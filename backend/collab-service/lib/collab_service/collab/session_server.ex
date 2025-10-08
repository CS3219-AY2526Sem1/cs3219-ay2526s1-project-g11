defmodule CollabService.Collab.SessionServer do
  @moduledoc """

  """
  use GenServer

  # Public API -------------------------------------------------------------

  def start_if_needed(session_id) do
    case GenServer.whereis(via(session_id)) do
      nil ->
        spec = {__MODULE__, session_id}
        DynamicSupervisor.start_child(CollabService.SessionSupervisor, spec)

      pid ->
        {:ok, pid}
    end
  end

  def join(session_id, user_id) do
    GenServer.call(via(session_id), {:join, user_id})
  end

  @doc """
  Apply a delta: replace text in [from, to) with `text` if client's `rev` matches.
  Returns:
    :ok               -> applied and broadcasted
    {:error, :stale}  -> client is behind; a full snapshot will be pushed
  """
  def apply_delta(session_id, user_id, {from, to, text, client_rev}) do
    GenServer.call(via(session_id), {:delta, user_id, from, to, text, client_rev})
  end

  @doc """
  Get the current revision number for the session.
  """
  def get_current_rev(session_id) do
    GenServer.call(via(session_id), :get_current_rev)
  end

  @doc """
  Get the current state (revision and text) for the session.
  Used when clients join to get the initial state.
  """
  def get_current_state(session_id) do
    GenServer.call(via(session_id), :get_current_state)
  end

  # GenServer ----------------------------------------------------------------
  @max_participants 2

  def start_link(session_id) do
    GenServer.start_link(__MODULE__, session_id, name: via(session_id))
  end

  @impl true
  def init(session_id) do
    state = %{
      id: session_id,
      rev: 0,
      text: "",
      participants: MapSet.new()
    }

    {:ok, state}
  end

  def handle_call({:join, user_id}, state) do
    cond do
      MapSet.member?(state.participants, user_id) ->
        {:reply, {:ok, :already_joined}, state}
      MapSet.size(state.participants) >= @max_participants ->
        {:reply, {:error, :session_full}, state}
      true ->
        new_participants = MapSet.put(state.participants, user_id)
        broadcast_user_joined(state.id, user_id, MapSet.size(new_participants))
        {:noreply, %{state | participants: new_participants}}
    end
  end

  @impl true
  def handle_call(:get_current_rev, _from, state) do
    {:reply, state.rev, state}
  end

  @impl true
  def handle_call(:get_current_state, _from, state) do
    {:reply, {:ok, %{rev: state.rev, text: state.text}}, state}
  end

  @impl true
  def handle_call({:delta, user_id, from, to, insert_text, client_rev}, _from, state) do
    cond do
      client_rev != state.rev ->
        # Stale client
        push_snapshot(state)
        {:reply, {:error, :stale}, state}

      not valid_range?(state.text, from, to) ->
        {:reply, {:error, :bad_range}, state}

      true ->
        new_text = splice(state.text, from, to, insert_text)
        new_rev = state.rev + 1
        new_state = %{state | text: new_text, rev: new_rev}

        broadcast_update(new_state, user_id, from, to, insert_text)
        {:reply, :ok, new_state}
    end
  end

  # Helpers -----------------------------------------------------------------

  defp via(session_id), do: {:via, Registry, {CollabService.SessionRegistry, session_id}}

  defp valid_range?(text, from, to)
       when is_binary(text) and is_integer(from) and is_integer(to) do
    max = String.length(text)
    0 <= from and from <= to and to <= max
  end

  # Replace substring text[from:to] with insert_text
  defp splice(text, from, to, insert_text) do
    {left, right} = split_at(text, from)
    {_drop, tail} = split_at(right, to - from)
    left <> insert_text <> tail
  end

  # like String.split_at/2 but without scanning twice
  defp split_at(text, idx), do: {String.slice(text, 0, idx), String.slice(text, idx..-1)}

  defp broadcast_update(%{id: id, rev: rev} = state, user_id, from, to, text) do
    payload = %{
      "rev" => rev,
      "by" => user_id,
      "delta" => %{"from" => from, "to" => to, "text" => text}
    }

    CollabServiceWeb.Endpoint.broadcast!("session:" <> id, "code:update", payload)

    _ = state
    :ok
  end

  defp push_snapshot(%{id: id, rev: rev, text: text}) do
    CollabServiceWeb.Endpoint.broadcast!("session:" <> id, "code:snapshot", %{
      "rev" => rev,
      "text" => text
    })
  end

  defp broadcast_user_joined(session_id, user_id, total_participants) do
    CollabServiceWeb.Endpoint.broadcast!(
      "session:" <> session_id,
      "session:user_joined",
      %{"user_id" => user_id, "total_participants" => total_participants}
    )
  end

end

defmodule CollabService.Collab.SessionServer do
  @moduledoc """
  Manages collaborative code editing sessions with operational transformation.
  """
  use GenServer
  require Logger

  # Public API -------------------------------------------------------------

  def start_if_needed(session_id) do
    case GenServer.whereis(via(session_id)) do
      nil ->
        Logger.info("Creating new SessionServer for session #{session_id}")
        spec = {__MODULE__, session_id}
        result = DynamicSupervisor.start_child(CollabService.SessionSupervisor, spec)

        case result do
          {:ok, pid} ->
            Logger.info("Successfully started SessionServer for session #{session_id}, pid: #{inspect(pid)}")
            {:ok, pid}
          {:error, reason} ->
            Logger.error("Failed to start SessionServer for session #{session_id}: #{inspect(reason)}")
            {:error, reason}
        end

      pid ->
        Logger.debug("SessionServer for session #{session_id} already exists, pid: #{inspect(pid)}")
        {:ok, pid}
    end
  end

  def join(session_id, user_id) do
    Logger.debug("join/2 called for session #{session_id}, user #{user_id}")
    GenServer.call(via(session_id), {:join, user_id})
  end

  @doc """
  Apply a delta: replace text in [from, to) with `text` if client's `rev` matches.
  Returns:
    :ok               -> applied and broadcasted
    {:error, :stale}  -> client is behind; a full snapshot will be pushed
  """
  def apply_delta(session_id, user_id, {from, to, text, client_rev}) do
    Logger.debug("apply_delta called: session=#{session_id}, user=#{user_id}, rev=#{client_rev}, from=#{from}, to=#{to}")
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

  def count_live_sessions() do
    CollabService.SessionSupervisor
    |> DynamicSupervisor.count_children()
    |> Map.get(:active)
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

    Logger.info("Initialized SessionServer state for session #{session_id}")
    {:ok, state}
  end

  @impl true
  def handle_call({:join, user_id}, _from, state) do
    Logger.info("Join attempt - session: #{state.id}, user: #{user_id}, current_participants: #{MapSet.size(state.participants)}/#{@max_participants}")

    cond do
      MapSet.member?(state.participants, user_id) ->
        Logger.info("User #{user_id} is rejoining session #{state.id} (already a member)")
        {:reply, {:ok, :already_joined}, state}

      MapSet.size(state.participants) >= @max_participants ->
        Logger.warning("Join rejected - session #{state.id} is full (#{@max_participants}/#{@max_participants}), rejected user: #{user_id}")
        {:reply, {:error, :session_full}, state}

      true ->
        new_participants = MapSet.put(state.participants, user_id)
        Logger.info("User #{user_id} successfully joined session #{state.id}, total participants: #{MapSet.size(new_participants)}/#{@max_participants}")
        broadcast_user_joined(state.id, user_id, MapSet.size(new_participants))
        {:reply, {:ok, :joined}, %{state | participants: new_participants}}
    end
  end

  @impl true
  def handle_call(:get_current_rev, _from, state) do
    Logger.debug("get_current_rev - session: #{state.id}, rev: #{state.rev}")
    {:reply, state.rev, state}
  end

  @impl true
  def handle_call(:get_current_state, _from, state) do
    text_preview = String.slice(state.text, 0, 50)
    text_info = if String.length(state.text) > 50, do: "#{text_preview}... (#{String.length(state.text)} chars)", else: text_preview
    Logger.debug("get_current_state - session: #{state.id}, rev: #{state.rev}, text: \"#{text_info}\"")
    {:reply, {:ok, %{rev: state.rev, text: state.text}}, state}
  end

  @impl true
  def handle_call({:delta, user_id, from, to, insert_text, client_rev}, _from, state) do
    start_time = System.monotonic_time(:millisecond)

    Logger.debug("Processing delta - session: #{state.id}, user: #{user_id}, client_rev: #{client_rev}, server_rev: #{state.rev}, from: #{from}, to: #{to}, text: \"#{String.slice(insert_text, 0, 20)}\"")

    result = cond do
      client_rev != state.rev ->
        Logger.warning("Stale revision detected - session: #{state.id}, user: #{user_id}, client_rev: #{client_rev}, server_rev: #{state.rev}")
        push_snapshot(state)
        {:reply, {:error, :stale}, state}

      not valid_range?(state.text, from, to) ->
        Logger.error("Invalid range - session: #{state.id}, user: #{user_id}, from: #{from}, to: #{to}, text_length: #{String.length(state.text)}")
        {:reply, {:error, :bad_range}, state}

      true ->
        new_text = splice(state.text, from, to, insert_text)
        new_rev = state.rev + 1
        new_state = %{state | text: new_text, rev: new_rev}

        broadcast_update(new_state, user_id, from, to, insert_text)

        elapsed = System.monotonic_time(:millisecond) - start_time
        Logger.info("Delta applied successfully - session: #{state.id}, user: #{user_id}, new_rev: #{new_rev}, elapsed: #{elapsed}ms")

        {:reply, :ok, new_state}
    end

    result
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

    Logger.debug("Broadcasting code update - session: #{id}, rev: #{rev}, from_user: #{user_id}")
    CollabServiceWeb.Endpoint.broadcast!("session:" <> id, "code:update", payload)

    _ = state
    :ok
  end

  defp push_snapshot(%{id: id, rev: rev, text: text}) do
    text_preview = String.slice(text, 0, 50)
    Logger.info("Pushing snapshot - session: #{id}, rev: #{rev}, text_length: #{String.length(text)}")

    CollabServiceWeb.Endpoint.broadcast!("session:" <> id, "code:snapshot", %{
      "rev" => rev,
      "text" => text
    })
  end

  defp broadcast_user_joined(session_id, user_id, total_participants) do
    Logger.debug("Broadcasting user joined - session: #{session_id}, user: #{user_id}, total: #{total_participants}")

    CollabServiceWeb.Endpoint.broadcast!(
      "session:" <> session_id,
      "session:user_joined",
      %{"user_id" => user_id, "total_participants" => total_participants}
    )
  end
end

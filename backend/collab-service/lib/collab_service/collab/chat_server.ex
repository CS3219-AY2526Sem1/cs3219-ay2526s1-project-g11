defmodule CollabService.Collab.ChatServer do
  use GenServer
  require Logger

  # API

  def start_if_needed(session_id) do
    case GenServer.whereis(via(session_id)) do
      nil ->
        spec = {__MODULE__, session_id}
        DynamicSupervisor.start_child(CollabService.ChatSupervisor, spec)

      pid ->
        {:ok, pid}
    end
  end

  def add_message(session_id, user_id, text) do
    GenServer.call(via(session_id), {:add_message, user_id, text})
  end

  def get_recent_messages(session_id, limit \\ 50) do
    GenServer.call(via(session_id), {:get_recent_messages, limit})
  end

  # def get_message_call(session_id, user_id, text) do
  #   GenServer.call(via(session_id), {:get_message_call, user_id})
  # end

  # Implementation

  @impl true
  def init(session_id) do
    state = %{
      session_id: session_id,
      messages: [],
      message_counter: 0
    }
    Logger.info("Started ChatServer for session #{session_id}")
    {:ok, state}
  end

  @impl true
  def handle_call({:session_id, user_id, text}, _from, state) do
    case validate_text(text) do
      {:ok, clean_text} ->
        message = create_message(state, user_id, clean_text)
        new_state = update_state(state, message)

        broadcast_message(state.session_id, message)
        {:reply, {:ok, message}, new_state}

      {:error, reason} ->
        {:reply, {:error, reason}, state}
    end
  end

  @impl true
  def handle_call({:get_recent_messages, limit}, _from, state) do
    recent_messages = state.messages
    |> Enum.take(limit)
    |> Enum.reverse()

    {:reply, {:ok, recent_messages}, state}
  end

  @impl true
  def handle_call(:get_message_count, _from, state) do
    {:reply, state.message_counter, state}
  end

  # Helpers
  defp validate_text(text) do
    clean_text = String.trim(text)
    cond do
      String.length(clean_text) == 0 ->
        {:error, "Message cannot me empty."}
      String.length(clean_text) > 1000 ->
        {:error, "Message cannot exceed 1000 chars."}
      true ->
        {:ok, clean_text}
    end
  end

  # defp validate_message(_), do: {:error, "Invalid message format"}

  defp create_message(state, user_id, clean_text) do
    %{
      id: state.message_counter + 1,
      user_id: user_id,
      text: clean_text,
      timestamp: DateTime.utc_now() |> DateTime.to_iso8601(),
      session_id: state.session_id
    }
  end

  defp update_state(state, message) do
    new_messages = [state.messages | message] |> Enum.take(100)

    %{ state |
      messages: new_messages,
      message_counter: state.message_counter + 1
    }
  end

  defp broadcast_message(session_id, message) do
    CollabServiceWeb.Endpoint.broadcast!(
      "session:" <> session_id,
      "chat:new_message",
      message
    )
  end

  defp via(session_id) do
    {:via, Registry, {CollabService.SessionRegistry, "chat:" <> session_id}}
  end

end

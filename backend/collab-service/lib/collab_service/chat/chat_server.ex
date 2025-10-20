defmodule CollabService.Chat.ChatServer do
  use GenServer
  require Logger

  @max_participants 2

  # Public API

  def start_if_needed(session_id) do
    case GenServer.whereis(via(session_id)) do
      nil ->
        Logger.info("Creating new ChatServer for session #{session_id}")
        spec = {__MODULE__, session_id}
        result = DynamicSupervisor.start_child(CollabService.ChatSupervisor, spec)

        case result do
          {:ok, pid} ->
            Logger.info("Successfully started ChatServer for session #{session_id}")
            {:ok, pid}
          {:error, reason} ->
            Logger.error("Failed to start ChatServer: #{inspect(reason)}")
            {:error, reason}
        end

      pid ->
        Logger.debug("ChatServer for session #{session_id} already exists")
        {:ok, pid}
    end
  end

  def join(session_id, user_id) do
    GenServer.call(via(session_id), {:join, user_id})
  end

  def add_message(session_id, user_id, text) do
    GenServer.call(via(session_id), {:add_message, user_id, text})
  end

  def get_recent_messages(session_id, limit \\ 50) do
    GenServer.call(via(session_id), {:get_recent_messages, limit})
  end

  def get_message_count(session_id) do
    GenServer.call(via(session_id), :get_message_count)
  end

  # GenServer Implementation

  def start_link(session_id) do
    GenServer.start_link(__MODULE__, session_id, name: via(session_id))
  end

  @impl true
  def init(session_id) do
    state = %{
      session_id: session_id,
      messages: [],
      message_counter: 0,
      participants: MapSet.new()  # Add participants tracking
    }

    Logger.info("Initialized ChatServer for session #{session_id}")
    {:ok, state}
  end

  @impl true
  def handle_call({:join, user_id}, _from, state) do
    Logger.info("Chat join attempt - session: #{state.session_id}, user: #{user_id}, current_participants: #{MapSet.size(state.participants)}/#{@max_participants}")

    cond do
      MapSet.member?(state.participants, user_id) ->
        Logger.info("User #{user_id} rejoining chat in session #{state.session_id}")
        {:reply, {:ok, :already_joined}, state}

      MapSet.size(state.participants) >= @max_participants ->
        Logger.warning("Chat join rejected - session #{state.session_id} is full, rejected user: #{user_id}")
        {:reply, {:error, :session_full}, state}

      true ->
        new_participants = MapSet.put(state.participants, user_id)
        Logger.info("User #{user_id} joined chat in session #{state.session_id}, total: #{MapSet.size(new_participants)}/#{@max_participants}")
        {:reply, {:ok, :joined}, %{state | participants: new_participants}}
    end
  end

  @impl true
  def handle_call({:add_message, user_id, text}, _from, state) do
    # Check if user is a participant
    # unless MapSet.member?(state.participants, user_id) do
    #   Logger.warning("Non-participant tried to send message - session: #{state.session_id}, user: #{user_id}")
    #   {:reply, {:error, "You must join the chat first"}, state}
    # else
      case validate_text(text) do
        {:ok, clean_text} ->
          message = create_message(state, user_id, clean_text)
          new_state = update_state(state, message)

          broadcast_message(state.session_id, message)
          Logger.info("Chat message added - session: #{state.session_id}, user: #{user_id}, msg_id: #{message.id}")
          {:reply, {:ok, message}, new_state}

        {:error, reason} ->
          Logger.warning("Invalid chat message - session: #{state.session_id}, reason: #{reason}")
          {:reply, {:error, reason}, state}
      end
    # end
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

  defp validate_text(text) when is_binary(text) do
    clean_text = String.trim(text)

    cond do
      String.length(clean_text) == 0 ->
        {:error, "Message cannot be empty"}

      String.length(clean_text) > 1000 ->
        {:error, "Message cannot exceed 1000 characters"}

      true ->
        {:ok, clean_text}
    end
  end

  defp validate_text(_), do: {:error, "Invalid message format"}

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
    # Fix: This should be [message | state.messages], not [state.messages | message]
    new_messages = [message | state.messages] |> Enum.take(100)

    %{state |
      messages: new_messages,
      message_counter: state.message_counter + 1
    }
  end

  defp broadcast_message(session_id, message) do
    Logger.debug("Broadcasting chat message - session: #{session_id}, msg_id: #{message.id}")

    CollabServiceWeb.Endpoint.broadcast!(
      "chat:" <> session_id, 
      "chat:new_message",
      message
    )
  end

  defp via(session_id) do
    {:via, Registry, {CollabService.SessionRegistry, "chat:" <> session_id}}
  end
end

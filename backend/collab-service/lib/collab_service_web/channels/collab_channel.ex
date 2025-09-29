defmodule CollabServiceWeb.CollabChannel do
  use Phoenix.Channel
  alias CollabService.Collab.SessionServer
  alias CollabService.Collab.ChatServer

  def join("session:" <> session_id, _params, socket) do
    user_id = socket.assigns.user_id || :guest
    {:ok, _pid} = SessionServer.start_if_needed(session_id)
    {:ok, _pid} = ChatServer.start_if_needed(session_id)

    :ok = SessionServer.join(session_id, user_id)

    session_data = case SessionServer.get_current_state(session_id) do
      {:ok, %{rev: rev, text: text}} -> %{rev: rev, text: text}
      {:error, _} -> %{rev: 0, text: ""}
    end

    # Get recent chat messages
    chat_messages = case ChatServer.get_recent_messages(session_id, 50) do
      {:ok, messages} -> messages
      {:error, _} -> []
    end

    socket = socket
    |> assign(:session_id, session_id)
    |> assign(:user_id, user_id)

    response = Map.merge(session_data, %{
      user_id: user_id,
      chat_messages: chat_messages
    })

    {:ok, response, socket}
  end

  def handle_in("code:delta", %{"from" => f, "to" => t, "text" => txt, "rev" => rev}, socket) do
    case SessionServer.apply_delta(
           socket.assigns.session_id,
           socket.assigns.user_id,
           {f, t, txt, rev}
         ) do
      :ok ->
        {:noreply, socket}

      {:error, :stale} ->
        # client should replace local doc with last "code:snapshot"
        push(socket, "code:stale", %{})
        {:noreply, socket}

      {:error, reason} ->
        push(socket, "code:error", %{"reason" => to_string(reason)})
        {:noreply, socket}
    end
  end

  def handle_in("code:request_snapshot", _params, socket) do
    # Allow clients to explicitly request a snapshot
    case SessionServer.get_current_state(socket.assigns.session_id) do
      {:ok, %{rev: rev, text: text}} ->
        push(socket, "code:snapshot", %{rev: rev, text: text})
      {:error, _} ->
        push(socket, "code:error", %{"reason" => "failed_to_get_snapshot"})
    end

    {:noreply, socket}
  end

  def handle_in("chat:message", %{"text" => text}, socket) do
    case ChatServer.add_message(
      socket.assigns.session_id,
      socket.assigns.user_id,
      text
    ) do
      {:ok, _message} ->
        {:noreply, socket}
      {:error, reason} ->
        push(socket, "chat:error", %{"reason" => reason})
        {:noreply, socket}
    end
  end

  def handle_in("chat:send_message", _invalid_payload, socket) do
    push(socket, "chat:error", %{"reason" => "Invalid message format"})
    {:noreply, socket}
  end

  def handle_in("chat:get_history", %{"limit" => limit}, socket) when is_integer(limit) do
    case ChatServer.get_recent_messages(socket.assigns.session_id, limit) do
      {:ok, messages} ->
        push(socket, "chat:history", %{"messages" => messages})
      {:error, _} ->
        push(socket, "chat:error", %{"reason" => "Failed to get chat history"})
    end

    {:noreply, socket}
  end

  def handle_in("chat:get_history", _params, socket) do
    # Default to 50 messages if no limit specified
    handle_in("chat:get_history", %{"limit" => 50}, socket)
  end

  def handle_in("chat:typing", %{"typing" => typing}, socket) when is_boolean(typing) do
    broadcast_from(socket, "chat:user_typing", %{
      "user_id" => socket.assigns.user_id,
      "typing" => typing
    })

    {:noreply, socket}
  end

  # Handle unknown events
  def handle_in(event, _payload, socket) do
    push(socket, "error", %{"reason" => "Unknown event: #{event}"})
    {:noreply, socket}
  end


end

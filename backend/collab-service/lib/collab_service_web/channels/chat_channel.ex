defmodule CollabServiceWeb.ChatChannel do
  use Phoenix.Channel
  require Logger
  alias CollabService.Chat.ChatServer

  def join("chat:" <> session_id, params, socket) do  # Note: "chat:" prefix
    user_id = socket.assigns.user_id || "guest-#{:crypto.strong_rand_bytes(4) |> Base.encode64()}"

    Logger.info("ChatChannel join attempt - session: #{session_id}, user: #{user_id}, params: #{inspect(params)}")

    case ChatServer.start_if_needed(session_id) do
      {:ok, _pid} ->
        Logger.debug("ChatServer ready for session #{session_id}")

        # Get chat history
        chat_messages = case ChatServer.get_recent_messages(session_id, 50) do
          {:ok, messages} ->
            Logger.debug("Retrieved #{length(messages)} chat messages")
            messages
          {:error, reason} ->
            Logger.warning("Failed to get chat messages: #{inspect(reason)}")
            []
        end

        socket = socket
        |> assign(:session_id, session_id)
        |> assign(:user_id, user_id)

        response = %{
          user_id: user_id,
          chat_messages: chat_messages
        }

        Logger.info("ChatChannel join successful - session: #{session_id}, user: #{user_id}")
        {:ok, response, socket}

      {:error, reason} ->
        Logger.error("Failed to start ChatServer for session #{session_id}: #{inspect(reason)}")
        {:error, %{reason: "Failed to start chat server: #{inspect(reason)}"}}
    end
  end

  def handle_in("chat:send_message", %{"text" => text}, socket) when is_binary(text) do
    text_preview = String.slice(text, 0, 50)
    Logger.info("Received chat message - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, text: \"#{text_preview}\"")

    case ChatServer.add_message(
      socket.assigns.session_id,
      socket.assigns.user_id,
      text
    ) do
      {:ok, message} ->
        Logger.debug("Chat message added successfully - message_id: #{message.id}")
        {:noreply, socket}

      {:error, reason} ->
        Logger.warning("Chat message rejected - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, reason: #{reason}")
        push(socket, "chat:error", %{"reason" => reason})
        {:noreply, socket}
    end
  end

  def handle_in("chat:send_message", invalid_payload, socket) do
    Logger.warning("Invalid chat message format - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, payload: #{inspect(invalid_payload)}")
    push(socket, "chat:error", %{"reason" => "Invalid message format"})
    {:noreply, socket}
  end

  def handle_in("chat:get_history", %{"limit" => limit}, socket) when is_integer(limit) do
    Logger.debug("Chat history requested - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, limit: #{limit}")

    case ChatServer.get_recent_messages(socket.assigns.session_id, limit) do
      {:ok, messages} ->
        Logger.debug("Sending #{length(messages)} chat messages")
        push(socket, "chat:history", %{"messages" => messages})
      {:error, reason} ->
        Logger.error("Failed to get chat history - session: #{socket.assigns.session_id}, reason: #{inspect(reason)}")
        push(socket, "chat:error", %{"reason" => "Failed to get chat history"})
    end

    {:noreply, socket}
  end

  def handle_in("chat:get_history", _params, socket) do
    Logger.debug("Chat history requested with default limit - session: #{socket.assigns.session_id}")
    handle_in("chat:get_history", %{"limit" => 50}, socket)
  end

  def handle_in("chat:typing", %{"typing" => typing}, socket) when is_boolean(typing) do
    Logger.debug("Typing indicator - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, typing: #{typing}")

    broadcast_from(socket, "chat:user_typing", %{
      "user_id" => socket.assigns.user_id,
      "typing" => typing
    })

    {:noreply, socket}
  end

  # Handle unknown events
  def handle_in(event, payload, socket) do
    Logger.warning("Unknown event received - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, event: #{event}, payload: #{inspect(payload)}")
    push(socket, "error", %{"reason" => "Unknown event: #{event}"})
    {:noreply, socket}
  end

  # Handle channel termination
  def terminate(reason, socket) do
    Logger.info("Channel terminated - session: #{socket.assigns[:session_id]}, user: #{socket.assigns[:user_id]}, reason: #{inspect(reason)}")
    :ok
  end
end

defmodule CollabServiceWeb.CollabChannel do
  use Phoenix.Channel
  require Logger
  alias CollabService.Collab.SessionServer

  def join("session:" <> session_id, params, socket) do
    user_id = socket.assigns.user_id || "guest-#{:crypto.strong_rand_bytes(4) |> Base.encode64()}"

    Logger.info("Channel join attempt - session: #{session_id}, user: #{user_id}, params: #{inspect(params)}")

    case SessionServer.start_if_needed(session_id) do
      {:ok, _pid} ->
        Logger.debug("SessionServer ready for session #{session_id}")
      {:error, reason} ->
        Logger.error("Failed to start SessionServer for session #{session_id}: #{inspect(reason)}")
    end

    case SessionServer.join(session_id, user_id) do
      {:ok, join_status} ->
        Logger.info("User #{user_id} joined session #{session_id} with status: #{join_status}")

        session_data = case SessionServer.get_current_state(session_id) do
          {:ok, %{rev: rev, text: text}} ->
            Logger.debug("Retrieved session state - rev: #{rev}, text_length: #{String.length(text)}")
            %{rev: rev, text: text}
          {:error, reason} ->
            Logger.warning("Failed to get session state: #{inspect(reason)}, using defaults")
            %{rev: 0, text: ""}
        end

        socket = socket
        |> assign(:session_id, session_id)
        |> assign(:user_id, user_id)

        response = Map.merge(session_data, %{
          user_id: user_id
        })

        Logger.info("Channel join successful - session: #{session_id}, user: #{user_id}")
        {:ok, response, socket}

      {:error, :session_full} ->
        Logger.warning("Channel join rejected - session #{session_id} is full, user: #{user_id}")
        {:error, %{reason: "Session is full. Maximum 2 participants allowed."}}

      {:error, reason} ->
        Logger.error("Channel join failed - session: #{session_id}, user: #{user_id}, reason: #{inspect(reason)}")
        {:error, %{reason: "Failed to join session: #{inspect(reason)}"}}
    end
  end

  def handle_in("code:delta", %{"from" => f, "to" => t, "text" => txt, "rev" => rev} = _payload, socket) do
    Logger.debug("Received code:delta - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, rev: #{rev}, from: #{f}, to: #{t}, text: \"#{String.slice(txt, 0, 20)}\"")

    case SessionServer.apply_delta(
           socket.assigns.session_id,
           socket.assigns.user_id,
           {f, t, txt, rev}
         ) do
      :ok ->
        Logger.debug("code:delta applied successfully")
        {:noreply, socket}

      {:error, :stale} ->
        Logger.warning("code:delta rejected - stale revision, session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, client_rev: #{rev}")
        push(socket, "code:stale", %{})
        {:noreply, socket}

      {:error, reason} ->
        Logger.error("code:delta failed - session: #{socket.assigns.session_id}, reason: #{inspect(reason)}")
        push(socket, "code:error", %{"reason" => to_string(reason)})
        {:noreply, socket}
    end
  end

  def handle_in("code:request_snapshot", _params, socket) do
    Logger.info("Snapshot requested - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}")

    case SessionServer.get_current_state(socket.assigns.session_id) do
      {:ok, %{rev: rev, text: text}} ->
        Logger.debug("Sending snapshot - session: #{socket.assigns.session_id}, rev: #{rev}, text_length: #{String.length(text)}")
        push(socket, "code:snapshot", %{rev: rev, text: text})
      {:error, reason} ->
        Logger.error("Failed to get snapshot - session: #{socket.assigns.session_id}, reason: #{inspect(reason)}")
        push(socket, "code:error", %{"reason" => "failed_to_get_snapshot"})
    end

    {:noreply, socket}
  end

  def handle_in("chat:send_message", %{"text" => text}, socket) when is_binary(text) do
    text_preview = String.slice(text, 0, 50)
    Logger.info("Received chat message - session: #{socket.assigns.session_id}, user: #{socket.assigns.user_id}, text: \"#{text_preview}\"")

    case SessionServer.add_message(
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

    case SessionServer.get_recent_messages(socket.assigns.session_id, limit) do
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

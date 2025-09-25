defmodule CollabServiceWeb.CollabChannel do
  use Phoenix.Channel
  alias CollabService.Collab.SessionServer

  def join("session:" <> session_id, _params, socket) do
    user_id = socket.assigns.user_id || :guest
    {:ok, _pid} = SessionServer.start_if_needed(session_id)
    :ok = SessionServer.join(session_id, user_id)

    case SessionServer.get_current_state(session_id) do
      {:ok, %{rev: rev, text: text}} ->
        socket = socket
        |> assign(:session_id, session_id)
        |> assign(:user_id, user_id)

        {:ok, %{rev: rev, text: text, user_id: user_id}, socket}

      {:error, _reason} ->
        # Fallback to empty state
        socket = socket
        |> assign(:session_id, session_id)
        |> assign(:user_id, user_id)

        {:ok, %{rev: 0, text: "", user_id: user_id}, socket}
    end
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
end

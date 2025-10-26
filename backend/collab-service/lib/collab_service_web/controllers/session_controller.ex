defmodule CollabServiceWeb.SessionController do
  use CollabServiceWeb, :controller
  alias CollabService.Collab.SessionServer

  def create(conn, %{"id" => id}) do
    {:ok, _pid} = SessionServer.start_if_needed(id)
    json(conn, %{id: id, status: "active"})
  end

  def show(conn, %{"id" => id}) do
    json(conn, %{id: id})
  end

  def live_sessions_count(conn, _params) do
    count = floor(Registry.count(CollabService.SessionRegistry) / 2)
    json(conn, %{live_sessions: count})
  end

end

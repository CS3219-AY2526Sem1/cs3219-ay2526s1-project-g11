defmodule CollabServiceWeb.SessionController do
  use CollabServiceWeb, :controller
  require OpenTelemetry.Tracer, as: Tracer
  alias CollabService.Collab.SessionServer

  def create(conn, %{"id" => id}) do
    Tracer.with_span :operation do
      Tracer.add_event("Nice operation!", [{"bogons", 100}])
      Tracer.set_attributes([{:another_key, "yes"}])
    end
    Tracer.with_span :create_server do
      Tracer.set_attributes([{:session_id, id}])
      {:ok, _pid} = SessionServer.start_if_needed(id)
      json(conn, %{id: id, status: "active"})
    end
  end

  def show(conn, %{"id" => id}) do
    json(conn, %{id: id})
  end
end

defmodule CollabServiceWeb.HealthController do
  use CollabServiceWeb, :controller

  def index(conn, _) do
    json(conn, %{ok: true})
  end
end

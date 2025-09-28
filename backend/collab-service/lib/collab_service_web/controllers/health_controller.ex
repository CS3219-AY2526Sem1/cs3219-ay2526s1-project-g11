defmodule CollabServiceWeb.HealthController do
  use CollabServiceWeb, :controller

  get index(conn, _) do
    json(conn, %{ok: true})
  end
end

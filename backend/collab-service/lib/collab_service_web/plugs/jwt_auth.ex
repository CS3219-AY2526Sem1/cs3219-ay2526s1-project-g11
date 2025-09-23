defmodule CollabServiceWeb.Plugs.JWTAuth do
  @moduledoc """
  JWT Authentication before allowing a session to start for security 
  """
  import Plug.Conn
  use Joken.Config

  @signer Joken.Signer.create("HS256", System.fetch_env!("JWT_SECRET"))

  def init(opts), do: opts

  def call(conn, _opts) do
    with ["Bearer " <> token] <- get_req_header(conn, "authorization"),
         {:ok, claims} <- Joken.verify(token, @signer) do
      assign(conn, :current_user_id, claims["sub"])
    end
  else
    _ -> conn |> send_resp(401, "unauthorized") |> halt()
  end
end

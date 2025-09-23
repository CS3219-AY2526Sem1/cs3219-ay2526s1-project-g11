defmodule CollabServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "session:*", CollabServiceWeb.CollabChannel

  @signer Joken.Signer.create("HS256", System.fetch_env!("JWT_SECRET"))

  @impl true
  def connect(%{"token" => token}, socket, _connect_info) do
    cond do
      Mix.env() == :dev and (token in [nil, "", "<your-dev-jwt-or-empty>"]) ->
        gid = "guest-" <> Base.url_encode64(:crypto.strong_rand_bytes(5))
        {:ok, assign(socket, :user_id, gid)}

      true ->
        case Joken.verify(token, @signer) do
          {:ok, %{"sub" => user_id}} -> {:ok, assign(socket, :user_id, user_id)}
          _ -> :error
        end
    end
  end

  def id(_socket), do: nil
end

defmodule CollabServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "session:*", CollabServiceWeb.CollabChannel

  def connect(_params, socket, _connect_info) do
    gid = "guest-" <> Base.url_encode64(:crypto.strong_rand_bytes(8))
    {:ok, assign(socket, :user_id, gid)}
  end

  def id(_socket), do: nil
end

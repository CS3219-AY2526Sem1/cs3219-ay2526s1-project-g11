defmodule CollabServiceWeb.UserSocket do
  use Phoenix.Socket

  channel "session:*", CollabServiceWeb.CollabChannel
  channel "chat:*", CollabServiceWeb.ChatChannel

  def connect(params, socket, _connect_info) do
    gid =
      case params["userId"] do
        id when is_binary(id) and byte_size(id) > 0 -> id
        _ -> "guest-" <> Base.url_encode64(:crypto.strong_rand_bytes(8))
      end
    {:ok, assign(socket, :user_id, gid)}
  end

  def id(_socket), do: nil
end

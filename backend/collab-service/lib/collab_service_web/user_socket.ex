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

      token != nil and token != "" ->
        case verify_user_service_token(token) do
          {:ok, user_id} -> 
            IO.inspect(user_id, label: "Connected user_id")
            {:ok, assign(socket, :user_id, user_id)}
          {:error, reason} -> 
            IO.inspect(reason, label: "Token verification failed")
            :error
        end

      true ->
        :error
    end
  end

  defp verify_user_service_token(token) do
    case Joken.verify(token, @signer) do
      {:ok, claims} ->
        IO.inspect(claims, label: "JWT Claims")
        
        # Your JWT has "id" field, not "sub" 
        user_id = Map.get(claims, "id") || Map.get(claims, "sub") || Map.get(claims, "user_id")
        
        if user_id do
          # Check if token is expired
          case Map.get(claims, "exp") do
            nil -> {:ok, user_id}
            exp when is_integer(exp) ->
              if System.system_time(:second) < exp do
                {:ok, user_id}
              else
                {:error, :token_expired}
              end
            _ -> {:ok, user_id}
          end
        else
          {:error, :no_user_id_in_token}
        end
      
      {:error, reason} ->
        IO.inspect(reason, label: "JWT verification error")
        {:error, reason}
    end
  end

  def id(_socket), do: nil
end
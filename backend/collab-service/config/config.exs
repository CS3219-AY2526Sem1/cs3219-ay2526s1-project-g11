# config/runtime.exs
import Config

if config_env() == :prod do
  # Generate a secret key base if not provided
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
    raise """
    Environment variable SECRET_KEY_BASE is missing.
    You can generate one by calling: mix phx.gen.secret
    """

  host = System.get_env("PUBLIC_URL") || "your-service-name.run.app"
  port = String.to_integer(System.get_env("PORT", "8080"))

  config :collab_service, CollabServiceWeb.Endpoint,
    http: [
      # Listen on all IPv4 interfaces
      ip: {0, 0, 0, 0},
      port: port
    ],
    url: [scheme: "https", host: host, port: 443],
    secret_key_base: secret_key_base,
    server: true
end

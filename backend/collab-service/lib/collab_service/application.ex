defmodule CollabService.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CollabServiceWeb.Telemetry,
      {DNSCluster, query: Application.get_env(:collab_service, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CollabService.PubSub},
      # Start a worker by calling: CollabService.Worker.start_link(arg)
      # {CollabService.Worker, arg},
      # Start to serve requests, typically the last entry
      CollabServiceWeb.Endpoint,

      # Keep track of sessions in registry
      {Registry, keys: :unique, name: CollabService.SessionRegistry},

      # Start and stop sessions on demand
      {DynamicSupervisor, strategy: :one_for_one, name: CollabService.SessionSupervisor}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CollabService.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CollabServiceWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

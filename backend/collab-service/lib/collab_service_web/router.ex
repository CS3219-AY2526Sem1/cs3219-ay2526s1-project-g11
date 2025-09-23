defmodule CollabServiceWeb.Router do
  use CollabServiceWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {CollabServiceWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  # JWT Auth for API routes
  pipeline :api_auth do
    plug CollabServiceWeb.Plugs.JWTAuth
  end

  scope "/", CollabServiceWeb do
    pipe_through :browser

    get "/", PageController, :home
  end

  # Need to add JWTAuth in the future
  scope "/api", CollabServiceWeb do
    pipe_through [:api]
    post "/sessions", SessionController, :create
    post "/sessions/:id/end", SessionController, :end
    get "/sessions/:id", SessionController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", CollabServiceWeb do
  #   pipe_through :api
  # end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:collab_service, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through :browser

      live_dashboard "/dashboard", metrics: CollabServiceWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end

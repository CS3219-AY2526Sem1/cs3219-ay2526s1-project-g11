defmodule CollabServiceWeb.PageController do
  use CollabServiceWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end

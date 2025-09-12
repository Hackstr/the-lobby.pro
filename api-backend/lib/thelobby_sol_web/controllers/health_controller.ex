defmodule ThelobbysolWeb.HealthController do
  use ThelobbysolWeb, :controller

  def check(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{
      status: "healthy",
      service: "thelobby-sol-api",
      timestamp: DateTime.utc_now(),
      version: "0.1.0"
    })
  end
end

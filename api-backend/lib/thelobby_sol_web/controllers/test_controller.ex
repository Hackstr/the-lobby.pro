defmodule ThelobbysolWeb.TestController do
  use ThelobbysolWeb, :controller

  def ping(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{
      status: "success",
      message: "API is working!",
      timestamp: DateTime.utc_now(),
      cors_origin: get_req_header(conn, "origin") |> List.first(),
      user_agent: get_req_header(conn, "user-agent") |> List.first()
    })
  end

  def test_cors(conn, _params) do
    conn
    |> put_resp_header("access-control-allow-origin", "*")
    |> put_resp_header("access-control-allow-methods", "GET, POST, OPTIONS")
    |> put_resp_header("access-control-allow-headers", "content-type")
    |> put_status(:ok)
    |> json(%{
      message: "CORS test successful",
      origin: get_req_header(conn, "origin") |> List.first() || "no-origin",
      method: conn.method
    })
  end
end

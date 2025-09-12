defmodule ThelobbysolWeb.GamingController do
  use ThelobbysolWeb, :controller

  alias ThelobbySol.Gaming.CS2Integration

  def servers(conn, _params) do
    servers = CS2Integration.list_servers()

    conn
    |> put_status(:ok)
    |> json(%{
      success: true,
      data: %{
        servers: servers,
        total_count: length(servers)
      }
    })
  end

  def server_status(conn, %{"server_id" => server_id}) do
    servers = CS2Integration.list_servers()

    case Enum.find(servers, fn server -> server.id == server_id end) do
      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{
          success: false,
          error: "Server not found",
          message: "Server with ID #{server_id} does not exist"
        })

      server ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: server
        })
    end
  end

  # Mock endpoint for simulating kill events (hackathon demo)
  def simulate_kill_event(conn, %{
    "player_id" => player_id,
    "event_type" => event_type
  }) do
    mock_event = %{
      player_id: player_id,
      event_type: event_type,
      timestamp: DateTime.utc_now(),
      server_id: "server_1",
      map: "de_dust2"
    }

    case CS2Integration.process_kill_event(mock_event) do
      {:headshot, kill_data} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            event_type: "headshot",
            kill_data: kill_data,
            should_mint_token: true
          }
        })

      {:kill, kill_data} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            event_type: "regular_kill",
            kill_data: kill_data,
            should_mint_token: false
          }
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to process kill event"
        })
    end
  end
end

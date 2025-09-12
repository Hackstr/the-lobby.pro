defmodule ThelobbysolWeb.GamingController do
  use ThelobbysolWeb, :controller

  alias ThelobbySol.Gaming.CS2Integration
  alias ThelobbySol.Gaming.RconClient

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

  # 🎯 NEW KILL EVENT SIMULATION with improved token logic
  def simulate_kill_event(conn, params) do
    player_id = params["player_id"] || "demo_player"
    event_type = params["event_type"] || "headshot"

    case CS2Integration.simulate_kill_event(%{"player_id" => player_id, "event_type" => event_type}) do
      {:mint_tokens, result} ->
        # Игрок заслужил токены!
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            action: "mint_tokens",
            player_id: result.player_id,
            tokens_earned: result.tokens_to_mint,
            reasons: result.reasons,
            kill_type: result.kill_type,
            total_kills: result.total_kills,
            current_streak: result.current_streak,
            message: "🪙 #{result.tokens_to_mint} SKILLS tokens earned!"
          }
        })

      {:no_tokens, result} ->
        # Kill зарегистрирован но токены не заработаны
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            action: "kill_registered",
            message: result.message,
            total_kills: result.total_kills,
            reasons: result.reasons,
            tokens_earned: 0
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

  def rcon_command(conn, %{"command" => command}) do
    case RconClient.send_command(command) do
      {:ok, response} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            command: command,
            response: response
          },
          message: "RCON command executed successfully"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to execute RCON command: #{reason}"
        })
    end
  end

  def rcon_status(conn, _params) do
    case RconClient.get_server_status() do
      {:ok, status} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: status,
          message: "RCON status retrieved successfully"
        })

      {:error, reason} ->
        conn
        |> put_status(:service_unavailable)
        |> json(%{
          success: false,
          error: reason,
          message: "RCON not available - using mock mode"
        })
    end
  end
end

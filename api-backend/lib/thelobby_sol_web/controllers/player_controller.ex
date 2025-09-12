defmodule ThelobbysolWeb.PlayerController do
  use ThelobbysolWeb, :controller

  alias ThelobbySol.Platform.PlayerManager
  alias ThelobbySol.Platform.Player

  def register(conn, %{"wallet_address" => wallet_address}) do
    case PlayerManager.register_player(wallet_address) do
      {:ok, player_data} ->
        conn
        |> put_status(:created)
        |> json(%{
          success: true,
          data: player_data,
          message: "Player registered successfully"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to register player"
        })
    end
  end

  def dashboard(conn, %{"wallet_address" => wallet_address}) do
    case PlayerManager.get_player_dashboard(wallet_address) do
      {:ok, dashboard_data} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: dashboard_data
        })

      {:error, reason} ->
        conn
        |> put_status(:not_found)
        |> json(%{
          success: false,
          error: reason,
          message: "Player not found"
        })
    end
  end

  def process_achievement(conn, %{
    "wallet_address" => wallet_address,
    "achievement_type" => achievement_type,
    "achievement_data" => achievement_data
  }) do
    achievement_atom = String.to_existing_atom(achievement_type)

    case PlayerManager.process_achievement(wallet_address, achievement_atom, achievement_data) do
      {:ok, achievement} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: achievement,
          message: "Achievement processed successfully"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to process achievement"
        })
    end
  end

  def simulate_headshot(conn, %{"wallet_address" => wallet_address}) do
    achievement_data = %{
      "weapon" => "ak47",
      "map" => "de_dust2",
      "timestamp" => DateTime.utc_now()
    }

    case PlayerManager.process_achievement(wallet_address, :headshot, achievement_data) do
      {:ok, achievement} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: achievement,
          message: "🎯 Хедшот токен получен!"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to simulate headshot"
        })
    end
  end

  def simulate_kill_streak(conn, %{"wallet_address" => wallet_address} = params) do
    streak_count = Map.get(params, "streak_count", 10)

    achievement_data = %{
      "streak_count" => streak_count,
      "map" => "de_mirage",
      "timestamp" => DateTime.utc_now()
    }

    case PlayerManager.process_achievement(wallet_address, :kill_streak, achievement_data) do
      {:ok, achievement} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: achievement,
          message: "⚡ Токен серии получен!"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to simulate kill streak"
        })
    end
  end

  def reset_player_stats(conn, %{"wallet_address" => wallet_address}) do
    case PlayerManager.reset_player_stats(wallet_address) do
      {:ok, player} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: %{
            headshots: player.headshots,
            kill_streaks: player.kill_streaks,
            total_kills: player.total_kills,
            xp: Player.calculate_xp(player)
          },
          message: "🔄 Статистика сброшена!"
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Failed to reset player stats"
        })
    end
  end

  def claim_achievement(conn, %{"wallet_address" => wallet_address, "achievement_id" => achievement_id}) do
    case PlayerManager.claim_achievement(wallet_address, achievement_id) do
      {:ok, claim_result} ->
        conn
        |> put_status(:ok)
        |> json(%{
          success: true,
          data: claim_result,
          message: claim_result.message
        })

      {:error, reason} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          success: false,
          error: reason,
          message: "Не удалось забрать достижение: #{reason}"
        })
    end
  end
end

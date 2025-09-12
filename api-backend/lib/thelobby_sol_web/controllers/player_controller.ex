defmodule ThelobbysolWeb.PlayerController do
  use ThelobbysolWeb, :controller

  alias ThelobbySol.Platform.PlayerManager

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
end

defmodule ThelobbySol.Platform.PlayerManager do
  @moduledoc """
  Player management and analytics
  Coordinates between gaming events and blockchain operations
  """

  alias ThelobbySol.Gaming.CS2Integration
  alias ThelobbySol.Blockchain.SolanaClient

  require Logger

  @doc """
  Register new player with wallet
  """
  def register_player(wallet_address) do
    with {:ok, validated_wallet} <- SolanaClient.validate_wallet(wallet_address),
         {:ok, blockchain_result} <- SolanaClient.initialize_player(validated_wallet) do

      player_data = %{
        wallet_address: validated_wallet,
        registered_at: DateTime.utc_now(),
        blockchain_account: blockchain_result.player_stats_account,
        status: "active"
      }

      Logger.info("Player registered: #{validated_wallet}")
      {:ok, player_data}
    else
      {:error, reason} ->
        Logger.error("Failed to register player: #{reason}")
        {:error, reason}
    end
  end

  @doc """
  Process gaming achievement and mint appropriate tokens
  """
  def process_achievement(wallet_address, achievement_type, achievement_data) do
    case achievement_type do
      :headshot ->
        mint_headshot_achievement(wallet_address, achievement_data)

      :kill_streak ->
        mint_streak_achievement(wallet_address, achievement_data)

      _ ->
        {:error, "Unknown achievement type"}
    end
  end

  @doc """
  Get comprehensive player dashboard data
  """
  def get_player_dashboard(wallet_address) do
    with {:ok, blockchain_stats} <- SolanaClient.get_player_stats(wallet_address) do
      dashboard_data = %{
        wallet_address: wallet_address,
        stats: blockchain_stats,
        recent_achievements: get_recent_achievements(wallet_address),
        available_servers: CS2Integration.list_servers(),
        last_updated: DateTime.utc_now()
      }

      {:ok, dashboard_data}
    else
      {:error, reason} ->
        Logger.error("Failed to get player dashboard: #{reason}")
        {:error, reason}
    end
  end

  # Private functions
  defp mint_headshot_achievement(wallet_address, kill_data) do
    case SolanaClient.mint_headshot_token(wallet_address, kill_data) do
      {:ok, mint_result} ->
        achievement = %{
          type: "headshot",
          timestamp: DateTime.utc_now(),
          transaction: mint_result.transaction_signature,
          token_account: mint_result.token_account
        }

        Logger.info("Headshot achievement processed for: #{wallet_address}")
        {:ok, achievement}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp mint_streak_achievement(wallet_address, streak_data) do
    case SolanaClient.mint_streak_token(wallet_address, streak_data) do
      {:ok, mint_result} ->
        achievement = %{
          type: "kill_streak",
          streak_count: streak_data.streak_count,
          timestamp: DateTime.utc_now(),
          transaction: mint_result.transaction_signature,
          token_account: mint_result.token_account
        }

        Logger.info("Kill streak achievement processed for: #{wallet_address}")
        {:ok, achievement}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_recent_achievements(_wallet_address) do
    # Mock recent achievements for hackathon
    [
      %{
        type: "headshot",
        timestamp: DateTime.add(DateTime.utc_now(), -3600, :second),
        map: "de_dust2"
      },
      %{
        type: "kill_streak",
        streak_count: 10,
        timestamp: DateTime.add(DateTime.utc_now(), -7200, :second),
        map: "de_mirage"
      }
    ]
  end
end

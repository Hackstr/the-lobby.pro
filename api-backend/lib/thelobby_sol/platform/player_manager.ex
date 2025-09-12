defmodule ThelobbySol.Platform.PlayerManager do
  @moduledoc """
  Player management and analytics
  Coordinates between gaming events and blockchain operations
  """

  import Ecto.Query, warn: false
  alias ThelobbySol.Repo
  alias ThelobbySol.Platform.Player
  alias ThelobbySol.Platform.Achievement
  alias ThelobbySol.Gaming.CS2Integration
  alias ThelobbySol.Blockchain.SolanaClient

  require Logger

  @doc """
  Register new player with wallet
  """
  def register_player(wallet_address) do
    with {:ok, validated_wallet} <- SolanaClient.validate_wallet(wallet_address) do

      # Check if player already exists
      case Repo.get_by(Player, wallet_address: validated_wallet) do
        nil ->
          # Create new player
          {:ok, blockchain_result} = SolanaClient.initialize_player(validated_wallet)

          player_attrs = %{
            wallet_address: validated_wallet,
            blockchain_account: blockchain_result.player_stats_account,
            status: "active"
          }

          case Repo.insert(Player.changeset(%Player{}, player_attrs)) do
            {:ok, player} ->
              Logger.info("Player registered: #{validated_wallet}")
              {:ok, player}

            {:error, changeset} ->
              Logger.error("Failed to create player: #{inspect(changeset.errors)}")
              {:error, "Failed to create player"}
          end

        existing_player ->
          Logger.info("Player already exists: #{validated_wallet}")
          {:ok, existing_player}
      end
    else
      {:error, reason} ->
        Logger.error("Failed to validate wallet: #{reason}")
        {:error, reason}
    end
  end

  @doc """
  Process gaming achievement and mint appropriate tokens
  """
  def process_achievement(wallet_address, achievement_type, achievement_data) do
    # Ensure player exists
    {:ok, player} = ensure_player_exists(wallet_address)

    case achievement_type do
      :headshot ->
        mint_headshot_achievement(player, achievement_data)

      :kill_streak ->
        mint_streak_achievement(player, achievement_data)

      _ ->
        {:error, "Unknown achievement type"}
    end
  end

  defp ensure_player_exists(wallet_address) do
    case Repo.get_by(Player, wallet_address: wallet_address) do
      nil -> register_player(wallet_address)
      existing_player -> {:ok, existing_player}
    end
  end

  @doc """
  Get comprehensive player dashboard data
  """
  def get_player_dashboard(wallet_address) do
    case Repo.get_by(Player, wallet_address: wallet_address) do
      nil ->
        # Player doesn't exist, create with demo data for hackathon
        {:ok, player} = register_player(wallet_address)
        build_dashboard_data(player)

      player ->
        build_dashboard_data(player)
    end
  end

  defp build_dashboard_data(player) do
    recent_achievements = get_recent_achievements(player.wallet_address)
    xp = Player.calculate_xp(player)
    level = Player.get_level(xp)

    dashboard_data = %{
      wallet_address: player.wallet_address,
      stats: %{
        headshots: player.headshots,
        kill_streaks: player.kill_streaks,
        total_kills: player.total_kills,
        xp: xp,
        level: level,
        wallet_address: player.wallet_address
      },
      claimed_achievements: player.claimed_achievements || [],
      recent_achievements: recent_achievements,
      available_servers: CS2Integration.list_servers(),
      last_updated: DateTime.utc_now()
    }

    {:ok, dashboard_data}
  end

  # Private functions
  defp mint_headshot_achievement(player, kill_data) do
    # Mint token on blockchain
    {:ok, mint_result} = SolanaClient.mint_headshot_token(player.wallet_address, kill_data)

    # Create achievement record
    achievement_attrs = Achievement.create_headshot_achievement(
      player.wallet_address,
      kill_data,
      mint_result
    )

    case Repo.insert(Achievement.changeset(%Achievement{}, achievement_attrs)) do
      {:ok, achievement} ->
        # Update player stats
        updated_player = Repo.update!(Player.update_stats_changeset(player, %{
          headshots: player.headshots + 1,
          total_kills: player.total_kills + 1
        }))

        result = %{
          type: "headshot",
          timestamp: achievement.inserted_at,
          transaction: achievement.transaction_signature,
          token_account: achievement.token_account,
          xp_gained: achievement.xp_gained,
          player_stats: %{
            headshots: updated_player.headshots,
            kill_streaks: updated_player.kill_streaks,
            total_kills: updated_player.total_kills,
            xp: Player.calculate_xp(updated_player)
          }
        }

        Logger.info("Headshot achievement processed for: #{player.wallet_address}")
        {:ok, result}

      {:error, changeset} ->
        Logger.error("Failed to create achievement: #{inspect(changeset.errors)}")
        {:error, "Failed to create achievement"}
    end
  end

  defp mint_streak_achievement(player, streak_data) do
    # Mint token on blockchain
    {:ok, mint_result} = SolanaClient.mint_streak_token(player.wallet_address, streak_data)

    # Create achievement record
    achievement_attrs = Achievement.create_streak_achievement(
      player.wallet_address,
      streak_data,
      mint_result
    )

    case Repo.insert(Achievement.changeset(%Achievement{}, achievement_attrs)) do
      {:ok, achievement} ->
        # Update player stats
        updated_player = Repo.update!(Player.update_stats_changeset(player, %{
          kill_streaks: player.kill_streaks + 1,
          total_kills: player.total_kills + Map.get(streak_data, "streak_count", 10)
        }))

        result = %{
          type: "kill_streak",
          streak_count: achievement.streak_count,
          timestamp: achievement.inserted_at,
          transaction: achievement.transaction_signature,
          token_account: achievement.token_account,
          xp_gained: achievement.xp_gained,
          player_stats: %{
            headshots: updated_player.headshots,
            kill_streaks: updated_player.kill_streaks,
            total_kills: updated_player.total_kills,
            xp: Player.calculate_xp(updated_player)
          }
        }

        Logger.info("Kill streak achievement processed for: #{player.wallet_address}")
        {:ok, result}

      {:error, changeset} ->
        Logger.error("Failed to create achievement: #{inspect(changeset.errors)}")
        {:error, "Failed to create achievement"}
    end
  end

  @doc """
  Reset player statistics to zero
  """
  def reset_player_stats(wallet_address) do
    case Repo.get_by(Player, wallet_address: wallet_address) do
      nil ->
        {:error, "Player not found"}

      player ->
        # Reset all stats to zero and clear claimed achievements
        updated_player = Repo.update!(Player.changeset(player, %{
          headshots: 0,
          kill_streaks: 0,
          total_kills: 0,
          claimed_achievements: []
        }))

        # Delete all achievements
        from(a in Achievement, where: a.wallet_address == ^wallet_address)
        |> Repo.delete_all()

        Logger.info("Player stats reset for: #{wallet_address}")
        {:ok, updated_player}
    end
  end

  @doc """
  Claim achievement and get bonus SKILLS token
  """
  def claim_achievement(wallet_address, achievement_id) do
    case Repo.get_by(Player, wallet_address: wallet_address) do
      nil ->
        {:error, "Player not found"}

      player ->
        # Check if achievement is already claimed
        if achievement_id in player.claimed_achievements do
          {:error, "Достижение уже получено"}
        else
          # Check if achievement is unlocked and not yet claimed
          case check_achievement_eligibility(player, achievement_id) do
            {:ok, achievement_name} ->
              # Award bonus SKILLS token
            {:ok, mint_result} = SolanaClient.mint_headshot_token(wallet_address, %{
              "achievement_bonus" => achievement_id,
              "bonus_type" => "achievement_claim"
            })

            # Create achievement claim record
            achievement_attrs = Achievement.create_headshot_achievement(
              wallet_address,
              %{"achievement_id" => achievement_id, "achievement_name" => achievement_name},
              mint_result
            )

            case Repo.insert(Achievement.changeset(%Achievement{}, achievement_attrs)) do
              {:ok, achievement} ->
                # Mark achievement as claimed
                updated_claimed = [achievement_id | player.claimed_achievements]
                Repo.update!(Player.changeset(player, %{claimed_achievements: updated_claimed}))

                Logger.info("🏆 Achievement claimed: #{achievement_name} by #{wallet_address}")

                {:ok, %{
                  achievement_id: achievement_id,
                  achievement_name: achievement_name,
                  transaction: achievement.transaction_signature,
                  token_account: achievement.token_account,
                  message: "🏆 #{achievement_name} получено! +1 BONUS SKILLS!"
                }}

              {:error, changeset} ->
                Logger.error("Failed to claim achievement: #{inspect(changeset.errors)}")
                {:error, "Failed to claim achievement"}
            end

            {:error, reason} ->
              {:error, reason}
          end
        end
    end
  end

  @doc """
  Check if player is eligible for achievement and not yet claimed
  """
  defp check_achievement_eligibility(player, achievement_id) do
    case achievement_id do
      "first_headshot" ->
        if player.headshots >= 1 do
          {:ok, "Первый хедшот"}
        else
          {:error, "Недостаточно хедшотов"}
        end

      "headshot_master" ->
        if player.headshots >= 50 do
          {:ok, "Мастер хедшотов"}
        else
          {:error, "Нужно 50 хедшотов"}
        end

      "first_streak" ->
        if player.kill_streaks >= 1 do
          {:ok, "Первая серия"}
        else
          {:error, "Недостаточно серий"}
        end

      "streak_legend" ->
        if player.kill_streaks >= 10 do
          {:ok, "Легенда серий"}
        else
          {:error, "Нужно 10 серий"}
        end

      "killer" ->
        if player.total_kills >= 100 do
          {:ok, "Убийца"}
        else
          {:error, "Нужно 100 убийств"}
        end

      _ ->
        {:error, "Unknown achievement"}
    end
  end

  @doc """
  Check for achievement unlocks and award bonus tokens
  """
  defp check_and_award_achievement_bonuses(player, achievement_type) do
    Logger.info("Checking achievements for player: #{player.wallet_address}, type: #{achievement_type}")
    Logger.info("Player stats: headshots=#{player.headshots}, streaks=#{player.kill_streaks}, kills=#{player.total_kills}")

    bonus_tokens = []

    # Check for first headshot achievement
    if achievement_type == "headshot" && player.headshots == 1 do
      bonus_tokens = ["first_headshot" | bonus_tokens]
      Logger.info("🏆 ACHIEVEMENT UNLOCKED: Первый хедшот! +1 BONUS SKILLS")
    end

    # Check for headshot master achievement
    if achievement_type == "headshot" && player.headshots == 50 do
      bonus_tokens = ["headshot_master" | bonus_tokens]
      Logger.info("🏆 ACHIEVEMENT UNLOCKED: Мастер хедшотов! +1 BONUS SKILLS")
    end

    # Check for first streak achievement
    if achievement_type == "kill_streak" && player.kill_streaks == 1 do
      bonus_tokens = ["first_streak" | bonus_tokens]
      Logger.info("🏆 ACHIEVEMENT UNLOCKED: Первая серия! +1 BONUS SKILLS")
    end

    # Check for streak legend achievement
    if achievement_type == "kill_streak" && player.kill_streaks == 10 do
      bonus_tokens = ["streak_legend" | bonus_tokens]
      Logger.info("🏆 ACHIEVEMENT UNLOCKED: Легенда серий! +1 BONUS SKILLS")
    end

    # Check for killer achievement
    if player.total_kills == 100 do
      bonus_tokens = ["killer" | bonus_tokens]
      Logger.info("🏆 ACHIEVEMENT UNLOCKED: Убийца! +1 BONUS SKILLS")
    end

    # Award bonus SKILLS tokens for each achievement
    Enum.each(bonus_tokens, fn achievement_id ->
      {:ok, _bonus_result} = SolanaClient.mint_headshot_token(player.wallet_address, %{
        "achievement_bonus" => achievement_id,
        "bonus_type" => "achievement_unlock"
      })
    end)

    bonus_tokens
  end

  defp get_recent_achievements(wallet_address) do
    # Get real achievements from database
    achievements =
      from(a in Achievement,
        where: a.wallet_address == ^wallet_address,
        order_by: [desc: a.inserted_at],
        limit: 10
      )
      |> Repo.all()

    # Convert to frontend format
    Enum.map(achievements, fn achievement ->
      %{
        type: achievement.achievement_type,
        timestamp: achievement.inserted_at,
        map: achievement.map_name,
        weapon: achievement.weapon,
        streak_count: achievement.streak_count,
        xp_gained: achievement.xp_gained,
        achievement_data: achievement.achievement_data
      }
    end)
  end
end

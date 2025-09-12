defmodule ThelobbySol.Platform.Achievement do
  use Ecto.Schema
  import Ecto.Changeset

  schema "achievements" do
    field :wallet_address, :string
    field :achievement_type, :string  # "headshot" or "kill_streak"
    field :achievement_data, :map     # JSON data about the achievement
    field :transaction_signature, :string
    field :token_account, :string
    field :xp_gained, :integer, default: 0
    field :map_name, :string
    field :weapon, :string
    field :streak_count, :integer

    timestamps()
  end

  @doc false
  def changeset(achievement, attrs) do
    achievement
    |> cast(attrs, [:wallet_address, :achievement_type, :achievement_data, :transaction_signature,
                    :token_account, :xp_gained, :map_name, :weapon, :streak_count])
    |> validate_required([:wallet_address, :achievement_type])
    |> validate_inclusion(:achievement_type, ["headshot", "kill_streak", "achievement_claim"])
    |> validate_number(:xp_gained, greater_than_or_equal_to: 0)
  end

  def create_headshot_achievement(wallet_address, kill_data, transaction_result) do
    # Check if this is an achievement claim
    is_achievement_claim = Map.has_key?(kill_data, "achievement_id")

    %{
      wallet_address: wallet_address,
      achievement_type: if(is_achievement_claim, do: "achievement_claim", else: "headshot"),
      achievement_data: kill_data,
      transaction_signature: transaction_result.transaction_signature,
      token_account: transaction_result.token_account,
      xp_gained: 10,
      map_name: Map.get(kill_data, "map", "unknown"),
      weapon: Map.get(kill_data, "weapon", "unknown")
    }
  end

  def create_streak_achievement(wallet_address, streak_data, transaction_result) do
    %{
      wallet_address: wallet_address,
      achievement_type: "kill_streak",
      achievement_data: streak_data,
      transaction_signature: transaction_result.transaction_signature,
      token_account: transaction_result.token_account,
      xp_gained: 50,
      map_name: Map.get(streak_data, "map", "unknown"),
      streak_count: Map.get(streak_data, "streak_count", 10)
    }
  end
end

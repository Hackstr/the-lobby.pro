defmodule ThelobbySol.Platform.Player do
  use Ecto.Schema
  import Ecto.Changeset

  schema "players" do
    field :wallet_address, :string
    field :headshots, :integer, default: 0
    field :kill_streaks, :integer, default: 0
    field :total_kills, :integer, default: 0
    field :blockchain_account, :string
    field :status, :string, default: "active"
    field :claimed_achievements, {:array, :string}, default: []

    timestamps()
  end

  @doc false
  def changeset(player, attrs) do
    player
    |> cast(attrs, [:wallet_address, :headshots, :kill_streaks, :total_kills, :blockchain_account, :status, :claimed_achievements])
    |> validate_required([:wallet_address])
    |> unique_constraint(:wallet_address)
    |> validate_format(:wallet_address, ~r/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, message: "Invalid Solana wallet address")
  end

  def update_stats_changeset(player, stats) do
    player
    |> cast(stats, [:headshots, :kill_streaks, :total_kills])
    |> validate_number(:headshots, greater_than_or_equal_to: 0)
    |> validate_number(:kill_streaks, greater_than_or_equal_to: 0)
    |> validate_number(:total_kills, greater_than_or_equal_to: 0)
  end

  def calculate_xp(player) do
    (player.headshots * 10) + (player.kill_streaks * 50) + (player.total_kills * 2)
  end

  def get_level(xp) do
    cond do
      xp >= 500 -> %{level: 5, title: "Легенда", color: "text-yellow-400", min_xp: 500, max_xp: 99999}
      xp >= 300 -> %{level: 4, title: "Ветеран", color: "text-purple-400", min_xp: 300, max_xp: 500}
      xp >= 150 -> %{level: 3, title: "Снайпер", color: "text-blue-400", min_xp: 150, max_xp: 300}
      xp >= 50 -> %{level: 2, title: "Стрелок", color: "text-green-400", min_xp: 50, max_xp: 150}
      true -> %{level: 1, title: "Новичок", color: "text-gray-400", min_xp: 0, max_xp: 50}
    end
  end
end

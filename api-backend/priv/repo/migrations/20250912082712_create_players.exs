defmodule ThelobbySol.Repo.Migrations.CreatePlayers do
  use Ecto.Migration

  def change do
    create table(:players) do
      add :wallet_address, :string, null: false
      add :headshots, :integer, default: 0
      add :kill_streaks, :integer, default: 0
      add :total_kills, :integer, default: 0
      add :blockchain_account, :string
      add :status, :string, default: "active"

      timestamps()
    end

    create unique_index(:players, [:wallet_address])
  end
end

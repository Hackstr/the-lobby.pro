defmodule ThelobbySol.Repo.Migrations.CreateAchievements do
  use Ecto.Migration

  def change do
    create table(:achievements) do
      add :wallet_address, :string, null: false
      add :achievement_type, :string, null: false
      add :achievement_data, :map, default: %{}
      add :transaction_signature, :string
      add :token_account, :string
      add :xp_gained, :integer, default: 0
      add :map_name, :string
      add :weapon, :string
      add :streak_count, :integer

      timestamps()
    end

    create index(:achievements, [:wallet_address])
    create index(:achievements, [:achievement_type])
    create index(:achievements, [:inserted_at])
  end
end

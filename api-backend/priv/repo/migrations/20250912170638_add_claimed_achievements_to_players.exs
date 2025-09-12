defmodule ThelobbySol.Repo.Migrations.AddClaimedAchievementsToPlayers do
  use Ecto.Migration

  def change do
    alter table(:players) do
      add :claimed_achievements, {:array, :string}, default: []
    end
  end
end

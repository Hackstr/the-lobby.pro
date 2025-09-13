defmodule ThelobbySol.Release do
  @moduledoc """
  Used for executing DB release tasks when run in production without Mix
  installed.
  """
  @app :thelobby_sol

  def migrate do
    load_app()

    for repo <- repos() do
      # Create database if it doesn't exist
      case repo.__adapter__.storage_up(repo.config) do
        :ok -> IO.puts("Database created successfully")
        {:error, :already_up} -> IO.puts("Database already exists")
        {:error, term} -> IO.puts("Database creation failed: #{inspect(term)}")
      end

      # Run migrations
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def rollback(repo, version) do
    load_app()
    {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :down, to: version))
  end

  defp repos do
    Application.fetch_env!(@app, :ecto_repos)
  end

  defp load_app do
    Application.load(@app)
  end
end

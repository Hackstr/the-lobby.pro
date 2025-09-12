defmodule ThelobbySol.Repo do
  use Ecto.Repo,
    otp_app: :thelobby_sol,
    adapter: Ecto.Adapters.Postgres
end

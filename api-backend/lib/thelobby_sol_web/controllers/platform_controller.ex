defmodule ThelobbysolWeb.PlatformController do
  use ThelobbysolWeb, :controller

  import Ecto.Query, warn: false
  alias ThelobbySol.Repo
  alias ThelobbySol.Platform.Player
  alias ThelobbySol.Gaming.CS2Integration

  def stats(conn, _params) do
    aggregates =
      from(p in Player,
        where: p.status == "active",
        select: %{
          total_headshots: coalesce(sum(p.headshots), 0),
          total_kill_streaks: coalesce(sum(p.kill_streaks), 0),
          total_kills: coalesce(sum(p.total_kills), 0),
          total_players: count(p.id)
        }
      )
      |> Repo.one()

    servers = CS2Integration.list_servers()
    servers_online = Enum.count(servers, fn s -> (s[:status] || s["status"]) == "online" end)

    data = %{
      total_headshots: aggregates.total_headshots || 0,
      total_kill_streaks: aggregates.total_kill_streaks || 0,
      total_kills: aggregates.total_kills || 0,
      total_players: aggregates.total_players || 0,
      servers_online: servers_online,
      total_servers: length(servers),
      # базовая оценка сминченных токенов из логики: 1 за хедшот, 5 за серию
      estimated_skills_minted: (aggregates.total_headshots || 0) + 5 * (aggregates.total_kill_streaks || 0)
    }

    conn
    |> put_status(:ok)
    |> json(%{success: true, data: data})
  end
end

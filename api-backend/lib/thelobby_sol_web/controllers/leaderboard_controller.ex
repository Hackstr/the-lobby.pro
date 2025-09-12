defmodule ThelobbysolWeb.LeaderboardController do
  use ThelobbysolWeb, :controller

  import Ecto.Query, warn: false
  alias ThelobbySol.Repo
  alias ThelobbySol.Platform.Player

  def index(conn, params) do
    sort_by = Map.get(params, "sort_by", "xp")
    limit = Map.get(params, "limit", "20") |> String.to_integer()

    players = get_leaderboard_players(sort_by, limit)

    conn
    |> put_status(:ok)
    |> json(%{
      success: true,
      data: %{
        players: players,
        sort_by: sort_by,
        total_players: get_total_players_count()
      }
    })
  end

  defp get_leaderboard_players(sort_by, limit) do
    base_query = from(p in Player, where: p.status == "active")

    query = case sort_by do
      "headshots" ->
        from(p in base_query,
          order_by: [desc: p.headshots, desc: p.total_kills],
          limit: ^limit
        )

      "kill_streaks" ->
        from(p in base_query,
          order_by: [desc: p.kill_streaks, desc: p.total_kills],
          limit: ^limit
        )

      "total_kills" ->
        from(p in base_query,
          order_by: [desc: p.total_kills, desc: p.headshots],
          limit: ^limit
        )

      _ -> # default: xp
        from(p in base_query,
          order_by: [desc: fragment("(? * 10) + (? * 50) + (? * 2)", p.headshots, p.kill_streaks, p.total_kills)],
          limit: ^limit
        )
    end

    players = Repo.all(query)

    # Convert to leaderboard format
    players
    |> Enum.with_index(1)
    |> Enum.map(fn {player, rank} ->
      xp = Player.calculate_xp(player)
      level = Player.get_level(xp)

      %{
        rank: rank,
        wallet_address: player.wallet_address,
        display_name: generate_display_name(player.wallet_address),
        headshots: player.headshots,
        kill_streaks: player.kill_streaks,
        total_kills: player.total_kills,
        xp: xp,
        level: level.title,
        level_color: level.color,
        skills_tokens: player.headshots + player.kill_streaks, # Базовые токены
        claimed_achievements: length(player.claimed_achievements || [])
      }
    end)
  end

  defp get_total_players_count do
    from(p in Player, where: p.status == "active", select: count(p.id))
    |> Repo.one()
  end

  defp generate_display_name(wallet_address) do
    # Generate cool gaming names from wallet address
    hash = :crypto.hash(:md5, wallet_address) |> Base.encode16() |> String.slice(0, 8)

    prefixes = ["Pro", "Elite", "Hack", "Skill", "Token", "Sol", "CS2", "Sniper", "Legend", "Master"]
    suffixes = ["Str", "God", "King", "Lord", "Pro", "X", "99", "2K", "Sol", "NFT"]

    prefix_index = String.to_integer(String.slice(hash, 0, 1), 16) |> rem(length(prefixes))
    suffix_index = String.to_integer(String.slice(hash, 1, 1), 16) |> rem(length(suffixes))

    "#{Enum.at(prefixes, prefix_index)}#{Enum.at(suffixes, suffix_index)}"
  end
end

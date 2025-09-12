defmodule ThelobbySol.Gaming.CS2Integration do
  @moduledoc """
  CS2 Server Integration Module
  Handles RCON connections and kill event processing
  """

  require Logger

  @doc """
  Get list of available CS2 servers
  """
  def list_servers do
    [
      %{
        id: "server_1",
        name: "🔥 The Lobby CS2 Server #1",
        ip: "77.240.39.110",
        port: 27015,
        map: "de_dust2",
        players: "12/16",
        status: "online"
      },
      %{
        id: "server_2",
        name: "⚡ The Lobby CS2 Server #2",
        ip: "77.240.39.110",
        port: 27016,
        map: "de_mirage",
        players: "8/16",
        status: "online"
      }
    ]
  end

  @doc """
  Process kill events from CS2 server
  Returns parsed kill data for token minting
  """
  def process_kill_event(raw_event) do
    # Mock implementation for hackathon
    # In production, this would parse actual RCON logs
    case parse_kill_log(raw_event) do
      {:ok, kill_data} ->
        if kill_data.is_headshot do
          {:headshot, kill_data}
        else
          {:kill, kill_data}
        end

      {:error, reason} ->
        Logger.error("Failed to parse kill event: #{reason}")
        {:error, reason}
    end
  end

  @doc """
  Check for kill streaks and return streak data
  """
  def check_kill_streak(player_id, recent_kills) do
    streak_count = count_consecutive_kills(recent_kills)

    if streak_count >= 10 and rem(streak_count, 10) == 0 do
      {:streak, %{player_id: player_id, streak_count: streak_count}}
    else
      {:no_streak, streak_count}
    end
  end

  # Private functions for parsing (mock implementation)
  defp parse_kill_log(_raw_event) do
    # Parse CS2 log format and extract kill information
    {:ok, %{
      killer_id: "player_123",
      victim_id: "player_456",
      weapon: "ak47",
      is_headshot: :rand.uniform() > 0.7,
      timestamp: DateTime.utc_now()
    }}
  end

  defp count_consecutive_kills(kills) do
    # Simple consecutive kill counter
    Enum.count(kills)
  end
end

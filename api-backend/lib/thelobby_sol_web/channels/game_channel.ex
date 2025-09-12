defmodule ThelobbysolWeb.GameChannel do
  use ThelobbysolWeb, :channel

  alias ThelobbySol.Platform.PlayerManager

  @impl true
  def join("game:lobby", _payload, socket) do
    {:ok, socket}
  end

  def join("game:player:" <> wallet_address, _payload, socket) do
    socket = assign(socket, :wallet_address, wallet_address)
    {:ok, socket}
  end

  @impl true
  def handle_in("simulate_headshot", %{"wallet_address" => wallet_address}, socket) do
    # Simulate headshot event
    case PlayerManager.process_achievement(wallet_address, :headshot, %{
      weapon: "ak47",
      map: "de_dust2",
      timestamp: DateTime.utc_now()
    }) do
      {:ok, achievement} ->
        # Broadcast to player channel
        broadcast!(socket, "achievement_earned", %{
          type: "headshot",
          achievement: achievement,
          xp_gained: 10
        })

        # Broadcast to lobby
        ThelobbysolWeb.Endpoint.broadcast!("game:lobby", "player_achievement", %{
          wallet_address: wallet_address,
          type: "headshot",
          timestamp: DateTime.utc_now()
        })

        {:reply, {:ok, %{success: true, achievement: achievement}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  @impl true
  def handle_in("simulate_kill_streak", %{"wallet_address" => wallet_address, "streak_count" => streak_count}, socket) do
    # Simulate kill streak event
    case PlayerManager.process_achievement(wallet_address, :kill_streak, %{
      streak_count: streak_count,
      map: "de_mirage",
      timestamp: DateTime.utc_now()
    }) do
      {:ok, achievement} ->
        # Broadcast to player channel
        broadcast!(socket, "achievement_earned", %{
          type: "kill_streak",
          achievement: achievement,
          xp_gained: 50,
          streak_count: streak_count
        })

        # Broadcast to lobby
        ThelobbysolWeb.Endpoint.broadcast!("game:lobby", "player_achievement", %{
          wallet_address: wallet_address,
          type: "kill_streak",
          streak_count: streak_count,
          timestamp: DateTime.utc_now()
        })

        {:reply, {:ok, %{success: true, achievement: achievement}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  @impl true
  def handle_in("get_live_stats", %{"wallet_address" => wallet_address}, socket) do
    case PlayerManager.get_player_dashboard(wallet_address) do
      {:ok, dashboard_data} ->
        {:reply, {:ok, dashboard_data}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end

  # Handle real CS2 kill events (when server is ready)
  @impl true
  def handle_in("cs2_kill_event", %{"kill_data" => kill_data}, socket) do
    wallet_address = socket.assigns.wallet_address

    achievement_type = if kill_data["is_headshot"], do: :headshot, else: :kill

    case PlayerManager.process_achievement(wallet_address, achievement_type, kill_data) do
      {:ok, achievement} ->
        broadcast!(socket, "achievement_earned", %{
          type: achievement_type,
          achievement: achievement,
          kill_data: kill_data
        })

        {:reply, {:ok, %{success: true}}, socket}

      {:error, reason} ->
        {:reply, {:error, %{reason: reason}}, socket}
    end
  end
end

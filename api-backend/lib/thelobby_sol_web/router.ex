defmodule ThelobbysolWeb.Router do
  use ThelobbysolWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug
  end

  scope "/api", ThelobbysolWeb do
    pipe_through :api

    # Health check
    get "/health", HealthController, :check

    # Player management routes
    post "/players/register", PlayerController, :register
    get "/players/:wallet_address/dashboard", PlayerController, :dashboard
    post "/players/achievement", PlayerController, :process_achievement

    # Demo simulation routes
    post "/players/:wallet_address/simulate-headshot", PlayerController, :simulate_headshot
    post "/players/:wallet_address/simulate-streak", PlayerController, :simulate_kill_streak
    post "/players/:wallet_address/reset-stats", PlayerController, :reset_player_stats
    post "/players/:wallet_address/claim-achievement", PlayerController, :claim_achievement

    # Gaming routes
    get "/gaming/servers", GamingController, :servers
    get "/gaming/servers/:server_id", GamingController, :server_status
    post "/gaming/simulate-kill", GamingController, :simulate_kill_event
    post "/gaming/rcon-command", GamingController, :rcon_command
    get "/gaming/rcon-status", GamingController, :rcon_status

    # Leaderboard routes
    get "/leaderboard", LeaderboardController, :index

    # Platform stats
    get "/platform/stats", PlatformController, :stats
  end

  # Additional health endpoints
  scope "/", ThelobbysolWeb do
    pipe_through :api

    get "/health", HealthController, :check
    get "/ping", TestController, :ping
    get "/test-cors", TestController, :test_cors
    options "/test-cors", TestController, :test_cors
  end
end

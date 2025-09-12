defmodule ThelobbysolWeb.Router do
  use ThelobbysolWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug
  end

  scope "/api", ThelobbysolWeb do
    pipe_through :api

    # Player management routes
    post "/players/register", PlayerController, :register
    get "/players/:wallet_address/dashboard", PlayerController, :dashboard
    post "/players/achievement", PlayerController, :process_achievement

    # Gaming routes
    get "/gaming/servers", GamingController, :servers
    get "/gaming/servers/:server_id", GamingController, :server_status
    post "/gaming/simulate-kill", GamingController, :simulate_kill_event
  end

  # Health check and test endpoints
  scope "/", ThelobbysolWeb do
    pipe_through :api

    get "/health", HealthController, :check
    get "/ping", TestController, :ping
    get "/test-cors", TestController, :test_cors
    options "/test-cors", TestController, :test_cors
  end
end

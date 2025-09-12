import Config

# For production, don't forget to configure the url host
# to something meaningful, Phoenix uses this information
# when generating URLs.

config :thelobby_sol, ThelobbysolWeb.Endpoint,
  url: [host: System.get_env("PHX_HOST") || "api.thelobby.sol"],
  http: [
    # Enable IPv6 and bind on all interfaces.
    # Set it to  {0, 0, 0, 0, 0, 0, 0, 1} for local network only access.
    # See the documentation on https://hexdocs.pm/plug_cowboy/Plug.Cowboy.html
    # for details about using IPv6 vs IPv4 and loopback vs public addresses.
    ip: {0, 0, 0, 0, 0, 0, 0, 0},
    port: String.to_integer(System.get_env("PORT") || "4000")
  ],
  secret_key_base: System.get_env("SECRET_KEY_BASE"),
  check_origin: [
    "https://thelobby.sol",
    "https://www.thelobby.sol",
    "https://app.thelobby.sol",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ]

# Configures Swoosh API Client
config :swoosh, api_client: Swoosh.ApiClient.Finch, finch_name: ThelobbySol.Finch

# Disable Swoosh Local Memory Storage
config :swoosh, local: false

# Do not print debug messages in production
config :logger, level: :info

# Runtime production config, including reading
# of environment variables, is done on config/runtime.exs.

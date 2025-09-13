import Config

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  config :thelobby_sol, ThelobbySol.Repo,
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "5"),
    socket_options: [:inet6],
    timeout: 60_000,
    connect_timeout: 60_000

  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "thelobby-sol-api.fly.dev"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :thelobby_sol, ThelobbysolWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base,
    server: true

  # CS2 Server configuration
  config :thelobby_sol, :cs2_server,
    host: System.get_env("CS2_SERVER_HOST") || "82.115.43.10",
    port: String.to_integer(System.get_env("CS2_SERVER_PORT") || "27015"),
    rcon_port: String.to_integer(System.get_env("CS2_RCON_PORT") || "27015"),
    rcon_password: System.get_env("CS2_RCON_PASSWORD") || "thelobby_rcon_2024_hackathon",
    ssh_password: System.get_env("CS2_SSH_PASSWORD") || "wcbEnDhG3bX8/swzQa2HHBo="

  # Solana configuration
  config :thelobby_sol, :solana,
    rpc_url: System.get_env("SOLANA_RPC_URL") || "https://api.devnet.solana.com",
    program_id: System.get_env("SOLANA_PROGRAM_ID") || "HackathonSkillTokenProgram111111111111111"

  # Unified SKILLS token configuration (single mint on Devnet)
  config :thelobby_sol, :skills,
    mint: System.get_env("SKILLS_MINT_ADDRESS") || "SKILLSMint111111111111111111111111111111111",
    symbol: System.get_env("SKILLS_TOKEN_SYMBOL") || "SKILLS",
    decimals: String.to_integer(System.get_env("SKILLS_TOKEN_DECIMALS") || "9")

  # External minter service URL (optional; if not set, uses mock)
  config :thelobby_sol, :mint_service_url, System.get_env("MINT_SERVICE_URL")
end

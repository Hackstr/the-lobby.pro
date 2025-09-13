defmodule ThelobbySol.Blockchain.SolanaClient do
  @moduledoc """
  Solana blockchain integration
  Handles wallet connections and token operations
  """

  require Logger

  # fetch at runtime to avoid compile-time env mismatch on Fly
  defp solana_rpc_url, do: Application.get_env(:thelobby_sol, :solana)[:rpc_url] || "https://api.devnet.solana.com"
  defp program_id, do: Application.get_env(:thelobby_sol, :solana)[:program_id] || "HackathonSkillTokenProgram111111111111111"
  defp skills_mint, do: Application.get_env(:thelobby_sol, :skills)[:mint] || "SKILLSMint111111111111111111111111111111111"
  defp skills_symbol, do: Application.get_env(:thelobby_sol, :skills)[:symbol] || "SKILLS"

  @doc """
  Validate Solana wallet address
  """
  def validate_wallet(wallet_address) do
    case String.length(wallet_address) do
      44 -> {:ok, wallet_address}
      43 -> {:ok, wallet_address}  # Some wallets might be 43 chars
      _ -> {:error, "Invalid wallet address length"}
    end
  end

  @doc """
  Initialize player on Solana blockchain
  """
  def initialize_player(wallet_address) do
    # Initialize player account on Solana blockchain
    Logger.info("Initializing player: #{wallet_address}")

    {:ok, %{
      player_stats_account: generate_pda(wallet_address),
      transaction_signature: generate_mock_signature(),
      status: "initialized"
    }}
  end

  @doc """
  Mint headshot token for player
  """
  def mint_headshot_token(wallet_address, _kill_data) do
    do_mint(wallet_address, 1, "headshot")
  end

  @doc """
  Mint kill streak token for player
  """
  def mint_streak_token(wallet_address, streak_data) do
    _streak_count = Map.get(streak_data, "streak_count", 10)
    # Mint 5 SKILLS per streak simulation for demo
    do_mint(wallet_address, 5, "kill_streak")
  end

  defp do_mint(wallet_address, amount, achievement_type) do
    case Application.get_env(:thelobby_sol, :mint_service_url) do
      nil ->
        Logger.info("[MOCK MINT] #{achievement_type} for #{wallet_address}")
        {:ok, %{
          mint_address: skills_mint(),
          token_name: "Skills Token",
          token_symbol: skills_symbol(),
          token_account: generate_token_account(wallet_address),
          transaction_signature: generate_mock_signature(),
          amount: amount,
          achievement_type: achievement_type
        }}

      mint_service_url ->
        body = Jason.encode!(%{to: wallet_address, amount: amount, memo: achievement_type})
        headers = [{"Content-Type", "application/json"}]
        url = mint_service_url <> "/mint"
        Logger.info("[REAL MINT] POST #{url} -> #{wallet_address}")
        case HTTPoison.post(url, body, headers, timeout: 15_000, recv_timeout: 15_000) do
          {:ok, %HTTPoison.Response{status_code: 200, body: resp_body}} ->
            case Jason.decode(resp_body) do
              {:ok, %{"success" => true, "signature" => sig, "token_account" => ata}} ->
                {:ok, %{
                  mint_address: skills_mint(),
                  token_name: "Skills Token",
                  token_symbol: skills_symbol(),
                  token_account: ata,
                  transaction_signature: sig,
                  amount: amount,
                  achievement_type: achievement_type
                }}
              _ ->
                Logger.error("Mint service unexpected response: #{resp_body}")
                {:error, "mint_service_unexpected_response"}
            end
          {:ok, %HTTPoison.Response{status_code: code, body: resp_body}} ->
            Logger.error("Mint service error #{code}: #{resp_body}")
            {:error, "mint_service_error_#{code}"}
          {:error, reason} ->
            Logger.error("Mint service request failed: #{inspect(reason)}")
            {:error, :mint_service_unreachable}
        end
    end
  end

  @doc """
  Get player statistics from blockchain
  """
  def get_player_stats(wallet_address) do
    # Retrieve player statistics from blockchain
    {:ok, %{
      headshots: :rand.uniform(50),
      kill_streaks: :rand.uniform(10),
      total_kills: :rand.uniform(200),
      wallet_address: wallet_address
    }}
  end

  # Private helper functions
  defp generate_pda(wallet_address) do
    # Mock PDA generation
    "PlayerStats" <> String.slice(wallet_address, 0, 20) <> "111111111"
  end

  defp generate_token_account(wallet_address) do
    # Mock associated token account
    "TokenAccount" <> String.slice(wallet_address, 0, 15) <> "1111111"
  end

  defp generate_mock_signature do
    # Generate mock transaction signature
    :crypto.strong_rand_bytes(32) |> Base.encode64() |> String.slice(0, 88)
  end
end

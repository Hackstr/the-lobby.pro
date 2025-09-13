defmodule ThelobbySol.Gaming.RconClient do
  @moduledoc """
  CS2 RCON Client for real-time server communication
  """

  use GenServer
  require Logger

  @rcon_port 27015
  @rcon_password "thelobby_rcon_2024_hackathon"
  @server_ip "82.115.43.10"

  # Client API
  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def send_command(command) do
    GenServer.call(__MODULE__, {:send_command, command})
  end

  def get_server_status do
    GenServer.call(__MODULE__, :get_status)
  end

  def start_log_monitoring do
    GenServer.cast(__MODULE__, :start_monitoring)
  end

  # GenServer callbacks
  @impl true
  def init(state) do
    # Connect to CS2 server RCON
    case connect_rcon() do
      {:ok, socket} ->
        Logger.info("RCON connected to CS2 server: #{@server_ip}:#{@rcon_port}")
        {:ok, Map.put(state, :socket, socket)}

      {:error, reason} ->
        Logger.warn("RCON connection failed: #{reason}. Using mock mode.")
        {:ok, Map.put(state, :socket, nil)}
    end
  end

  @impl true
  def handle_call({:send_command, command}, _from, state) do
    case state.socket do
      nil ->
        # Mock mode for development
        mock_response = mock_command_response(command)
        {:reply, {:ok, mock_response}, state}

      socket ->
        # Real RCON command
        case send_rcon_command(socket, command) do
          {:ok, response} -> {:reply, {:ok, response}, state}
          {:error, reason} -> {:reply, {:error, reason}, state}
        end
    end
  end

  @impl true
  def handle_call(:get_status, _from, state) do
    status = %{
      connected: state.socket != nil,
      server_ip: @server_ip,
      server_port: @rcon_port,
      last_ping: DateTime.utc_now()
    }
    {:reply, status, state}
  end

  @impl true
  def handle_cast(:start_monitoring, state) do
    # Start log file monitoring for kill events
    if state.socket do
      spawn_link(fn -> monitor_log_file() end)
      Logger.info("Started CS2 log monitoring")
    else
      Logger.info("Log monitoring in mock mode")
    end
    {:noreply, state}
  end

  # Private functions
  defp connect_rcon do
    # For hackathon, we'll use mock connection
    # Real implementation would use :gen_tcp to connect to RCON
    case :gen_tcp.connect(
      String.to_charlist(@server_ip),
      @rcon_port,
      [:binary, packet: 0, active: false],
      5000
    ) do
      {:ok, socket} ->
        # Send RCON auth
        case authenticate_rcon(socket) do
          :ok -> {:ok, socket}
          {:error, reason} -> {:error, reason}
        end

      {:error, reason} ->
        Logger.warn("TCP connection failed: #{reason}")
        {:error, reason}
    end
  end

  defp authenticate_rcon(socket) do
    # RCON authentication protocol
    auth_packet = build_rcon_packet(1, 3, @rcon_password)

    case :gen_tcp.send(socket, auth_packet) do
      :ok ->
        case :gen_tcp.recv(socket, 0, 5000) do
          {:ok, response} ->
            case parse_rcon_response(response) do
              {:ok, _} -> :ok
              {:error, reason} -> {:error, reason}
            end
          {:error, reason} -> {:error, reason}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  defp send_rcon_command(socket, command) do
    packet = build_rcon_packet(2, 2, command)

    case :gen_tcp.send(socket, packet) do
      :ok ->
        case :gen_tcp.recv(socket, 0, 5000) do
          {:ok, response} -> parse_rcon_response(response)
          {:error, reason} -> {:error, reason}
        end
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_rcon_packet(id, type, body) do
    body_size = byte_size(body)
    packet_size = 10 + body_size

    <<packet_size::little-32, id::little-32, type::little-32, body::binary, 0, 0>>
  end

  defp parse_rcon_response(data) do
    case data do
      <<_size::little-32, id::little-32, type::little-32, body::binary>> ->
        body_clean = String.trim_trailing(body, <<0>>)
        {:ok, %{id: id, type: type, body: body_clean}}
      _ ->
        {:error, "Invalid RCON response format"}
    end
  end

  defp monitor_log_file do
    # Monitor CS2 log file for kill events
    # This would tail the log file and parse kill events
    log_path = "/home/cs2server/cs2/game/csgo/logs/latest.log"

    # For now, simulate log monitoring
    :timer.sleep(1000)
    monitor_log_file()
  end

  defp mock_command_response(command) do
    case command do
      "status" ->
        "hostname: The-lobby.pro CS2 Server #1\nversion : 1.40.0.1/13406 secure\nmap     : de_dust2\nplayers : 12/16 (0 bots)\n"

      "users" ->
        "userid name uniqueid connected ping loss state rate adr\n# 2 \"Player1\" STEAM_1:0:123456 02:30 50 0 active 80000\n# 3 \"Player2\" STEAM_1:1:789012 01:45 30 0 active 80000\n"

      _ ->
        "Command executed successfully"
    end
  end
end

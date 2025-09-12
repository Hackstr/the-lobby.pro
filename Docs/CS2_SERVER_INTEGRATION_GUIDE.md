# 🎮 CS2 DEDICATED SERVER INTEGRATION GUIDE
## For The Lobby.Sol Gaming Platform

**Основано на: https://github.com/joedwards32/CS2**

---

## 📋 QUICK REFERENCE

### **Docker Image:** `joedwards32/cs2`
### **Минимальные требования:** 2 CPU, 2GB RAM, 60GB диска
### **Ключевые порты:** 27015 (TCP/UDP), 27020 (UDP)

---

## ⚡ БЫСТРЫЙ ЗАПУСК ДЛЯ ХАКАТОНА

### **1. ПОЛУЧИТЬ SRCDS_TOKEN**
```bash
# Идти на https://steamcommunity.com/dev/managegameservers
# Создать Game Server Account Management token
export SRCDS_TOKEN="YOUR_TOKEN_HERE"
```

### **2. БАЗОВЫЙ ЗАПУСК CS2 СЕРВЕРА**
```bash
# Создать папку для данных
mkdir -p $(pwd)/cs2-data
chown 1000:1000 $(pwd)/cs2-data

# Запустить CS2 сервер
docker run -d \
  --name=cs2-lobby \
  -e SRCDS_TOKEN="$SRCDS_TOKEN" \
  -e CS2_SERVERNAME="Lobby.Sol Test Server" \
  -e CS2_RCONPW="hackathon123" \
  -e CS2_MAXPLAYERS="20" \
  -v $(pwd)/cs2-data:/home/steam/cs2-dedicated/ \
  -p 27015:27015/tcp \
  -p 27015:27015/udp \
  -p 27020:27020/udp \
  joedwards32/cs2
```

### **3. ПРОВЕРИТЬ СТАТУС**
```bash
# Логи сервера
docker logs -f cs2-lobby

# Статус контейнера
docker ps | grep cs2-lobby
```

---

## 🔧 КОНФИГУРАЦИЯ ДЛЯ THELOBBY.SOL

### **ENVIRONMENT VARIABLES ДЛЯ ХАКАТОНА:**

```bash
# Основные настройки
CS2_SERVERNAME="Lobby.Sol Hackathon Server"
CS2_RCONPW="secure_rcon_password"
CS2_MAXPLAYERS="20"
CS2_STARTMAP="de_dust2"

# Игровые режимы (для демо)
CS2_GAMEALIAS="deathmatch"  # Быстрый режим для тестов
CS2_BOT_QUOTA="10"          # Боты для демонстрации
CS2_BOT_DIFFICULTY="1"      # Нормальная сложность

# Логирование (ВАЖНО для token tracking)
CS2_LOG="on"
CS2_LOG_DETAIL="3"          # Все убийства логируются
CS2_LOG_MONEY="1"
CS2_LOG_ITEMS="1"

# Debug для разработки
DEBUG="2"                   # CS2 debug логи
```

### **DOCKER COMPOSE ДЛЯ PRODUCTION:**

```yaml
version: '3.8'
services:
  cs2-server:
    image: joedwards32/cs2:latest
    container_name: lobby-sol-cs2
    restart: unless-stopped
    environment:
      - SRCDS_TOKEN=${SRCDS_TOKEN}
      - CS2_SERVERNAME=Lobby.Sol Gaming Server
      - CS2_RCONPW=${CS2_RCONPW}
      - CS2_MAXPLAYERS=20
      - CS2_GAMEALIAS=competitive
      - CS2_STARTMAP=de_inferno
      - CS2_LOG=on
      - CS2_LOG_DETAIL=3
      - DEBUG=1
    ports:
      - "27015:27015/tcp"
      - "27015:27015/udp"  
      - "27020:27020/udp"
    volumes:
      - ./cs2-data:/home/steam/cs2-dedicated/
      - ./server-configs:/home/steam/cs2-dedicated/game/csgo/cfg/
    networks:
      - lobby-sol-network

networks:
  lobby-sol-network:
    driver: bridge
```

---

## 🔗 RCON ИНТЕГРАЦИЯ (Elixir Phoenix)

### **ELIXIR RCON CLIENT MODULE:**

```elixir
defmodule TheLobby.CS2.RconClient do
  @moduledoc """
  CS2 RCON client для мониторинга game events
  """
  use GenServer
  require Logger

  # RCON команды для мониторинга
  @log_command "logaddress_add 127.0.0.1 27015"
  @status_command "status"
  @players_command "users"

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(opts) do
    server_ip = Keyword.get(opts, :server_ip, "127.0.0.1")
    rcon_port = Keyword.get(opts, :rcon_port, 27015)
    rcon_password = Keyword.get(opts, :rcon_password)
    
    # Подключение к RCON
    case :gen_tcp.connect(server_ip, rcon_port, [:binary, active: false]) do
      {:ok, socket} ->
        # Аутентификация RCON
        authenticate(socket, rcon_password)
        {:ok, %{socket: socket, authenticated: true}}
        
      {:error, reason} ->
        Logger.error("Failed to connect to CS2 RCON: #{inspect(reason)}")
        {:stop, reason}
    end
  end

  # Отправка RCON команды
  def send_command(command) do
    GenServer.call(__MODULE__, {:rcon_command, command})
  end

  # Получение списка игроков
  def get_players do
    send_command(@players_command)
  end

  # Мониторинг kill events
  def monitor_kills do
    send_command("log on")
    send_command(@log_command)
  end
end
```

---

## 📊 KILL EVENT PARSING (Elixir)

### **LOG PARSER MODULE:**

```elixir
defmodule TheLobby.CS2.LogParser do
  @moduledoc """
  Парсер логов CS2 для извлечения kill events
  """

  # Регулярные выражения для парсинга логов
  @kill_regex ~r/(?<killer>.*)<(?<killer_id>\d+)><.*><.*>" killed "(?<victim>.*)<(?<victim_id>\d+)><.*><.*>" with "(?<weapon>.*)"(?: \(headshot\))?/
  @headshot_regex ~r/headshot/

  def parse_kill_event(log_line) do
    case Regex.named_captures(@kill_regex, log_line) do
      %{"killer" => killer, "victim" => victim, "weapon" => weapon} = captures ->
        headshot = String.contains?(log_line, "headshot")
        
        %{
          event_type: :kill,
          killer: %{
            name: killer,
            steam_id: captures["killer_id"]
          },
          victim: %{
            name: victim, 
            steam_id: captures["victim_id"]
          },
          weapon: weapon,
          headshot: headshot,
          timestamp: DateTime.utc_now()
        }
        
      nil ->
        # Не kill event
        nil
    end
  end

  # Pattern matching для разных типов событий
  def parse_event(log_line) do
    cond do
      String.contains?(log_line, " killed ") ->
        parse_kill_event(log_line)
        
      String.contains?(log_line, "Round_Start") ->
        %{event_type: :round_start, timestamp: DateTime.utc_now()}
        
      String.contains?(log_line, "Round_End") ->
        %{event_type: :round_end, timestamp: DateTime.utc_now()}
        
      true ->
        nil
    end
  end
end
```

---

## 🎯 INTEGRATION С SOLANA TOKEN MINTING

### **KILL EVENT → TOKEN PIPELINE:**

```elixir
defmodule TheLobby.Blockchain.TokenMinter do
  @moduledoc """
  Автоматический минтинг токенов за игровые события
  """
  use GenServer
  require Logger

  def handle_kill_event(%{headshot: true, killer: killer} = event) do
    # Headshot = HEADSHOT TOKEN
    spawn_token_mint(killer.steam_id, :headshot_token, event)
  end

  def handle_kill_event(%{killer: killer} = event) do
    # Обычное убийство = обновить счетчик
    update_kill_counter(killer.steam_id)
    
    # Проверить streak
    case get_current_streak(killer.steam_id) do
      streak when streak >= 10 ->
        spawn_token_mint(killer.steam_id, :streak_token, %{streak: streak})
      _ ->
        :ok
    end
  end

  defp spawn_token_mint(steam_id, token_type, metadata) do
    Task.start(fn ->
      # Найти wallet по steam_id
      case find_wallet_by_steam_id(steam_id) do
        {:ok, wallet_address} ->
          # Минтить токен в Solana
          mint_solana_token(wallet_address, token_type, metadata)
          
          # Уведомить frontend через Phoenix Channels
          notify_frontend(steam_id, token_type, metadata)
          
        {:error, :wallet_not_found} ->
          Logger.warn("No wallet found for steam_id: #{steam_id}")
      end
    end)
  end
end
```

---

## 🚀 БЫСТРАЯ НАСТРОЙКА ДЛЯ DEMO

### **СКРИПТ АВТОМАТИЧЕСКОЙ НАСТРОЙКИ:**

```bash
#!/bin/bash
# setup-cs2-demo.sh - Быстрая настройка для хакатона

echo "🎮 Setting up CS2 server for Lobby.Sol demo..."

# 1. Проверить Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен!"
    exit 1
fi

# 2. Получить SRCDS_TOKEN
if [ -z "$SRCDS_TOKEN" ]; then
    echo "⚠️  SRCDS_TOKEN не установлен!"
    echo "Получите токен: https://steamcommunity.com/dev/managegameservers"
    read -p "Введите SRCDS_TOKEN: " SRCDS_TOKEN
fi

# 3. Создать директории
mkdir -p cs2-data
chown 1000:1000 cs2-data

# 4. Создать кастомную конфигурацию
cat > cs2-data/server.cfg << EOF
hostname "Lobby.Sol Hackathon Server"
rcon_password "hackathon123"
sv_password ""
sv_lan 0

// Game settings для демо
mp_autoteambalance 0
mp_limitteams 0
mp_maxrounds 30
mp_roundtime 2
mp_freezetime 3

// Logging для token tracking
log on
sv_logbans 1
sv_logecho 1
sv_logfile 1
sv_log_onefile 0
EOF

# 5. Запустить сервер
echo "🚀 Launching CS2 server..."
docker run -d \
  --name=lobby-sol-cs2 \
  -e SRCDS_TOKEN="$SRCDS_TOKEN" \
  -e CS2_SERVERNAME="Lobby.Sol Hackathon Server" \
  -e CS2_RCONPW="hackathon123" \
  -e CS2_MAXPLAYERS="20" \
  -e CS2_GAMEALIAS="deathmatch" \
  -e CS2_LOG="on" \
  -e CS2_LOG_DETAIL="3" \
  -e DEBUG="2" \
  -v $(pwd)/cs2-data:/home/steam/cs2-dedicated/ \
  -p 27015:27015/tcp \
  -p 27015:27015/udp \
  -p 27020:27020/udp \
  joedwards32/cs2

echo "✅ CS2 server starting up..."
echo "📊 Monitor logs: docker logs -f lobby-sol-cs2"
echo "🎯 Server IP: YOUR_SERVER_IP:27015"
echo "🔧 RCON password: hackathon123"
```

---

## 🔍 МОНИТОРИНГ И ОТЛАДКА

### **ПОЛЕЗНЫЕ DOCKER КОМАНДЫ:**

```bash
# Логи в реальном времени
docker logs -f lobby-sol-cs2

# Войти в контейнер
docker exec -it lobby-sol-cs2 bash

# Проверить статус сервера
docker exec lobby-sol-cs2 ps aux | grep cs2

# Рестарт сервера
docker restart lobby-sol-cs2

# Проверить использование ресурсов
docker stats lobby-sol-cs2
```

### **RCON КОМАНДЫ ДЛЯ ТЕСТИРОВАНИЯ:**

```bash
# Подключиться через RCON (нужен rcon клиент)
rcon -a YOUR_SERVER_IP:27015 -p hackathon123

# Список команд в игре:
status              # Информация о сервере
users               # Список подключенных игроков  
changelevel de_dust2 # Сменить карту
say "Hello World"   # Отправить сообщение
kick PlayerName     # Кикнуть игрока
```

---

## ⚠️ ВАЖНЫЕ NOTES ДЛЯ HACKATHON

### **SECURITY:**
- Не используйте слабые RCON пароли в production
- SRCDS_TOKEN должен быть в environment variables
- Ограничьте доступ к RCON портам

### **PERFORMANCE:**
- Минимум 60GB свободного места
- CS2 требует значительных ресурсов
- Мониторьте использование RAM

### **NETWORKING:**
- Убедитесь что порты 27015, 27020 открыты
- UDP трафик должен проходить свободно
- Настройте firewall корректно

### **DEMO TIPS:**
- Используйте `CS2_GAMEALIAS="deathmatch"` для быстрых тестов
- Добавьте ботов для демонстрации: `CS2_BOT_QUOTA="10"`
- Включите подробное логирование: `CS2_LOG_DETAIL="3"`

---

## 🎯 INTEGRATION ROADMAP

### **PHASE 1: Basic Setup (1 hour)**
- [ ] Запустить CS2 сервер в Docker
- [ ] Настроить RCON подключение
- [ ] Протестировать базовое логирование

### **PHASE 2: Event Monitoring (2 hours)**  
- [ ] Создать Elixir RCON client
- [ ] Реализовать kill event parsing
- [ ] Настроить real-time event streaming

### **PHASE 3: Token Integration (2 hours)**
- [ ] Связать Steam ID с Solana wallets
- [ ] Автоматический минтинг за kill events
- [ ] Phoenix Channels уведомления

### **PHASE 4: Demo Polishing (1 hour)**
- [ ] Добавить ботов для демонстрации
- [ ] Настроить удобные карты
- [ ] Проверить stability

---

*Этот guide обеспечивает полную интеграцию CS2 dedicated server с платформой Lobby.Sol для токенизации игровых достижений.*

**Remember: Keep it simple for hackathon - focus on working demo over perfect code!** 🚀
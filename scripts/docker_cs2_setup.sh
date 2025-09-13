#!/bin/bash

# Docker CS2 Server Setup Script
# Server: 82.115.43.10 (Ubuntu 24.04 LTS)

SERVER_IP="82.115.43.10"
SERVER_USER="ubuntu"
SERVER_PASS="wcbEnDhG3bX8/swzQa2HHBo="

echo "🐳 Setting up CS2 via Docker on $SERVER_IP"
echo "=============================================="

# Add server to known hosts
ssh-keyscan -H $SERVER_IP >> ~/.ssh/known_hosts 2>/dev/null

echo "📦 Step 1: Installing Docker..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Update system
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo apt install -y docker-compose-plugin

# Start Docker service
sudo systemctl enable docker
sudo systemctl start docker

echo "✅ Docker installed successfully"
docker --version
docker compose version
EOF

echo "🎮 Step 2: Setting up CS2 server directories..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Create directories
mkdir -p ~/thelobby-cs2/{cs2-configs,logs}
cd ~/thelobby-cs2

echo "✅ Directories created"
EOF

echo "⚙️ Step 3: Creating Docker Compose configuration..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd ~/thelobby-cs2

# Create docker-compose.yml
cat > docker-compose.yml << 'COMPOSE_EOF'
version: '3.8'

services:
  cs2-server:
    image: joedwards32/cs2:latest
    container_name: thelobby-cs2-server
    restart: unless-stopped
    environment:
      # Server Token (нужно обновить!)
      SRCDS_TOKEN: "YOUR_GSLT_TOKEN_HERE"
      
      # Server Configuration
      CS2_SERVERNAME: "The-lobby.pro Hackathon Server"
      CS2_RCONPW: "thelobby_rcon_2024_hackathon"
      CS2_PW: "thelobby_sol_2024"
      CS2_MAXPLAYERS: 16
      CS2_PORT: 27015
      CS2_IP: "0.0.0.0"
      CS2_LAN: "0"
      
      # Game Mode
      CS2_GAMEALIAS: "competitive"
      CS2_MAPGROUP: "mg_active"
      CS2_STARTMAP: "de_dust2"
      
      # Logging
      CS2_LOG: "on"
      CS2_LOG_DETAIL: "3"
      CS2_LOG_ITEMS: "1"
      CS2_LOG_MONEY: "1"
      
      # SourceTV
      TV_ENABLE: "1"
      TV_PORT: "27020"
      TV_AUTORECORD: "1"
      TV_PW: "thelobby_tv_2024"
      
      # Debug
      DEBUG: "2"
      
    ports:
      - "27015:27015/tcp"
      - "27015:27015/udp"
      - "27020:27020/udp"
      
    volumes:
      - cs2_data:/home/steam/cs2-dedicated/
      - ./cs2-configs:/home/steam/cs2-dedicated/game/csgo/cfg/
      - ./logs:/home/steam/cs2-dedicated/game/csgo/logs/
      
volumes:
  cs2_data:
    driver: local
COMPOSE_EOF

echo "✅ Docker Compose configuration created"
EOF

echo "🔧 Step 4: Creating server configurations..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd ~/thelobby-cs2

# Create custom server config
cat > cs2-configs/server.cfg << 'CONFIG_EOF'
// The-lobby.pro CS2 Server Configuration

// Server Identity
hostname "The-lobby.pro Hackathon Server"
sv_password "thelobby_sol_2024"
sv_region 3
sv_lan 0

// RCON Configuration
rcon_password "thelobby_rcon_2024_hackathon"
sv_rcon_whitelist_address "0.0.0.0"

// Game Settings
mp_autoteambalance 1
mp_limitteams 2
mp_maxrounds 30
mp_startmoney 800
mp_freezetime 15
mp_roundtime 1.92
mp_roundtime_defuse 1.92
mp_restartgame 1

// Bot Configuration
bot_quota 0
bot_quota_mode "fill"

// Logging (CRITICAL for token integration)
log on
sv_logbans 1
sv_logecho 1
sv_logfile 1
sv_log_onefile 0
sv_logflush 0

// Kill event logging
mp_logdetail 3
mp_logmoney 1

// Performance
fps_max 300
sys_ticrate 128

// Welcome message
sv_motd_unload_on_dismissal 0

// Admin settings
exec banned_user.cfg
exec banned_ip.cfg

echo "Server: The-lobby.pro Hackathon"
echo "Password: thelobby_sol_2024"
echo "Connect via: steam://connect/82.115.43.10:27015/thelobby_sol_2024"
CONFIG_EOF

# Create competitive mode overrides
cat > cs2-configs/gamemode_competitive_server.cfg << 'COMP_EOF'
// The-lobby.pro Competitive Overrides

// Shorter rounds for demo
mp_maxrounds 16
mp_overtime_enable 0

// Economy
mp_startmoney 800
mp_maxmoney 16000

// Timers
mp_freezetime 10
mp_roundtime 1.75
mp_roundtime_defuse 1.75
mp_buytime 20

// Kill rewards (important for tokenization)
mp_death_drop_gun 1
mp_death_drop_grenade 2
mp_death_drop_defuser 1

echo "Competitive mode configured for The-lobby.pro"
COMP_EOF

echo "✅ Server configurations created"
EOF

echo "🚀 Step 5: Creating management scripts..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd ~/thelobby-cs2

# Start server script
cat > start_server.sh << 'START_EOF'
#!/bin/bash
echo "🚀 Starting The-lobby.pro CS2 Server..."

# Pull latest image
docker compose pull

# Start server
docker compose up -d

echo "✅ Server started!"
echo "🎮 Connect via: steam://connect/82.115.43.10:27015/thelobby_sol_2024"
echo "📊 Check logs: docker compose logs -f cs2-server"
echo "🔧 RCON: rcon_password thelobby_rcon_2024_hackathon"
START_EOF

# Stop server script
cat > stop_server.sh << 'STOP_EOF'
#!/bin/bash
echo "🛑 Stopping CS2 Server..."
docker compose down
echo "✅ Server stopped"
STOP_EOF

# Server status script
cat > server_status.sh << 'STATUS_EOF'
#!/bin/bash
echo "📊 CS2 Server Status"
echo "==================="

if docker ps | grep -q thelobby-cs2-server; then
    echo "✅ Server is running"
    echo ""
    echo "Container info:"
    docker ps --filter name=thelobby-cs2-server --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "Recent logs:"
    docker compose logs --tail=10 cs2-server
else
    echo "❌ Server is not running"
fi
STATUS_EOF

# Make scripts executable
chmod +x *.sh

echo "✅ Management scripts created"
EOF

echo "🔑 Step 6: Setting up Steam Game Server Login Token..."
echo ""
echo "⚠️  ВАЖНО: Нужно получить GSLT токен!"
echo "1. Зайдите на: https://steamcommunity.com/dev/managegameservers"
echo "2. Войдите в Steam аккаунт"
echo "3. Создайте новый Game Server Account:"
echo "   - App ID: 730 (Counter-Strike 2)"
echo "   - Memo: The-lobby.pro Hackathon Server"
echo "4. Скопируйте сгенерированный токен"
echo ""
echo "После получения токена:"
echo "ssh ubuntu@$SERVER_IP"
echo "cd ~/thelobby-cs2"
echo "nano docker-compose.yml"
echo "# Замените YOUR_GSLT_TOKEN_HERE на реальный токен"
echo ""

echo "🎯 CS2 Docker Setup Complete!"
echo "=============================="
echo ""
echo "Команды для управления сервером:"
echo "ssh ubuntu@$SERVER_IP"
echo "cd ~/thelobby-cs2"
echo "./start_server.sh     # Запустить сервер"
echo "./stop_server.sh      # Остановить сервер"  
echo "./server_status.sh    # Проверить статус"
echo ""
echo "Подключение игроков:"
echo "steam://connect/82.115.43.10:27015/thelobby_sol_2024"
echo ""
echo "RCON для API:"
echo "Host: 82.115.43.10:27015"
echo "Password: thelobby_rcon_2024_hackathon"

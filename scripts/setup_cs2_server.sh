#!/bin/bash

# CS2 Dedicated Server Setup Script
# Server: 82.115.43.10 (Ubuntu 24.04 LTS)

SERVER_IP="82.115.43.10"
SERVER_USER="ubuntu"
SERVER_PASS="wcbEnDhG3bX8/swzQa2HHBo="

echo "🚀 Setting up CS2 Dedicated Server on $SERVER_IP"
echo "=================================================="

# Add server to known hosts
ssh-keyscan -H $SERVER_IP >> ~/.ssh/known_hosts

echo "📦 Step 1: Installing system dependencies..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common curl wget unzip

# Add multiverse repository for steamcmd
sudo add-apt-repository multiverse -y
sudo apt update

# Install steamcmd
echo steam steam/question select "I AGREE" | sudo debconf-set-selections
echo steam steam/license note '' | sudo debconf-set-selections
sudo apt install -y steamcmd

# Create cs2 user
sudo useradd -m -s /bin/bash cs2server
sudo usermod -aG sudo cs2server

# Create directories
sudo mkdir -p /home/cs2server/cs2
sudo chown cs2server:cs2server /home/cs2server/cs2

echo "✅ System dependencies installed"
EOF

echo "🎮 Step 2: Installing CS2 Dedicated Server..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Switch to cs2server user and install CS2
sudo -u cs2server bash << 'INNER_EOF'
cd /home/cs2server/cs2

# Install CS2 via steamcmd
/usr/games/steamcmd +force_install_dir /home/cs2server/cs2 +login anonymous +app_update 730 +quit

echo "✅ CS2 Dedicated Server installed"
INNER_EOF
EOF

echo "⚙️ Step 3: Configuring CS2 server..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Create server configuration
sudo -u cs2server bash << 'INNER_EOF'
cd /home/cs2server/cs2

# Create server.cfg
cat > game/csgo/cfg/server.cfg << 'CONFIG_EOF'
// Basic server settings
hostname "The Lobby.Sol CS2 Server #1"
sv_password ""
sv_lan 0
sv_region 3

// RCON settings for API integration
rcon_password "thelobby_rcon_2024_hackathon"
sv_rcon_whitelist_address "0.0.0.0"
ip 0.0.0.0

// Game settings
mp_autoteambalance 1
mp_limitteams 2
mp_maxrounds 30
mp_startmoney 800
mp_freezetime 15
mp_roundtime 1.92
mp_roundtime_defuse 1.92

// Logging for kill events
log on
sv_logbans 1
sv_logecho 1
sv_logfile 1
sv_log_onefile 0

// Performance
fps_max 300
sys_ticrate 128
CONFIG_EOF

# Create startup script
cat > start_server.sh << 'SCRIPT_EOF'
#!/bin/bash
cd /home/cs2server/cs2
./game/bin/linuxsteamrt64/cs2 -dedicated -console -usercon +game_type 0 +game_mode 1 +mapgroup mg_active +map de_dust2 -port 27015 +rcon_password thelobby_rcon_2024_hackathon +sv_setsteamaccount GSLT_TOKEN_HERE
SCRIPT_EOF

chmod +x start_server.sh

echo "✅ CS2 server configured"
INNER_EOF
EOF

echo "🔥 Step 4: Testing server startup..."
sshpass -p "$SERVER_PASS" ssh $SERVER_USER@$SERVER_IP << 'EOF'
sudo -u cs2server bash << 'INNER_EOF'
cd /home/cs2server/cs2

# Test if server files are properly installed
ls -la game/bin/linuxsteamrt64/cs2

echo "✅ CS2 server files verified"
INNER_EOF
EOF

echo "🎯 CS2 Server Setup Complete!"
echo "================================="
echo "Server IP: $SERVER_IP"
echo "RCON Password: thelobby_rcon_2024_hackathon"
echo "Game Port: 27015"
echo "RCON Port: 27015"
echo ""
echo "Next steps:"
echo "1. Get Steam Game Server Login Token (GSLT)"
echo "2. Update start_server.sh with GSLT token"
echo "3. Start server: sudo -u cs2server /home/cs2server/cs2/start_server.sh"
echo "4. Test RCON connection from Phoenix API"

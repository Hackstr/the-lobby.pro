#!/bin/bash

# Manual CS2 Setup Commands
# Copy-paste these commands one by one if automatic script fails

echo "=== MANUAL CS2 SETUP COMMANDS ==="
echo ""
echo "1. Connect to server:"
echo "ssh ubuntu@82.115.43.10"
echo ""
echo "2. Update system:"
echo "sudo apt update && sudo apt upgrade -y"
echo ""
echo "3. Install dependencies:"
echo "sudo apt install -y software-properties-common curl wget unzip"
echo "sudo add-apt-repository multiverse -y"
echo "sudo apt update"
echo ""
echo "4. Install SteamCMD:"
echo "echo steam steam/question select \"I AGREE\" | sudo debconf-set-selections"
echo "echo steam steam/license note '' | sudo debconf-set-selections"
echo "sudo apt install -y steamcmd"
echo ""
echo "5. Create CS2 user:"
echo "sudo useradd -m -s /bin/bash cs2server"
echo "sudo mkdir -p /home/cs2server/cs2"
echo "sudo chown cs2server:cs2server /home/cs2server/cs2"
echo ""
echo "6. Install CS2 (as cs2server user):"
echo "sudo -u cs2server bash"
echo "cd /home/cs2server/cs2"
echo "/usr/games/steamcmd +force_install_dir /home/cs2server/cs2 +login anonymous +app_update 730 +quit"
echo ""
echo "7. Create server.cfg:"
echo "sudo -u cs2server mkdir -p /home/cs2server/cs2/game/csgo/cfg"
cat << 'EOF'
sudo -u cs2server tee /home/cs2server/cs2/game/csgo/cfg/server.cfg << 'CONFIG_EOF'
hostname "The-lobby.pro CS2 Server #1"
sv_password ""
sv_lan 0
sv_region 3
rcon_password "thelobby_rcon_2024_hackathon"
sv_rcon_whitelist_address "0.0.0.0"
ip 0.0.0.0
mp_autoteambalance 1
mp_limitteams 2
mp_maxrounds 30
mp_startmoney 800
mp_freezetime 15
mp_roundtime 1.92
mp_roundtime_defuse 1.92
log on
sv_logbans 1
sv_logecho 1
sv_logfile 1
sv_log_onefile 0
fps_max 300
sys_ticrate 128
CONFIG_EOF
EOF
echo ""
echo "8. Create startup script:"
cat << 'EOF'
sudo -u cs2server tee /home/cs2server/cs2/start_server.sh << 'SCRIPT_EOF'
#!/bin/bash
cd /home/cs2server/cs2
./game/bin/linuxsteamrt64/cs2 -dedicated -console -usercon +game_type 0 +game_mode 1 +mapgroup mg_active +map de_dust2 -port 27015 +rcon_password thelobby_rcon_2024_hackathon +sv_setsteamaccount GSLT_TOKEN_HERE
SCRIPT_EOF
EOF
echo ""
echo "9. Make startup script executable:"
echo "sudo -u cs2server chmod +x /home/cs2server/cs2/start_server.sh"
echo ""
echo "10. Get GSLT token from:"
echo "https://steamcommunity.com/dev/managegameservers"
echo "App ID: 730"
echo ""
echo "11. Update startup script with GSLT:"
echo "sudo -u cs2server nano /home/cs2server/cs2/start_server.sh"
echo "# Replace GSLT_TOKEN_HERE with real token"
echo ""
echo "12. Start server:"
echo "sudo -u cs2server /home/cs2server/cs2/start_server.sh"
echo ""
echo "=== SETUP COMPLETE ==="

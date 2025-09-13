# 🎮 CS2 DEDICATED SERVER SETUP GUIDE
## Полное руководство по настройке CS2 сервера для The-lobby.pro

---

## 📋 ИНФОРМАЦИЯ О СЕРВЕРЕ

**Купленный сервер:**
- **IP**: `82.115.43.10`
- **IPv6**: `2a00:5da0:1:201::152`
- **OS**: Ubuntu 24.04 LTS
- **CPU**: 4 cores
- **RAM**: 4 GB
- **Storage**: 80 GB SSD
- **User**: `ubuntu`
- **Password**: `wcbEnDhG3bX8/swzQa2HHBo=`

---

## 🚀 АВТОМАТИЧЕСКАЯ УСТАНОВКА

### Запуск скрипта установки:
```bash
# В директории проекта
./setup_cs2_server.sh
```

**Что делает скрипт:**
1. ✅ Обновляет систему Ubuntu
2. ✅ Устанавливает SteamCMD
3. ✅ Создает пользователя cs2server
4. ✅ Скачивает CS2 Dedicated Server
5. ✅ Настраивает RCON
6. ✅ Создает конфигурационные файлы

---

## ⚙️ РУЧНАЯ НАСТРОЙКА (если нужно)

### 1. Подключение к серверу:
```bash
ssh ubuntu@82.115.43.10
# Пароль: wcbEnDhG3bX8/swzQa2HHBo=
```

### 2. Установка зависимостей:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y software-properties-common curl wget unzip

# Добавить multiverse репозиторий
sudo add-apt-repository multiverse -y
sudo apt update

# Установить steamcmd
echo steam steam/question select "I AGREE" | sudo debconf-set-selections
echo steam steam/license note '' | sudo debconf-set-selections
sudo apt install -y steamcmd
```

### 3. Создание пользователя CS2:
```bash
sudo useradd -m -s /bin/bash cs2server
sudo usermod -aG sudo cs2server
sudo mkdir -p /home/cs2server/cs2
sudo chown cs2server:cs2server /home/cs2server/cs2
```

### 4. Установка CS2:
```bash
sudo -u cs2server bash
cd /home/cs2server/cs2

# Установка CS2 через steamcmd
/usr/games/steamcmd +force_install_dir /home/cs2server/cs2 +login anonymous +app_update 730 +quit
```

---

## 🔧 КОНФИГУРАЦИЯ СЕРВЕРА

### server.cfg (создается автоматически):
```cfg
// Basic server settings
hostname "The-lobby.pro CS2 Server #1"
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
```

### Startup Script:
```bash
#!/bin/bash
cd /home/cs2server/cs2
./game/bin/linuxsteamrt64/cs2 -dedicated -console -usercon +game_type 0 +game_mode 1 +mapgroup mg_active +map de_dust2 -port 27015 +rcon_password thelobby_rcon_2024_hackathon +sv_setsteamaccount GSLT_TOKEN_HERE
```

---

## 🔑 STEAM GAME SERVER LOGIN TOKEN (GSLT)

### Получение GSLT:
1. Зайти на https://steamcommunity.com/dev/managegameservers
2. Войти в Steam аккаунт
3. Создать новый Game Server Account
4. **App ID**: `730` (Counter-Strike 2)
5. **Memo**: "The-lobby.pro Hackathon Server"
6. Скопировать сгенерированный токен

### Установка GSLT:
```bash
# На сервере, в файле start_server.sh
# Заменить GSLT_TOKEN_HERE на реальный токен
```

---

## 🌐 СЕТЕВЫЕ НАСТРОЙКИ

### Порты для открытия:
- **27015/tcp** - Game server port
- **27015/udp** - Game server port  
- **27020/udp** - SourceTV port
- **22/tcp** - SSH (уже открыт)

### Firewall настройка:
```bash
sudo ufw allow 27015
sudo ufw allow 22
sudo ufw enable
```

---

## 🔌 RCON ИНТЕГРАЦИЯ С PHOENIX

### Phoenix RCON Client:
- ✅ **Модуль создан**: `ThelobbySol.Gaming.RconClient`
- ✅ **GenServer**: Автоматическое подключение при старте
- ✅ **Commands**: `status`, `users`, custom commands
- ✅ **Monitoring**: Real-time log parsing для kill events

### Тестирование RCON:
```bash
# Из Phoenix приложения
iex -S mix phx.server

# В IEX консоли:
ThelobbySol.Gaming.RconClient.send_command("status")
ThelobbySol.Gaming.RconClient.get_server_status()
```

---

## 🎯 KILL EVENT PARSING

### Log Format CS2:
```
L 09/12/2025 - 15:30:45: "Player1<2><STEAM_1:0:123456><CT>" killed "Player2<3><STEAM_1:1:789012><TERRORIST>" with "ak47" (headshot)
```

### Parsing Logic:
```elixir
def parse_kill_log(log_line) do
  regex = ~r/killed.*with "(\w+)"( \(headshot\))?/
  
  case Regex.run(regex, log_line) do
    [_, weapon, headshot_flag] ->
      {:ok, %{
        weapon: weapon,
        is_headshot: headshot_flag != nil,
        timestamp: DateTime.utc_now()
      }}
    _ ->
      {:error, "Invalid kill log format"}
  end
end
```

---

## 🚀 ЗАПУСК СЕРВЕРА

### Команды запуска:
```bash
# На сервере
sudo -u cs2server /home/cs2server/cs2/start_server.sh

# Проверка статуса
ps aux | grep cs2

# Просмотр логов
tail -f /home/cs2server/cs2/game/csgo/logs/latest.log
```

### Подключение игроков:
```
steam://connect/82.115.43.10:27015
```

---

## 🔍 TROUBLESHOOTING

### Проблема: Сервер не запускается
**Решение:**
```bash
# Проверить права доступа
sudo chown -R cs2server:cs2server /home/cs2server/cs2
chmod +x /home/cs2server/cs2/game/bin/linuxsteamrt64/cs2

# Проверить логи
journalctl -u cs2server -f
```

### Проблема: RCON не подключается
**Решение:**
```bash
# Проверить что сервер запущен с RCON
netstat -tulpn | grep 27015

# Тестировать RCON подключение
telnet 82.115.43.10 27015
```

### Проблема: Нет kill events
**Решение:**
```bash
# Проверить логирование
tail -f /home/cs2server/cs2/game/csgo/logs/*.log

# Проверить настройки в server.cfg
cat /home/cs2server/cs2/game/csgo/cfg/server.cfg
```

---

## 📊 МОНИТОРИНГ

### Команды для мониторинга:
```bash
# Статус сервера
sudo -u cs2server /usr/games/steamcmd +login anonymous +app_update 730 validate +quit

# Производительность
htop
iotop
nethogs

# Логи
tail -f /var/log/syslog
tail -f /home/cs2server/cs2/game/csgo/logs/*.log
```

---

## 🎯 ИНТЕГРАЦИЯ С THE-LOBBY.PRO

### После настройки сервера:
1. ✅ **RCON Client** подключится автоматически
2. ✅ **Server Browser** покажет реальный сервер
3. ✅ **Kill Events** будут парситься в real-time
4. ✅ **Token Minting** активируется для реальных событий

### Phoenix API endpoints обновятся:
- `/api/gaming/servers` - покажет реальный сервер
- `/api/gaming/simulate-kill` - заменится на real events
- Real-time WebSocket для live updates

---

## ⏰ ВРЕМЕННЫЕ РАМКИ

**Установка**: ~30-45 минут  
**Конфигурация**: ~15 минут  
**Тестирование**: ~15 минут  
**Интеграция**: ~30 минут  

**Общее время**: ~1.5 часа до полной готовности

---

*Последнее обновление: 12 сентября 2025*
*Статус: В процессе установки*

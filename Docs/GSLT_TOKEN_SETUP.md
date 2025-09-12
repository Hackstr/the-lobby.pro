# 🔑 STEAM GAME SERVER LOGIN TOKEN (GSLT) SETUP

## ЧТО ЭТО И ЗАЧЕМ НУЖНО

**GSLT** - это токен который Steam требует для всех публичных dedicated серверов CS2. Без него сервер не будет виден в браузере серверов Steam.

---

## 📋 ПОШАГОВАЯ ИНСТРУКЦИЯ

### 1. Зайдите на Steam Developer Portal
🔗 **URL**: https://steamcommunity.com/dev/managegameservers

### 2. Войдите в Steam аккаунт
- Используйте любой Steam аккаунт
- Аккаунт должен иметь CS2 в библиотеке (желательно)

### 3. Создайте новый Game Server Account
- Нажмите **"Create New Game Server Account"**
- **App ID**: `730` (Counter-Strike 2)
- **Memo**: `The Lobby.Sol Hackathon Server`
- Нажмите **"Create"**

### 4. Скопируйте токен
- Появится длинная строка вроде: `A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6`
- **СКОПИРУЙТЕ** этот токен

---

## 🚀 УСТАНОВКА ТОКЕНА НА СЕРВЕР

### Подключитесь к серверу:
```bash
ssh ubuntu@82.115.43.10
# Пароль: wcbEnDhG3bX8/swzQa2HHBo=
```

### Обновите Docker Compose:
```bash
cd ~/thelobby-cs2
nano docker-compose.yml

# Найдите строку:
SRCDS_TOKEN: "YOUR_GSLT_TOKEN_HERE"

# Замените на ваш токен:
SRCDS_TOKEN: "A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"

# Сохраните: Ctrl+X, Y, Enter
```

### Запустите сервер:
```bash
./start_server.sh
```

---

## ✅ ПРОВЕРКА РАБОТЫ

### 1. Проверьте статус:
```bash
./server_status.sh
```

### 2. Проверьте логи:
```bash
docker compose logs -f cs2-server
```

### 3. Тестируйте подключение:
- Откройте CS2 в Steam
- Откройте консоль (~)
- Введите: `connect 82.115.43.10:27015; password thelobby_sol_2024`

---

## 🔧 TROUBLESHOOTING

### Проблема: "Invalid GSLT token"
**Решение**: 
- Проверьте что токен скопирован полностью
- Убедитесь что App ID = 730
- Попробуйте создать новый токен

### Проблема: Сервер не запускается
**Решение**:
```bash
# Проверить Docker
docker ps -a

# Перезапустить
docker compose down
docker compose up -d

# Проверить логи
docker compose logs cs2-server
```

### Проблема: Не могу подключиться
**Решение**:
- Проверьте что сервер запущен: `./server_status.sh`
- Проверьте firewall: `sudo ufw status`
- Попробуйте без пароля: `connect 82.115.43.10:27015`

---

## 📊 ВАЖНЫЕ ДЕТАЛИ

### Сервер настроен для хакатона:
- **Пароль**: `thelobby_sol_2024` (только зарегистрированные игроки)
- **RCON**: `thelobby_rcon_2024_hackathon` (для API интеграции)
- **Логирование**: Включено для отслеживания kill events
- **Режим**: Competitive (16 раундов)

### Подключение игроков:
1. **Steam URL**: `steam://connect/82.115.43.10:27015/thelobby_sol_2024`
2. **Консоль CS2**: `connect 82.115.43.10:27015; password thelobby_sol_2024`
3. **Браузер серверов**: Поиск по IP `82.115.43.10`

---

*После установки токена сервер будет готов к работе через 5-10 минут*

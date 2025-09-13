# 🚀 DEPLOYMENT NOTES - The-lobby.pro
## Критические заметки для деплоя и production

---

## ⚠️ КРИТИЧЕСКИЕ ИСПРАВЛЕНИЯ ПЕРЕД ДЕПЛОЕМ

### 1. CORS Configuration
- ✅ **Dev**: `localhost:3000` настроен
- ⏳ **Prod**: Нужно добавить реальные домены в `config/prod.exs`
- ⏳ **Wildcard**: Убрать `*` origins в production

### 2. Environment Variables
```bash
# Production требует:
DATABASE_URL=postgresql://user:pass@host:5432/thelobby_sol_prod
SECRET_KEY_BASE=generate_with_mix_phx_gen_secret
PHX_HOST=api.thelobby.sol
PORT=4000
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com  # или devnet
```

### 3. Database Setup
```bash
# На production сервере:
mix ecto.create
mix ecto.migrate
```

---

## 🔧 CS2 SERVER SETUP CHECKLIST

### Server Requirements:
- **OS**: Ubuntu 20.04+ или CentOS 8+
- **RAM**: Минимум 4GB, рекомендуется 8GB
- **CPU**: 2+ cores
- **Storage**: 50GB+ SSD
- **Network**: Статический IP, открытые порты 27015, 27020

### Installation Steps:
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install SteamCMD
sudo apt install steamcmd -y

# 3. Create CS2 user
sudo useradd -m cs2server

# 4. Install CS2 Dedicated Server
sudo -u cs2server steamcmd +login anonymous +app_update 730 +quit

# 5. Configure server
# Создать server.cfg с RCON настройками
```

### RCON Configuration:
```cfg
// server.cfg
rcon_password "your_secure_rcon_password"
sv_rcon_whitelist_address "YOUR_API_SERVER_IP"
sv_lan 0
sv_region 3
```

---

## 🌐 PRODUCTION DEPLOYMENT PLAN

### Frontend Deployment (Vercel/Netlify):
1. **Build**: `npm run build` в `web-frontend/`
2. **Environment**: Настроить `VITE_API_URL` на production API
3. **Domain**: Настроить custom domain
4. **HTTPS**: Автоматически через Vercel/Netlify

### Backend Deployment (Railway/Fly.io):
1. **Database**: PostgreSQL instance
2. **Environment**: Все переменные из списка выше
3. **Domain**: API subdomain (api.thelobby.sol)
4. **SSL**: Настроить HTTPS

### Blockchain (Solana):
1. **Network**: Devnet для demo, Mainnet для production
2. **Wallet**: Production keypair (НЕ dev keypair!)
3. **Program**: Deploy на выбранную сеть

---

## 🐛 ИЗВЕСТНЫЕ ПРОБЛЕМЫ И РЕШЕНИЯ

### Problem 1: CORS Errors
**Симптом**: `Access to XMLHttpRequest blocked by CORS`
**Решение**: Проверить `check_origin` в `config/prod.exs`

### Problem 2: Database Connection
**Симптом**: `Connection refused` к PostgreSQL
**Решение**: Проверить `DATABASE_URL` и firewall

### Problem 3: Wallet Connection
**Симптом**: Phantom не подключается
**Решение**: Проверить HTTPS и правильную Solana network

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Backend:
- [ ] Все environment variables настроены
- [ ] Database миграции выполнены
- [ ] CORS правильно настроен для production domains
- [ ] Health check endpoint отвечает
- [ ] Logs настроены

### Frontend:
- [ ] `VITE_API_URL` указывает на production API
- [ ] Build проходит без ошибок
- [ ] Wallet connection работает на HTTPS
- [ ] Все routes доступны

### CS2 Server:
- [ ] Dedicated server установлен
- [ ] RCON настроен и доступен
- [ ] Firewall открыт для нужных портов
- [ ] Server.cfg правильно настроен

---

## 🚨 КРИТИЧЕСКИЕ МОМЕНТЫ

### Security:
- **НИКОГДА** не коммитить private keys
- **ВСЕГДА** использовать environment variables
- **ПРОВЕРИТЬ** CORS origins перед production

### Performance:
- **Database**: Настроить connection pooling
- **API**: Rate limiting для production
- **Frontend**: Code splitting для больших chunks

### Monitoring:
- **Health checks**: `/health` endpoint
- **Logs**: Структурированные logs для debugging
- **Metrics**: Telemetry для мониторинга

---

## 📞 SUPPORT CONTACTS

**При проблемах с деплоем:**
1. Проверить logs в первую очередь
2. Тестировать каждый компонент отдельно
3. Использовать staging environment
4. Fallback на demo data если нужно

**Backup план:**
- Video demo если live demo fails
- Mock data вместо real blockchain
- Static deployment если API problems

---

*Последнее обновление: 12 сентября 2025*
*Статус: Ready for deployment*

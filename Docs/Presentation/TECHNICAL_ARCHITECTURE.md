# 🏗️ TECHNICAL ARCHITECTURE - The Lobby.Sol
## Подробная техническая архитектура для презентации

---

## 🔄 DATA FLOW DIAGRAM

```
ИГРОК В CS2                    PHOENIX API                    SOLANA BLOCKCHAIN
     │                              │                              │
     ▼                              ▼                              ▼
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│   Headshot  │───RCON────────►│Kill Event   │───RPC─────────►│Token Mint   │
│   in Game   │                │Parser       │                │Program      │
└─────────────┘                └─────────────┘                └─────────────┘
     │                              │                              │
     ▼                              ▼                              ▼
┌─────────────┐                ┌─────────────┐                ┌─────────────┐
│CS2 Log File │───File Watch──►│WebSocket    │───Broadcast───►│Frontend     │
│/logs/*.log  │                │Channel      │                │Live Update  │
└─────────────┘                └─────────────┘                └─────────────┘
```

---

## 🎯 COMPONENT BREAKDOWN

### **1. CS2 Integration Layer**
```
CS2 Dedicated Server (Docker)
├── RCON Protocol (Port 27015)
├── Log File Monitoring (/logs/*.log)
├── Real-time Event Parsing
└── Kill Event Detection
    ├── Headshot Detection (weapon + headshot flag)
    ├── Kill Streak Counting (consecutive kills)
    └── Player Identification (Steam ID)
```

### **2. Phoenix API Backend**
```
Phoenix Application (Elixir)
├── Gaming Domain
│   ├── CS2Integration (RCON client)
│   ├── RconClient (GenServer)
│   └── EventParser (kill log parsing)
├── Blockchain Domain
│   ├── SolanaClient (RPC integration)
│   ├── TokenMinter (NFT creation)
│   └── WalletManager (address validation)
├── Platform Domain
│   ├── PlayerManager (user coordination)
│   ├── AchievementTracker (progress)
│   └── LeaderboardManager (rankings)
└── WebSocket Channels
    ├── GameChannel (real-time events)
    ├── PlayerChannel (individual updates)
    └── LobbyChannel (global broadcasts)
```

### **3. Solana Smart Contracts**
```
Anchor Program (Rust)
├── Instructions
│   ├── initialize_player() - Create player account
│   ├── mint_headshot_token() - Mint headshot NFT
│   ├── mint_streak_token() - Mint kill streak NFT
│   └── get_player_stats() - Retrieve statistics
├── Accounts
│   ├── PlayerStats (PDA with stats)
│   ├── HeadshotMint (NFT mint authority)
│   └── StreakMint (NFT mint authority)
└── Security
    ├── PDA derivation (wallet-based)
    ├── Authority validation
    └── Reentrancy protection
```

### **4. React Frontend**
```
React Application (TypeScript)
├── Wallet Integration
│   ├── Phantom Adapter
│   ├── Connection Management
│   └── Transaction Signing
├── Components
│   ├── ServerBrowser (CS2 servers)
│   ├── PlayerProfile (gamification)
│   ├── TokenDashboard (achievements)
│   ├── DemoControls (testing)
│   └── Leaderboard (competition)
├── Real-time Features
│   ├── WebSocket Hook
│   ├── Live Notifications
│   └── Auto-refresh Data
└── UX/UI
    ├── Gaming Aesthetic
    ├── Responsive Design
    └── Toast Notifications
```

---

## ⚡ REAL-TIME EVENT PROCESSING

### **Kill Event Pipeline:**
```
1. CS2 Game Event
   ├── Player kills enemy with headshot
   └── CS2 writes to log file

2. RCON Monitoring
   ├── Phoenix GenServer monitors RCON
   ├── Parses log file in real-time
   └── Extracts kill data

3. Event Processing
   ├── Identify player (Steam ID → Wallet)
   ├── Validate kill type (headshot/regular)
   └── Check streak conditions

4. Blockchain Transaction
   ├── Call Solana program
   ├── Mint appropriate token
   └── Update player stats

5. Frontend Update
   ├── WebSocket broadcast
   ├── Live notification
   └── UI refresh
```

### **Performance Optimizations:**
- **Batch Processing**: Multiple events in single transaction
- **Caching**: Redis для hot data
- **Connection Pooling**: Database и Solana RPC
- **Async Processing**: Non-blocking token minting

---

## 🔐 SECURITY & SCALABILITY

### **Security Measures:**
- **Wallet Validation**: Address format verification
- **Event Verification**: Prevent fake kill events
- **Rate Limiting**: Anti-spam protection
- **PDA Security**: Solana program authority

### **Scalability Solutions:**
- **Horizontal Scaling**: Multiple Phoenix nodes
- **Database Sharding**: Player data partitioning
- **CDN**: Static assets delivery
- **Load Balancing**: Multiple CS2 servers

---

## 💰 TOKENOMICS

### **Token Types:**
```
Headshot Token (HST)
├── Supply: Unlimited (skill-based)
├── Rarity: Common (every headshot)
├── Utility: Tournament entry, trading
└── Value: Market-driven

Kill Streak Token (KST)  
├── Supply: Limited (10+ kills required)
├── Rarity: Rare (skill + luck)
├── Utility: Premium tournaments, staking
└── Value: Higher than HST
```

### **Economic Model:**
- **Free-to-Play**: No upfront costs
- **Skill-based Earning**: Better players earn more
- **Market Trading**: Secondary market for tokens
- **Utility Staking**: Lock tokens for benefits

---

## 🛠️ DEPLOYMENT INFRASTRUCTURE

### **Production Stack:**
```
Frontend (Vercel)
├── React build optimized
├── CDN distribution
└── Custom domain

Backend (Railway/Fly.io)
├── Phoenix release
├── PostgreSQL database
├── Environment variables
└── Health monitoring

CS2 Server (VPS)
├── Docker containerized
├── Ubuntu 24.04 LTS
├── 4 CPU / 4GB RAM
└── 82.115.43.10

Blockchain (Solana)
├── Devnet for demo
├── Mainnet ready
└── Program deployed
```

### **DevOps Pipeline:**
- **CI/CD**: GitHub Actions
- **Monitoring**: Telemetry + Logs
- **Backup**: Database snapshots
- **Scaling**: Auto-scaling на demand

---

**Technical Complexity**: High ⭐⭐⭐⭐⭐  
**Innovation Level**: Revolutionary ⭐⭐⭐⭐⭐  
**Production Readiness**: 95% ⭐⭐⭐⭐⭐

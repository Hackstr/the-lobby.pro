# 🚀 CURSOR IDE - FIRST PROMPT FOR THE LOBBY.SOL
## Hackathon Gaming Tokenization Platform Setup

**CONTEXT:** Creating a Counter-Strike 2 gaming achievement tokenization platform on Solana blockchain for a $20,000 hackathon. Deadline: less than 24 hours.

**PROJECT GOAL:** Build an MVP where players connect Solana wallets, play CS2, and earn NFT tokens for headshots and kill streaks.

---

## 📋 PROJECT OVERVIEW

You are helping build "The Lobby.Sol" - a revolutionary gaming platform that tokenizes Counter-Strike 2 achievements on Solana blockchain. 

**Core Concept:**
- Players connect Phantom wallet to web platform
- Browse CS2 servers and join games  
- Earn NFT tokens for headshots (1 token per headshot)
- Earn special tokens for kill streaks (1 token per 10 kills)
- View earned tokens in personal dashboard

**Technical Stack:**
- **Blockchain:** Solana + Anchor Framework
- **Backend:** Elixir/Phoenix + PostgreSQL  
- **Frontend:** React + TypeScript + Solana wallet adapter
- **Gaming:** CS2 dedicated server + RCON integration

---

## 🎯 FIRST TASK: PROJECT FOUNDATION SETUP

Please create the complete project structure and development environment setup for this hackathon project.

### **DIRECTORY STRUCTURE NEEDED:**

```
thelobby-sol/
├── README.md
├── .gitignore
├── solana-backend/           # Anchor Framework Smart Contracts
│   ├── Anchor.toml
│   ├── Cargo.toml
│   ├── programs/
│   │   └── skill-token-program/
│   │       ├── Cargo.toml
│   │       └── src/
│   │           └── lib.rs
│   ├── app/                  # Client interactions
│   └── tests/
├── api-backend/              # Elixir Phoenix API
│   ├── mix.exs
│   ├── config/
│   ├── lib/
│   │   ├── thelobby_sol/
│   │   │   ├── application.ex
│   │   │   ├── gaming/       # Gaming domain
│   │   │   ├── blockchain/   # Solana domain  
│   │   │   └── platform/     # Platform domain
│   │   └── thelobby_sol_web/
│   │       ├── channels/
│   │       ├── controllers/
│   │       └── endpoint.ex
│   ├── priv/
│   └── test/
└── web-frontend/             # React Frontend
    ├── package.json
    ├── src/
    │   ├── components/
    │   │   ├── WalletManager.tsx
    │   │   ├── ServerBrowser.tsx
    │   │   └── TokenDashboard.tsx
    │   ├── services/
    │   │   └── solana.ts
    │   ├── hooks/
    │   └── App.tsx
    ├── public/
    └── index.html
```

### **REQUIREMENTS:**

1. **Create all directories and basic files** with proper structure
2. **Setup configuration files** (package.json, mix.exs, Anchor.toml, etc.)
3. **Initialize basic smart contract** with placeholder functions
4. **Setup Phoenix app** with basic web structure and domains
5. **Create React app** with Solana wallet adapter dependencies
6. **Add comprehensive README.md** with setup instructions

### **KEY DEPENDENCIES NEEDED:**

**Solana/Anchor:**
- `@coral-xyz/anchor`
- `@solana/web3.js`

**Phoenix Backend:**
- `phoenix`
- `phoenix_ecto`
- `postgrex`
- `jason`

**React Frontend:**
- `react`, `typescript`
- `@solana/wallet-adapter-react`
- `@solana/wallet-adapter-phantom`
- `@solana/web3.js`
- `tailwindcss`

### **SMART CONTRACT STARTER:**

The Solana program should have these placeholder functions:
- `initialize_player()` - Create player profile
- `mint_headshot_token()` - Mint NFT for headshot
- `mint_streak_token()` - Mint NFT for kill streak
- `get_player_stats()` - Retrieve player statistics

### **PHOENIX APP DOMAINS:**

Create these domain modules in Phoenix:
- `TheLobby.Gaming` - CS2 server integration, kill events
- `TheLobby.Blockchain` - Solana wallet/token management  
- `TheLobby.Platform` - User management, analytics

### **REACT COMPONENTS:**

Create these key components:
- `WalletManager` - Connect/disconnect Phantom wallet
- `ServerBrowser` - Display CS2 servers (can start with mock data)
- `TokenDashboard` - Show earned tokens and statistics

---

## ⚡ SUCCESS CRITERIA

After completion, the project should have:
- [x] Complete directory structure created
- [x] All package.json/mix.exs files with correct dependencies
- [x] Basic Anchor program compiling successfully
- [x] Phoenix app starting without errors
- [x] React app launching with wallet connection UI
- [x] Comprehensive setup documentation

## 🚨 IMPORTANT NOTES

- **Time is critical** - this is for a hackathon with <24 hours left
- **Focus on working foundation** - don't over-engineer
- **Use latest stable versions** of all dependencies
- **Include error handling** in setup instructions
- **Make it easy to get started** - clear README with steps

## 📖 CONTEXT FILES

You can reference these files in the project for additional context:
- `COMPREHENSIVE_TECHNICAL_SPECIFICATION.md` - Full technical architecture
- `CS2_SERVER_INTEGRATION_GUIDE.md` - CS2 integration details
- `HACKATHON_TODO_LIST.md` - Project timeline and priorities

---

**🎯 YOUR TASK:** Create the complete project foundation that allows immediate development of the gaming tokenization platform. Make it production-ready structure but with hackathon speed.

**PHILOSOPHY:** "Честность важнее уверенности" - create a solid foundation that actually works rather than impressive complexity that breaks.
# 🚀 The Lobby.Sol - CS2 Gaming Tokenization Platform

**Hackathon Project**: Tokenizing Counter-Strike 2 achievements on Solana blockchain

> Built with solid foundation for hackathon speed

---

## 🎯 Project Overview

**The Lobby.Sol** is a revolutionary gaming platform that tokenizes Counter-Strike 2 achievements as NFTs on the Solana blockchain. Players connect their wallets, join CS2 servers, and earn tokens for headshots and kill streaks.

### Core Features
- 🎮 **CS2 Integration**: Real-time server browsing and kill event tracking
- 💰 **Token Rewards**: NFT tokens for headshots (1 per headshot) and streaks (1 per 10 kills)
- 🔗 **Solana Blockchain**: Decentralized token storage and verification
- 📊 **Player Dashboard**: Track achievements and view token collection

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Phoenix API     │    │ Solana Programs │
│   (Port 3000)   │◄──►│  (Port 4000)     │◄──►│   (Devnet)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Wallet Adapter  │    │   PostgreSQL     │    │  Token Accounts │
│   (Phantom)     │    │   (Database)     │    │     (NFTs)      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Tech Stack
- **Blockchain**: Solana + Anchor Framework
- **Backend**: Elixir/Phoenix + PostgreSQL
- **Frontend**: React + TypeScript + Vite
- **Gaming**: CS2 RCON Integration

---

## 🚀 Quick Start

### Prerequisites
```bash
# Required tools
- Node.js 18+ and npm
- Rust 1.70+
- Solana CLI 1.16+
- Anchor CLI 0.29+
- Elixir 1.14+ and Phoenix
- PostgreSQL 14+
- Git
```

### 1. Clone Repository
```bash
git clone <repository-url>
cd thelobby-sol
```

### 2. Setup Solana Environment
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.16.0/install)"

# Setup devnet
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
```

### 3. Setup Solana Smart Contract
```bash
cd solana-backend

# Build and deploy
anchor build
anchor deploy --provider.cluster devnet

# Run tests
anchor test
```

### 4. Setup Phoenix Backend
```bash
cd api-backend

# Install dependencies
mix deps.get

# Setup database
mix ecto.create
mix ecto.migrate

# Start server
mix phx.server
# Server runs on http://localhost:4000
```

### 5. Setup React Frontend
```bash
cd web-frontend

# Install dependencies
npm install

# Start development server
npm run dev
# App runs on http://localhost:3000
```

---

## 📁 Project Structure

```
thelobby-sol/
├── README.md
├── .gitignore
├── solana-backend/           # Anchor Framework Smart Contracts
│   ├── Anchor.toml          # Anchor configuration
│   ├── Cargo.toml           # Rust dependencies
│   ├── programs/
│   │   └── skill-token-program/
│   │       ├── Cargo.toml
│   │       └── src/
│   │           └── lib.rs   # Main program logic
│   ├── app/                 # Client interactions
│   └── tests/               # Anchor tests
├── api-backend/             # Elixir Phoenix API
│   ├── mix.exs             # Elixir dependencies
│   ├── config/             # Phoenix configuration
│   ├── lib/
│   │   ├── thelobby_sol/
│   │   │   ├── application.ex
│   │   │   ├── gaming/     # CS2 integration domain
│   │   │   ├── blockchain/ # Solana integration domain
│   │   │   └── platform/   # Platform management domain
│   │   └── thelobby_sol_web/
│   │       ├── channels/   # WebSocket channels
│   │       ├── controllers/ # API controllers
│   │       └── endpoint.ex # Web endpoint
│   ├── priv/               # Database migrations
│   └── test/               # Phoenix tests
└── web-frontend/           # React Frontend
    ├── package.json        # Node.js dependencies
    ├── vite.config.ts      # Vite configuration
    ├── tailwind.config.js  # Tailwind CSS config
    ├── src/
    │   ├── components/
    │   │   ├── WalletManager.tsx    # Solana wallet connection
    │   │   ├── ServerBrowser.tsx    # CS2 server list
    │   │   └── TokenDashboard.tsx   # Player achievements
    │   ├── services/
    │   │   └── api.ts      # API client
    │   ├── hooks/          # React hooks
    │   ├── pages/          # Route pages
    │   └── App.tsx         # Main app component
    ├── public/             # Static assets
    └── index.html          # HTML template
```

---

## 🎮 How It Works

### 1. Player Registration
```typescript
// Player connects Phantom wallet
const { publicKey } = useWallet();

// Register on platform
await registerPlayer(publicKey.toString());
```

### 2. CS2 Server Integration
```elixir
# Phoenix backend processes CS2 kill events
def process_kill_event(raw_event) do
  case parse_kill_log(raw_event) do
    {:ok, %{is_headshot: true}} -> {:headshot, kill_data}
    {:ok, kill_data} -> {:kill, kill_data}
  end
end
```

### 3. Token Minting
```rust
// Anchor program mints NFT tokens
#[program]
pub mod skill_token_program {
    pub fn mint_headshot_token(ctx: Context<MintHeadshotToken>) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.headshots += 1;
        
        // Mint NFT to player's wallet
        mint_to(cpi_ctx, 1)?;
        Ok(())
    }
}
```

---

## 🔧 Development Commands

### Solana Backend
```bash
cd solana-backend

# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test

# Generate TypeScript client
anchor build && anchor deploy
```

### Phoenix Backend
```bash
cd api-backend

# Install dependencies
mix deps.get

# Database operations
mix ecto.create      # Create database
mix ecto.migrate     # Run migrations
mix ecto.reset       # Reset database

# Development server
mix phx.server       # Start server
iex -S mix phx.server # Start with interactive shell

# Tests
mix test
```

### React Frontend
```bash
cd web-frontend

# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Code quality
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

---

## 🌐 API Endpoints

### Player Management
```bash
POST /api/players/register
GET  /api/players/:wallet/dashboard
POST /api/players/achievement
```

### Gaming Integration
```bash
GET  /api/gaming/servers
GET  /api/gaming/servers/:id
POST /api/gaming/simulate-kill  # Demo endpoint
```

### Example API Usage
```javascript
// Register player
const response = await fetch('/api/players/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    wallet_address: 'HnRy8zW8...abc123'
  })
});

// Get player dashboard
const dashboard = await fetch('/api/players/HnRy8zW8...abc123/dashboard');
```

---

## 🎯 Smart Contract Functions

### Core Program Instructions
```rust
// Initialize player account
initialize_player(ctx: Context<InitializePlayer>) -> Result<()>

// Mint headshot achievement token
mint_headshot_token(ctx: Context<MintHeadshotToken>) -> Result<()>

// Mint kill streak achievement token
mint_streak_token(ctx: Context<MintStreakToken>, streak_count: u64) -> Result<()>

// Get player statistics
get_player_stats(ctx: Context<GetPlayerStats>) -> Result<PlayerStats>
```

### Account Structure
```rust
#[account]
pub struct PlayerStats {
    pub authority: Pubkey,    // Player's wallet
    pub headshots: u64,       // Total headshot count
    pub kill_streaks: u64,    // Total kill streaks
    pub total_kills: u64,     // All-time kills
    pub bump: u8,             // PDA bump seed
}
```

---

## 🚨 Hackathon Notes

### ⚡ Quick Demo Setup
For immediate demo purposes, the system includes:
- **Mock CS2 servers** - Pre-configured server list
- **Simulated kill events** - Demo endpoints for testing
- **Mock token minting** - Works without real blockchain calls
- **Responsive UI** - Works on desktop and mobile

### 🔄 Fallback Plans
1. **Plan A**: Full integration (30% success rate)
2. **Plan B**: Mock backend with real wallet (50% success rate)  
3. **Plan C**: Complete demo with recorded video (20% success rate)

### ⏰ Time Estimates
- **Core functionality**: 6 hours
- **Polish and testing**: 4 hours
- **Demo preparation**: 2 hours
- **Buffer time**: 2 hours

---

## 🐛 Troubleshooting

### Common Issues

#### Solana Setup
```bash
# If anchor command not found
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# If deployment fails
solana config set --url devnet
solana airdrop 2  # Get test SOL
```

#### Phoenix Backend
```bash
# If mix deps.get fails
mix local.hex --force
mix local.rebar --force

# If database connection fails
createdb thelobby_sol_dev
```

#### React Frontend
```bash
# If npm install fails
rm -rf node_modules package-lock.json
npm install

# If wallet connection fails
# Check browser console for CORS errors
```

### Environment Variables
```bash
# .env.local (frontend)
VITE_API_URL=http://localhost:4000
VITE_SOLANA_NETWORK=devnet

# config/dev.exs (backend)
config :thelobby_sol, ThelobbysolWeb.Endpoint,
  url: [host: "localhost"],
  http: [port: 4000]
```

---

## 🏆 Success Criteria

After setup completion:
- ✅ Solana program compiles and deploys
- ✅ Phoenix server starts without errors  
- ✅ React app launches with wallet connection
- ✅ All three components communicate properly
- ✅ Demo flow works end-to-end

---

## 🤝 Contributing

This is a hackathon project with <24 hours deadline. Priority is on:
1. **Working functionality** over perfect code
2. **Demo-ready features** over comprehensive testing
3. **Clear documentation** over extensive comments

---

## 📜 License

MIT License - Built for Solana Hackathon 2024

---

## 🎮 Demo Flow

1. **Connect Wallet** → Phantom wallet connection
2. **Browse Servers** → View available CS2 servers  
3. **Join & Play** → Simulate gameplay events
4. **Earn Tokens** → Headshot and streak NFTs minted
5. **View Dashboard** → Check collected achievements

**Live Demo**: [Coming Soon]
**Video Demo**: [Coming Soon]

---

*Built with ❤️ for the Solana ecosystem*

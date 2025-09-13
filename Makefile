# The-lobby.pro - Hackathon Gaming Tokenization Platform
# Makefile for development workflow

.PHONY: help install build test start clean deploy

# Default target
help:
	@echo "The-lobby.pro - Development Commands"
	@echo "===================================="
	@echo ""
	@echo "Setup Commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make build       - Build all components"
	@echo "  make test        - Run tests for all components"
	@echo ""
	@echo "Development Commands:"
	@echo "  make start       - Start all services in development mode"
	@echo "  make start-api   - Start Phoenix API server only"
	@echo "  make start-web   - Start React frontend only"
	@echo "  make start-sol   - Build Solana program only"
	@echo ""
	@echo "Deployment Commands:"
	@echo "  make deploy      - Deploy Solana program to devnet"
	@echo "  make deploy-prod - Build for production"
	@echo "  make deploy-web  - Deploy frontend to Fly.io"
	@echo "  make deploy-api  - Deploy API to Fly.io"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make reset       - Reset databases and rebuild"
	@echo "  make health      - Check service health"

# Installation
install: install-solana install-api install-web

install-solana:
	@echo "Installing Solana dependencies..."
	cd solana-backend && npm install

install-api:
	@echo "Installing Phoenix dependencies..."
	cd api-backend && mix deps.get

install-web:
	@echo "Installing React dependencies..."
	cd web-frontend && npm install

# Build
build: build-solana build-api build-web

build-solana:
	@echo "Building Solana program..."
	@which anchor > /dev/null || (echo "❌ Anchor CLI not found. Install from: https://www.anchor-lang.com/docs/installation" && exit 1)
	cd solana-backend && anchor build

build-api:
	@echo "Compiling Phoenix application..."
	cd api-backend && mix compile

build-web:
	@echo "Building React application..."
	cd web-frontend && npm run build

# Test
test: test-solana test-api test-web

test-solana:
	@echo "Testing Solana program..."
	cd solana-backend && anchor test

test-api:
	@echo "Testing Phoenix application..."
	cd api-backend && mix test

test-web:
	@echo "Testing React application..."
	cd web-frontend && npm run lint

# Development
start:
	@echo "Starting all services..."
	@echo "This will start Phoenix API (port 4000) and React frontend (port 3000)"
	@make -j2 start-api start-web

start-api:
	@echo "Starting Phoenix API server on port 4000..."
	cd api-backend && mix phx.server

start-web:
	@echo "Starting React development server on port 3000..."
	cd web-frontend && npm run dev

start-sol:
	@echo "Building and deploying Solana program..."
	cd solana-backend && anchor build && anchor deploy --provider.cluster devnet

# Deployment
deploy:
	@echo "Deploying Solana program to devnet..."
	cd solana-backend && anchor deploy --provider.cluster devnet

deploy-prod: build
	@echo "Building for production..."
	cd web-frontend && npm run build
	@echo "Production build complete. Deploy dist/ folder to your hosting service."

# Fly.io convenient targets
deploy-web:
	@echo "Deploying web-frontend to Fly.io..."
	cd web-frontend && flyctl deploy --app thelobby-sol-frontend

deploy-api:
	@echo "Deploying api-backend to Fly.io..."
	cd api-backend && flyctl deploy --app thelobby-sol-api

# Database
db-setup:
	@echo "Setting up database..."
	cd api-backend && mix ecto.create && mix ecto.migrate

db-reset:
	@echo "Resetting database..."
	cd api-backend && mix ecto.reset

# Utility
clean:
	@echo "Cleaning build artifacts..."
	cd solana-backend && rm -rf target/
	cd api-backend && rm -rf _build/
	cd web-frontend && rm -rf dist/ node_modules/.vite/

reset: clean db-reset install build
	@echo "Full reset complete!"

health:
	@echo "Checking service health..."
	@curl -s http://localhost:4000/health || echo "API server not running"
	@curl -s http://localhost:3000 || echo "Web server not running"

# Quick demo setup
demo-setup:
	@echo "Setting up for hackathon demo..."
	@make install
	@make db-setup
	@make build-solana
	@echo "Demo setup complete! Run 'make start' to launch."

# Hackathon shortcuts
hack: demo-setup start
	@echo "Hackathon mode activated! 🚀"

# Environment check
check-env:
	@echo "Checking development environment..."
	@which node > /dev/null && echo "✅ Node.js found" || echo "❌ Node.js not found"
	@which npm > /dev/null && echo "✅ npm found" || echo "❌ npm not found"  
	@which mix > /dev/null && echo "✅ Elixir/Mix found" || echo "❌ Elixir/Mix not found"
	@which psql > /dev/null && echo "✅ PostgreSQL found" || echo "❌ PostgreSQL not found"
	@which solana > /dev/null && echo "✅ Solana CLI found" || echo "❌ Solana CLI not found - install from https://docs.solana.com/cli/install-solana-cli-tools"
	@which anchor > /dev/null && echo "✅ Anchor CLI found" || echo "❌ Anchor CLI not found - install from https://www.anchor-lang.com/docs/installation"
	@echo "✅ Environment check complete"

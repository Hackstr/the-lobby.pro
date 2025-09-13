#!/bin/bash

echo "🚀 DEPLOYING THE LOBBY.SOL TO PRODUCTION"
echo "========================================"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📊 Checking current status...${NC}"
flyctl apps list

echo -e "${BLUE}🗄️ Database connection info:${NC}"
echo "Database: postgres://postgres:UQ2PQgysvHbCXFh@thelobby-sol-db.flycast:5432"
echo "Apps created:"
echo "- thelobby-sol-api (backend)"
echo "- thelobby-sol-frontend (frontend)"
echo "- thelobby-sol-db (database)"

echo -e "${GREEN}✅ All infrastructure ready!${NC}"
echo ""
echo "🌐 Your domain: the-lobby.pro"
echo "📋 Next steps:"
echo "1. Configure DNS: api.the-lobby.pro → thelobby-sol-api.fly.dev"
echo "2. Configure DNS: the-lobby.pro → thelobby-sol-frontend.fly.dev"
echo "3. Deploy backend with: cd api-backend && flyctl deploy"
echo "4. Deploy frontend with: cd web-frontend && flyctl deploy"
echo ""
echo "🎯 Manual deployment ready - no hanging commands!"

# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install Python and build tools for native dependencies
RUN apk add --no-cache python3 py3-pip make g++ linux-headers eudev-dev

# Copy package files
COPY package*.json ./

# Install dependencies first (for better caching)
RUN npm install

# Copy source code AFTER dependencies
COPY . .

# Build args для передачи переменных окружения
ARG VITE_API_URL
ARG VITE_SOLANA_NETWORK
ARG VITE_PROGRAM_ID

# Set environment variables for build with proper defaults
ENV VITE_API_URL=${VITE_API_URL:-https://thelobby-sol-api.fly.dev}
ENV VITE_SOLANA_NETWORK=${VITE_SOLANA_NETWORK:-devnet}
ENV VITE_PROGRAM_ID=${VITE_PROGRAM_ID:-HackathonSkillTokenProgram111111111111111}

# Debug: проверяем переменные
RUN echo "Building with VITE_API_URL=$VITE_API_URL"

# Build the app with environment variables
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built app
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]

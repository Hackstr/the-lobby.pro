# Use official Elixir image
FROM elixir:1.15-alpine AS build

# Install build dependencies
RUN apk add --no-cache build-base git openssh-client

# Set build ENV
ENV MIX_ENV=prod

# Install hex + rebar
RUN mix local.hex --force && \
    mix local.rebar --force

# Create app directory
WORKDIR /app

# Copy mix files
COPY mix.exs mix.lock ./
RUN mix deps.get --only prod

# Copy config
COPY config config
RUN mix deps.compile

# Copy source
COPY priv priv
COPY lib lib

# Compile and build release
RUN mix compile
RUN mix release

# Runtime stage
FROM alpine:3.18 AS app

# Install runtime dependencies including C++ libraries
RUN apk add --no-cache openssl ncurses-libs bash openssh-client libstdc++ libgcc

WORKDIR /app

# Copy release
COPY --from=build /app/_build/prod/rel/thelobby_sol ./

# Create non-root user
RUN adduser -D -s /bin/bash app
USER app

EXPOSE 4000

CMD ["./bin/thelobby_sol", "start"]

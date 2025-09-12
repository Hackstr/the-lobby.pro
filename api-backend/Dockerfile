# Build stage
FROM hexpm/elixir:1.18.4-erlang-27.2.1-alpine-3.20.3 AS build

# Install build dependencies
RUN apk add --no-cache build-base npm git python3 openssh-client

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
RUN mkdir config

# Copy compile-time config files before we compile dependencies
COPY config/config.exs config/prod.exs config/
RUN mix deps.compile

# Copy priv, lib, assets
COPY priv priv
COPY lib lib

# Compile the release
RUN mix compile

# Copy runtime config
COPY config/runtime.exs config/

# Assemble the release
RUN mix release

# Runtime stage
FROM alpine:3.20.3 AS app

RUN apk add --no-cache openssl ncurses-libs openssh-client sshpass

ENV USER="elixir"

WORKDIR "/home/elixir"

# Create user
RUN \
  addgroup \
   -g 1000 \
   -S "${USER}" \
  && adduser \
   -s /bin/sh \
   -u 1000 \
   -G "${USER}" \
   -h "/home/${USER}" \
   -D "${USER}"

USER "${USER}"

COPY --from=build --chown=elixir:elixir /app/_build/prod/rel/thelobby_sol ./

ENV HOME=/home/elixir

EXPOSE 4000

CMD ["bin/thelobby_sol", "start"]

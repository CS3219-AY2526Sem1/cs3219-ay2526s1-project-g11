# ---- build stage ----
  FROM hexpm/elixir:1.18.4-erlang-28.1-debian-bookworm-20250908 AS build
  ENV MIX_ENV=prod
  WORKDIR /app
  
  # Install dependencies for building
  RUN apt-get update && apt-get install -y build-essential git && rm -rf /var/lib/apt/lists/*
  
  # Set up Elixir tools
  RUN mix local.hex --force && mix local.rebar --force
  
  # Copy dependency files
  COPY mix.exs mix.lock ./
  COPY config config
  
  # Install and compile dependencies
  RUN mix deps.get --only prod && mix deps.compile
  
  # Copy source code
  COPY lib lib
  COPY priv priv
  
  # Compile and build release
  RUN mix compile
  RUN mix release
  
  # ---- run stage ----
  FROM debian:bookworm AS run
  
  # Install runtime dependencies
  RUN apt-get update && apt-get install -y openssl libstdc++6 && rm -rf /var/lib/apt/lists/*
  
  WORKDIR /app
  ENV LANG=C.UTF-8 MIX_ENV=prod PHX_SERVER=true
  
  # Copy compiled release from build stage
  COPY --from=build /app/_build/prod/rel/collab_service ./
  
  # Expose app port
  EXPOSE 4000
  
  # Start the release
  CMD ["/app/bin/collab_service", "start"]
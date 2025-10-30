# ---- build stage ----
FROM hexpm/elixir:1.18.4-erlang-28.1-debian-bookworm-20250908 AS build
ENV MIX_ENV=prod
WORKDIR /app

RUN apt-get update && apt-get install -y build-essential git && rm -rf /var/lib/apt/lists/*

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
COPY config config
RUN mix deps.get --only prod && mix deps.compile

COPY lib lib
COPY priv priv

RUN mix compile
RUN mix release

# ---- run stage ----
FROM debian:bookworm AS run
RUN apt-get update && apt-get install -y openssl libstdc++6 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV MIX_ENV=prod LANG=C.UTF-8 PHX_SERVER=true

COPY --from=build /app/_build/prod/rel/collab_service ./

CMD ["/app/bin/collab_service", "start"]

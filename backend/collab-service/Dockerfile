FROM elixir:1.17

WORKDIR /app

# Install hex and rebar
RUN mix local.hex --force && \
  mix local.rebar --force

# Copy mix files
COPY mix.exs mix.lock* ./

# Get dependencies
RUN mix deps.get

# Copy source code
COPY . .

# Set environment variables
ENV JWT_SECRET=test
ENV MIX_ENV=dev
ENV PHX_HOST=0.0.0.0

# Compile dependencies and application
RUN mix deps.compile
RUN mix compile

EXPOSE 4000

CMD ["mix", "phx.server"]
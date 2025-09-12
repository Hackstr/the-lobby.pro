defmodule ThelobbySol.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      # Start the Telemetry supervisor
      ThelobbysolWeb.Telemetry,
      # Start the Ecto repository
      ThelobbySol.Repo,
      # Start the PubSub system
      {Phoenix.PubSub, name: ThelobbySol.PubSub},
      # Start Finch
      {Finch, name: ThelobbySol.Finch},
      # Start the Endpoint (http/https)
      ThelobbysolWeb.Endpoint
      # Start a worker by calling: ThelobbySol.Worker.start_link(arg)
      # {ThelobbySol.Worker, arg}
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ThelobbySol.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    ThelobbysolWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end

# Regenfass Dashboard API

![Regenfass Dashboard API](https://raw.githubusercontent.com/ttnleipzig/regenfass-brand/main/examples/github/sample-readme-header-api-service.svg)

The dashboard is the Go API and service layer for reading Regenfass device and
sensor data. It includes the HTTP API, database migrations, SQL queries, and a
local Docker Compose setup for development.

## Technology

- Go
- Fiber
- PostgreSQL
- SQL migrations and SQLC-generated database access
- Docker Compose for local dependencies

## Development

Install Go and Docker, then start the local dependencies with:

```bash
docker compose up -d
go run .
```

The API configuration and available endpoints are documented in the source and
generated OpenAPI files under [`docs/`](docs/).

## Checks

```bash
go test ./...
go build ./...
```

## Related projects

- [Regenfass homepage](../homepage/README.md)
- [Repository development guide](../../docs/Local-Development.md)

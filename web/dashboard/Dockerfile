# syntax=docker/dockerfile:1

FROM golang:1.26 AS build
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /backend

FROM alpine
RUN apk add --no-cache curl

COPY --from=build /backend /usr/local/bin/backend

EXPOSE 64000

ENTRYPOINT ["/usr/local/bin/backend"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "localhost:64000/healthz" ]

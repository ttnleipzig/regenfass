CREATE EXTENSION IF NOT EXISTS timescaledb;

CREATE USER regenfass;
CREATE DATABASE regenfass;
GRANT ALL PRIVILEGES ON DATABASE regenfass TO regenfass;

\c regenfass
CREATE EXTENSION IF NOT EXISTS timescaledb;

# NOVA ENGLISH AI — Quick Setup

Minimal steps to run the backend (NestJS + PostgreSQL + Prisma).

## Requirements
- Node.js 22+
- pnpm
- Docker & Docker Compose

## 1) Clone & install
```bash
git clone https://github.com/lamhoang7146/NEA-BE.git
cd NEA-API
pnpm install
```

## 2) Env file
```bash
cp NEA-API/.env.example NEA-API/.env
```
Adjust database creds if needed. Default `DATABASE_URL` points to dockerized Postgres.

## 3) Run with Docker (recommended)
```bash
make up
```
Services: API (6002), Postgres (5432), Redis (6379). Check logs with `make logs`.

## 4) Migrate & seed
Use local Prisma (no global install):
```bash
pnpm prisma migrate deploy
pnpm prisma db seed   # optional
```

## 5) Dev mode without Docker
```bash
cd NEA-API
pnpm dev
```
Ensure Postgres/Redis are running and `DATABASE_URL` is reachable.

## Handy commands
- `pnpm prisma generate` — regenerate client
- `pnpm prisma studio` — browse DB
- `pnpm lint` / `pnpm test` — quality & tests

API base: `http://localhost:6002` • GraphQL: `/graphql` • Health: `/health`
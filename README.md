Ciplaw — Zero Plain Exposure

Quickstart

1. Copy `.env.example` to `.env` and set `CIPLAW_MASTER_KEY` (base64 32 bytes) and `DATABASE_URL`.
2. Install dependencies:

```bash
pnpm install
```

3. Start local dev (docker-compose + services):

```bash
./scripts/dev.sh
```

API examples

POST start verification:

```bash
curl -X POST http://localhost:4000/v1/verify \
  -H 'Content-Type: application/json' \
  -d '{"payload":"sensitive data here"}'
```

GET result:

```bash
curl http://localhost:4000/v1/verify/<id>
```

See `threat-model` for assumptions and mitigations.
# ciplaw-zero
# Postgres Docker Compose (incidentsdb)

Run Postgres with initialization scripts (creates `users` with default `admin`/`admin` and `incident` table):

```bash
cd backend
docker compose up -d
```

Verify tables and default user:

```bash
# open a psql shell in the running container
docker compose exec db psql -U admin -d incidentsdb
# then inside psql:
\dt
SELECT * FROM users;
SELECT * FROM incident LIMIT 10;
```

To stop and remove containers:

```bash
docker compose down -v
```

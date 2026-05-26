# CyberGuard Incident Analysis Platform

CyberGuard is a network incident analysis platform that combines a Flask API, a TensorFlow-based traffic classification model, PostgreSQL incident storage, and a React dashboard. It supports incident intake, CSV traffic-flow storage, AI-assisted traffic labeling, incident review, and report editing through a browser-based interface.

## Features

- Flask REST API for incident, traffic, prediction, authentication, and report workflows
- TensorFlow/Keras model inference using bundled model artifacts
- PostgreSQL persistence for users, incidents, analysis status, and reports
- CSV upload and per-incident traffic-flow storage
- React 19 + TypeScript + Vite dashboard
- Paginated incident and traffic views
- Docker Compose setup for local PostgreSQL

## Tech Stack

- Backend: Python, Flask, TensorFlow, pandas, NumPy, scikit-learn, psycopg2
- Database: PostgreSQL 15
- Frontend: React, TypeScript, Vite, Tailwind CSS
- Tooling: Docker Compose, npm

## Project Structure

```text
.
├── app.py                         # Flask API and ML inference routes
├── db.py                          # PostgreSQL connection and query helpers
├── requirements.txt               # Python dependencies
├── docker-compose.yml             # Local PostgreSQL service
├── docker-entrypoint-initdb.d/
│   └── init.sql                   # Database schema and default admin user
├── model_test/                    # Model artifacts used by the API
│   ├── my_model.h5
│   ├── scaler.pkl
│   ├── label_encoder.pkl
│   └── feature_columns.json
├── model_prod/                    # Production model artifacts
├── Incident-Flows/                # Uploaded traffic-flow CSV files
└── dashboard/                     # React dashboard application
```

## Prerequisites

- Python 3.12 or compatible Python 3 version
- Node.js 20 or newer
- npm
- Docker and Docker Compose
- PostgreSQL client tools, optional for manual database inspection

## Environment Variables

The backend reads database configuration from environment variables. Defaults are provided for local development.

| Variable | Default | Description |
| --- | --- | --- |
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_USER` | `admin` | PostgreSQL username |
| `DB_PASSWORD` | `admin` | PostgreSQL password |
| `DB_NAME` | `incidentsdb` | PostgreSQL database name |

## Quick Start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL and runs `docker-entrypoint-initdb.d/init.sql`, which creates the `users` and `incident` tables and inserts a default user:

```text
username: admin
password: admin
```

### 2. Set up the Backend

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

If your environment does not already include the database and CORS packages, install them as well:

```bash
pip install psycopg2-binary flask-cors
```

### 3. Run the Flask API

```bash
python app.py
```

The API runs at:

```text
http://localhost:5000
```

### 4. Run the Dashboard

```bash
cd dashboard
npm install
npm run dev
```

The dashboard runs at the URL printed by Vite, typically:

```text
http://localhost:5173
```

The dashboard expects the API at `http://localhost:5000/api`.

## API Reference

### Authentication

#### `POST /api/auth/login`

Authenticates a user against the `users` table.

Request body:

```json
{
  "username": "admin",
  "password": "admin"
}
```

Response:

```json
{
  "user": "admin",
  "token": "mock-token-..."
}
```

### Incidents

#### `POST /reportIncident`

Uploads a traffic-flow CSV and creates or updates an incident record.

Form data:

| Field | Required | Description |
| --- | --- | --- |
| `file` or `csv` | Yes | Traffic-flow CSV file |
| `incident_id` or `incidentId` | Yes | Incident identifier |
| `serverip` | Yes | Server IP address |
| `networkinterface` | Yes | Network interface name |
| `name` | Yes | Incident name |
| `risklevel` | Yes | Risk level |

Example:

```bash
curl -X POST http://localhost:5000/reportIncident \
  -F "file=@traffic.csv" \
  -F "incident_id=INC-001" \
  -F "serverip=192.168.1.10" \
  -F "networkinterface=eth0" \
  -F "name=Suspicious Traffic" \
  -F "risklevel=HIGH"
```

#### `GET /api/incidents?page=1&pageSize=10`

Returns paginated incidents for the dashboard.

#### `GET /api/incidents/<incident_id>/traffic?page=1&pageSize=10`

Returns paginated traffic-flow rows for a specific incident.

### Prediction

#### `POST /predict`

Runs prediction for a single JSON traffic-flow feature object. The request body must include all features listed in `model_test/feature_columns.json`.

#### `POST /api/incidents/<incident_id>/ai-predict`

Loads the incident's uploaded CSV, transforms the traffic-flow data, runs batch model inference, writes predicted labels back to the CSV, and marks the incident as analyzed.

### Reports

#### `GET /api/incidents/<incident_id>/report`

Returns the saved report content for an incident.

#### `POST /api/incidents/<incident_id>/report`

Updates the report content for an incident.

Request body:

```json
{
  "content": "# Incident Report\n\nAnalysis details..."
}
```

#### `POST /api/incidents/<incident_id>/auto-report`

Returns a generated placeholder incident report.

## Database

The local database is initialized with this schema:

- `users`: stores dashboard login credentials
- `incident`: stores incident metadata, uploaded CSV filename, analysis status, risk level, and report content

Inspect the database with:

```bash
docker compose exec db psql -U admin -d incidentsdb
```

Useful SQL commands:

```sql
\dt
SELECT * FROM users;
SELECT * FROM incident LIMIT 10;
```

Stop and remove the local database container and volume with:

```bash
docker compose down -v
```

## Model Artifacts

The Flask API currently loads artifacts from `model_test/`:

- `my_model.h5`: trained Keras model
- `scaler.pkl`: feature scaler
- `label_encoder.pkl`: label decoder
- `feature_columns.json`: expected model feature order

The model input is scaled, padded or truncated to 81 values, and reshaped into `9 x 9 x 1` before inference.

## Development Notes

- Uploaded traffic-flow files are stored in `Incident-Flows/` using generated filenames.
- The dashboard stores the mock auth token and username in browser local storage.
- The default dashboard API base URL is defined in `dashboard/src/services/mockApi.ts`.
- CORS is enabled in the Flask app for local dashboard development.
- The current report auto-generation endpoint returns placeholder content.

## Common Commands

```bash
# Start database
docker compose up -d

# Run backend
source venv/bin/activate
python app.py

# Run frontend
cd dashboard
npm run dev

# Build frontend
cd dashboard
npm run build

# Lint frontend
cd dashboard
npm run lint
```

## Security Notes

- The default `admin/admin` credentials are intended for local development only.
- Passwords are currently stored in plain text in the local database.
- The dashboard token is a mock token generated by the API and is not a production authentication mechanism.
- Configure real authentication, password hashing, secret management, and restricted CORS before deploying publicly.

-- Initialization SQL: creates users table and incident table

CREATE TABLE IF NOT EXISTS users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL
);

INSERT INTO users (username, password)
SELECT 'admin', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

CREATE TABLE IF NOT EXISTS incident (
  incident_id TEXT PRIMARY KEY,
  name TEXT,
  time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  serverip TEXT,
  networkinterface TEXT,
  trafficflowfilebobid TEXT,
  isAnalysed BOOLEAN DEFAULT FALSE,
  risklevel TEXT,
  incident_report TEXT
);

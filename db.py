import os
import psycopg2
from psycopg2.extras import RealDictCursor


def get_conn():
    """Return a new psycopg2 connection using env vars with sensible defaults."""
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    user = os.getenv("DB_USER", "admin")
    password = os.getenv("DB_PASSWORD", "admin")
    dbname = os.getenv("DB_NAME", "incidentsdb")
    return psycopg2.connect(host=host, port=port, user=user, password=password, dbname=dbname)


def insert_or_update_incident(incident_id, serverip, networkinterface, trafficflowfilebobid, name, risklevel):
    """Insert or update an incident record."""
    conn = get_conn()
    cur = None
    try:
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO incident (incident_id, serverip, networkinterface, trafficflowfilebobid,name,risklevel)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (incident_id) DO UPDATE SET
              serverip = EXCLUDED.serverip,
              networkinterface = EXCLUDED.networkinterface,
              trafficflowfilebobid = EXCLUDED.trafficflowfilebobid, 
              name = EXCLUDED.name,
              risklevel = EXCLUDED.risklevel
            """,
            (incident_id, serverip, networkinterface, trafficflowfilebobid, name, risklevel),
        )
        conn.commit()
    finally:
        if cur is not None:
            try:
                cur.close()
            except Exception:
                pass
        try:
            conn.close()
        except Exception:
            pass


def validate_user(username, password):
    conn = get_conn()
    cur = None
    try:
        cur = conn.cursor()
        cur.execute("SELECT password FROM users WHERE username = %s", (username,))
        row = cur.fetchone()
        if not row:
            return False
        stored = row[0]
        return stored == password
    finally:
        if cur is not None:
            try:
                cur.close()
            except Exception:
                pass
        try:
            conn.close()
        except Exception:
            pass


def get_incident(incident_id):
    conn = get_conn()
    cur = None
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT * FROM incident WHERE incident_id = %s", (incident_id,))
        return cur.fetchone()
    finally:
        if cur is not None:
            try:
                cur.close()
            except Exception:
                pass
        try:
            conn.close()
        except Exception:
            pass


def mark_analyzed(incident_id, report=None):
    conn = get_conn()
    cur = None
    try:
        cur = conn.cursor()
        cur.execute(
            "UPDATE incident SET isAnalysed = TRUE, incident_report = %s WHERE incident_id = %s",
            (report, incident_id),
        )
        conn.commit()
    finally:
        if cur is not None:
            try:
                cur.close()
            except Exception:
                pass
        try:
            conn.close()
        except Exception:
            pass

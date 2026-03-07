import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'aether.db')


def get_db():
    """Get a database connection with row factory."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    """Initialize database tables."""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
        );
        
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT,
            is_active INTEGER DEFAULT 1,
            created_at TEXT DEFAULT (datetime('now')),
            ended_at TEXT,
            summary_reflection TEXT,
            summary_exercise TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
        
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
            content TEXT NOT NULL,
            mood_score INTEGER,
            detected_distortions TEXT,
            confidence_scores TEXT,
            reframe_suggestion TEXT,
            created_at TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
        );
    """)
    conn.commit()
    conn.close()


# ── User CRUD ──────────────────────────────────────────────

def create_user(name: str, email: str, password_hash: str) -> dict:
    conn = get_db()
    try:
        cursor = conn.execute(
            "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
            (name, email, password_hash)
        )
        conn.commit()
        user = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (cursor.lastrowid,)).fetchone()
        return dict(user)
    except sqlite3.IntegrityError:
        raise ValueError("Email already registered")
    finally:
        conn.close()


def get_user_by_email(email: str) -> dict | None:
    conn = get_db()
    user = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(user) if user else None


def get_user_by_id(user_id: int) -> dict | None:
    conn = get_db()
    user = conn.execute("SELECT id, name, email, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    conn.close()
    return dict(user) if user else None


def delete_user(user_id: int):
    conn = get_db()
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


# ── Session CRUD ───────────────────────────────────────────

def create_session(user_id: int) -> dict:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO sessions (user_id) VALUES (?)",
        (user_id,)
    )
    conn.commit()
    session = conn.execute("SELECT * FROM sessions WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(session)


def get_session(session_id: int) -> dict | None:
    conn = get_db()
    session = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,)).fetchone()
    conn.close()
    return dict(session) if session else None


def get_user_sessions(user_id: int) -> list[dict]:
    conn = get_db()
    sessions = conn.execute(
        "SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC",
        (user_id,)
    ).fetchall()
    conn.close()
    return [dict(s) for s in sessions]


def end_session(session_id: int, reflection: str = None, exercise: str = None):
    conn = get_db()
    conn.execute(
        "UPDATE sessions SET is_active = 0, ended_at = datetime('now'), summary_reflection = ?, summary_exercise = ? WHERE id = ?",
        (reflection, exercise, session_id)
    )
    conn.commit()
    conn.close()


def update_session_title(session_id: int, title: str):
    conn = get_db()
    conn.execute("UPDATE sessions SET title = ? WHERE id = ?", (title, session_id))
    conn.commit()
    conn.close()


# ── Message CRUD ───────────────────────────────────────────

def add_message(session_id: int, role: str, content: str,
                mood_score: int = None, detected_distortions: str = None,
                confidence_scores: str = None, reframe_suggestion: str = None) -> dict:
    conn = get_db()
    cursor = conn.execute(
        """INSERT INTO messages (session_id, role, content, mood_score, 
           detected_distortions, confidence_scores, reframe_suggestion) 
           VALUES (?, ?, ?, ?, ?, ?, ?)""",
        (session_id, role, content, mood_score, detected_distortions,
         confidence_scores, reframe_suggestion)
    )
    conn.commit()
    msg = conn.execute("SELECT * FROM messages WHERE id = ?", (cursor.lastrowid,)).fetchone()
    conn.close()
    return dict(msg)


def get_session_messages(session_id: int) -> list[dict]:
    conn = get_db()
    messages = conn.execute(
        "SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC",
        (session_id,)
    ).fetchall()
    conn.close()
    return [dict(m) for m in messages]


def get_session_mood_arc(session_id: int) -> list[dict]:
    """Get mood scores for a session to build a mood arc."""
    conn = get_db()
    moods = conn.execute(
        "SELECT mood_score FROM messages WHERE session_id = ? AND role = 'assistant' AND mood_score IS NOT NULL ORDER BY created_at ASC",
        (session_id,)
    ).fetchall()
    conn.close()
    return [{"index": i + 1, "mood": m["mood_score"]} for i, m in enumerate(moods)]


def get_session_distortion_counts(session_id: int) -> list[dict]:
    """Count occurrences of each distortion in a session."""
    conn = get_db()
    messages = conn.execute(
        "SELECT detected_distortions FROM messages WHERE session_id = ? AND detected_distortions IS NOT NULL",
        (session_id,)
    ).fetchall()
    conn.close()

    import json
    counts = {}
    for msg in messages:
        try:
            distortions = json.loads(msg["detected_distortions"])
            for d in distortions:
                counts[d] = counts.get(d, 0) + 1
        except (json.JSONDecodeError, TypeError):
            pass

    return sorted(
        [{"name": k, "count": v} for k, v in counts.items()],
        key=lambda x: x["count"],
        reverse=True
    )

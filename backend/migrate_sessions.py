import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "duolingo.db")

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Check if auth_sessions exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='auth_sessions'")
    table_exists = cursor.fetchone()
    
    if table_exists:
        print("Migration already applied: 'auth_sessions' table exists.")
    else:
        print("Creating 'auth_sessions' table...")
        cursor.execute("""
            CREATE TABLE auth_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash VARCHAR NOT NULL UNIQUE,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL,
                revoked_at DATETIME,
                last_used_at DATETIME NOT NULL,
                FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)
        # Create indices
        cursor.execute("CREATE INDEX ix_auth_sessions_user_id ON auth_sessions (user_id)")
        cursor.execute("CREATE INDEX ix_auth_sessions_token_hash ON auth_sessions (token_hash)")
        
        conn.commit()
        print("Migration successful: 'auth_sessions' created.")
        
    conn.close()

if __name__ == "__main__":
    migrate()

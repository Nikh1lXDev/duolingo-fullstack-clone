import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "duolingo.db")

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    
    column_names = [col[1] for col in columns]
    
    if "password_hash" in column_names:
        print("Migration already applied: 'password_hash' column exists.")
    else:
        print("Adding 'password_hash' column to 'users' table...")
        cursor.execute("ALTER TABLE users ADD COLUMN password_hash VARCHAR;")
        conn.commit()
        print("Migration successful: 'password_hash' added.")
        
    conn.close()

if __name__ == "__main__":
    migrate()

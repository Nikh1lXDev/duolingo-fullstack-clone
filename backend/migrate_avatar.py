import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "duolingo.db")

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("PRAGMA table_info(user_settings)")
    columns = cursor.fetchall()
    column_names = [col[1] for col in columns]
    
    if "avatar_config" in column_names:
        print("Migration already applied: 'avatar_config' column exists.")
    else:
        print("Adding 'avatar_config' column to 'user_settings' table...")
        cursor.execute("ALTER TABLE user_settings ADD COLUMN avatar_config VARCHAR;")
        conn.commit()
        print("Migration successful: 'avatar_config' added.")
        
    conn.close()

if __name__ == "__main__":
    migrate()

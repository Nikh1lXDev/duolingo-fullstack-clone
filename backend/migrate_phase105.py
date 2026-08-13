import sqlite3
import os
from app.core.database import engine, Base

def run_migration():
    db_path = os.path.join(os.path.dirname(__file__), "duolingo.db")
    if not os.path.exists(db_path):
        print("duolingo.db does not exist yet; creating tables directly...")
        Base.metadata.create_all(bind=engine)
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # Add course_id column to user_settings if missing
    c.execute("PRAGMA table_info(user_settings)")
    cols = [row[1] for row in c.fetchall()]
    
    if "course_id" not in cols:
        print("Adding course_id to user_settings...")
        c.execute("ALTER TABLE user_settings ADD COLUMN course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL")
        
        # Set default course_id = 1 for existing user_settings rows
        c.execute("UPDATE user_settings SET course_id = 1 WHERE course_id IS NULL")

    conn.commit()
    conn.close()

    Base.metadata.create_all(bind=engine)
    print("Phase 10.5 migration completed successfully.")

if __name__ == "__main__":
    run_migration()

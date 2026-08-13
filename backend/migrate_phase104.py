import sqlite3
import os
from app.core.database import engine, Base
from app.models import VocabularyItem

def run_migration():
    db_path = os.path.join(os.path.dirname(__file__), "duolingo.db")
    if not os.path.exists(db_path):
        print("duolingo.db does not exist yet; creating tables directly...")
        Base.metadata.create_all(bind=engine)
        return

    conn = sqlite3.connect(db_path)
    c = conn.cursor()

    # 1. Add source_language and target_language to courses if missing
    c.execute("PRAGMA table_info(courses)")
    course_cols = [row[1] for row in c.fetchall()]
    
    if "source_language" not in course_cols:
        print("Adding source_language to courses...")
        c.execute("ALTER TABLE courses ADD COLUMN source_language VARCHAR DEFAULT 'Spanish'")
    
    if "target_language" not in course_cols:
        print("Adding target_language to courses...")
        c.execute("ALTER TABLE courses ADD COLUMN target_language VARCHAR DEFAULT 'English'")

    # 2. Add direction to exercises if missing
    c.execute("PRAGMA table_info(exercises)")
    exercise_cols = [row[1] for row in c.fetchall()]
    
    if "direction" not in exercise_cols:
        print("Adding direction to exercises...")
        c.execute("ALTER TABLE exercises ADD COLUMN direction VARCHAR DEFAULT 'source_to_target'")

    conn.commit()
    conn.close()

    # 3. Create vocabulary_items table if missing
    Base.metadata.create_all(bind=engine)
    print("Phase 10.4 migration completed successfully.")

if __name__ == "__main__":
    run_migration()

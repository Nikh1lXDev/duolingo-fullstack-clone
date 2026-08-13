import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine
from app.models.user import User, UserStats, UserSettings

if __name__ == "__main__":
    print("Creating missing tables...")
    Base.metadata.create_all(bind=engine)
    print("Done.")

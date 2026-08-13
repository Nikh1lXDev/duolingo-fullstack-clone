import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import get_db, Base
from app.db.seed import seed_data
import app.db.seed as seed_module

# Test Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session")
def setup_database():
    Base.metadata.create_all(bind=engine)
    
    # Patch the engine and SessionLocal in the seed module so it seeds the test DB
    original_engine = seed_module.engine
    original_session = seed_module.SessionLocal
    
    seed_module.engine = engine
    seed_module.SessionLocal = TestingSessionLocal
    
    seed_data()
    
    yield
    
    # Teardown
    Base.metadata.drop_all(bind=engine)
    seed_module.engine = original_engine
    seed_module.SessionLocal = original_session


@pytest.fixture(scope="function")
def db_session(setup_database):
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

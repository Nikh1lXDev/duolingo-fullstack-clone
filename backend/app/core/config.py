from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Duolingo Clone"
    AUTH_SESSION_EXPIRE_DAYS: int = 7
    DATABASE_URL: str = "sqlite:///./duolingo.db"
    SECRET_KEY: str = "replace-this-in-production"
    CORS_ORIGINS: str = "http://localhost:3000"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8')

settings = Settings()

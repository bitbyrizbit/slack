# Configuration settings for slack-api
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "slack-api"
    debug: bool = False
    database_url: str = "postgresql://postgres@localhost:5432/slack_db"
    tight_threshold_minutes: int = 30
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://slack-sand-nu.vercel.app"]

    # JWT auth settings
    jwt_secret: str = "dev-secret-change-in-prod"
    jwt_algorithm: str = "HS256"
    jwt_expire_days: int = 7

    # Groq LLM API Key and Model
    groq_api_key: Optional[str] = None
    groq_model: str = "openai/gpt-oss-20b"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

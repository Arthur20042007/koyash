from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000

    MONGODB_URI: str
    MONGO_DB_NAME: str = "koyash"

    # Authentication (ADR-004). Access tokens are JWTs signed with HS256.
    # JWT_SECRET must be overridden in production via the environment; the
    # default below is for local development only.
    JWT_SECRET: str = "dev-only-insecure-secret-change-in-production"
    JWT_ALG: str = "HS256"
    JWT_EXPIRE_DAYS: int = 7

    # LLM justification layer (ADR-001). Off by default: when disabled or
    # unconfigured, /recommend returns the rule-based justification unchanged.
    LLM_ENABLED: bool = False
    LLM_API: str = ""
    LLM_BASE_URL: str = "https://api.vsellm.ru/v1"
    LLM_MODEL: str = "openai/gpt-4o-mini"
    LLM_TIMEOUT: float = 20.0

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

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

    # Password reset by email (US-27). Mail is sent through the project's own
    # mail domain over SMTP — only sending is used, so the mailbox's POP3/IMAP
    # side is not configured here. Credentials come from the environment only and
    # are never committed. When SMTP is unconfigured the reset endpoint still
    # answers normally but nothing is sent (see app.core.mailer).
    #
    # Note: the mail is sent in a background task, so an unreachable mail server
    # never makes the user wait and never leaks (by response time) which
    # addresses are registered.
    #
    # The "from" address; falls back to SMTP_FROM / SMTP_USER for compatibility.
    MAIL_FROM: str = ""

    SMTP_HOST: str = ""
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    # True  -> implicit TLS, connect with SMTP_SSL (the SSL/TLS port, usually 465)
    # False -> plain connect on the SMTP port + STARTTLS (usually 587)
    SMTP_SSL: bool = True
    SMTP_TIMEOUT: float = 15.0

    # Where the reset link points (the deployed web app).
    FRONTEND_URL: str = "http://localhost:5173"
    # Reset links are single-use and expire after this many minutes.
    RESET_TOKEN_TTL_MINUTES: int = 30

    # LLM justification layer (ADR-001). Off by default: when disabled or
    # unconfigured, /recommend returns the rule-based justification unchanged.
    LLM_ENABLED: bool = False
    LLM_API: str = ""
    LLM_BASE_URL: str = "https://api.vsellm.ru/v1"
    LLM_MODEL: str = "openai/gpt-4o-mini"
    LLM_TIMEOUT: float = 20.0

    @property
    def mail_from(self) -> str:
        """The address the reset email is sent from."""
        return self.MAIL_FROM or self.SMTP_FROM or self.SMTP_USER

    @property
    def mail_enabled(self) -> bool:
        """True when enough SMTP settings are present to actually send mail."""
        return bool(self.SMTP_HOST and self.SMTP_USER and self.SMTP_PASSWORD)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

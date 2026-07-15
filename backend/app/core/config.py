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

    # Password reset by email (US-27). Mail is sent through Resend's HTTPS API
    # rather than SMTP: Railway blocks outbound SMTP (ports 25/465/587) on its
    # Free/Hobby plans, so a smtplib-based sender can never actually deliver in
    # production — see https://railway.com/deploy/resend-email-railway.
    # Resend's API rides on port 443 like any other web request, so it isn't
    # blocked. Credentials come from the environment only and are never
    # committed. When Resend is unconfigured the reset endpoint still answers
    # normally but nothing is sent (see app.core.mailer).
    #
    # Note: the mail is sent in a background task, so an unreachable API
    # never makes the user wait and never leaks (by response time) which
    # addresses are registered.
    #
    # The "from" address, e.g. "Koyash <noreply@your-domain>" or a bare
    # address; must be on a domain verified with Resend (or the sandbox
    # `onboarding@resend.dev` for testing).
    MAIL_FROM: str = ""

    # API key from the Resend dashboard (starts with "re_").
    RESEND_API_KEY: str = ""
    MAIL_TIMEOUT: float = 15.0

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
        return self.MAIL_FROM

    @property
    def mail_enabled(self) -> bool:
        """True when enough Resend settings are present to actually send mail."""
        return bool(self.RESEND_API_KEY and self.MAIL_FROM)

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

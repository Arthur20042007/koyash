"""User and authentication models (ADR-004).

Email is used as the login identifier (unique, stored lower-cased). Phone and
age are optional and never used for authentication. We validate email with a
light normalization check rather than pulling in an extra dependency.
"""

from typing import Optional

from pydantic import BaseModel, Field, field_validator


def _normalize_email(value: str) -> str:
    value = value.strip().lower()
    local, _, domain = value.partition("@")
    if not local or "." not in domain:
        raise ValueError("Некорректный email")
    return value


class UserRegister(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str
    password: str = Field(min_length=8, max_length=128)
    age: Optional[int] = Field(default=None, ge=10, le=100)
    phone: Optional[str] = Field(default=None, max_length=32)
    avatar: Optional[str] = Field(default=None, max_length=32)

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        return _normalize_email(v)

    @field_validator("name", "phone")
    @classmethod
    def _strip(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v


class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def _email(cls, v: str) -> str:
        return _normalize_email(v)


class UserOut(BaseModel):
    """Public view of a user — never exposes the password hash."""

    id: str
    name: str
    email: str
    age: Optional[int] = None
    phone: Optional[str] = None
    avatar: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class ProfileUpdate(BaseModel):
    """Partial edit of personal data. Only provided fields are updated."""

    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = Field(default=None, max_length=32)
    age: Optional[int] = Field(default=None, ge=10, le=100)
    avatar: Optional[str] = Field(default=None, max_length=32)

    @field_validator("email")
    @classmethod
    def _email(cls, v: Optional[str]) -> Optional[str]:
        return _normalize_email(v) if v is not None else v

    @field_validator("name", "phone")
    @classmethod
    def _strip(cls, v: Optional[str]) -> Optional[str]:
        return v.strip() if isinstance(v, str) else v


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


class AccountDelete(BaseModel):
    password: str

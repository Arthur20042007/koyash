# ADR-004: Guest-first authentication with bcrypt and JWT

**Status:** Accepted

**Quality requirements addressed:**
[QR-004](../../quality-requirements.md#qr-004-credential-confidentiality)

## Context

MVP v3 adds a personal account: a profile card, one saved cosmetic bag,
per-product feedback, product replacement, and a result tracker. All of these
need to identify the user and store personal data. The customer's brief (ТЗ
§7.4) marks authentication as **low priority** ("не тратить много времени") and
says email or phone are both acceptable, while asking that a real database back
the data. Two hard constraints shape the design:

- The core value flow — the questionnaire and `POST /recommend` — must stay
  fully usable by anonymous visitors. Accounts are an addition, not a gate.
- The team is small and wants no third-party dependency (SMS/email provider) on
  the critical auth path for the trial.

## Decision

Introduce a thin, **guest-first** authentication layer:

- **Guest-first.** The questionnaire and `POST /recommend` stay open to
  anonymous users. `/recommend` takes an *optional* auth dependency: a signed-in
  request additionally persists the profile and the saved bag, while a guest (or
  an invalid/expired token) is served normally and persists nothing. All
  account endpoints (`/auth/me`, `/profile`, `/care`, `/tracker`, `/account…`)
  require authentication.
- **Email + password.** Email is the unique, case-insensitive login identifier.
  Passwords are hashed with **bcrypt** and never stored or returned in plain
  text. A phone number may be collected but is **not** used for authentication
  (no SMS/OTP), keeping the customer's "keep it light" guidance.
- **Stateless JWT.** Login and registration issue a **JWT** (HS256, 7-day
  expiry) carried as a `Bearer` token; a reusable `get_current_user` dependency
  validates it. The signing secret is `JWT_SECRET`, supplied via the environment
  (dev-only default in config).
- **User data in MongoDB (ADR-002).** One `users` document per user (with the
  profile snapshot embedded), one `care` document (the single saved bag), and
  one `tracker` document, each keyed by the user id. A unique index on
  `users.email` enforces identity at the database level.
- **Deliberately out of scope for the trial:** OAuth/social login, refresh
  tokens, server-side sessions, and email-based password reset. Password reset
  needs a transactional email service and is deferred (PBI-503); until it ships,
  the "Forgot password?" entry point is hidden.

## Consequences and tradeoffs

- **Positive — guest funnel is untouched.** Because `/recommend` authentication
  is optional, the acquisition flow keeps working for anonymous users and the
  account layer is purely additive.
- **Confidentiality ([QR-004](../../quality-requirements.md#qr-004-credential-confidentiality)).**
  Passwords exist only as bcrypt hashes and are never returned by any endpoint;
  this is verified continuously by QRT-004.
- **Positive — no external dependency on the auth path.** Email+password+JWT
  needs no SMS/email provider to work, so the trial has no third-party runtime
  coupling for sign-in.
- **Positive — data isolation.** Every account document is keyed by user id and
  every account endpoint is scoped to the current user, so one user cannot read
  another's profile, bag, or tracker. Account deletion cascades across the
  `users`, `care`, and `tracker` collections.
- **Negative / tradeoff — token lifecycle.** A stateless JWT cannot be revoked
  before it expires (a 7-day window), and the frontend stores it in
  `localStorage`, which is exposed to XSS. Both are accepted for a low-priority
  MVP auth layer; a future hardening step could add refresh/rotation or an
  http-only cookie.
- **Negative / tradeoff — no self-service recovery yet.** Without the email
  service, a user who forgets their password cannot reset it in the trial; this
  is a known, documented gap (PBI-503) rather than an insecure direct reset.
- **New secret.** `JWT_SECRET` joins `MONGODB_URI` and the LLM key as an
  environment secret (see the deployment view and the configuration section of
  the development process).

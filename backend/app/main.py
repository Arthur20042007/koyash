from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import connect_db, close_db, get_database
from app.api import products, recommend, auth, account, tracker


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    # Enforce unique emails at the database level (safety net for the
    # application-level check in /auth/register).
    await get_database()["users"].create_index("email", unique=True)
    yield
    await close_db()


app = FastAPI(
    title="SWP API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(products.router)
app.include_router(recommend.router)
app.include_router(auth.router)
app.include_router(account.router)
app.include_router(tracker.router)


@app.get("/health", status_code=200)
async def health_check():
    return {"status": "ok"}

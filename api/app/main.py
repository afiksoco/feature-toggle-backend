from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import connect_to_mongo, close_mongo_connection
from .routes import admin_router, sdk_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()


app = FastAPI(
    title="Feature Toggle SDK API",
    description="Backend API for Feature Toggle SDK",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(admin_router)
app.include_router(sdk_router)


@app.get("/")
async def root():
    return {"message": "Feature Toggle SDK API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}

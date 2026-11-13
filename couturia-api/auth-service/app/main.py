import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.bootstrap import seed_admin_if_needed
from app.config import get_settings

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

settings = get_settings()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    seed_admin_if_needed()
    yield


app = FastAPI(
    title=settings.auth_app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

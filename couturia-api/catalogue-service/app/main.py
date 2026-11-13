import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import api_router
from app.config import get_settings
from app.media import media_root

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s %(message)s")

settings = get_settings()

app = FastAPI(
    title=settings.catalogue_app_name,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
# Disque local uniquement (en prod Cloudinary, pas de /media servi ici)
if not settings.cloudinary_enabled:
    app.mount("/media", StaticFiles(directory=str(media_root())), name="media")

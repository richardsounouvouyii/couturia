from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    catalogue_app_name: str = "Couturia Catalogue Service"
    catalogue_env: str = "development"
    catalogue_service_port: int = 8003
    catalogue_database_url: str = (
        "postgresql+psycopg://couturia:couturia_dev@localhost:5432/catalogue_db"
    )
    rabbitmq_url: str = "amqp://couturia:couturia_dev@localhost:5672/"
    # Dossier disque des images + URL vue par le navigateur (local / sans Cloudinary)
    catalogue_media_root: str = "media"
    catalogue_public_url: str = "http://localhost:8003"
    # Cloudinary (prod gratuit) — si renseigné, remplace le disque local
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""
    cloudinary_folder: str = "couturia/creations"
    # Origines front autorisées, séparées par des virgules
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]

    @property
    def cloudinary_enabled(self) -> bool:
        return bool(
            self.cloudinary_cloud_name
            and self.cloudinary_api_key
            and self.cloudinary_api_secret
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()

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


@lru_cache
def get_settings() -> Settings:
    return Settings()

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    atelier_app_name: str = "Couturia Atelier Service"
    atelier_env: str = "development"
    atelier_service_port: int = 8002
    atelier_database_url: str = (
        "postgresql+psycopg://couturia:couturia_dev@localhost:5432/atelier_db"
    )
    rabbitmq_url: str = "amqp://couturia:couturia_dev@localhost:5672/"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

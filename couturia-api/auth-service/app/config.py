from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    auth_app_name: str = "Couturia Auth Service"
    auth_env: str = "development"
    auth_service_port: int = 8001
    auth_database_url: str = (
        "postgresql+psycopg://couturia:couturia_dev@localhost:5432/auth_db"
    )
    auth_jwt_secret: str = "change-me-in-production-use-a-long-random-string"
    auth_jwt_algorithm: str = "HS256"
    auth_jwt_expire_minutes: int = 60
    rabbitmq_url: str = "amqp://couturia:couturia_dev@localhost:5672/"


@lru_cache
def get_settings() -> Settings:
    return Settings()

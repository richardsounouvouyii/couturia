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
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Seed admin en développement (désactivé si e-mail vide)
    auth_seed_admin_email: str = "admin@couturia.com"
    auth_seed_admin_password: str = "admincouturia1"
    auth_seed_admin_name: str = "Admin Couturia"

    @property
    def cors_origin_list(self) -> list[str]:
        return [item.strip() for item in self.cors_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

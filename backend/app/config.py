from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mapa Campanha API"
    debug: bool = False
    database_url: str = "sqlite:///./data/mapa.db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    uploads_dir: Path = Path("./uploads")
    max_upload_bytes: int = 5 * 1024 * 1024  # 5 MB
    allowed_image_types: str = "image/jpeg,image/png,image/webp,image/gif"
    admin_user: str | None = Field(default=None, validation_alias="ADMIN_USER")
    admin_password: str | None = Field(default=None, validation_alias="ADMIN_PASSWORD")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_image_type_list(self) -> list[str]:
        return [t.strip() for t in self.allowed_image_types.split(",") if t.strip()]

    @property
    def admin_configured(self) -> bool:
        return bool(self.admin_user and self.admin_password)


settings = Settings()

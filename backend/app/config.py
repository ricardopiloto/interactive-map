from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

DEFAULT_MODULOS_BY_SISTEMA: dict[str, list[str]] = {
    "wfrp4e": ["fadiga"],
    "wod": [],
}


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Mapa Campanha API"
    debug: bool = False
    data_dir: Path = Field(default=Path("./data"), validation_alias="DATA_DIR")
    campaign_slug: str | None = Field(default=None, validation_alias="CAMPAIGN_SLUG")
    # Legacy single-DB URL kept for seed/tools; HTTP uses CAMPAIGN_SLUG + control.db
    database_url: str = "sqlite:///./data/mapa.db"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    uploads_dir: Path = Path("./uploads")
    registo_modo: str = Field(default="fechado", validation_alias="REGISTO_MODO")
    email_api_key: str | None = Field(default=None, validation_alias="EMAIL_API_KEY")
    email_from: str = Field(default="", validation_alias="EMAIL_FROM")
    turnstile_secret: str | None = Field(default=None, validation_alias="TURNSTILE_SECRET")
    turnstile_site_key: str | None = Field(default=None, validation_alias="TURNSTILE_SITE_KEY")
    registo_dominios_bloqueados: Path | None = Field(default=None, validation_alias="REGISTO_DOMINIOS_BLOQUEADOS")
    email_log_file: Path | None = Field(default=None, validation_alias="EMAIL_LOG_FILE")
    contato_email: str | None = Field(default=None, validation_alias="CONTATO_EMAIL")
    contato_limite_diario: int = Field(default=30, gt=0, validation_alias="CONTATO_LIMITE_DIARIO")
    contato_limite_privacidade: int = Field(default=10, gt=0, validation_alias="CONTATO_LIMITE_PRIVACIDADE")
    cota_padrao_bytes: int = Field(default=300 * 1024**2, gt=0, validation_alias="COTA_PADRAO_BYTES")
    max_upload_bytes: int = Field(
        default=25 * 1024 * 1024,  # 25 MB — mapas de campanha costumam ser grandes
        validation_alias="MAX_UPLOAD_BYTES",
    )
    allowed_image_types: str = "image/jpeg,image/png,image/webp,image/gif"
    # Deprecated as GM gate (spec 095) — ignored for auth; kept for legacy scripts
    admin_user: str | None = Field(default=None, validation_alias="ADMIN_USER")
    admin_password: str | None = Field(default=None, validation_alias="ADMIN_PASSWORD")
    public_base_url: str = Field(
        default="http://localhost:5173",
        validation_alias="PUBLIC_BASE_URL",
    )
    trusted_proxy: bool = Field(default=False, validation_alias="TRUSTED_PROXY")
    cookie_secure: bool | None = Field(default=None, validation_alias="COOKIE_SECURE")
    sistema: str = Field(default="wfrp4e", validation_alias="SISTEMA")
    modulos_ativos_env: str | None = Field(default=None, validation_alias="MODULOS_ATIVOS")
    migrate_drop_legacy_fadiga: bool = Field(
        default=False,
        validation_alias="MIGRATE_DROP_LEGACY_FADIGA",
    )
    tolerancia_pernoite_pct: float = 0.20
    raio_abrigo_cidade_unidades_mapa: float = 0.02
    deepseek_api_key: str | None = Field(default=None, validation_alias="DEEPSEEK_API_KEY")
    deepseek_base_url: str = Field(
        default="https://api.deepseek.com",
        validation_alias="DEEPSEEK_BASE_URL",
    )
    deepseek_model: str = Field(default="deepseek-chat", validation_alias="DEEPSEEK_MODEL")
    deepseek_timeout_seconds: float = Field(
        default=30.0,
        validation_alias="DEEPSEEK_TIMEOUT_SECONDS",
    )
    ia_assistente_contexto_max_chars: int = Field(default=48000, ge=2000)
    ia_assistente_timeout_seconds: float = Field(default=120.0, gt=0)
    ia_indice_trechos_max: int = Field(default=20, ge=1)
    ia_indice_catalogo_max_chars: int = Field(default=6000, ge=0)
    ia_indice_sessoes_recentes: int = Field(default=3, ge=0)
    ia_indice_arcos_recentes: int = Field(default=3, ge=0)

    @field_validator("deepseek_api_key", mode="before")
    @classmethod
    def _blank_deepseek_key(cls, value: object) -> str | None:
        if value is None:
            return None
        text = str(value).strip()
        return text or None

    @field_validator("modulos_ativos_env", mode="before")
    @classmethod
    def _coerce_modulos_env(cls, value: object) -> str | None:
        if value is None:
            return None
        return str(value)

    @property
    def modulos_ativos(self) -> list[str]:
        if self.modulos_ativos_env is not None:
            raw = self.modulos_ativos_env.strip()
            if raw == "":
                return []
            return [part.strip() for part in raw.split(",") if part.strip()]
        return list(DEFAULT_MODULOS_BY_SISTEMA.get(self.sistema, []))

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_image_type_list(self) -> list[str]:
        return [t.strip() for t in self.allowed_image_types.split(",") if t.strip()]

settings = Settings()

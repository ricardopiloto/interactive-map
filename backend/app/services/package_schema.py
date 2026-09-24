"""Package format constants, schema registry, and zip allowlist (spec 097)."""

from __future__ import annotations

from collections.abc import Callable
from pathlib import Path
from typing import Any

from alembic.config import Config
from alembic.script import ScriptDirectory

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent

PACKAGE_FORMAT = 1
CONTENT_FILENAME = "content.json"
MANIFEST_FILENAME = "manifest.json"
UPLOAD_CATEGORIES = frozenset({"map", "portraits", "locals", "covers"})

# Uncompressed size ceiling = default cota + margin for JSON
ZIP_SIZE_MARGIN_BYTES = 64 * 1024 * 1024
ZIP_MAX_ENTRIES = 50_000

# Error codes (contracts/security-refusals.md)
PACOTE_INVALIDO = "PACOTE_INVALIDO"
ENTRADA_PROIBIDA = "ENTRADA_PROIBIDA"
MANIFESTO_INVALIDO = "MANIFESTO_INVALIDO"
CONTEUDO_INVALIDO = "CONTEUDO_INVALIDO"
SCHEMA_FUTURO = "SCHEMA_FUTURO"
SCHEMA_DESCONHECIDO = "SCHEMA_DESCONHECIDO"
SISTEMA_DESCONHECIDO = "SISTEMA_DESCONHECIDO"
COTA_EXCEDIDA = "COTA_EXCEDIDA"
ZIP_DEMASIADO_GRANDE = "ZIP_DEMASIADO_GRANDE"
SLUG_OCUPADO = "SLUG_OCUPADO"
SLUG_INVALIDO = "SLUG_INVALIDO"
NAO_DONO = "NAO_DONO"


class PackageError(Exception):
    def __init__(self, codigo: str, message: str = "") -> None:
        self.codigo = codigo
        super().__init__(message or codigo)


def campaign_head_revision() -> str:
    cfg = Config()
    cfg.set_main_option("script_location", str(_BACKEND_ROOT / "alembic_campaign"))
    cfg.set_main_option("sqlalchemy.url", "sqlite:///")
    script = ScriptDirectory.from_config(cfg)
    head = script.get_current_head()
    if not head:
        raise RuntimeError("campaign alembic head missing")
    return head


ContentMigrator = Callable[[dict[str, Any], dict[str, Any]], tuple[dict[str, Any], dict[str, Any]]]


def _identity_migrator(
    manifest: dict[str, Any], content: dict[str, Any]
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Synthetic older schema → current shape (fixture 000_pre)."""
    out_m = dict(manifest)
    out_m["schema_version"] = campaign_head_revision()
    return out_m, content


# Older recognized revisions → migrator to next (chain until head)
SCHEMA_MIGRATORS: dict[str, ContentMigrator] = {
    "000_pre": _identity_migrator,
}


def is_allowed_zip_member(name: str) -> bool:
    """True if name is exactly manifest/content or uploads/{cat}/basename."""
    name = name.replace("\\", "/").lstrip("/")
    if name in (MANIFEST_FILENAME, CONTENT_FILENAME):
        return True
    parts = name.split("/")
    if len(parts) == 3 and parts[0] == "uploads" and parts[1] in UPLOAD_CATEGORIES:
        base = parts[2]
        if not base or base in (".", "..") or "/" in base or "\\" in base:
            return False
        if ".." in base:
            return False
        return True
    return False


def migrate_to_head(
    manifest: dict[str, Any], content: dict[str, Any]
) -> tuple[dict[str, Any], dict[str, Any]]:
    head = campaign_head_revision()
    version = str(manifest.get("schema_version") or "")
    if not version:
        raise PackageError(MANIFESTO_INVALIDO)
    if version == head:
        return manifest, content
    if version not in SCHEMA_MIGRATORS:
        # Unknown: if it looks "newer" we cannot know — treat as future/unknown
        raise PackageError(SCHEMA_FUTURO if version != head else SCHEMA_DESCONHECIDO)

    seen: set[str] = set()
    m, c = manifest, content
    while str(m.get("schema_version")) != head:
        ver = str(m.get("schema_version"))
        if ver in seen:
            raise PackageError(SCHEMA_DESCONHECIDO)
        seen.add(ver)
        migrator = SCHEMA_MIGRATORS.get(ver)
        if migrator is None:
            raise PackageError(SCHEMA_DESCONHECIDO)
        m, c = migrator(m, c)
        if str(m.get("schema_version")) == ver:
            # Migrator must advance version
            m = dict(m)
            m["schema_version"] = head
    return m, c

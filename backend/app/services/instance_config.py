from pathlib import Path

from app.config import settings
from app.schemas.config import InstanceConfigRead

_MAP_EXTENSIONS = (".webp", ".jpg", ".jpeg", ".png", ".gif")


def has_map_image() -> bool:
    map_dir = Path(settings.uploads_dir) / "map"
    if not map_dir.is_dir():
        return False
    for ext in _MAP_EXTENSIONS:
        if (map_dir / f"campaign-map{ext}").is_file():
            return True
    return False


def get_instance_config() -> InstanceConfigRead:
    return InstanceConfigRead(
        sistema=settings.sistema,
        modulos_ativos=settings.modulos_ativos,
        has_map_image=has_map_image(),
    )

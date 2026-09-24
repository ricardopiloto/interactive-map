from fastapi import APIRouter, Path

from app.schemas.config import InstanceConfigRead
from app.services.instance_config import get_instance_config_for_slug

router = APIRouter()


@router.get("/config", response_model=InstanceConfigRead)
def read_instance_config(slug: str = Path(...)) -> InstanceConfigRead:
    return get_instance_config_for_slug(slug)

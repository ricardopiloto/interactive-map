from fastapi import APIRouter

from app.schemas.config import InstanceConfigRead
from app.services.instance_config import get_instance_config

router = APIRouter()


@router.get("/config", response_model=InstanceConfigRead)
def read_instance_config() -> InstanceConfigRead:
    return get_instance_config()

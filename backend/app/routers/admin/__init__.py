from fastapi import APIRouter, Depends

from app.deps.auth import verify_admin
from app.routers.admin import arcos, grupo, locais, map_scale, npcs, route_segments, uploads, waypoints

router = APIRouter(prefix="/api/admin", dependencies=[Depends(verify_admin)])
router.include_router(locais.router, tags=["admin-locais"])
router.include_router(npcs.router, tags=["admin-npcs"])
router.include_router(arcos.router, tags=["admin-arcos"])
router.include_router(grupo.router, tags=["admin-grupo"])
router.include_router(uploads.router, tags=["admin-uploads"])
router.include_router(waypoints.router, tags=["admin-waypoints"])
router.include_router(route_segments.router, tags=["admin-route-segments"])
router.include_router(map_scale.router, tags=["admin-map-scale"])


@router.get("/session")
def admin_session(user: str = Depends(verify_admin)) -> dict[str, str]:
    return {"user": user}

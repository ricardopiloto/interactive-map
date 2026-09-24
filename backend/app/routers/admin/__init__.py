from fastapi import APIRouter, Depends

from app.deps.auth import MembroContext, require_membro
from app.routers.admin import (
    arcos,
    eventos,
    export,
    grupo,
    locais,
    map_scale,
    npcs,
    personagens,
    route_segments,
    sessoes,
    uploads,
    vinculos,
    waypoints,
)

router = APIRouter(prefix="/api/c/{slug}/admin", dependencies=[Depends(require_membro)])
router.include_router(locais.router, tags=["admin-locais"])
router.include_router(npcs.router, tags=["admin-npcs"])
router.include_router(personagens.router, tags=["admin-personagens"])
router.include_router(vinculos.router, tags=["admin-vinculos"])
router.include_router(arcos.router, tags=["admin-arcos"])
router.include_router(grupo.router, tags=["admin-grupo"])
router.include_router(uploads.router, tags=["admin-uploads"])
router.include_router(waypoints.router, tags=["admin-waypoints"])
router.include_router(route_segments.router, tags=["admin-route-segments"])
router.include_router(map_scale.router, tags=["admin-map-scale"])
router.include_router(export.router, tags=["admin-export"])
router.include_router(sessoes.router, tags=["admin-sessoes"])
router.include_router(eventos.router, tags=["admin-eventos"])


@router.get("/session")
def admin_session(ctx: MembroContext = Depends(require_membro)) -> dict[str, str]:
    return {"email": ctx.usuario.email}

from fastapi import APIRouter, Depends

from app.deps.auth import verify_admin
from app.routers.admin import arcos, grupo, locais, npcs, uploads

router = APIRouter(prefix="/api/admin", dependencies=[Depends(verify_admin)])
router.include_router(locais.router, tags=["admin-locais"])
router.include_router(npcs.router, tags=["admin-npcs"])
router.include_router(arcos.router, tags=["admin-arcos"])
router.include_router(grupo.router, tags=["admin-grupo"])
router.include_router(uploads.router, tags=["admin-uploads"])


@router.get("/session")
def admin_session(user: str = Depends(verify_admin)) -> dict[str, str]:
    return {"user": user}

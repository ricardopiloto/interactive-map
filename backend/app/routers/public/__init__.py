from fastapi import APIRouter

from app.routers.public import arcos, grupo, locais, npcs

router = APIRouter(prefix="/api")
router.include_router(locais.router, tags=["locais"])
router.include_router(npcs.router, tags=["npcs"])
router.include_router(arcos.router, tags=["arcos"])
router.include_router(grupo.router, tags=["grupo"])

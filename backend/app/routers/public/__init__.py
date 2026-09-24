from fastapi import APIRouter

from app.routers.public import arcos, config, grupo, locais, media, npcs, personagens, routes, sessoes, vinculos

router = APIRouter(prefix="/api/c/{slug}")
router.include_router(config.router, tags=["config"])
router.include_router(media.router, tags=["media"])
router.include_router(locais.router, tags=["locais"])
router.include_router(npcs.router, tags=["npcs"])
router.include_router(personagens.router, tags=["personagens"])
router.include_router(vinculos.router, tags=["vinculos"])
router.include_router(arcos.router, tags=["arcos"])
router.include_router(grupo.router, tags=["grupo"])
router.include_router(routes.router, tags=["routes"])
router.include_router(sessoes.router, tags=["sessoes"])

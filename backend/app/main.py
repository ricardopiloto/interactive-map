from contextlib import asynccontextmanager
import asyncio
import logging

from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.campaign_db import get_control_engine, init_control
from app.config import settings
from app.errors import raise_api_error
from app.middleware.csrf import CsrfOriginMiddleware
from app.routers import admin, administrador, auth, campanhas, contato, public
from app.services.rate_limit import limiter
from app.services.sitemap import build_sitemap_xml, campanhas_indexaveis
from sqlmodel import Session


PURGE_INTERVAL_SECONDS = 15 * 60


def _purge_pending_cycle() -> None:
    from sqlmodel import Session
    from app.services.admin_console import purge_unverified_signups

    with Session(get_control_engine()) as session:
        purge_unverified_signups(session)


async def _periodic_pending_cleanup(interval: float = PURGE_INTERVAL_SECONDS) -> None:
    while True:
        await asyncio.sleep(interval)
        try:
            await asyncio.to_thread(_purge_pending_cycle)
        except Exception:
            assistant_logger.exception("pending signup cleanup failed")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    from app.services.registo_config import validate_public_forms_startup, validate_registo_startup
    from app.services.auth_admin import valid_email_format

    validate_registo_startup()
    validate_public_forms_startup()
    if settings.contato_email and not valid_email_format(settings.contato_email):
        assistant_logger.warning('contact unavailable code=CONTATO_EMAIL_INVALIDO')
    init_control()
    cleanup_task = asyncio.create_task(_periodic_pending_cleanup())
    from app.services.admin_console import reconcile_campaign_deletions

    try:
        reconcile_campaign_deletions()
        yield
    finally:
        cleanup_task.cancel()
        try:
            await cleanup_task
        except asyncio.CancelledError:
            pass


assistant_logger = logging.getLogger("app")
assistant_logger.setLevel(logging.INFO)
if not assistant_logger.handlers:
    assistant_logger.addHandler(logging.StreamHandler())

app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
    openapi_url="/api/openapi.json" if settings.debug else None,
)

app.state.limiter = limiter
def rate_limit_handler(request, _exc):
    code = "LIMITE_REGISTO" if request.url.path == "/api/auth/registo" else "LIMITE_PEDIDOS"
    return JSONResponse(status_code=429, content={"detail": {"erro": code}})


app.add_exception_handler(RateLimitExceeded, rate_limit_handler)
app.add_middleware(SlowAPIMiddleware)
app.add_middleware(CsrfOriginMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(public.router)
app.include_router(admin.router)
app.include_router(administrador.router)
app.include_router(auth.router)
app.include_router(contato.router)
app.include_router(campanhas.router)


@app.get("/sitemap.xml")
def sitemap_xml() -> Response:
    with Session(get_control_engine()) as session:
        xml = build_sitemap_xml(session)
        count = len(campanhas_indexaveis(session))
    assistant_logger.info("sitemap gerado campanhas=%d", count)
    return Response(content=xml, media_type="application/xml", headers={"Cache-Control": "public, max-age=3600"})


@app.get("/uploads/c/{slug}/{file_path:path}")
def uploads_c_gone(slug: str, file_path: str) -> None:
    raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)


@app.get("/uploads/{file_path:path}")
def uploads_bare_gone(file_path: str) -> None:
    raise_api_error("CAMPANHA_NAO_ENCONTRADA", status_code=404)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def run() -> None:
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )


if __name__ == "__main__":
    run()

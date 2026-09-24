from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

from app.campaign_db import init_control
from app.config import settings
from app.errors import raise_api_error
from app.middleware.csrf import CsrfOriginMiddleware
from app.routers import admin, administrador, auth, campanhas, public
from app.services.rate_limit import limiter


@asynccontextmanager
async def lifespan(_app: FastAPI):
    init_control()
    yield


app = FastAPI(
    title=settings.app_name,
    debug=settings.debug,
    lifespan=lifespan,
    docs_url="/api/docs" if settings.debug else None,
    redoc_url=None,
    openapi_url="/api/openapi.json" if settings.debug else None,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
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
app.include_router(campanhas.router)


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

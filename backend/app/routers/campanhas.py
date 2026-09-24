from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, UploadFile, status

from app.deps.auth import MembroContext, require_dono, require_session_user
from app.errors import raise_api_error
from app.models.usuario import Usuario
from app.schemas.campanhas import (
    CatalogoResponse,
    CapaRequest,
    CapaResponse,
    CriarCampanhaRequest,
    CriarCampanhaResponse,
    GeneroRequest,
    GeneroResponse,
    MinhasResponse,
    UnidadeDistanciaRequest,
    UnidadeDistanciaResponse,
    VisibilidadeRequest,
    VisibilidadeResponse,
)
from app.services.auth_admin import assign_owner
from app.services.campanha_admin import (
    CampanhaAdminError,
    create_campanha,
    list_catalogo_publico,
    list_minhas_campanhas,
    set_capa,
    set_genero,
    set_unidade_distancia,
    set_visibilidade,
)
from app.services.media_paths import media_url
from app.services.campaign_import import import_campaign_from_bytes
from app.services.package_schema import PackageError, SLUG_OCUPADO
from app.campaign_db import get_control_engine
from sqlmodel import Session

router = APIRouter(prefix="/api/campanhas", tags=["campanhas"])


def _admin_error_status(codigo: str) -> int:
    if codigo in ("SLUG_DUPLICADO",):
        return 409
    if codigo in ("CAMPANHA_NAO_ENCONTRADA",):
        return 404
    return 400


@router.get("/catalogo", response_model=CatalogoResponse)
def catalogo_publico() -> CatalogoResponse:
    return CatalogoResponse(campanhas=list_catalogo_publico())  # type: ignore[arg-type]


@router.get("/minhas", response_model=MinhasResponse)
def minhas_campanhas(usuario: Usuario = Depends(require_session_user)) -> MinhasResponse:
    assert usuario.id is not None
    return MinhasResponse(campanhas=list_minhas_campanhas(usuario.id))  # type: ignore[arg-type]


@router.post("", status_code=status.HTTP_201_CREATED, response_model=CriarCampanhaResponse)
def criar_campanha_http(
    body: CriarCampanhaRequest,
    usuario: Usuario = Depends(require_session_user),
) -> CriarCampanhaResponse:
    vis = body.visibilidade if body.visibilidade is not None else "listada"
    try:
        camp = create_campanha(
            slug=body.slug.strip(),
            nome=body.nome.strip(),
            sistema=body.sistema.strip(),
            genero=body.genero,
            visibilidade=vis,
        )
        with Session(get_control_engine()) as session:
            assign_owner(session, camp.slug, usuario.email)
    except CampanhaAdminError as exc:
        raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
    return CriarCampanhaResponse(
        slug=camp.slug,
        id=camp.id,  # type: ignore[arg-type]
        nome=camp.nome,
        sistema=camp.sistema,
        genero=camp.genero,
        visibilidade=camp.visibilidade,
    )


@router.patch("/{slug}/visibilidade", response_model=VisibilidadeResponse)
def patch_visibilidade(
    slug: str,
    body: VisibilidadeRequest,
    _ctx: MembroContext = Depends(require_dono),
) -> VisibilidadeResponse:
    try:
        camp = set_visibilidade(slug, body.visibilidade)
    except CampanhaAdminError as exc:
        raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
    return VisibilidadeResponse(slug=camp.slug, visibilidade=camp.visibilidade)


@router.patch("/{slug}/unidade-distancia", response_model=UnidadeDistanciaResponse)
def patch_unidade_distancia(
    slug: str,
    body: UnidadeDistanciaRequest,
    _ctx: MembroContext = Depends(require_dono),
) -> UnidadeDistanciaResponse:
    try:
        camp = set_unidade_distancia(slug, body.unidade_distancia)
    except CampanhaAdminError as exc:
        raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
    return UnidadeDistanciaResponse(slug=camp.slug, unidade_distancia=camp.unidade_distancia)


@router.patch("/{slug}/capa", response_model=CapaResponse)
def patch_capa(
    slug: str,
    body: CapaRequest,
    _ctx: MembroContext = Depends(require_dono),
) -> CapaResponse:
    try:
        camp = set_capa(
            slug,
            capa_arquivo=body.capa_arquivo,
            limpar_capa=body.limpar_capa,
        )
    except CampanhaAdminError as exc:
        raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
    capa = (camp.capa_arquivo or "").strip()
    return CapaResponse(
        slug=camp.slug,
        capa_arquivo=capa,
        capa_url=media_url(camp.slug, "covers", capa) if capa else None,
    )


@router.patch("/{slug}/genero", response_model=GeneroResponse)
def patch_genero(
    slug: str,
    body: GeneroRequest,
    _ctx: MembroContext = Depends(require_dono),
) -> GeneroResponse:
    try:
        camp = set_genero(slug, body.genero)
    except CampanhaAdminError as exc:
        raise_api_error(exc.codigo, status_code=_admin_error_status(exc.codigo))
    return GeneroResponse(slug=camp.slug, genero=camp.genero)


@router.post("/import", status_code=status.HTTP_201_CREATED)
async def import_campaign(
    file: UploadFile = File(...),
    slug: str | None = Form(default=None),
    usuario: Usuario = Depends(require_session_user),
) -> dict:
    data = await file.read()
    if not data:
        raise_api_error("PACOTE_INVALIDO", status_code=400)
    try:
        camp = import_campaign_from_bytes(
            data,
            owner_email=usuario.email,
            slug_override=slug,
        )
    except PackageError as exc:
        code = 409 if exc.codigo == SLUG_OCUPADO else 400
        raise_api_error(exc.codigo, status_code=code)
    return {
        "slug": camp.slug,
        "id": camp.id,
        "nome": camp.nome,
        "sistema": camp.sistema,
        "genero": camp.genero,
    }

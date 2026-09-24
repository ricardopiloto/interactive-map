from __future__ import annotations

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from app.deps.auth import MembroContext, require_dono
from app.services.campaign_export import export_campaign_to_bytes

router = APIRouter()


@router.get("/export")
def export_campaign(ctx: MembroContext = Depends(require_dono)) -> Response:
    data = export_campaign_to_bytes(ctx.campanha.slug)
    filename = f"{ctx.campanha.slug}-export.zip"
    return Response(
        content=data,
        media_type="application/zip",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

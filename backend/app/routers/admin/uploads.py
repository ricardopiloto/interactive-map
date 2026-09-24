from fastapi import APIRouter, File, Form, Path, Request, UploadFile

from app.services.rate_limit import limiter
from app.services.uploads import save_image

router = APIRouter()


@router.post("/uploads")
@limiter.limit("20/minute")
async def upload_image(
    request: Request,
    slug: str = Path(...),
    category: str = Form(..., description="map | portraits | locals"),
    file: UploadFile = File(...),
) -> dict:
    return await save_image(file, category, slug)

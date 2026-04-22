from fastapi import APIRouter, File, HTTPException, UploadFile, status

from ..schemas import ExtractResponse, StructureRequest, StructureResponse
from ..services.extraction_service import extract_from_upload
from ..services.structuring_service import structure_text

router = APIRouter(prefix="/ai", tags=["ai-import"])


# v1: keep the limit small but practical. Files are processed in-memory only.
_MAX_UPLOAD_BYTES = 20 * 1024 * 1024  # 20 MB


@router.post(
    "/extract",
    response_model=ExtractResponse,
    status_code=status.HTTP_200_OK,
)
async def ai_extract(file: UploadFile = File(...)) -> ExtractResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="file name is required")

    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="empty file")
    if len(content) > _MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail="file too large (max 20MB)")

    result = extract_from_upload(file_name=file.filename, content=content)
    return ExtractResponse(
        success=result.success,
        file_type=result.file_type,
        file_name=result.file_name,
        extracted_text=result.extracted_text,
        warnings=result.warnings,
    )


@router.post(
    "/structure",
    response_model=StructureResponse,
    status_code=status.HTTP_200_OK,
)
def ai_structure(payload: StructureRequest) -> StructureResponse:
    data, warnings = structure_text(
        screen_type=payload.screen_type,
        extracted_text=payload.extracted_text,
    )
    return StructureResponse(
        success=True,
        screen_type=payload.screen_type,
        structured_data=data,
        warnings=warnings,
    )

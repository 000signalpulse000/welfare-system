from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import SupportRecord
from ..schemas import SupportRecordCreate, SupportRecordRead

router = APIRouter(tags=["support-records"])


@router.post(
    "/records",
    response_model=SupportRecordRead,
    status_code=status.HTTP_201_CREATED,
)
def create_record(
    payload: SupportRecordCreate,
    db: Session = Depends(get_db),
) -> SupportRecord:
    record = SupportRecord(
        user_id=payload.user_id,
        record_date=payload.record_date,
        body=payload.body,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/users/{user_id}/records",
    response_model=list[SupportRecordRead],
)
def list_records(
    user_id: str,
    db: Session = Depends(get_db),
) -> list[SupportRecord]:
    stmt = (
        select(SupportRecord)
        .where(SupportRecord.user_id == user_id)
        .order_by(SupportRecord.created_at.desc(), SupportRecord.id.desc())
    )
    rows = db.execute(stmt).scalars().all()
    return list(rows)


@router.get(
    "/users/{user_id}/records/latest",
    response_model=SupportRecordRead | None,
)
def latest_record(
    user_id: str,
    db: Session = Depends(get_db),
) -> SupportRecord | None:
    stmt = (
        select(SupportRecord)
        .where(SupportRecord.user_id == user_id)
        .order_by(SupportRecord.created_at.desc(), SupportRecord.id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()


@router.delete(
    "/records/{record_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_record(
    record_id: int,
    db: Session = Depends(get_db),
) -> None:
    rec = db.get(SupportRecord, record_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="record not found")
    db.delete(rec)
    db.commit()
    return None

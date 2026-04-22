from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import IntakeRecord
from ..schemas import IntakeRecordCreate, IntakeRecordRead

router = APIRouter(tags=["intake-records"])


@router.post(
    "/intakes",
    response_model=IntakeRecordRead,
    status_code=status.HTTP_201_CREATED,
)
def create_intake(
    payload: IntakeRecordCreate,
    db: Session = Depends(get_db),
) -> IntakeRecord:
    record = IntakeRecord(
        name=payload.name,
        kana=payload.kana,
        birth_date=payload.birth_date,
        phone=payload.phone,
        address=payload.address,
        desired_service=payload.desired_service,
        consultation_route=payload.consultation_route,
        consultation_memo=payload.consultation_memo,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/intakes/latest",
    response_model=IntakeRecordRead | None,
)
def latest_intake(
    name: str = Query(min_length=1, max_length=128),
    db: Session = Depends(get_db),
) -> IntakeRecord | None:
    stmt = (
        select(IntakeRecord)
        .where(IntakeRecord.name == name)
        .order_by(IntakeRecord.created_at.desc(), IntakeRecord.id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()

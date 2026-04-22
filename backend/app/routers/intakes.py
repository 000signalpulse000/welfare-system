from fastapi import APIRouter, Depends, status
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

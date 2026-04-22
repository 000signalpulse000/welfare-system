from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Monitoring
from ..schemas import MonitoringCreate, MonitoringRead

router = APIRouter(tags=["monitorings"])


@router.post(
    "/monitorings",
    response_model=MonitoringRead,
    status_code=status.HTTP_201_CREATED,
)
def create_monitoring(
    payload: MonitoringCreate,
    db: Session = Depends(get_db),
) -> Monitoring:
    record = Monitoring(
        user_id=payload.user_id,
        service_type=payload.service_type,
        monitoring_date=payload.monitoring_date,
        staff_name=payload.staff_name,
        period_start=payload.period_start,
        period_end=payload.period_end,
        long_term_status=payload.long_term_status,
        short_term_status=payload.short_term_status,
        long_term_progress=payload.long_term_progress,
        short_term_progress=payload.short_term_progress,
        user_condition=payload.user_condition,
        issues=payload.issues,
        next_plan=payload.next_plan,
        note=payload.note,
        user_signature=payload.user_signature,
        seal_note=payload.seal_note,
        signed_date=payload.signed_date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/users/{user_id}/monitorings/latest",
    response_model=MonitoringRead | None,
)
def latest_monitoring(
    user_id: str,
    db: Session = Depends(get_db),
) -> Monitoring | None:
    stmt = (
        select(Monitoring)
        .where(Monitoring.user_id == user_id)
        .order_by(Monitoring.created_at.desc(), Monitoring.id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import SupportPlan
from ..schemas import SupportPlanCreate, SupportPlanRead

router = APIRouter(tags=["support-plans"])


@router.post(
    "/plans",
    response_model=SupportPlanRead,
    status_code=status.HTTP_201_CREATED,
)
def create_plan(
    payload: SupportPlanCreate,
    db: Session = Depends(get_db),
) -> SupportPlan:
    record = SupportPlan(
        user_id=payload.user_id,
        service_type=payload.service_type,
        plan_created_date=payload.plan_created_date,
        period_start=payload.period_start,
        period_end=payload.period_end,
        long_term_goal=payload.long_term_goal,
        short_term_goals=payload.short_term_goals,
        support_content=payload.support_content,
        user_intention=payload.user_intention,
        note=payload.note,
        user_signature=payload.user_signature,
        seal_note=payload.seal_note,
        signed_date=payload.signed_date,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

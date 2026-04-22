from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import ServiceMeeting
from ..schemas import ServiceMeetingCreate, ServiceMeetingRead

router = APIRouter(tags=["meetings"])


@router.post(
    "/meetings",
    response_model=ServiceMeetingRead,
    status_code=status.HTTP_201_CREATED,
)
def create_meeting(
    payload: ServiceMeetingCreate,
    db: Session = Depends(get_db),
) -> ServiceMeeting:
    record = ServiceMeeting(
        user_id=payload.user_id,
        service_type=payload.service_type,
        meeting_title=payload.meeting_title,
        meeting_date=payload.meeting_date,
        meeting_time=payload.meeting_time,
        meeting_place=payload.meeting_place,
        attendees=payload.attendees,
        user_attended=payload.user_attended,
        agenda=payload.agenda,
        status_check=payload.status_check,
        issues=payload.issues,
        discussion=payload.discussion,
        decision=payload.decision,
        next_policy=payload.next_policy,
        next_action=payload.next_action,
        next_scheduled_date=payload.next_scheduled_date,
        note=payload.note,
        user_signature=payload.user_signature,
        user_seal=payload.user_seal,
        staff_signature=payload.staff_signature,
        staff_seal=payload.staff_seal,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get(
    "/users/{user_id}/meetings",
    response_model=list[ServiceMeetingRead],
)
def list_meetings(
    user_id: str,
    db: Session = Depends(get_db),
) -> list[ServiceMeeting]:
    stmt = (
        select(ServiceMeeting)
        .where(ServiceMeeting.user_id == user_id)
        .order_by(
            ServiceMeeting.meeting_date.desc(),
            ServiceMeeting.id.desc(),
        )
    )
    return list(db.execute(stmt).scalars().all())


@router.get(
    "/users/{user_id}/meetings/latest",
    response_model=ServiceMeetingRead | None,
)
def latest_meeting(
    user_id: str,
    db: Session = Depends(get_db),
) -> ServiceMeeting | None:
    stmt = (
        select(ServiceMeeting)
        .where(ServiceMeeting.user_id == user_id)
        .order_by(ServiceMeeting.created_at.desc(), ServiceMeeting.id.desc())
        .limit(1)
    )
    return db.execute(stmt).scalars().first()


@router.get(
    "/meetings/{meeting_id}",
    response_model=ServiceMeetingRead,
)
def get_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
) -> ServiceMeeting:
    rec = db.get(ServiceMeeting, meeting_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="meeting not found")
    return rec

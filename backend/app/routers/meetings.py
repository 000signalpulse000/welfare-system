from fastapi import APIRouter, Depends, status
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
        meeting_date=payload.meeting_date,
        meeting_place=payload.meeting_place,
        attendees=payload.attendees,
        agenda=payload.agenda,
        discussion=payload.discussion,
        decision=payload.decision,
        next_action=payload.next_action,
        note=payload.note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

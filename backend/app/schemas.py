from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class SupportRecordCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    record_date: date
    body: str = Field(min_length=1)


class SupportRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    record_date: date
    body: str
    created_at: datetime
    updated_at: datetime


class IntakeRecordCreate(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    kana: str | None = Field(default=None, max_length=128)
    birth_date: date | None = None
    phone: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=255)
    desired_service: str = Field(min_length=1, max_length=64)
    consultation_route: str | None = Field(default=None, max_length=64)
    consultation_memo: str | None = None


class IntakeRecordRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    kana: str | None
    birth_date: date | None
    phone: str | None
    address: str | None
    desired_service: str
    consultation_route: str | None
    consultation_memo: str | None
    created_at: datetime
    updated_at: datetime


class SupportPlanCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    service_type: str = Field(min_length=1, max_length=64)
    plan_created_date: date
    period_start: date
    period_end: date
    long_term_goal: str | None = None
    short_term_goals: list[str] = Field(default_factory=list, max_length=6)
    support_content: str | None = None
    user_intention: str | None = None
    note: str | None = None
    user_signature: str = Field(min_length=1, max_length=128)
    seal_note: str | None = Field(default=None, max_length=255)
    signed_date: date


class SupportPlanRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    service_type: str
    plan_created_date: date
    period_start: date
    period_end: date
    long_term_goal: str | None
    short_term_goals: list[str]
    support_content: str | None
    user_intention: str | None
    note: str | None
    user_signature: str
    seal_note: str | None
    signed_date: date
    created_at: datetime
    updated_at: datetime


class ServiceMeetingCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    service_type: str = Field(min_length=1, max_length=64)
    meeting_title: str | None = Field(default=None, max_length=128)
    meeting_date: date
    meeting_time: str | None = Field(default=None, max_length=8)
    meeting_place: str = Field(min_length=1, max_length=255)
    attendees: str | None = None
    user_attended: bool | None = None
    agenda: str | None = None
    status_check: str | None = None
    issues: str | None = None
    discussion: str | None = None
    decision: str | None = None
    next_policy: str | None = None
    next_action: str | None = None
    next_scheduled_date: date | None = None
    note: str | None = None
    user_signature: str | None = Field(default=None, max_length=128)
    user_seal: str | None = Field(default=None, max_length=255)
    staff_signature: str | None = Field(default=None, max_length=128)
    staff_seal: str | None = Field(default=None, max_length=255)


class ServiceMeetingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    service_type: str
    meeting_title: str | None
    meeting_date: date
    meeting_time: str | None
    meeting_place: str
    attendees: str | None
    user_attended: bool | None
    agenda: str | None
    status_check: str | None
    issues: str | None
    discussion: str | None
    decision: str | None
    next_policy: str | None
    next_action: str | None
    next_scheduled_date: date | None
    note: str | None
    user_signature: str | None
    user_seal: str | None
    staff_signature: str | None
    staff_seal: str | None
    created_at: datetime
    updated_at: datetime


class MonitoringCreate(BaseModel):
    user_id: str = Field(min_length=1, max_length=32)
    service_type: str = Field(min_length=1, max_length=64)
    monitoring_date: date
    staff_name: str | None = Field(default=None, max_length=128)
    period_start: date
    period_end: date
    long_term_status: str | None = Field(default=None, max_length=32)
    short_term_status: str | None = Field(default=None, max_length=32)
    long_term_progress: str | None = None
    short_term_progress: str | None = None
    user_condition: str | None = None
    issues: str | None = None
    next_plan: str | None = None
    note: str | None = None
    user_signature: str = Field(min_length=1, max_length=128)
    seal_note: str | None = Field(default=None, max_length=255)
    signed_date: date


class MonitoringRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: str
    service_type: str
    monitoring_date: date
    staff_name: str | None
    period_start: date
    period_end: date
    long_term_status: str | None
    short_term_status: str | None
    long_term_progress: str | None
    short_term_progress: str | None
    user_condition: str | None
    issues: str | None
    next_plan: str | None
    note: str | None
    user_signature: str
    seal_note: str | None
    signed_date: date
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# AI import foundation (shared extract + structure)
# ---------------------------------------------------------------------------


class ExtractResponse(BaseModel):
    success: bool
    file_type: str
    file_name: str
    extracted_text: str
    warnings: list[str] = Field(default_factory=list)


ScreenType = Literal["monitoring", "support_plan", "service_meeting"]


class StructureRequest(BaseModel):
    screen_type: ScreenType
    extracted_text: str = ""


class StructureResponse(BaseModel):
    success: bool
    screen_type: ScreenType
    structured_data: dict[str, Any]
    warnings: list[str] = Field(default_factory=list)

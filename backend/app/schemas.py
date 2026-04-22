from datetime import date, datetime

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

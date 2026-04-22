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

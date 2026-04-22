from datetime import date, datetime

from sqlalchemy import Date, DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


class SupportRecord(Base):
    __tablename__ = "support_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    record_date: Mapped[date] = mapped_column(Date, nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class IntakeRecord(Base):
    __tablename__ = "intake_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    kana: Mapped[str | None] = mapped_column(String(128), nullable=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    address: Mapped[str | None] = mapped_column(String(255), nullable=True)
    desired_service: Mapped[str] = mapped_column(String(64), nullable=False)
    consultation_route: Mapped[str | None] = mapped_column(String(64), nullable=True)
    consultation_memo: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class SupportPlan(Base):
    __tablename__ = "support_plans"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    service_type: Mapped[str] = mapped_column(String(64), nullable=False)
    plan_created_date: Mapped[date] = mapped_column(Date, nullable=False)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    long_term_goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_term_goals: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
    )
    support_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_intention: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_signature: Mapped[str] = mapped_column(String(128), nullable=False)
    seal_note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    signed_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class ServiceMeeting(Base):
    __tablename__ = "service_meetings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    service_type: Mapped[str] = mapped_column(String(64), nullable=False)
    meeting_date: Mapped[date] = mapped_column(Date, nullable=False)
    meeting_place: Mapped[str] = mapped_column(String(255), nullable=False)
    attendees: Mapped[str | None] = mapped_column(Text, nullable=True)
    agenda: Mapped[str | None] = mapped_column(Text, nullable=True)
    discussion: Mapped[str | None] = mapped_column(Text, nullable=True)
    decision: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_action: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )


class Monitoring(Base):
    __tablename__ = "monitorings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    service_type: Mapped[str] = mapped_column(String(64), nullable=False)
    monitoring_date: Mapped[date] = mapped_column(Date, nullable=False)
    staff_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    period_start: Mapped[date] = mapped_column(Date, nullable=False)
    period_end: Mapped[date] = mapped_column(Date, nullable=False)
    long_term_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    short_term_status: Mapped[str | None] = mapped_column(String(32), nullable=True)
    long_term_progress: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_term_progress: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_condition: Mapped[str | None] = mapped_column(Text, nullable=True)
    issues: Mapped[str | None] = mapped_column(Text, nullable=True)
    next_plan: Mapped[str | None] = mapped_column(Text, nullable=True)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_signature: Mapped[str] = mapped_column(String(128), nullable=False)
    seal_note: Mapped[str | None] = mapped_column(String(255), nullable=True)
    signed_date: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

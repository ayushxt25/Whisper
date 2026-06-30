from sqlalchemy import select

from database import SessionLocal
from db_models import Meeting


def create_meeting(
    *,
    original_filename: str,
    content_type: str,
    file_size_bytes: int,
    transcript: str,
    summary: str,
    action_items: list[str],
    generated_audio_path: str | None,
) -> Meeting:
    meeting = Meeting(
        original_filename=original_filename,
        content_type=content_type,
        file_size_bytes=file_size_bytes,
        transcript=transcript,
        summary=summary,
        action_items=action_items,
        generated_audio_path=generated_audio_path,
    )
    with SessionLocal() as session:
        session.add(meeting)
        session.commit()
        session.refresh(meeting)
    return meeting


def list_meetings(*, limit: int, offset: int) -> list[Meeting]:
    statement = select(Meeting).order_by(Meeting.created_at.desc()).limit(limit).offset(offset)
    with SessionLocal() as session:
        return list(session.scalars(statement).all())


def get_meeting(meeting_id: str) -> Meeting | None:
    with SessionLocal() as session:
        return session.get(Meeting, meeting_id)

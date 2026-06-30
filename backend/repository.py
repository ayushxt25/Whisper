from sqlalchemy import Text, cast, or_, select

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
    owner_id: str | None = None,
) -> Meeting:
    meeting = Meeting(
        original_filename=original_filename,
        content_type=content_type,
        file_size_bytes=file_size_bytes,
        transcript=transcript,
        summary=summary,
        action_items=action_items,
        generated_audio_path=generated_audio_path,
        owner_id=owner_id,
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


def search_meetings(
    *,
    query: str,
    owner_id: str | None = None,
    limit: int = 50,
) -> list[Meeting]:
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = f"%{escaped}%"
    statement = (
        select(Meeting)
        .where(
            or_(
                Meeting.transcript.ilike(pattern, escape="\\"),
                Meeting.summary.ilike(pattern, escape="\\"),
                cast(Meeting.action_items, Text).ilike(pattern, escape="\\"),
                Meeting.original_filename.ilike(pattern, escape="\\"),
            )
        )
        .order_by(Meeting.created_at.desc())
        .limit(limit)
    )
    if owner_id is not None:
        statement = statement.where(Meeting.owner_id == owner_id)

    with SessionLocal() as session:
        return list(session.scalars(statement).all())

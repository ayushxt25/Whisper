from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel

class ActionItem(BaseModel):
    description: str

class ProcessedAudioResponse(BaseModel):
    meeting_id: Optional[str] = None
    transcript: str
    summary: str
    action_items: List[str]
    audio_summary_url: Optional[str] = None


class MeetingResponse(BaseModel):
    id: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    transcript: str
    summary: str
    action_items: List[str]
    audio_summary_url: Optional[str] = None
    created_at: datetime

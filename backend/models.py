from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

from job_status import JobStatus


class ActionItem(BaseModel):
    description: str


class ProcessedAudioResponse(BaseModel):
    job_id: Optional[str] = None
    meeting_id: Optional[str] = None
    transcript: str
    summary: str
    action_items: List[str]
    keywords: List[str] = Field(default_factory=list)
    decisions: List[str] = Field(default_factory=list)
    sentiment: Optional[str] = None
    audio_summary_url: Optional[str] = None


class MeetingResponse(BaseModel):
    id: str
    original_filename: str
    content_type: str
    file_size_bytes: int
    transcript: str
    summary: str
    action_items: List[str]
    keywords: List[str] = Field(default_factory=list)
    decisions: List[str] = Field(default_factory=list)
    sentiment: Optional[str] = None
    audio_summary_url: Optional[str] = None
    job_id: Optional[str] = None
    job_status: Optional[JobStatus] = None
    created_at: datetime


class ProcessingJobResponse(BaseModel):
    id: str
    status: JobStatus
    original_filename: str
    meeting_id: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime


class SearchResultResponse(BaseModel):
    meeting_id: str
    title: str
    snippet: str
    created_at: datetime

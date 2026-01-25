from pydantic import BaseModel
from typing import List, Optional

class ActionItem(BaseModel):
    description: str

class ProcessedAudioResponse(BaseModel):
    transcript: str
    summary: str
    action_items: List[str]
    audio_summary_url: Optional[str] = None

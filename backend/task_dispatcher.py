import logging
from dataclasses import dataclass
from typing import Protocol

from fastapi import UploadFile

from config import settings
from models import ProcessedAudioResponse
from processor import run_processing_job


logger = logging.getLogger("uvicorn.error")


@dataclass(frozen=True)
class AudioProcessingPayload:
    job_id: str
    file: UploadFile
    file_size_bytes: int


class ProcessingTaskDispatcher(Protocol):
    async def dispatch(self, payload: AudioProcessingPayload) -> ProcessedAudioResponse: ...


class SyncTaskDispatcher:
    async def dispatch(self, payload: AudioProcessingPayload) -> ProcessedAudioResponse:
        return await run_processing_job(
            job_id=payload.job_id,
            file=payload.file,
            file_size_bytes=payload.file_size_bytes,
        )


class WorkerTaskDispatcher:
    def __init__(self, redis_url: str, fallback: ProcessingTaskDispatcher) -> None:
        self.redis_url = redis_url
        self.fallback = fallback

    async def dispatch(self, payload: AudioProcessingPayload) -> ProcessedAudioResponse:
        logger.warning(
            "PROCESSING_MODE=worker requested; queue backend is not installed, using sync fallback"
        )
        return await self.fallback.dispatch(payload)


def build_task_dispatcher() -> ProcessingTaskDispatcher:
    sync_dispatcher = SyncTaskDispatcher()
    if settings.processing_mode == "worker":
        return WorkerTaskDispatcher(settings.redis_url, sync_dispatcher)
    return sync_dispatcher

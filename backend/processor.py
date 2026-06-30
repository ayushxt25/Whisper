import asyncio
import json
import logging
import os

from fastapi import UploadFile

from config import settings
from errors import APIError
from job_repository import mark_job_completed, mark_job_failed, mark_job_processing
from models import ProcessedAudioResponse
from repository import create_meeting
from services import (
    gemini_summarize_text,
    generate_mock_speech,
    mock_summarize_text,
    mock_transcribe_audio,
)


logger = logging.getLogger("uvicorn.error")


async def _record_failure(job_id: str, message: str) -> None:
    try:
        await asyncio.to_thread(mark_job_failed, job_id, message)
    except Exception:
        logger.exception("Unable to mark processing job %s as failed", job_id)


async def run_processing_job(
    *,
    job_id: str,
    file: UploadFile,
    file_size_bytes: int,
) -> ProcessedAudioResponse:
    mode = "MOCK" if settings.use_mock_ai else "GEMINI"
    logger.info("Processing job %s using %s mode", job_id, mode)

    try:
        await asyncio.to_thread(mark_job_processing, job_id)

        if not settings.use_mock_ai and not settings.gemini_api_key:
            raise APIError(503, "gemini_not_configured", "Gemini is not configured.")

        transcript = await mock_transcribe_audio(file)
        if settings.use_mock_ai:
            summary_json_str = await mock_summarize_text(transcript)
        else:
            summary_json_str = await gemini_summarize_text(transcript)

        summary_data = json.loads(summary_json_str)
        action_items = summary_data.get("action_items", [])
        if not isinstance(summary_data.get("summary"), str):
            raise ValueError("Summary response is missing a string summary")
        if not isinstance(action_items, list) or not all(isinstance(item, str) for item in action_items):
            raise ValueError("Summary response action_items must be a list of strings")

        audio_filename = f"summary_{os.urandom(4).hex()}.wav"
        audio_path = settings.generated_dir / audio_filename
        await generate_mock_speech(audio_path)

        audio_summary_url = f"/generated/{audio_filename}"
        meeting = await asyncio.to_thread(
            create_meeting,
            original_filename=file.filename or "audio",
            content_type=(file.content_type or "application/octet-stream").split(";", 1)[0],
            file_size_bytes=file_size_bytes,
            transcript=transcript,
            summary=summary_data["summary"],
            action_items=action_items,
            generated_audio_path=audio_summary_url,
        )
        response = ProcessedAudioResponse(
            job_id=job_id,
            meeting_id=meeting.id,
            transcript=transcript,
            summary=summary_data["summary"],
            action_items=action_items,
            audio_summary_url=audio_summary_url,
        )
        await asyncio.to_thread(mark_job_completed, job_id, meeting.id)
        return response
    except APIError as exc:
        await _record_failure(job_id, exc.message)
        raise
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        logger.exception("AI processing returned an invalid structured response")
        message = "The AI service returned an invalid response."
        await _record_failure(job_id, message)
        raise APIError(502, "invalid_ai_response", message) from None
    except Exception:
        logger.exception("Audio processing failed for job %s", job_id)
        message = "Audio processing failed. Please try again."
        await _record_failure(job_id, message)
        raise APIError(502, "audio_processing_failed", message) from None

import asyncio
import json
import logging
import os
from pathlib import Path

from fastapi import FastAPI, File, Request, UploadFile
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from database import init_db
from db_models import Meeting
from errors import APIError
from models import MeetingResponse, ProcessedAudioResponse
from repository import create_meeting, get_meeting, list_meetings
from services import (
    gemini_summarize_text,
    generate_mock_speech,
    mock_summarize_text,
    mock_transcribe_audio,
)


logger = logging.getLogger("uvicorn.error")
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.cors_origins),
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=list(settings.cors_allow_methods),
    allow_headers=list(settings.cors_allow_headers),
)

settings.generated_dir.mkdir(parents=True, exist_ok=True)
init_db()
app.mount("/generated", StaticFiles(directory=str(settings.generated_dir)), name="generated")


@app.exception_handler(APIError)
async def api_error_handler(_request: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content=exc.payload())


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "request_validation_failed",
                "message": "The request is invalid.",
                "details": jsonable_encoder(exc.errors()),
            }
        },
    )


@app.exception_handler(StarletteHTTPException)
async def http_error_handler(_request: Request, exc: StarletteHTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "http_error", "message": "The requested resource is unavailable."}},
    )


@app.exception_handler(Exception)
async def unexpected_error_handler(_request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled application error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={"error": {"code": "internal_error", "message": "An unexpected error occurred."}},
    )


async def validate_upload(file: UploadFile) -> int:
    if not file.filename:
        raise APIError(400, "missing_filename", "An audio filename is required.")

    extension = Path(file.filename).suffix.lower()
    if extension not in settings.allowed_audio_extensions:
        raise APIError(415, "unsupported_extension", "The audio file extension is not supported.")

    content_type = (file.content_type or "").split(";", 1)[0].strip().lower()
    if content_type not in settings.allowed_audio_mime_types:
        raise APIError(415, "unsupported_media_type", "The audio MIME type is not supported.")

    content = await file.read(settings.max_upload_size_bytes + 1)
    await file.seek(0)
    if not content:
        raise APIError(400, "empty_file", "The uploaded audio file is empty.")
    if len(content) > settings.max_upload_size_bytes:
        raise APIError(
            413,
            "file_too_large",
            f"The audio file exceeds the {settings.max_upload_size_mb} MB limit.",
        )
    return len(content)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": settings.app_name, "environment": settings.app_environment}


def meeting_response(meeting: Meeting) -> MeetingResponse:
    return MeetingResponse(
        id=meeting.id,
        original_filename=meeting.original_filename,
        content_type=meeting.content_type,
        file_size_bytes=meeting.file_size_bytes,
        transcript=meeting.transcript,
        summary=meeting.summary,
        action_items=meeting.action_items,
        audio_summary_url=meeting.generated_audio_path,
        created_at=meeting.created_at,
    )


@app.get("/api/meetings", response_model=list[MeetingResponse])
def meetings(limit: int = 50, offset: int = 0) -> list[MeetingResponse]:
    return [meeting_response(meeting) for meeting in list_meetings(limit=limit, offset=offset)]


@app.get("/api/meetings/{meeting_id}", response_model=MeetingResponse)
def meeting_detail(meeting_id: str) -> MeetingResponse:
    meeting = get_meeting(meeting_id)
    if meeting is None:
        raise APIError(404, "meeting_not_found", "The meeting was not found.")
    return meeting_response(meeting)


@app.post("/api/process-audio", response_model=ProcessedAudioResponse)
async def process_audio(file: UploadFile = File(...)) -> ProcessedAudioResponse:
    file_size_bytes = await validate_upload(file)
    mode = "MOCK" if settings.use_mock_ai else "GEMINI"
    logger.info("Processing %s using %s mode", file.filename, mode)

    if not settings.use_mock_ai and not settings.gemini_api_key:
        raise APIError(503, "gemini_not_configured", "Gemini is not configured.")

    try:
        transcript = await mock_transcribe_audio(file)
        if settings.use_mock_ai:
            summary_json_str = await mock_summarize_text(transcript)
        else:
            summary_json_str = await gemini_summarize_text(transcript)

        summary_data = json.loads(summary_json_str)
        if not isinstance(summary_data.get("summary"), str):
            raise ValueError("Summary response is missing a string summary")
        if not isinstance(summary_data.get("action_items", []), list):
            raise ValueError("Summary response action_items must be a list")

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
            action_items=summary_data.get("action_items", []),
            generated_audio_path=audio_summary_url,
        )

        return ProcessedAudioResponse(
            meeting_id=meeting.id,
            transcript=transcript,
            summary=summary_data["summary"],
            action_items=summary_data.get("action_items", []),
            audio_summary_url=audio_summary_url,
        )
    except (json.JSONDecodeError, KeyError, TypeError, ValueError):
        logger.exception("AI processing returned an invalid structured response")
        raise APIError(502, "invalid_ai_response", "The AI service returned an invalid response.") from None
    except Exception:
        logger.exception("Audio processing failed")
        raise APIError(502, "audio_processing_failed", "Audio processing failed. Please try again.") from None


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)

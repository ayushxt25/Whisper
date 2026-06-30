import asyncio
import os
import tempfile
from functools import lru_cache
from pathlib import Path

import openai
from fastapi import UploadFile

from config import settings


@lru_cache
def _client() -> openai.OpenAI:
    if not settings.openai_api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")
    return openai.OpenAI(api_key=settings.openai_api_key)


async def transcribe_audio(file: UploadFile) -> str:
    suffix = Path(file.filename or "audio").suffix.lower()
    content = await file.read()
    temp_path = ""

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(content)
            temp_path = temp_file.name

        def transcribe() -> str:
            with open(temp_path, "rb") as audio_file:
                transcript = _client().audio.transcriptions.create(
                    model=settings.transcription_model,
                    file=audio_file,
                )
            return transcript.text

        return await asyncio.to_thread(transcribe)
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)


async def summarize_text(text: str) -> str:
    def summarize() -> str:
        response = _client().chat.completions.create(
            model=settings.summary_model,
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Summarize the following text and extract actionable items. Return JSON with keys: 'summary' (string) and 'action_items' (list of strings).",
                },
                {"role": "user", "content": text},
            ],
            response_format={"type": "json_object"},
        )
        return response.choices[0].message.content or ""

    return await asyncio.to_thread(summarize)


async def generate_speech(text: str, output_file: str | Path) -> Path:
    output_path = Path(output_file)

    def synthesize() -> None:
        response = _client().audio.speech.create(
            model=settings.tts_model,
            voice=settings.tts_voice,
            input=text,
        )
        response.stream_to_file(output_path)

    await asyncio.to_thread(synthesize)
    return output_path

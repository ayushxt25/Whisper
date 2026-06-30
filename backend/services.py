import asyncio
import json
import math
import struct
import wave
from functools import lru_cache
from pathlib import Path

from fastapi import UploadFile
from google import genai
from pydantic import BaseModel, Field

from config import settings


MOCK_TRANSCRIPT = """The product team reviewed the upcoming customer onboarding release. Maya confirmed that the guided setup flow is ready for final QA, while Daniel noted that two analytics events still need validation before launch. The team agreed to run a focused regression test on Wednesday and release the update on Friday if no blocking issues are found.

Maya will publish the final onboarding checklist by Tuesday afternoon. Daniel will verify the remaining analytics events and share the results in the launch channel. The support team will also receive an updated troubleshooting guide before the release."""

MOCK_SUMMARY = {
    "summary": "The team reviewed the customer onboarding release and confirmed it is nearly ready. Final QA, analytics validation, and support documentation remain before the planned Friday launch.",
    "action_items": [
        "Publish the final onboarding checklist by Tuesday afternoon",
        "Validate the two remaining analytics events",
        "Run onboarding regression testing on Wednesday",
        "Share the updated troubleshooting guide with support before launch",
    ],
}


class GeminiSummary(BaseModel):
    summary: str = Field(description="A concise summary of the meeting transcript")
    action_items: list[str] = Field(description="Concrete follow-up actions from the meeting")


@lru_cache
def _gemini_client() -> genai.Client:
    if not settings.gemini_api_key:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    return genai.Client(api_key=settings.gemini_api_key)


async def mock_transcribe_audio(_file: UploadFile) -> str:
    return MOCK_TRANSCRIPT


async def mock_summarize_text(_text: str) -> str:
    return json.dumps(MOCK_SUMMARY)


async def gemini_summarize_text(text: str) -> str:
    prompt = (
        "Summarize this meeting transcript and extract concrete action items. "
        "Do not invent facts or tasks not supported by the transcript.\n\n"
        f"Transcript:\n{text}"
    )

    def summarize() -> str:
        interaction = _gemini_client().interactions.create(
            model=settings.gemini_model,
            input=prompt,
            response_format={
                "type": "text",
                "mime_type": "application/json",
                "schema": GeminiSummary.model_json_schema(),
            },
        )
        return interaction.output_text

    return await asyncio.to_thread(summarize)


async def generate_mock_speech(output_file: str | Path) -> Path:
    output_path = Path(output_file)

    def synthesize_placeholder() -> None:
        sample_rate = 16_000
        frames = bytearray()
        for index in range(sample_rate):
            sample = int(4_000 * math.sin(2 * math.pi * 440 * index / sample_rate))
            frames.extend(struct.pack("<h", sample))

        with wave.open(str(output_path), "wb") as audio_file:
            audio_file.setnchannels(1)
            audio_file.setsampwidth(2)
            audio_file.setframerate(sample_rate)
            audio_file.writeframes(frames)

    await asyncio.to_thread(synthesize_placeholder)
    return output_path

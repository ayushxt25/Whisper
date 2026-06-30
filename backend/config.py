import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _csv(name: str, default: str) -> tuple[str, ...]:
    return tuple(value.strip() for value in os.getenv(name, default).split(",") if value.strip())


def _bool(name: str, default: bool = False) -> bool:
    return os.getenv(name, str(default)).strip().lower() in {"1", "true", "yes", "on"}


def _extensions() -> tuple[str, ...]:
    values = _csv("ALLOWED_AUDIO_EXTENSIONS", ".mp3,.wav,.webm,.m4a,.mp4,.ogg")
    return tuple(value.lower() if value.startswith(".") else f".{value.lower()}" for value in values)


def _path(name: str, default: str) -> Path:
    value = Path(os.getenv(name, default))
    return value if value.is_absolute() else BASE_DIR / value


@dataclass(frozen=True)
class Settings:
    app_name: str
    app_environment: str
    openai_api_key: str
    transcription_model: str
    summary_model: str
    tts_model: str
    tts_voice: str
    generated_dir: Path
    max_upload_size_mb: int
    allowed_audio_extensions: tuple[str, ...]
    allowed_audio_mime_types: tuple[str, ...]
    cors_origins: tuple[str, ...]
    cors_allow_credentials: bool
    cors_allow_methods: tuple[str, ...]
    cors_allow_headers: tuple[str, ...]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


settings = Settings(
    app_name=os.getenv("APP_NAME", "AI Voice Summarizer"),
    app_environment=os.getenv("APP_ENVIRONMENT", "development"),
    openai_api_key=os.getenv("OPENAI_API_KEY", ""),
    transcription_model=os.getenv("OPENAI_TRANSCRIPTION_MODEL", "whisper-1"),
    summary_model=os.getenv("OPENAI_SUMMARY_MODEL", "gpt-4o-mini"),
    tts_model=os.getenv("OPENAI_TTS_MODEL", "tts-1"),
    tts_voice=os.getenv("OPENAI_TTS_VOICE", "alloy"),
    generated_dir=_path("GENERATED_DIR", "generated"),
    max_upload_size_mb=int(os.getenv("MAX_UPLOAD_SIZE_MB", "25")),
    allowed_audio_extensions=_extensions(),
    allowed_audio_mime_types=tuple(
        value.lower()
        for value in _csv(
            "ALLOWED_AUDIO_MIME_TYPES",
            "audio/mpeg,audio/mp3,audio/wav,audio/x-wav,audio/webm,audio/mp4,audio/x-m4a,audio/m4a,audio/ogg",
        )
    ),
    cors_origins=_csv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"),
    cors_allow_credentials=_bool("CORS_ALLOW_CREDENTIALS"),
    cors_allow_methods=_csv("CORS_ALLOW_METHODS", "GET,POST,OPTIONS"),
    cors_allow_headers=_csv("CORS_ALLOW_HEADERS", "Content-Type,Authorization"),
)

if "*" in settings.cors_origins and settings.cors_allow_credentials:
    raise RuntimeError("CORS_ALLOW_CREDENTIALS cannot be true when CORS_ORIGINS contains '*'")

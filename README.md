# Whisper

Whisper is a full-stack audio intelligence platform for uploading or recording meeting audio, generating structured meeting insights, and retaining searchable meeting history.

The project currently uses mocked transcription and a placeholder WAV audio summary. Gemini can enrich the mock transcript with summaries, action items, keywords, decisions, and sentiment. Real audio transcription and production text-to-speech are not implemented yet.

Repository: [ayushxt25/Whisper](https://github.com/ayushxt25/Whisper)

## Features

- Browser audio recording and file upload
- Development mock mode with no provider key required
- Gemini-powered meeting enrichment
- SQLite meeting persistence through SQLAlchemy
- Processing jobs with queued, processing, completed, and failed states
- Meeting history and detail retrieval
- Search across filenames, transcripts, summaries, action items, keywords, and decisions
- Extracted action items, keywords/topics, decisions, and sentiment
- Structured API errors and upload validation
- Configurable CORS, upload limits, provider mode, and processing mode
- Worker-ready task dispatcher with synchronous fallback

## Current Processing Modes

### Mock Mode

Set `USE_MOCK_AI=true` to run without an API key. The backend uses a realistic mock transcript, mock meeting intelligence, and a generated placeholder WAV file. Meetings and processing jobs are still persisted normally.

### Gemini Mode

Set `USE_MOCK_AI=false` and provide `GEMINI_API_KEY`. The current hybrid pipeline uses:

- Mock transcription
- Gemini summary and intelligence extraction
- Mock WAV audio summary

Users must provide their own Gemini API key for real provider mode. Never commit `.env` or expose API keys in frontend code.

## Architecture

```mermaid
flowchart LR
    UI["React + Vite frontend"] -->|"multipart audio upload"| API["FastAPI API"]
    API --> JOB["Processing job"]
    JOB --> DISPATCH["Task dispatcher"]
    DISPATCH -->|"PROCESSING_MODE=sync"| PROCESSOR["Audio processor"]
    DISPATCH -.->|"future worker mode"| REDIS["Redis / worker"]
    PROCESSOR --> TRANSCRIPT["Mock transcription"]
    TRANSCRIPT --> MODE{"USE_MOCK_AI"}
    MODE -->|"true"| MOCK["Mock intelligence"]
    MODE -->|"false"| GEMINI["Gemini enrichment"]
    MOCK --> AUDIO["Placeholder WAV"]
    GEMINI --> AUDIO
    AUDIO --> ORM["SQLAlchemy"]
    ORM --> DB["SQLite"]
    API --> ORM
```

## Job Flow

The API currently waits for processing to finish, preserving the original synchronous response. The job boundary is ready for a future external queue.

```mermaid
sequenceDiagram
    participant Client
    participant API as FastAPI
    participant Jobs as Job Store
    participant Task as Task Dispatcher
    participant AI as Mock/Gemini Pipeline
    participant DB as Meeting Store

    Client->>API: POST /api/process-audio
    API->>API: Validate file
    API->>Jobs: Create job (queued)
    API->>Task: Dispatch job
    Task->>Jobs: Set processing
    Task->>AI: Build transcript and intelligence
    AI-->>Task: Summary, actions, topics, decisions, sentiment
    Task->>DB: Persist meeting
    Task->>Jobs: Link meeting and set completed
    Task-->>API: Compatible processing response
    API-->>Client: Transcript, intelligence, audio URL, IDs
    alt Processing failure
        Task->>Jobs: Set failed
        API-->>Client: Structured error response
    end
```

## Technology

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, Tailwind CSS, Framer Motion |
| Backend | FastAPI, Python 3.11+, Uvicorn |
| Persistence | SQLAlchemy, SQLite |
| Intelligence | Google Gemini or local mock data |
| Processing | Synchronous task dispatcher; Redis configuration reserved for worker mode |

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health and environment |
| `POST` | `/api/process-audio` | Validate and process an uploaded audio file |
| `GET` | `/api/jobs/{job_id}` | Retrieve processing job state |
| `GET` | `/api/meetings` | List persisted meetings |
| `GET` | `/api/meetings/{meeting_id}` | Retrieve one meeting and its intelligence |
| `GET` | `/api/search?q={query}` | Search meeting content and metadata |
| `GET` | `/generated/{filename}` | Serve generated placeholder audio summaries |

Interactive API documentation is available at `http://127.0.0.1:8000/docs` while the backend is running.

## Local Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm
- A Gemini API key only when using Gemini mode

Clone the repository:

```powershell
git clone https://github.com/ayushxt25/Whisper.git
cd Whisper
```

### Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Copy-Item .env.example .env
python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### Frontend

Open another terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend runs at `http://localhost:5173` and the backend at `http://127.0.0.1:8000`.

## Environment

Backend configuration lives in `backend/.env`. Start from `backend/.env.example`.

| Variable | Default | Purpose |
| --- | --- | --- |
| `APP_NAME` | `AI Voice Summarizer` | API service name |
| `APP_ENVIRONMENT` | `development` | Runtime environment label |
| `USE_MOCK_AI` | `true` | Select full mock mode |
| `GEMINI_API_KEY` | none | User-provided Gemini key |
| `GEMINI_MODEL` | `gemini-3.5-flash` | Gemini model identifier |
| `DATABASE_URL` | `sqlite:///./whisper.db` | SQLAlchemy database URL |
| `PROCESSING_MODE` | `sync` | Task execution mode (`sync` or worker-ready fallback) |
| `REDIS_URL` | `redis://localhost:6379/0` | Reserved worker queue connection |
| `GENERATED_DIR` | `generated` | Generated audio directory |
| `MAX_UPLOAD_SIZE_MB` | `25` | Maximum upload size |
| `ALLOWED_AUDIO_EXTENSIONS` | configured list | Accepted filename extensions |
| `ALLOWED_AUDIO_MIME_TYPES` | configured list | Accepted MIME types |
| `CORS_ORIGINS` | local frontend origins | Allowed browser origins |
| `CORS_ALLOW_CREDENTIALS` | `false` | CORS credentials setting |
| `CORS_ALLOW_METHODS` | `GET,POST,OPTIONS` | Allowed CORS methods |
| `CORS_ALLOW_HEADERS` | `Content-Type,Authorization` | Allowed CORS headers |

Frontend configuration lives in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Deployment Placeholders

### Frontend

- Build with `npm run build`.
- Deploy `frontend/dist` to a static hosting provider.
- Set `VITE_API_BASE_URL` to the deployed backend URL before building.

### Backend

- Deploy the `backend` directory to a Python ASGI hosting provider.
- Install `backend/requirements.txt` and run Uvicorn against `main:app`.
- Configure environment variables and persistent storage for generated files.
- Replace the synchronous worker fallback when a queue worker is introduced.

### Database

- SQLite is suitable for local development and single-instance demos.
- Use a persistent volume when deploying SQLite.
- Replace `DATABASE_URL` with a managed relational database URL for multi-instance deployment, with a formal migration tool added before production use.

## Screenshots

> Placeholder: Dashboard with audio recording and upload controls.

> Placeholder: Processed meeting summary, actions, keywords, decisions, and sentiment.

> Placeholder: Meeting history and search results.

## License

Add the project license file and terms here.

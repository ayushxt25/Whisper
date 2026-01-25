# 🎤 AI Voice Summarizer

> **Professional AI-powered voice note summarizer** that transcribes audio, extracts actionable insights, and generates audio summaries using state-of-the-art OpenAI models.

![Demo](https://img.shields.io/badge/Status-Production_Ready-success)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features

- 🎙️ **Real-time Voice Recording** with visual feedback
- 📝 **AI Transcription** using OpenAI Whisper
- 🧠 **Smart Summarization** with GPT-4o-mini
- ✅ **Action Item Extraction** from conversations
- 🔊 **Audio Summary Playback** via text-to-speech
- 💅 **Modern UI** with Tailwind CSS

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI (Python 3.8+) |
| **Frontend** | React 19 + Vite + TailwindCSS v4 |
| **AI/ML** | OpenAI Whisper, GPT-4o-mini, TTS-1 |

## 📋 Prerequisites

- **Node.js** (v18+) and npm
- **Python** (3.8+)
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

> **💰 Cost Note for Recruiters/Testers:**  
> This app requires an OpenAI API key with credits (~$5 minimum). Each test run costs approximately **$0.02-0.05** depending on audio length.  
> **Alternative**: Contact me for a live demo or watch the [demo video](#) if you prefer not to set up API credits.

## 🚀 Quick Start

### 1️⃣ Clone the Repository
```bash
git clone <your-repo-url>
cd ai-voice-summarizer
```

### 2️⃣ Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file from template
copy .env.example .env
# Now edit .env and add your OpenAI API key

# Start the server
uvicorn main:app --reload
```

**Backend will run on:** `http://localhost:8000`

### 3️⃣ Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

**Frontend will open at:** `http://localhost:5173`

## 📖 Usage Guide

1. **Click the microphone button** to start recording
2. **Speak clearly** (e.g., "Schedule a team meeting for Monday at 10 AM to discuss Q1 goals")
3. **Click again to stop** recording
4. **Wait ~5-10 seconds** for AI processing
5. **Review results:**
   - Full transcript
   - Concise summary
   - Extracted action items
   - AI-generated audio summary

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory:

```env
OPENAI_API_KEY=sk-proj-...your-key-here...
```

> ⚠️ **Security:** Never commit your `.env` file to Git. It's already in `.gitignore`.

## 📁 Project Structure

```
ai-voice-summarizer/
├── backend/
│   ├── main.py           # FastAPI app & endpoints
│   ├── services.py       # OpenAI integration logic
│   ├── models.py         # Pydantic data models
│   ├── requirements.txt  # Python dependencies
│   └── .env.example      # Template for API keys
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx  # Recording UI
│   │   │   └── SummaryView.jsx    # Results display
│   │   └── index.css            # Tailwind styles
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🎯 For Recruiters

**Why this project demonstrates my skills:**

1. ✅ **Full-stack development** (React + FastAPI)
2. ✅ **AI/ML integration** (OpenAI API, prompt engineering)
3. ✅ **Modern tooling** (Vite, Tailwind v4, async Python)
4. ✅ **API design** (RESTful endpoints, proper error handling)
5. ✅ **UX focus** (responsive design, loading states, visual feedback)

**Want to test it without setup?**  
- 📧 Email me for a live demo session
- 🎥 Watch the demo video: [Link to demo]
- 📸 See screenshots in `/docs/screenshots/`

## 🤝 Contributing

This is a portfolio project, but suggestions are welcome! Open an issue or PR.

## 📄 License

MIT License - feel free to use this for learning or your own projects.

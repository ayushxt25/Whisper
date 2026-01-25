from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import shutil
import os
import json
from services import transcribe_audio, summarize_text, generate_speech
from models import ProcessedAudioResponse

app = FastAPI(title="AI Voice Summarizer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for audio playback if needed, or just return direct file response
# For simplicity, we can serve the 'generated' folder
os.makedirs("generated", exist_ok=True)
app.mount("/generated", StaticFiles(directory="generated"), name="generated")

@app.post("/api/process-audio", response_model=ProcessedAudioResponse)
async def process_audio(file: UploadFile = File(...)):
    try:
        # 1. Transcribe
        transcript = await transcribe_audio(file)
        
        # 2. Summarize
        summary_json_str = await summarize_text(transcript)
        summary_data = json.loads(summary_json_str) 
        
        # 3. Generate Audio
        audio_filename = f"generated/summary_{os.urandom(4).hex()}.mp3"
        await generate_speech(summary_data["summary"], audio_filename)
        
        return ProcessedAudioResponse(
            transcript=transcript,
            summary=summary_data["summary"],
            action_items=summary_data.get("action_items", []),
            audio_summary_url=f"/{audio_filename}"
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))


import os
import openai
from dotenv import load_dotenv
from fastapi import UploadFile

load_dotenv()

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def transcribe_audio(file: UploadFile) -> str:
    # Save temp file
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        buffer.write(await file.read())
    
    try:
        with open(temp_filename, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file
            )
        return transcript.text
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

async def summarize_text(text: str):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant. Summarize the following text and extract actionable items. Return JSON with keys: 'summary' (string) and 'action_items' (list of strings)."},
            {"role": "user", "content": text}
        ],
        response_format={ "type": "json_object" }
    )
    return response.choices[0].message.content

async def generate_speech(text: str, output_file: str):
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text
    )
    response.stream_to_file(output_file)
    return output_file

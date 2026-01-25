import React, { useState, useRef } from 'react';

const AudioRecorder = ({ onUploadSuccess, isLoading }) => {
    const [recording, setRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = uploadAudio;
            mediaRecorderRef.current.start();
            setRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
            // Stop all tracks to release mic
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const uploadAudio = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', blob, 'recording.webm');
        onUploadSuccess(formData);
    };

    return (
        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Record Voice Note</h2>

            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${recording ? 'bg-red-50 animate-pulse' : 'bg-blue-50'}`}>
                <button
                    onClick={recording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 focus:outline-none shadow-md ${recording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {recording ? (
                        <div className="w-6 h-6 bg-white rounded-sm" />
                    ) : (
                        <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-white border-b-8 border-b-transparent ml-1" /> // Play iconish triangle or mic icon
                    )}
                </button>
            </div>

            <p className="text-gray-500 font-medium">
                {recording ? "Recording... Tap to stop" : "Tap to start recording"}
            </p>
        </div>
    );
};

export default AudioRecorder;

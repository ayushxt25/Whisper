import React, { useState } from 'react';
import AudioRecorder from './components/AudioRecorder';
import SummaryView from './components/SummaryView';

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async (formData) => {
    setIsLoading(true);
    setData(null);
    try {
      const response = await fetch('http://localhost:8000/api/process-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error(error);
      alert("Error processing audio. Ensure backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center py-10 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
          AI Voice Summarizer
        </h1>
        <p className="text-gray-500">Record a voice note and let AI organize your thoughts.</p>
      </header>

      <main className="w-full max-w-4xl flex flex-col items-center">
        <AudioRecorder onUploadSuccess={handleUpload} isLoading={isLoading} />

        {isLoading && (
          <div className="mt-12 flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 font-medium">Transcribing & Summarizing...</p>
          </div>
        )}

        <SummaryView data={data} />
      </main>
    </div>
  );
}

export default App;

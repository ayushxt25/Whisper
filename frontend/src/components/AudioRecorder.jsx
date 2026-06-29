import React, { useState, useRef } from 'react';

const SoundWave = ({ active }) => (
  <div className={`soundwave ${active ? 'active' : ''}`}>
    {Array.from({ length: 12 }).map((_, i) => (
      <span key={i} />
    ))}
  </div>
);

const MicIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const StopIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
);

const AudioRecorder = ({ onUploadSuccess, isLoading }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const formatTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

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
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone error:", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      clearInterval(timerRef.current);
      setRecording(false);
    }
  };

  const uploadAudio = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    onUploadSuccess(formData);
  };

  return (
    <div
      className="glass animate-slide-up w-full rounded-2xl p-8 flex flex-col items-center gap-6"
      style={{
        animationDelay: '0.15s',
        boxShadow: recording
          ? '0 0 0 1px rgba(108,99,255,0.3), 0 24px 48px rgba(0,0,0,0.4)'
          : '0 24px 48px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <p
          className="font-display text-sm font-600 tracking-widest uppercase"
          style={{ color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif' }}
        >
          {recording ? 'Recording' : isLoading ? 'Processing' : 'Voice Note'}
        </p>
      </div>

      {/* Soundwave */}
      <SoundWave active={recording} />

      {/* Main button */}
      <div style={{ position: 'relative' }}>
        {/* Outer glow ring — only while recording */}
        {recording && (
          <span
            className="glow-ring"
            style={{
              position: 'absolute',
              inset: '-10px',
              borderRadius: '50%',
              border: '1.5px solid rgba(108,99,255,0.35)',
              pointerEvents: 'none',
            }}
          />
        )}

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={isLoading}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            transition: 'transform 0.2s ease, background 0.3s ease, box-shadow 0.3s ease',
            background: recording
              ? 'var(--danger)'
              : isLoading
              ? 'var(--elevated)'
              : 'var(--violet)',
            boxShadow: recording
              ? '0 0 32px rgba(255,77,109,0.4)'
              : isLoading
              ? 'none'
              : '0 0 32px rgba(108,99,255,0.35)',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.transform = 'scale(1.07)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {recording ? <StopIcon /> : <MicIcon />}
        </button>
      </div>

      {/* Timer / status */}
      <p
        style={{
          fontFamily: 'Syne, sans-serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: recording ? 'var(--text-primary)' : 'var(--text-muted)',
          transition: 'color 0.3s ease',
          minWidth: '4rem',
          textAlign: 'center',
        }}
      >
        {recording ? formatTime(seconds) : isLoading ? '···' : '00:00'}
      </p>

      {/* Hint */}
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
        {recording
          ? 'Tap stop when you're done'
          : isLoading
          ? 'Analyzing your note…'
          : 'Tap the mic to begin'}
      </p>
    </div>
  );
};

export default AudioRecorder;
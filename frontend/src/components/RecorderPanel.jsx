import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SoundWave = ({ active }) => (
  <div className={`soundwave ${active ? 'active' : ''}`}>
    {Array.from({ length: 14 }).map((_, i) => (
      <span key={i} />
    ))}
  </div>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const StopIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="3.5" />
  </svg>
);

const UploadIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16,16 12,12 8,16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.47L19 10l-5.12 3.53L15.76 19 12 15.9 8.24 19l1.88-5.47L5 10l5.12-1.53z" />
  </svg>
);

const RecorderPanel = ({ onUploadSuccess, isLoading }) => {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);

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
      mediaRecorderRef.current.onstop = submitAudio;
      mediaRecorderRef.current.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      console.error(err);
      alert('Could not access microphone.');
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

  const submitAudio = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'recording.webm');
    onUploadSuccess(formData);
  };

  const handleFileUpload = (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file, file.name);
    onUploadSuccess(formData);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  return (
    <motion.div
      className="panel panel-accent"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      style={{
        boxShadow: recording
          ? '0 0 0 1px rgba(244,63,94,0.25), 0 24px 64px rgba(0,0,0,0.5)'
          : '0 0 0 1px rgba(124,58,237,0.12), 0 24px 64px rgba(0,0,0,0.4)',
        transition: 'box-shadow 0.4s ease',
      }}
    >
      {/* Panel header */}
      <div className="panel-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span className="panel-label">
            <SparkleIcon />
            Voice Studio
          </span>
          <span className="panel-title">Record or Upload</span>
        </div>
        <AnimatePresence mode="wait">
          {recording ? (
            <motion.div
              key="rec"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge badge-danger"
            >
              <span className="badge-dot" />
              Live
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="proc"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge badge-violet"
            >
              <span className="badge-dot" />
              Processing
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="badge badge-violet"
            >
              <span className="badge-dot" />
              Ready
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Waveform + Timer */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '1.5rem 0',
      }}>
        <SoundWave active={recording} />

        {/* Timer */}
        <motion.div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '3rem',
            fontWeight: 800,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: recording ? 'var(--danger)' : isLoading ? 'var(--violet-soft)' : 'var(--text-3)',
            transition: 'color 0.3s ease',
            minWidth: '6rem',
            textAlign: 'center',
          }}
        >
          {recording ? formatTime(seconds) : isLoading ? '···' : '00:00'}
        </motion.div>

        {/* Main mic button */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {recording && (
            <span
              className="glow-pulse"
              style={{
                position: 'absolute',
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                border: '1.5px solid rgba(244,63,94,0.3)',
                pointerEvents: 'none',
              }}
            />
          )}
          <motion.button
            onClick={recording ? stopRecording : startRecording}
            disabled={isLoading}
            whileHover={!isLoading ? { scale: 1.06 } : {}}
            whileTap={!isLoading ? { scale: 0.96 } : {}}
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1rem',
              background: recording
                ? 'linear-gradient(135deg, #F43F5E, #E11D48)'
                : isLoading
                ? 'var(--elevated)'
                : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              boxShadow: recording
                ? '0 0 40px rgba(244,63,94,0.45), 0 8px 24px rgba(0,0,0,0.4)'
                : isLoading
                ? 'none'
                : '0 0 40px rgba(124,58,237,0.4), 0 8px 24px rgba(0,0,0,0.4)',
              opacity: isLoading ? 0.45 : 1,
              transition: 'background 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease',
            }}
          >
            {recording ? <StopIcon /> : <MicIcon />}
          </motion.button>
        </div>

        {/* Hint text */}
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-3)',
          letterSpacing: '0.04em',
          textAlign: 'center',
        }}>
          {recording
            ? 'Recording in progress — tap stop when done'
            : isLoading
            ? 'Analyzing your voice note…'
            : 'Tap the mic to start recording'}
        </p>
      </div>

      {/* Divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span style={{ fontSize: '0.65rem', color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>or upload</span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        animate={{
          borderColor: dragOver ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.06)',
          background: dragOver ? 'rgba(124,58,237,0.08)' : 'rgba(255,255,255,0.02)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          border: '1.5px dashed rgba(255,255,255,0.06)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          cursor: 'pointer',
        }}
      >
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'var(--violet-subtle)',
          border: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--violet-soft)',
        }}>
          <UploadIcon />
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-2)', fontWeight: 500 }}>
          Drop audio file here
        </p>
        <p style={{ fontSize: '0.68rem', color: 'var(--text-3)' }}>
          MP3, WAV, WEBM, M4A supported
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          style={{ display: 'none' }}
          onChange={(e) => handleFileUpload(e.target.files[0])}
        />
      </motion.div>

      {/* Processing bar */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div style={{
              width: '100%', height: '2px',
              background: 'var(--elevated)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}>
              <div
                className="sweep"
                style={{
                  height: '100%', width: '40%',
                  background: 'linear-gradient(90deg, transparent, var(--violet-mid), var(--violet-soft), transparent)',
                }}
              />
            </div>
            <p style={{
              fontSize: '0.68rem',
              color: 'var(--text-3)',
              textAlign: 'center',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Transcribing &amp; summarizing
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecorderPanel;
import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HistoryPanel from './components/HistoryPanel';
import RecorderPanel from './components/RecorderPanel';
import SummaryPanel from './components/SummaryPanel';
import TranscriptPanel from './components/TranscriptPanel';
import { apiUrl } from './config';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_RESULT = {
  summary:
    'Discussed Q3 product roadmap with the team. Key focus areas include improving onboarding flow, reducing churn with better in-app nudges, and shipping the mobile redesign by end of October. A/B test results expected next Thursday will inform the final approach.',
  action_items: [
    'Finalize mobile redesign mockups by Friday',
    'Schedule follow-up with growth team on churn metrics',
    'Draft onboarding flow v2 spec document',
    'Review A/B test results from last sprint',
    'Share Notion doc access with all stakeholders',
  ],
  keywords: ['onboarding', 'churn', 'mobile', 'A/B test', 'roadmap'],
  transcript: `So today we went over the Q3 roadmap and there were a few things that came up. First, the onboarding flow needs work — users are dropping off after step two. We think better tooltips and a progress indicator would help significantly.

Second, churn is up slightly and the growth team wants to try in-app nudges before the user hits the cancel screen. We've seen this work well at other companies and it's worth a shot before we invest in a bigger retention push.

Third, the mobile redesign is on track but we need the mockups finalized before the engineers can start. I'll put together the spec doc for onboarding v2 over the weekend.

Let's sync again after the A/B test results come in next Thursday. Make sure everyone has access to the shared Notion doc before then.`,
  sentiment: 'Productive',
  confidence: 94,
  audio_summary_url: null,
};

const StatsBar = ({ data }) => {
  if (!data) return null;
  const wordCount = data.transcript?.trim().split(/\s+/).length || 0;
  const stats = [
    { label: 'Words', value: wordCount },
    { label: 'Action Items', value: data.action_items?.length || 0 },
    { label: 'Topics', value: data.keywords?.length || 0 },
    { label: 'Confidence', value: `${data.confidence || 0}%` },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '0.75rem',
      }}
    >
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.35 }}
          className="panel"
          style={{ padding: '1rem 1.25rem', gap: '0.2rem' }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #F1F5F9, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            {s.value}
          </span>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--text-3)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {s.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

function App() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (formData) => {
    setIsLoading(true);
    setData(null);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/process-audio'), {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error?.message || 'Audio processing failed.');
      }
      setData(result);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Audio processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell">
      {/* Ambient background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Fixed navbar */}
      <Navbar />

      {/* Dashboard body */}
      <div className="dashboard">

        {/* Sidebar — history */}
        <HistoryPanel />

        {/* Main content */}
        <main className="main-content">

          {/* Hero strip */}
          <motion.div
            className="hero-strip"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              AI Voice Intelligence
            </p>
            <h1 className="hero-title grad-text">
              Turn speech into<br />structured insight.
            </h1>
            <p className="hero-sub">
              Record a voice note or upload an audio file. Whisper transcribes,
              summarizes, and extracts action items in seconds.
            </p>
          </motion.div>

          {/* Stats bar — only when results exist */}
          <AnimatePresence>
            {data && <StatsBar data={data} />}
          </AnimatePresence>

          {/* Panel grid */}
          <div className="panel-grid">

            {/* Recorder — left column */}
            <RecorderPanel
              onUploadSuccess={handleUpload}
              isLoading={isLoading}
            />

            {/* Right column — summary + transcript stacked */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    className="panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '220px',
                      gap: '1.5rem',
                    }}
                  >
                    {/* Sweep bar */}
                    <div style={{
                      width: '100%',
                      maxWidth: '240px',
                      height: '2px',
                      background: 'var(--elevated)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                    }}>
                      <div className="sweep" style={{
                        height: '100%',
                        width: '40%',
                        background: 'linear-gradient(90deg, transparent, var(--violet-mid), var(--violet-soft), transparent)',
                      }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        color: 'var(--text-2)',
                        marginBottom: '0.3rem',
                      }}>
                        Analyzing your note
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)' }}>
                        Transcribing · Summarizing · Extracting tasks
                      </p>
                    </div>
                  </motion.div>
                ) : data ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <SummaryPanel data={data} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    className="panel"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '220px',
                      gap: '0.75rem',
                      border: '1px dashed var(--border-subtle)',
                      background: 'transparent',
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'var(--violet-subtle)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--violet-soft)',
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <p style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-3)',
                      textAlign: 'center',
                      lineHeight: 1.6,
                      maxWidth: '200px',
                    }}>
                      {error || 'Record or upload a voice note to see your AI summary here.'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Transcript — always visible, uses mock if no data */}
              <TranscriptPanel transcript={data?.transcript} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './App.css';
import HistoryPanel from './components/HistoryPanel';
import Navbar from './components/Navbar';
import RecorderPanel from './components/RecorderPanel';
import SummaryPanel from './components/SummaryPanel';
import TranscriptPanel from './components/TranscriptPanel';
import { API_BASE_URL, apiUrl } from './config';

const StatsBar = ({ data }) => {
  if (!data) return null;
  const stats = [
    { label: 'Words', value: data.transcript?.trim().split(/\s+/).length || 0 },
    { label: 'Action Items', value: data.action_items?.length || 0 },
    { label: 'Topics', value: data.keywords?.length || 0 },
    { label: 'Decisions', value: data.decisions?.length || 0 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="panel"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.06, duration: 0.35 }}
          style={{ padding: '1rem 1.25rem', gap: '0.2rem' }}
        >
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            lineHeight: 1,
            background: 'linear-gradient(135deg, #F1F5F9, #A78BFA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            {stat.value}
          </span>
          <span style={{
            fontSize: '0.65rem',
            color: 'var(--text-3)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            {stat.label}
          </span>
        </motion.div>
      ))}
    </motion.div>
  );
};

const Hero = ({ eyebrow, title, subtitle }) => (
  <motion.div
    className="hero-strip"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <p className="hero-eyebrow"><span className="hero-eyebrow-dot" />{eyebrow}</p>
    <h1 className="hero-title grad-text">{title}</h1>
    <p className="hero-sub">{subtitle}</p>
  </motion.div>
);

const EmptyPanel = ({ message, error = false }) => (
  <motion.div
    className="panel"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    style={{
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '220px',
      border: '1px dashed var(--border-subtle)',
      background: 'transparent',
    }}
  >
    <p style={{
      fontSize: '0.82rem',
      color: error ? 'var(--danger)' : 'var(--text-3)',
      textAlign: 'center',
      lineHeight: 1.6,
      maxWidth: '320px',
    }}>
      {message}
    </p>
  </motion.div>
);

const LoadingPanel = () => (
  <motion.div
    className="panel"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ alignItems: 'center', justifyContent: 'center', minHeight: '220px', gap: '1.5rem' }}
  >
    <div style={{ width: '100%', maxWidth: '240px', height: '2px', background: 'var(--elevated)', overflow: 'hidden' }}>
      <div className="sweep" style={{
        height: '100%',
        width: '40%',
        background: 'linear-gradient(90deg, transparent, var(--violet-mid), var(--violet-soft), transparent)',
      }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-2)' }}>
        Analyzing your note
      </p>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-3)', marginTop: '0.3rem' }}>
        Processing transcript and meeting intelligence
      </p>
    </div>
  </motion.div>
);

const SettingsPanel = () => {
  const [health, setHealth] = useState({ loading: true, online: false, environment: '' });

  useEffect(() => {
    const controller = new AbortController();
    fetch(apiUrl('/health'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable');
        return response.json();
      })
      .then((data) => setHealth({ loading: false, online: true, environment: data.environment || '' }))
      .catch((error) => {
        if (error.name !== 'AbortError') setHealth({ loading: false, online: false, environment: '' });
      });
    return () => controller.abort();
  }, []);

  const items = [
    { label: 'API mode', value: 'Mock / Gemini', note: 'Selected by the backend USE_MOCK_AI setting.' },
    { label: 'Backend URL', value: API_BASE_URL, note: health.online ? `Connected${health.environment ? ` (${health.environment})` : ''}` : health.loading ? 'Checking connection...' : 'Offline' },
    { label: 'Upload limit', value: '25 MB', note: 'Validated by the backend; deployment settings may override it.' },
    { label: 'Provider note', value: 'Backend managed', note: 'Gemini enriches meetings; transcription and audio summary may use mock providers.' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
      {items.map((item) => (
        <div className="panel" key={item.label}>
          <span className="panel-label">{item.label}</span>
          <span className="panel-title" style={{ overflowWrap: 'anywhere' }}>{item.value}</span>
          <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', lineHeight: 1.6 }}>{item.note}</p>
        </div>
      ))}
    </div>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [historyMeeting, setHistoryMeeting] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (formData) => {
    setIsLoading(true);
    setData(null);
    setError('');
    try {
      const response = await fetch(apiUrl('/api/process-audio'), { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result?.error?.message || 'Audio processing failed.');
      setData(result);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Audio processing failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const showHistory = activeTab === 'history';

  return (
    <div className="app-shell">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <Navbar activeTab={activeTab} onNavigate={setActiveTab} />

      <div className={`dashboard ${showHistory ? 'history-view' : ''}`}>
        {showHistory && <HistoryPanel onSelectMeeting={setHistoryMeeting} />}

        <main className="main-content">
          {activeTab === 'dashboard' && (
            <>
              <Hero
                eyebrow="AI Voice Intelligence"
                title={<>Turn speech into<br />structured insight.</>}
                subtitle="Record a voice note or upload audio to generate structured meeting intelligence."
              />
              <AnimatePresence>{data && <StatsBar data={data} />}</AnimatePresence>
              <div className="panel-grid">
                <RecorderPanel onUploadSuccess={handleUpload} isLoading={isLoading} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <AnimatePresence mode="wait">
                    {isLoading ? <LoadingPanel key="loading" /> : data ? (
                      <SummaryPanel key="results" data={data} />
                    ) : (
                      <EmptyPanel key="empty" message={error || 'Record or upload audio to see meeting intelligence here.'} error={Boolean(error)} />
                    )}
                  </AnimatePresence>
                  {data?.transcript && <TranscriptPanel transcript={data.transcript} />}
                </div>
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <>
              <Hero
                eyebrow="Meeting Archive"
                title="Meeting history"
                subtitle="Browse persisted meetings and review their generated intelligence."
              />
              {historyMeeting ? (
                <>
                  <StatsBar data={historyMeeting} />
                  <SummaryPanel data={historyMeeting} />
                  {historyMeeting.transcript && <TranscriptPanel transcript={historyMeeting.transcript} />}
                </>
              ) : (
                <EmptyPanel message="Select a meeting from history to view its details." />
              )}
            </>
          )}

          {activeTab === 'settings' && (
            <>
              <Hero
                eyebrow="Local Configuration"
                title="Settings"
                subtitle="Runtime information for this local Whisper workspace."
              />
              <SettingsPanel />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;

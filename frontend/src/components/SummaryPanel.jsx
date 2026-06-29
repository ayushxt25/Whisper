import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SparkleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.47L19 10l-5.12 3.53L15.76 19 12 15.9 8.24 19l1.88-5.47L5 10l5.12-1.53z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const AudioIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const TagIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const MOCK_DATA = {
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
  audio_summary_url: null,
  sentiment: 'Productive',
  confidence: 94,
};

const SentimentPill = ({ label }) => {
  const map = {
    Productive: { bg: 'var(--success-subtle)', border: 'rgba(16,185,129,0.2)', color: 'var(--success)' },
    Neutral:    { bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', color: 'var(--text-2)' },
    Urgent:     { bg: 'var(--danger-subtle)',   border: 'rgba(244,63,94,0.2)',    color: 'var(--danger)'   },
  };
  const s = map[label] || map.Neutral;
  return (
    <span style={{
      fontSize: '0.62rem',
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      padding: '0.2rem 0.55rem',
      borderRadius: '999px',
      background: s.bg,
      border: `1px solid ${s.border}`,
      color: s.color,
    }}>
      {label}
    </span>
  );
};

const ActionItem = ({ text, index }) => {
  const [done, setDone] = useState(false);

  return (
    <motion.li
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        padding: '0.65rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: done ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${done ? 'rgba(16,185,129,0.15)' : 'var(--border-subtle)'}`,
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
      onClick={() => setDone((d) => !d)}
    >
      {/* Checkbox */}
      <motion.span
        whileTap={{ scale: 0.85 }}
        style={{
          flexShrink: 0,
          marginTop: '1px',
          width: '18px',
          height: '18px',
          borderRadius: '5px',
          background: done ? 'var(--success)' : 'transparent',
          border: `1.5px solid ${done ? 'var(--success)' : 'var(--text-3)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          transition: 'all 0.2s ease',
          boxShadow: done ? '0 0 10px rgba(16,185,129,0.3)' : 'none',
        }}
      >
        <AnimatePresence>
          {done && (
            <motion.span
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
            >
              <CheckCircleIcon />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>

      <span style={{
        fontSize: '0.82rem',
        color: done ? 'var(--text-3)' : 'var(--text-2)',
        lineHeight: 1.6,
        textDecoration: done ? 'line-through' : 'none',
        transition: 'all 0.25s ease',
      }}>
        {text}
      </span>
    </motion.li>
  );
};

const SummaryPanel = ({ data }) => {
  const d = data || MOCK_DATA;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Audio summary */}
      {d.audio_summary_url && (
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="panel-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span className="panel-label"><AudioIcon /> AI Audio Summary</span>
              <span className="panel-title">Listen to Summary</span>
            </div>
          </div>
          <audio
            controls
            src={`http://localhost:8000${d.audio_summary_url}`}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '8px',
              accentColor: 'var(--violet)',
            }}
          />
        </motion.div>
      )}

      {/* Summary card */}
      <motion.div
        className="panel panel-accent"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="panel-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="panel-label"><SparkleIcon /> AI Summary</span>
            <span className="panel-title">Key Takeaways</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {d.sentiment && <SentimentPill label={d.sentiment} />}
            {d.confidence && (
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--text-3)',
                fontWeight: 600,
              }}>
                {d.confidence}% confidence
              </span>
            )}
          </div>
        </div>

        <p style={{
          fontSize: '0.88rem',
          lineHeight: 1.8,
          color: 'var(--text-2)',
        }}>
          {d.summary}
        </p>

        {/* Keywords */}
        {d.keywords && d.keywords.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              fontSize: '0.62rem',
              color: 'var(--text-3)',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}>
              <TagIcon /> Topics
            </span>
            {d.keywords.map((kw) => (
              <span key={kw} style={{
                fontSize: '0.65rem',
                fontWeight: 600,
                padding: '0.18rem 0.55rem',
                borderRadius: '999px',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(139,92,246,0.18)',
                color: 'var(--violet-soft)',
                letterSpacing: '0.04em',
              }}>
                {kw}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* Action items */}
      {d.action_items && d.action_items.length > 0 && (
        <motion.div
          className="panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="panel-header">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span className="panel-label"><CheckCircleIcon /> Tasks</span>
              <span className="panel-title">Action Items</span>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-3)',
            }}>
              {d.action_items.length} tasks
            </span>
          </div>

          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'none' }}>
            {d.action_items.map((item, i) => (
              <ActionItem key={i} text={item} index={i} />
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  );
};

export default SummaryPanel;
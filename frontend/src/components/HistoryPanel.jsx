import React, { useState } from 'react';
import { motion } from 'framer-motion';

const MOCK_HISTORY = [
  {
    id: 1,
    title: 'Q3 Product Roadmap',
    duration: '4:32',
    time: '2 hours ago',
    tags: ['product', 'roadmap'],
    preview: 'Discussed onboarding flow improvements and mobile redesign timeline.',
  },
  {
    id: 2,
    title: 'Team Standup',
    duration: '2:14',
    time: 'Yesterday',
    tags: ['standup'],
    preview: 'Sprint velocity down 12%. Blocked on API integration from backend team.',
  },
  {
    id: 3,
    title: 'Investor Call Notes',
    duration: '11:47',
    time: '2 days ago',
    tags: ['investor', 'funding'],
    preview: 'Series A discussion. Runway comfortable through Q2 next year.',
  },
  {
    id: 4,
    title: 'Personal Brainstorm',
    duration: '6:05',
    time: '3 days ago',
    tags: ['personal'],
    preview: 'Ideas for side project — AI-powered journaling with mood tracking.',
  },
  {
    id: 5,
    title: 'Design Review',
    duration: '3:51',
    time: '4 days ago',
    tags: ['design'],
    preview: 'Figma handoff feedback. Nav inconsistency flagged across three screens.',
  },
];

const ClockIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const MicTinyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
);

const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const TAG_COLORS = {
  product:  { bg: 'rgba(124,58,237,0.12)', border: 'rgba(124,58,237,0.25)', color: '#A78BFA' },
  roadmap:  { bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.22)',  color: '#67E8F9' },
  standup:  { bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.22)', color: '#6EE7B7' },
  investor: { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)', color: '#FCD34D' },
  funding:  { bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.22)', color: '#FCD34D' },
  personal: { bg: 'rgba(244,63,94,0.10)',  border: 'rgba(244,63,94,0.22)',  color: '#FDA4AF' },
  design:   { bg: 'rgba(6,182,212,0.10)',  border: 'rgba(6,182,212,0.22)',  color: '#67E8F9' },
};

const Tag = ({ label }) => {
  const style = TAG_COLORS[label] || TAG_COLORS.product;
  return (
    <span style={{
      fontSize: '0.58rem',
      fontWeight: 700,
      letterSpacing: '0.07em',
      textTransform: 'uppercase',
      padding: '0.15rem 0.45rem',
      borderRadius: '999px',
      background: style.bg,
      border: `1px solid ${style.border}`,
      color: style.color,
    }}>
      {label}
    </span>
  );
};

const HistoryPanel = () => {
  const [activeId, setActiveId] = useState(1);
  const [query, setQuery] = useState('');

  const filtered = MOCK_HISTORY.filter((h) =>
    h.title.toLowerCase().includes(query.toLowerCase()) ||
    h.preview.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <motion.div
      className="sidebar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.62rem',
          fontWeight: 700,
          letterSpacing: '0.13em',
          textTransform: 'uppercase',
          color: 'var(--violet-soft)',
          marginBottom: '0.35rem',
        }}>
          History
        </p>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: 'var(--text-1)',
        }}>
          Your Notes
        </p>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 0.75rem',
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '0.75rem',
      }}>
        <span style={{ color: 'var(--text-3)', flexShrink: 0 }}>
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search notes…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            fontSize: '0.78rem',
            color: 'var(--text-1)',
            width: '100%',
            fontFamily: 'var(--font-body)',
          }}
        />
      </div>

      {/* Stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginBottom: '1rem',
      }}>
        {[
          { label: 'Total', value: MOCK_HISTORY.length },
          { label: 'This week', value: 3 },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '0.6rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.1rem',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-1)',
              lineHeight: 1,
            }}>
              {stat.value}
            </span>
            <span style={{
              fontSize: '0.62rem',
              color: 'var(--text-3)',
              fontWeight: 500,
              letterSpacing: '0.04em',
            }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: 'var(--border-subtle)',
        marginBottom: '0.75rem',
      }} />

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {filtered.length === 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-3)', textAlign: 'center', padding: '1rem 0' }}>
            No notes found
          </p>
        )}
        {filtered.map((item, i) => (
          <motion.div
            key={item.id}
            className={`history-item ${activeId === item.id ? 'active' : ''}`}
            onClick={() => setActiveId(item.id)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Icon */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: activeId === item.id
                ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.15))'
                : 'rgba(255,255,255,0.04)',
              border: `1px solid ${activeId === item.id ? 'var(--border)' : 'var(--border-subtle)'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: activeId === item.id ? 'var(--violet-soft)' : 'var(--text-3)',
              flexShrink: 0,
              transition: 'all 0.2s ease',
            }}>
              <MicTinyIcon />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <p style={{
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: activeId === item.id ? 'var(--text-1)' : 'var(--text-2)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  transition: 'color 0.2s ease',
                }}>
                  {item.title}
                </p>
                <span style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-3)',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  <ClockIcon /> {item.duration}
                </span>
              </div>

              <p style={{
                fontSize: '0.68rem',
                color: 'var(--text-3)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {item.preview}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.4rem' }}>
                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {item.tags.map((tag) => <Tag key={tag} label={tag} />)}
                </div>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-4)', flexShrink: 0 }}>
                  {item.time}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default HistoryPanel;
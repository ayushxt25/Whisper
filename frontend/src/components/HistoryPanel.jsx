import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiUrl } from '../config';

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const MicIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
  </svg>
);

const formatDate = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(value));
};

const HistoryPanel = ({ onSelectMeeting }) => {
  const [meetings, setMeetings] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetch(apiUrl('/api/meetings'), { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('Could not load meeting history.');
        return response.json();
      })
      .then((items) => {
        const records = Array.isArray(items) ? items : [];
        setMeetings(records);
        const first = records[0] || null;
        setActiveId(first?.id || null);
        onSelectMeeting(first);
      })
      .catch((loadError) => {
        if (loadError.name === 'AbortError') return;
        setError(loadError.message || 'Could not load meeting history.');
        setMeetings([]);
        setActiveId(null);
        onSelectMeeting(null);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [onSelectMeeting, refreshKey]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = meetings.filter((meeting) => {
    if (!normalizedQuery) return true;
    return [
      meeting.original_filename,
      meeting.summary,
      meeting.transcript,
      ...(meeting.keywords || []),
      ...(meeting.decisions || []),
      ...(meeting.action_items || []),
    ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
  });

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = meetings.filter((meeting) => new Date(meeting.created_at).getTime() >= weekAgo).length;

  const selectMeeting = (meeting) => {
    setActiveId(meeting.id);
    onSelectMeeting(meeting);
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <p className="panel-label" style={{ marginBottom: '0.35rem' }}>History</p>
        <p className="panel-title">Your Meetings</p>
      </div>

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
        <span style={{ color: 'var(--text-3)' }}><SearchIcon /></span>
        <input
          type="search"
          placeholder="Filter meetings..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
        {[{ label: 'Total', value: meetings.length }, { label: 'This week', value: thisWeek }].map((stat) => (
          <div key={stat.label} style={{
            padding: '0.6rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid var(--border)',
          }}>
            <span style={{ display: 'block', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{stat.value}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-3)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>Loading meetings...</p>}

      {!loading && error && (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <p style={{ color: 'var(--danger)', fontSize: '0.75rem', lineHeight: 1.5 }}>{error}</p>
          <button className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => setRefreshKey((key) => key + 1)}>
            Retry
          </button>
        </div>
      )}

      {!loading && !error && meetings.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>
          No meetings yet. Process audio from Dashboard to create one.
        </p>
      )}

      {!loading && !error && meetings.length > 0 && filtered.length === 0 && (
        <p style={{ color: 'var(--text-3)', fontSize: '0.75rem', textAlign: 'center', padding: '1rem' }}>No matching meetings.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {filtered.map((meeting, index) => (
          <motion.button
            type="button"
            key={meeting.id}
            className={`history-item ${activeId === meeting.id ? 'active' : ''}`}
            onClick={() => selectMeeting(meeting)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            style={{ width: '100%', textAlign: 'left', color: 'inherit' }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--violet-soft)',
              flexShrink: 0,
            }}>
              <MicIcon />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {meeting.original_filename || `Meeting ${meeting.id.slice(0, 8)}`}
              </p>
              <p style={{ fontSize: '0.68rem', color: 'var(--text-3)', lineHeight: 1.5, marginTop: '0.2rem' }}>
                {meeting.summary || 'No summary available.'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', marginTop: '0.35rem' }}>
                <span style={{ fontSize: '0.62rem', color: 'var(--violet-soft)', textTransform: 'capitalize' }}>
                  {meeting.sentiment || meeting.job_status || 'meeting'}
                </span>
                <span style={{ fontSize: '0.6rem', color: 'var(--text-4)' }}>{formatDate(meeting.created_at)}</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.aside>
  );
};

export default HistoryPanel;

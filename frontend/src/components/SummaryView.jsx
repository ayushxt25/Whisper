import React, { useState } from 'react';
import { apiUrl } from '../config';

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="2,6 5,9 10,3" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg
    width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
  >
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const AudioIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
  </svg>
);

const SectionCard = ({ children, delay = 0 }) => (
  <div
    className="glass animate-slide-up rounded-2xl p-6"
    style={{
      animationDelay: `${delay}s`,
      boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
    }}
  >
    {children}
  </div>
);

const SectionLabel = ({ children }) => (
  <p
    style={{
      fontFamily: 'Syne, sans-serif',
      fontSize: '0.65rem',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--violet-soft)',
      marginBottom: '0.75rem',
    }}
  >
    {children}
  </p>
);

const SummaryView = ({ data }) => {
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  if (!data) return null;

  return (
    <div
      className="w-full flex flex-col gap-4 animate-slide-up"
      style={{ animationDelay: '0.05s' }}
    >
      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        margin: '0.5rem 0',
      }}>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
        <span style={{
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          Results
        </span>
        <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      </div>

      {/* Audio Summary */}
      {data.audio_summary_url && (
        <SectionCard delay={0.1}>
          <SectionLabel>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <AudioIcon /> AI Audio Summary
            </span>
          </SectionLabel>
          <audio
            controls
            className="w-full"
            src={apiUrl(data.audio_summary_url)}
            style={{
              borderRadius: '8px',
              height: '36px',
              accentColor: 'var(--violet)',
            }}
          />
        </SectionCard>
      )}

      {/* Summary */}
      <SectionCard delay={0.15}>
        <SectionLabel>Summary</SectionLabel>
        <p style={{
          fontSize: '0.92rem',
          lineHeight: 1.75,
          color: 'var(--text-secondary)',
          fontWeight: 400,
        }}>
          {data.summary}
        </p>
      </SectionCard>

      {/* Action Items */}
      {data.action_items && data.action_items.length > 0 && (
        <SectionCard delay={0.2}>
          <SectionLabel>Action Items</SectionLabel>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {data.action_items.map((item, idx) => (
              <li
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}
              >
                <span style={{
                  flexShrink: 0,
                  marginTop: '3px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(52, 211, 153, 0.12)',
                  border: '1px solid rgba(52, 211, 153, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)',
                }}>
                  <CheckIcon />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {/* Transcript accordion */}
      {data.transcript && (
        <div
          className="glass rounded-2xl animate-slide-up"
          style={{
            animationDelay: '0.25s',
            overflow: 'hidden',
            boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
          }}
        >
          <button
            onClick={() => setTranscriptOpen((o) => !o)}
            style={{
              width: '100%',
              padding: '1.1rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <span style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--violet-soft)',
            }}>
              Full Transcript
            </span>
            <ChevronIcon open={transcriptOpen} />
          </button>

          <div style={{
            maxHeight: transcriptOpen ? '400px' : '0px',
            overflow: 'hidden',
            transition: 'max-height 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <p style={{
              padding: '0 1.5rem 1.5rem',
              fontSize: '0.8rem',
              lineHeight: 1.8,
              color: 'var(--text-muted)',
              whiteSpace: 'pre-wrap',
            }}>
              {data.transcript}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryView;

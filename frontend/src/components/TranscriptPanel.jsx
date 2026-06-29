import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FileTextIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const CopyIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const CheckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.3s ease',
    }}>
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const WordCountIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="6"  x2="21" y2="6"  />
    <line x1="3" y1="12" x2="15" y2="12" />
    <line x1="3" y1="18" x2="18" y2="18" />
  </svg>
);

const MOCK_TRANSCRIPT = `So today we went over the Q3 roadmap and there were a few things that came up. First, the onboarding flow needs work — users are dropping off after step two. We think better tooltips and a progress indicator would help significantly.

Second, churn is up slightly and the growth team wants to try in-app nudges before the user hits the cancel screen. We've seen this work well at other companies and it's worth a shot before we invest in a bigger retention push.

Third, the mobile redesign is on track but we need the mockups finalized before the engineers can start. I'll put together the spec doc for onboarding v2 over the weekend.

Let's sync again after the A/B test results come in next Thursday. Make sure everyone has access to the shared Notion doc before then.`;

const TranscriptPanel = ({ transcript }) => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = transcript || MOCK_TRANSCRIPT;
  const wordCount = text.trim().split(/\s+/).length;
  const charCount = text.length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="panel-header" style={{ cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span className="panel-label">
            <FileTextIcon />
            Transcript
          </span>
          <span className="panel-title">Full Transcript</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {/* Copy button */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); handleCopy(); }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              background: copied ? 'var(--success-subtle)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'var(--border-subtle)'}`,
              color: copied ? 'var(--success)' : 'var(--text-3)',
              fontSize: '0.68rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-body)',
            }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <CheckIcon /> Copied
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <CopyIcon /> Copy
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Chevron */}
          <span style={{ color: 'var(--text-3)' }}>
            <ChevronIcon open={open} />
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: <WordCountIcon />, label: `${wordCount} words` },
          { icon: <WordCountIcon />, label: `${charCount} characters` },
          { icon: <WordCountIcon />, label: `~${readTime} min read` },
        ].map((stat, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.68rem',
            color: 'var(--text-3)',
            fontWeight: 500,
          }}>
            <span style={{ color: 'var(--violet-soft)', opacity: 0.7 }}>{stat.icon}</span>
            {stat.label}
          </div>
        ))}
      </div>

      {/* Transcript body — animated accordion */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="transcript-body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              marginTop: '0.25rem',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
            }}>
              {/* Paragraph-by-paragraph rendering */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {text.split('\n\n').filter(Boolean).map((para, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.3 }}
                    style={{
                      fontSize: '0.82rem',
                      lineHeight: 1.85,
                      color: 'var(--text-2)',
                    }}
                  >
                    {para}
                  </motion.p>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed preview — shown when closed */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => setOpen(true)}
          >
            <p style={{
              fontSize: '0.8rem',
              lineHeight: 1.7,
              color: 'var(--text-3)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {text}
            </p>
            {/* Fade out gradient */}
            <div style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0,
              height: '40px',
              background: 'linear-gradient(to bottom, transparent, rgba(15,15,26,0.95))',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '6px',
            }}>
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--violet-soft)',
                fontWeight: 600,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                Click to expand
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TranscriptPanel;
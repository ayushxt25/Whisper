import React from 'react';
import { motion } from 'framer-motion';

const WhisperLogo = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect width="28" height="28" rx="8" fill="url(#logo-grad)" />
    <rect x="7" y="11" width="2.5" height="6" rx="1.25" fill="white" opacity="0.5" />
    <rect x="11.5" y="8" width="2.5" height="12" rx="1.25" fill="white" opacity="0.8" />
    <rect x="16" y="10" width="2.5" height="8" rx="1.25" fill="white" />
    <rect x="20.5" y="13" width="2.5" height="4" rx="1.25" fill="white" opacity="0.5" />
    <defs>
      <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
);

const Navbar = () => {
  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Left — Logo + wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
        <WhisperLogo />
        <span className="navbar-logo grad-text">Whisper</span>
        <span
          className="badge badge-violet"
          style={{ marginLeft: '0.25rem' }}
        >
          <span className="badge-dot" />
          Beta
        </span>
      </div>

      {/* Center — nav links (hidden on mobile) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
        className="nav-links-center"
      >
        {['Dashboard', 'History', 'Settings'].map((link) => (
          <button
            key={link}
            className="btn btn-ghost"
            style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem' }}
          >
            {link}
          </button>
        ))}
      </div>

      {/* Right — actions */}
      <div className="navbar-actions">
        {/* Model pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.3rem 0.75rem',
            borderRadius: '999px',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--violet-soft)',
            letterSpacing: '0.04em',
          }}
        >
          <span style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 6px var(--success)',
            flexShrink: 0,
          }} />
          Whisper-v3 · GPT-4o
        </div>

        {/* Avatar */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.72rem',
            fontWeight: 700,
            color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            border: '1.5px solid rgba(139,92,246,0.3)',
          }}
        >
          AY
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
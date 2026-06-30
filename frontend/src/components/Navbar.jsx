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
      <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28">
        <stop offset="0%" stopColor="#7C3AED" />
        <stop offset="100%" stopColor="#06B6D4" />
      </linearGradient>
    </defs>
  </svg>
);

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'history', label: 'History' },
  { id: 'settings', label: 'Settings' },
];

const Navbar = ({ activeTab, onNavigate }) => (
  <motion.nav
    className="navbar"
    initial={{ opacity: 0, y: -16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
      <WhisperLogo />
      <span className="navbar-logo grad-text">Whisper</span>
      <span className="badge badge-violet" style={{ marginLeft: '0.25rem' }}>
        <span className="badge-dot" />Local
      </span>
    </div>

    <div
      className="nav-links-center"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {tabs.map((tab) => (
        <button
          type="button"
          key={tab.id}
          className={`btn btn-ghost ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          aria-current={activeTab === tab.id ? 'page' : undefined}
          style={{
            fontSize: '0.78rem',
            padding: '0.4rem 0.85rem',
            color: activeTab === tab.id ? 'var(--text-1)' : 'var(--text-2)',
            background: activeTab === tab.id ? 'var(--violet-subtle)' : 'transparent',
            borderColor: activeTab === tab.id ? 'var(--border)' : 'var(--border-subtle)',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>

    <div className="navbar-actions">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.45rem',
        padding: '0.35rem 0.7rem',
        borderRadius: '999px',
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(139,92,246,0.2)',
        fontSize: '0.7rem',
        color: 'var(--violet-soft)',
      }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)' }} />
        Local user
      </div>
    </div>
  </motion.nav>
);

export default Navbar;

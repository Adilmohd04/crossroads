'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { intake, resetApp, isLoading } = useApp();
  const [memoryCount, setMemoryCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crossroads_journal_history');
      if (saved) setMemoryCount(JSON.parse(saved)?.length || 0);
    } catch { /* ignore */ }
  }, []);

  const isHome = pathname === '/' || pathname === '';
  const isJournal = pathname === '/journal';

  const logoSvg = (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--green-light)', flexShrink: 0 }}>
      {/* Curved path 1 */}
      <path d="M4 20C4 20 8 16 12 16C16 16 20 18 20 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Crossroads path 2 */}
      <path d="M4 4C4 4 9 8 12 12C15 16 20 20 20 20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaf node at decision point */}
      <path d="M12 12C12 12 13.5 9 16 8C18.5 7 19.5 8 19.5 8C19.5 8 18.5 10 16 11.5C13.5 13 12 12 12 12Z" fill="currentColor" opacity="0.9" />
    </svg>
  );

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(252, 252, 249, 0.82)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(223, 219, 207, 0.5)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <button onClick={resetApp} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}>
            {logoSvg}
            <span style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', fontWeight: 600, color: 'var(--ink)' }}>
              Crossroads
            </span>
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Link 
              href="/" 
              style={{ 
                padding: '6px 14px', 
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 600, 
                fontFamily: "'Outfit', sans-serif",
                color: isHome ? 'var(--green)' : 'var(--muted)', 
                background: isHome ? 'var(--green-dim)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
            >
              New Decision
            </Link>
            <Link 
              href="/journal" 
              style={{ 
                padding: '6px 14px', 
                borderRadius: '10px', 
                fontSize: '14px', 
                fontWeight: 600, 
                fontFamily: "'Outfit', sans-serif",
                color: isJournal ? 'var(--green)' : 'var(--muted)', 
                background: isJournal ? 'var(--green-dim)' : 'transparent',
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
            >
              Second Brain
              {memoryCount > 0 && (
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: 700, 
                  padding: '1px 6px', 
                  borderRadius: '100px', 
                  background: isJournal ? 'var(--green)' : 'var(--green-soft)', 
                  color: isJournal ? '#fff' : 'var(--green)',
                  transition: 'all 0.2s ease'
                }}>
                  {memoryCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        {intake && (
          <button onClick={resetApp} disabled={isLoading}
            className="btn-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
            <RotateCcw size={14} /> Start Over
          </button>
        )}
      </div>
    </header>
  );
}

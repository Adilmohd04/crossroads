'use client';

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReleasedLotus {
  id: number;
  text: string;
  top: number; // vertical offset in percentage within the stream
  speed: number; // duration in seconds
}

export default function WishLotus() {
  const [worryInput, setWorryInput] = useState('');
  const [released, setReleased] = useState<ReleasedLotus[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!worryInput.trim()) return;

    const newLotus: ReleasedLotus = {
      id: Date.now(),
      text: worryInput.trim(),
      top: 10 + Math.random() * 50, // random height variance in the pond stream (10% to 60%)
      speed: 14 + Math.random() * 6, // 14 to 20 seconds drift duration
    };

    setReleased((prev) => [...prev, newLotus]);
    setWorryInput('');
    setShowMessage(true);

    // Hide message after 4.5s
    setTimeout(() => {
      setShowMessage(false);
    }, 4500);

    // Clean up lotus after it leaves screen
    setTimeout(() => {
      setReleased((prev) => prev.filter((l) => l.id !== newLotus.id));
    }, newLotus.speed * 1000);
  };

  return (
    <div className="relative">
      {/* Stream overlay for drifting lotus flowers */}
      <div className="fixed bottom-[80px] left-0 w-full pointer-events-none z-50 overflow-hidden h-[120px]">
        <AnimatePresence>
          {released.map((l) => (
            <div
              key={l.id}
              className="absolute left-0 flex flex-col items-center"
              style={{
                top: `${l.top}%`,
                animation: `lotus-drift ${l.speed}s linear forwards`,
              }}
            >
              {/* Blooming Lotus SVG */}
              <div className="flex flex-col items-center drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)]">
                <svg width="40" height="28" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Green lotus pad */}
                  <path d="M4 19C10 21 26 21 32 19C28 17.5 8 17.5 4 19Z" fill="#0d9488" opacity="0.85" />
                  {/* Outer pink petals */}
                  <path d="M18 2C15 6 10 9 6 14C11 15 16 14 18 11C20 14 25 15 30 14C26 9 21 6 18 2Z" fill="#fbcfe8" opacity="0.9" />
                  {/* Inner dark pink petals */}
                  <path d="M18 6C16 9 12 11 9 15C13 16 16 15 18 13C20 15 23 16 27 15C24 11 20 9 18 6Z" fill="#f43f5e" />
                  {/* Gold center stamens */}
                  <circle cx="18" cy="12" r="2" fill="#fbbf24" />
                </svg>
                {/* Floating worry text bubble */}
                <div className="mt-1 max-w-[100px] bg-white/95 backdrop-blur-[4px] text-[8.5px] text-teal-900 font-bold py-0.5 px-2 rounded-full border border-teal-500/20 shadow-sm truncate">
                  {l.text}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Bias & Worry Release Lotus Pond</h4>
            <p className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
              Write down your doubts or anxious thoughts, release them into the sanctuary stream, and watch them drift away.
            </p>
          </div>
        </div>

        <form onSubmit={handleRelease} className="flex gap-2">
          <input
            type="text"
            value={worryInput}
            onChange={(e) => setWorryInput(e.target.value)}
            placeholder="Write an anxiety (e.g. 'Fear of regret', 'Worried about cost')..."
            className="field flex-1"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1.5px solid rgba(13, 148, 136, 0.15)',
              color: 'var(--ink)',
            }}
            maxLength={60}
          />
          <button
            type="submit"
            className="btn-primary py-2.5 px-4 shrink-0 flex items-center gap-1.5"
            style={{
              background: 'var(--green-light)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#12c08c'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green-light)'}
          >
            <Send className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Release</span>
          </button>
        </form>

        <AnimatePresence>
          {showMessage && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-semibold text-teal-600 text-center animate-fade-in"
            >
              🍃 Your worry drifts away down the forest stream. Focus on what you can influence.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

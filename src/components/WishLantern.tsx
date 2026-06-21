'use client';

import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReleasedLantern {
  id: number;
  text: string;
  left: number; // horizontal start percentage
  speed: number; // duration in seconds
}

export default function WishLantern() {
  const [fearInput, setFearInput] = useState('');
  const [released, setReleased] = useState<ReleasedLantern[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  const handleRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fearInput.trim()) return;

    const newLantern: ReleasedLantern = {
      id: Date.now(),
      text: fearInput.trim(),
      left: 10 + Math.random() * 80, // Random placement between 10% and 90%
      speed: 12 + Math.random() * 6, // 12-18 seconds rise duration
    };

    setReleased((prev) => [...prev, newLantern]);
    setFearInput('');
    setShowMessage(true);

    // Hide success message after 4s
    setTimeout(() => {
      setShowMessage(false);
    }, 4500);

    // Clean up lantern after it leaves screen
    setTimeout(() => {
      setReleased((prev) => prev.filter((l) => l.id !== newLantern.id));
    }, newLantern.speed * 1000);
  };

  return (
    <div className="relative">
      {/* Viewport overlay for floating lanterns */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {released.map((l) => (
            <div
              key={l.id}
              className="absolute bottom-0 text-center"
              style={{
                left: `${l.left}%`,
                animation: `lantern-float ${l.speed}s linear forwards`,
              }}
            >
              {/* The glowing lantern */}
              <div className="flex flex-col items-center">
                {/* Lantern bubble */}
                <div
                  className="w-10 h-14 rounded-t-full rounded-b-lg flex items-center justify-center p-1"
                  style={{
                    background: 'radial-gradient(circle at center, #ffd166 20%, #f77f00 70%, #d62828 100%)',
                    boxShadow: '0 0 15px #f77f00, 0 0 35px #ffb703, 0 0 60px rgba(247, 127, 0, 0.4)',
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
                {/* Microscopic text label representing the released worry */}
                <div className="mt-1 max-w-[80px] bg-slate-900/80 text-[7px] text-amber-200/90 font-mono py-0.5 px-1.5 rounded border border-amber-500/20 truncate">
                  {l.text}
                </div>
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Bias & Worry Release Lantern</h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Acknowledge your anxiety, write it down, and release it. Let go of what you cannot control.
            </p>
          </div>
        </div>

        <form onSubmit={handleRelease} className="flex gap-2">
          <input
            type="text"
            value={fearInput}
            onChange={(e) => setFearInput(e.target.value)}
            placeholder="Write a worry (e.g. 'I will fail', 'Lost savings')..."
            className="field flex-1"
            maxLength={60}
          />
          <button
            type="submit"
            className="btn-primary py-2.5 px-4 shrink-0 flex items-center gap-1.5"
            style={{ background: 'var(--green-light)', boxShadow: '0 4px 12px rgba(14, 161, 117, 0.15)' }}
            onMouseEnter={e => e.currentTarget.style.background = '#12c08c'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green-light)'}
          >
            <Send className="h-3.5 w-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">Release</span>
          </button>
        </form>

        <AnimatePresence>
          {showMessage && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-medium text-amber-400 text-center"
            >
              ✨ Your fear is released into the sanctuary sky. Focus on structured tradeoffs.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

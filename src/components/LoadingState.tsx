'use client';

import React, { useState, useEffect } from 'react';
import { Compass } from 'lucide-react';

const MESSAGES = [
  'Surfacing hidden assumptions in your framing...',
  'Modeling 30, 60, and 90-day realistic narratives...',
  'Calculating constraints boundary intersections...',
  'Weighing options against your priority values...',
  'Identifying non-obvious hidden costs and risk vectors...',
  'Honoring uncertainty and framing choices with clarity...',
];

export default function LoadingState({ message }: { message?: string }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4"
      style={{
        background: 'rgba(8, 11, 20, 0.92)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>

      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full opacity-20 blur-3xl animate-breathe"
          style={{ background: 'radial-gradient(circle, #3b6fff 0%, #8b5cf6 50%, transparent 70%)' }} />
      </div>

      <div className="relative flex flex-col items-center max-w-md text-center">
        {/* Animated rings */}
        <div className="relative flex h-28 w-28 items-center justify-center mb-10">
          {/* Outermost pulsing ring */}
          <div className="absolute inset-0 rounded-full animate-breathe"
            style={{ background: 'rgba(59, 111, 255, 0.08)', border: '1px solid rgba(59, 111, 255, 0.15)' }} />
          {/* Mid ring */}
          <div className="absolute h-20 w-20 rounded-full animate-pulse"
            style={{ background: 'rgba(59, 111, 255, 0.12)', border: '1px solid rgba(59, 111, 255, 0.25)' }} />
          {/* Core button */}
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              background: 'linear-gradient(135deg, #3b6fff 0%, #6366f1 100%)',
              boxShadow: '0 0 30px rgba(59, 111, 255, 0.5), 0 0 60px rgba(99, 102, 241, 0.3)',
            }}>
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)' }} />
            <Compass className="h-7 w-7 text-white animate-spin-slow relative z-10" />
          </div>
        </div>

        <h2 className="text-2xl font-black tracking-tight mb-2" style={{ color: '#f0f4ff' }}>
          Analyzing Decision
        </h2>

        {/* Rotating subtitles */}
        <p className="text-sm font-semibold h-5 transition-all duration-300"
          style={{
            color: '#7ba7ff',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(4px)',
          }}>
          {message || MESSAGES[msgIdx]}
        </p>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-500"
              style={{
                width: i === msgIdx % 5 ? '24px' : '6px',
                background: i === msgIdx % 5
                  ? 'linear-gradient(90deg, #3b6fff, #8b5cf6)'
                  : 'rgba(99, 116, 163, 0.3)',
              }} />
          ))}
        </div>

        <p className="mt-8 text-xs font-medium leading-relaxed max-w-xs"
          style={{ color: '#5c6b8c' }}>
          Crossroads is reasoning about your situation. We do not provide advice — we help you see your options clearly.
        </p>
      </div>
    </div>
  );
}

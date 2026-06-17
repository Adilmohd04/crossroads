'use client';

import React from 'react';
import { Compass, RotateCcw, BookOpen, Zap } from 'lucide-react';
import Link from 'next/link';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { intake, resetApp, isLoading } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full" style={{
      background: 'rgba(8, 11, 20, 0.80)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid rgba(99, 116, 163, 0.15)',
    }}>
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo + Nav */}
        <div className="flex items-center gap-6">
          <div
            className="flex items-center gap-3 cursor-pointer transition-all hover:opacity-90 group"
            onClick={resetApp}
          >
            {/* Logo mark */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3b6fff 0%, #6366f1 100%)',
                boxShadow: '0 4px 16px rgba(59, 111, 255, 0.4)',
              }}>
              {/* Gloss overlay */}
              <div className="absolute inset-0 rounded-xl" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }} />
              <Compass className="h-5 w-5 text-white animate-spin-slow relative z-10" />
            </div>

            <div>
              <h1 className="text-base font-black tracking-tight leading-none"
                style={{ color: '#f0f4ff' }}>
                Crossroads
              </h1>
              <p className="hidden text-[10px] font-semibold mt-0.5 sm:block"
                style={{ color: '#5c6b8c' }}>
                AI Decision Simulator
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center gap-1" style={{ borderLeft: '1px solid rgba(99, 116, 163, 0.2)', paddingLeft: '24px' }}>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ color: '#9ba8c9' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f0f4ff';
                (e.currentTarget as HTMLElement).style.background = 'rgba(99, 116, 163, 0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#9ba8c9';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <Zap className="h-3.5 w-3.5" />
              <span>New Decision</span>
            </Link>
            <Link
              href="/journal"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ color: '#9ba8c9' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#f0f4ff';
                (e.currentTarget as HTMLElement).style.background = 'rgba(99, 116, 163, 0.1)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#9ba8c9';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Decision Journal</span>
            </Link>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Hackathon badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: 'rgba(59, 111, 255, 0.12)',
              border: '1px solid rgba(59, 111, 255, 0.25)',
              color: '#7ba7ff',
            }}>
            <span className="inline-block w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b6fff' }} />
            USAII 2026
          </div>

          {intake && (
            <button
              onClick={resetApp}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 cursor-pointer"
              style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Start Over</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

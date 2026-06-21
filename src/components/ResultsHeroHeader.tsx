'use client';

import React from 'react';

export default function ResultsHeroHeader() {
  return (
    <section className="relative py-20 px-5 pb-24 flex flex-col items-center overflow-hidden bg-gradient-to-b from-sky-100 via-orange-100 to-[var(--canvas)]">
      {/* Dawn sun */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-60 h-60 rounded-full bg-[radial-gradient(circle,_#fffbeb_15%,_rgba(234,_88,_12,_0.15)_60%,_transparent_100%)] blur-[6px] opacity-85 z-10 pointer-events-none" />

      {/* Layered Ridge SVG */}
      <div className="absolute bottom-0 left-0 w-full h-20 z-20 pointer-events-none opacity-25">
        <svg className="w-full h-full" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
          <path d="M0,80 L0,40 Q150,55 280,30 Q410,5 580,35 Q750,65 920,20 Q1090,-25 1260,15 L1440,25 L1440,80 Z" fill="#1b4d3e" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[50px] z-30 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1440 50" preserveAspectRatio="none" fill="none">
          <path d="M0,50 Q150,43 280,50 Q440,30 600,45 Q740,30 900,43 Q1060,30 1340,40 L1440,42 L1440,50 Z" fill="var(--canvas)" />
        </svg>
      </div>

      {/* Content */}
      <div className="w-full max-w-[1000px] relative z-40 text-center">
        <h1 className="font-serif text-4xl sm:text-[2.5rem] text-[var(--green)] font-semibold mb-4 leading-tight">
          Your Decision Workspace
        </h1>
        <p className="text-[15px] text-[var(--body)] max-w-[600px] mx-auto leading-relaxed">
          Your options are simulated below. Calibrate your values, examine assumptions, and find path clarity.
        </p>
      </div>
    </section>
  );
}

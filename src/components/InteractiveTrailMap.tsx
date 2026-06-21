'use client';

import React, { useState, useEffect } from 'react';
import { Compass, ShieldAlert, Award, Compass as HikerIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Scenario } from '../lib/types';

interface InteractiveTrailMapProps {
  scenarios: Scenario[];
  onSelectOption?: (optionName: string) => void;
  selectedOption?: string | null;
}

export default function InteractiveTrailMap({
  scenarios,
  onSelectOption,
  selectedOption,
}: InteractiveTrailMapProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (selectedOption) {
      const idx = scenarios.findIndex(
        (s) => s.option_name.toLowerCase() === selectedOption.toLowerCase()
      );
      if (idx !== -1) setActiveIdx(idx);
    }
  }, [selectedOption, scenarios]);

  const handleSelect = (idx: number) => {
    setActiveIdx(idx);
    if (onSelectOption) {
      onSelectOption(scenarios[idx].option_name);
    }
  };

  const activeScenario = scenarios[activeIdx] || scenarios[0];
  const numOptions = scenarios.length;

  // Visual offsets for path branching in SVG
  const pathDArray = [
    // Branch 1: Winding Left to Peak 1
    'M 200 240 C 160 210, 110 180, 80 120 C 65 90, 75 60, 80 40',
    // Branch 2: Winding Right to Peak 2
    'M 200 240 C 240 210, 290 180, 320 120 C 335 90, 325 60, 320 40',
    // Branch 3: Winding Center-Left to Peak 3
    'M 200 240 C 180 200, 160 150, 160 110 C 160 80, 170 60, 170 40',
    // Branch 4: Winding Center-Right to Peak 4
    'M 200 240 C 220 200, 240 150, 240 110 C 240 80, 230 60, 230 40',
  ];

  // Coordinates for the peaks
  const peakCoords = [
    { x: 80, y: 40 },   // Peak 1
    { x: 320, y: 40 },  // Peak 2
    { x: 170, y: 40 },  // Peak 3
    { x: 230, y: 40 },  // Peak 4
  ];

  const pathColors = [
    '#d97706', // Amber / Owl
    '#0891b2', // Teal / Eagle
    '#16a34a', // Emerald / Fox
    '#8b5cf6', // Lavender / Purple
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
      {/* SVG Path visual map */}
      <div className="md:col-span-2 flex flex-col items-center justify-center bg-white/40 p-4 rounded-2xl border border-slate-200/60 relative overflow-hidden shadow-sm">
        {/* Sky background / Soft fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent pointer-events-none" />

        <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 absolute top-4 z-10">
          Decision Trail Map
        </div>

        <svg width="100%" height="280" viewBox="0 0 400 280" className="relative z-10" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <line x1="0" y1="240" x2="400" y2="240" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="200" y1="0" x2="200" y2="280" stroke="rgba(0, 0, 0, 0.04)" strokeWidth="1" strokeDasharray="4 4" />

          {/* Core Junction - Current Crossroads */}
          <circle cx="200" cy="240" r="8" fill="var(--surface)" stroke="var(--green-light)" strokeWidth="2" />
          <text x="200" y="265" textAnchor="middle" fill="var(--green)" fontSize="8" fontWeight="bold" fontFamily="sans-serif">CROSSROADS</text>

          {/* Branches */}
          {scenarios.map((s, idx) => {
            const isSelected = idx === activeIdx;
            const pathColor = pathColors[idx % pathColors.length];
            const pathD = pathDArray[idx] || pathDArray[0];

            return (
              <g key={s.option_name} className="cursor-pointer" onClick={() => handleSelect(idx)}>
                {/* Winding trail backdrop path (thick for hover click area) */}
                <path
                  d={pathD}
                  stroke="transparent"
                  strokeWidth="20"
                  className="hover:stroke-slate-500/5 transition-colors"
                />

                {/* Actual colored dashed trail line */}
                <motion.path
                  d={pathD}
                  stroke={pathColor}
                  strokeWidth={isSelected ? 3.5 : 2}
                  strokeDasharray="6 4"
                  opacity={isSelected ? 1.0 : 0.4}
                  animate={{ strokeDashoffset: isSelected ? [0, -20] : 0 }}
                  transition={{ repeat: Infinity, ease: 'linear', duration: 3 }}
                />

                {/* Peak Node / Mountain cap */}
                <g>
                  {/* Mountain silhouette icon */}
                  <polygon
                    points={`${peakCoords[idx].x},${peakCoords[idx].y - 12} ${peakCoords[idx].x - 14},${peakCoords[idx].y + 10} ${peakCoords[idx].x + 14},${peakCoords[idx].y + 10}`}
                    fill={isSelected ? pathColor : 'var(--surface)'}
                    stroke={pathColor}
                    strokeWidth="1.5"
                    opacity={isSelected ? 0.95 : 0.6}
                  />
                  {/* Flag on peak */}
                  {isSelected && (
                    <circle cx={peakCoords[idx].x} cy={peakCoords[idx].y - 12} r="3" fill="#ffffff" />
                  )}
                  {/* Peak label */}
                  <rect
                    x={peakCoords[idx].x - 45}
                    y={peakCoords[idx].y + 14}
                    width="90"
                    height="14"
                    rx="4"
                    fill="var(--card)"
                    stroke={isSelected ? pathColor : 'var(--border)'}
                    strokeWidth="1"
                  />
                  <text
                    x={peakCoords[idx].x}
                    y={peakCoords[idx].y + 24}
                    textAnchor="middle"
                    fill={isSelected ? 'var(--green)' : 'var(--muted)'}
                    fontSize="7.5"
                    fontWeight="extrabold"
                    fontFamily="sans-serif"
                    className="truncate w-[80px]"
                  >
                    {s.option_name.length > 18 ? `${s.option_name.slice(0, 15)}...` : s.option_name}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Active Hiker indicator */}
          {activeIdx < numOptions && (
            <motion.g
              initial={false}
              animate={{
                transform: `translate(${peakCoords[activeIdx].x}px, ${peakCoords[activeIdx].y + 5}px)`,
              }}
              transition={{ type: 'spring', stiffness: 50, damping: 10 }}
              style={{ transformOrigin: '0px 0px' }}
            >
              <circle cx="0" cy="0" r="10" fill="rgba(255,255,255,0.95)" className="shadow-md border border-slate-200" />
              <g transform="translate(-5, -5)">
                <HikerIcon size={10} className="text-teal-700 animate-spin-slow" />
              </g>
            </motion.g>
          )}
        </svg>

        {/* Trail selection tags */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-2 z-10">
          {scenarios.map((s, idx) => (
            <button
              key={s.option_name}
              onClick={() => handleSelect(idx)}
              className="px-2 py-0.5 rounded text-[8px] font-bold uppercase transition-all duration-200"
              style={{
                background: idx === activeIdx ? pathColors[idx % pathColors.length] : 'var(--surface)',
                color: idx === activeIdx ? '#fff' : 'var(--muted)',
                border: `1px solid ${idx === activeIdx ? pathColors[idx % pathColors.length] : 'var(--border)'}`,
              }}
            >
              Trail {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Detail dashboard representation */}
      <div className="md:col-span-3 space-y-4" style={{ color: 'var(--body)' }}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏔️</span>
            <div>
              <h3 className="text-base font-extrabold leading-tight" style={{ color: 'var(--ink)' }}>
                {activeScenario.option_name}
              </h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Peak Trail Projections
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Alignment card */}
          <div className="rounded-xl p-4 bg-white/50 border flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
              <Award className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Alignment Score</span>
              <span className="text-sm font-black" style={{ color: 'var(--ink)' }}>{activeScenario.alignment_score}%</span>
            </div>
          </div>

          {/* Confidence card */}
          <div className="rounded-xl p-4 bg-white/50 border flex items-center gap-3 shadow-sm" style={{ borderColor: 'var(--border)' }}>
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600">
              <Compass className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="block text-[9px] font-bold uppercase" style={{ color: 'var(--muted)' }}>Confidence</span>
              <span className="text-sm font-black" style={{ color: 'var(--ink)' }}>{activeScenario.confidence}%</span>
            </div>
          </div>
        </div>

        {/* Narratives quick outline */}
        <div className="rounded-xl p-4 bg-white/40 border space-y-2 shadow-sm" style={{ borderColor: 'var(--border)' }}>
          <span className="block text-[9px] font-bold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>30-60-90 Day Horizon Summary</span>
          <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--body)' }}>
            {activeScenario.narrative_90_days}
          </p>
        </div>

        {/* Risks & tradeoffs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-red-50/70 border flex items-start gap-2.5 shadow-sm" style={{ borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <ShieldAlert className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="block text-[8px] text-red-600 font-black uppercase tracking-wider">Key Downside Risk</span>
              <span className="block text-[11px] leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>{activeScenario.biggest_risk}</span>
            </div>
          </div>

          <div className="rounded-xl p-3 bg-amber-50/70 border flex items-start gap-2.5 shadow-sm" style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}>
            <span className="text-xs text-amber-600 shrink-0 mt-0.5">⚖️</span>
            <div className="space-y-0.5">
              <span className="block text-[8px] text-amber-600 font-black uppercase tracking-wider">Explicit Trade-off</span>
              <span className="block text-[11px] leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>{activeScenario.what_you_give_up}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

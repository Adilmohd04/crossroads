'use client';

import React, { useEffect, useState } from 'react';
import { Shield, Sparkles, Zap } from 'lucide-react';

export type NatureGuideId = 'owl' | 'eagle' | 'fox';

export interface NatureGuide {
  id: NatureGuideId;
  name: string;
  title: string;
  icon: string;
  color: string;
  themeClass: string;
  accent: string;
  description: string;
  focus: string;
  quote: string;
}

export const NATURE_GUIDES: NatureGuide[] = [
  {
    id: 'owl',
    name: 'Wise Owl',
    title: 'The Risk Auditor',
    icon: '🦉',
    color: 'from-amber-500 to-amber-700',
    themeClass: 'theme-owl',
    accent: '#d97706',
    description: 'Calculates downside risks, stress-tests constraints, and audits hidden assumptions.',
    focus: 'Stability, safety nets, caution, and avoiding blind spots.',
    quote: '"Before we leap across the canyon, let us measure the depth of the valley and check the safety of our wings."'
  },
  {
    id: 'eagle',
    name: 'Bold Eagle',
    title: 'The Horizon Visionary',
    icon: '🦅',
    color: 'from-teal-500 to-teal-700',
    themeClass: 'theme-eagle',
    accent: '#0891b2',
    description: 'Focuses on the 10,000-foot view, personal growth, freedom, and compounding opportunities.',
    focus: 'Personal growth, adventure, scalability, and long-term horizon.',
    quote: '"The storm does not threaten the eagle; it is the wind that carries us to higher peaks. Look past immediate hurdles."'
  },
  {
    id: 'fox',
    name: 'Clever Fox',
    title: 'The Tactical Pathfinder',
    icon: '🦊',
    color: 'from-emerald-500 to-emerald-700',
    themeClass: 'theme-fox',
    accent: '#16a34a',
    description: 'Finds creative workarounds, tactical shortcuts, and the path of least resistance.',
    focus: 'Flexibility, agility, hidden alternatives, and speed of action.',
    quote: '"If the front gate is locked, find the side window. No path is a straight line, and every detour holds a shortcut."'
  }
];

export default function NatureGuideSelector({
  onSelect,
  activeId,
}: {
  onSelect?: (guideId: NatureGuideId) => void;
  activeId?: NatureGuideId;
}) {
  const [selected, setSelected] = useState<NatureGuideId>('owl');

  useEffect(() => {
    const saved = localStorage.getItem('crossroads_nature_guide') as NatureGuideId;
    if (saved && ['owl', 'eagle', 'fox'].includes(saved)) {
      setSelected(saved);
      if (onSelect) onSelect(saved);
    } else {
      localStorage.setItem('crossroads_nature_guide', 'owl');
      if (onSelect) onSelect('owl');
    }
  }, [onSelect]);

  const handleSelect = (id: NatureGuideId) => {
    setSelected(id);
    localStorage.setItem('crossroads_nature_guide', id);
    // Dispatch custom event so the global layout can detect the theme class change
    window.dispatchEvent(new CustomEvent('nature-guide-change', { detail: id }));
    if (onSelect) onSelect(id);
  };

  const activeGuide = NATURE_GUIDES.find((g) => g.id === (activeId || selected)) || NATURE_GUIDES[0];

  return (
    <div className="space-y-5" style={{ color: 'var(--body)' }}>
      <div>
        <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: 'var(--muted)' }}>
          Choose your Woodland Guide
        </label>
        <p className="text-xs leading-normal mb-3" style={{ color: 'var(--body)' }}>
          Your guide anchors your decision environment, adjusting the accent themes and the AI commentary tone.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {NATURE_GUIDES.map((g) => {
          const isSelected = g.id === (activeId || selected);
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelect(g.id)}
              className="flex items-start gap-3 rounded-xl p-4 text-left transition-all duration-300 border cursor-pointer select-none bg-white/40 hover:bg-white/90"
              style={{
                borderColor: isSelected ? g.accent : 'var(--border)',
                boxShadow: isSelected ? `0 4px 20px ${g.accent}15` : 'none',
              }}
            >
              <span className="text-2xl">{g.icon}</span>
              <div className="space-y-0.5">
                <span className="block text-xs font-bold" style={{ color: 'var(--ink)' }}>{g.name}</span>
                <span className="block text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                  {g.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Guide description detail */}
      <div
        className="rounded-xl p-4.5 space-y-3 border transition-colors duration-300 bg-white/30"
        style={{ borderColor: `${activeGuide.accent}20` }}
      >
        <div className="flex items-center gap-2 text-xs font-bold" style={{ color: activeGuide.accent }}>
          {activeGuide.id === 'owl' && <Shield className="h-4 w-4 shrink-0" />}
          {activeGuide.id === 'eagle' && <Sparkles className="h-4 w-4 shrink-0" />}
          {activeGuide.id === 'fox' && <Zap className="h-4 w-4 shrink-0" />}
          <span>{activeGuide.name} Advice Paradigm</span>
        </div>

        <p className="text-xs leading-relaxed font-medium" style={{ color: 'var(--ink)' }}>
          {activeGuide.description}
        </p>

        <div className="text-[11px] leading-relaxed" style={{ color: 'var(--body)' }}>
          <strong style={{ color: 'var(--ink)' }}>Key Focus:</strong> {activeGuide.focus}
        </div>

        <div
          className="pt-2 border-t text-xs font-serif italic leading-relaxed"
          style={{ borderColor: `${activeGuide.accent}10`, color: 'var(--body)' }}
        >
          {activeGuide.quote}
        </div>
      </div>
    </div>
  );
}

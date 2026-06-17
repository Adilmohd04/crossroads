'use client';

import React from 'react';
import { FlaskConical, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';

interface WhatIfPanelProps {
  selectedConstraints: string[];
  toggledOffConstraints: string[];
  onToggle: (constraint: string) => void;
}

export default function WhatIfPanel({
  selectedConstraints,
  toggledOffConstraints,
  onToggle,
}: WhatIfPanelProps) {
  if (!selectedConstraints || selectedConstraints.length === 0) return null;

  const removedCount = toggledOffConstraints.length;

  return (
    <div className="rounded-2xl p-5 md:p-6 space-y-4"
      style={{
        background: 'rgba(139, 92, 246, 0.05)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        backdropFilter: 'blur(16px)',
      }}>

      {/* Header */}
      <div className="flex items-start gap-3 pb-4"
        style={{ borderBottom: '1px solid rgba(139, 92, 246, 0.15)' }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
          }}>
          <FlaskConical className="h-4.5 w-4.5" style={{ color: '#a78bfa' }} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
              What-If Constraint Simulator
            </h4>
            {removedCount > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold"
                style={{
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.35)',
                  color: '#a78bfa',
                }}>
                <Sparkles className="h-2.5 w-2.5" />
                {removedCount} constraint{removedCount > 1 ? 's' : ''} simulated off
              </div>
            )}
          </div>
          <p className="mt-1 text-[11px] font-medium leading-relaxed" style={{ color: '#5c6b8c' }}>
            Toggle off constraints to discover which limitation is actually blocking your best outcome.
          </p>
        </div>
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2.5">
        {selectedConstraints.map((constraint) => {
          const isOff = toggledOffConstraints.includes(constraint);
          return (
            <button
              key={constraint}
              onClick={() => onToggle(constraint)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
              style={{
                background: isOff
                  ? 'rgba(139, 92, 246, 0.18)'
                  : 'rgba(13, 17, 32, 0.6)',
                border: isOff
                  ? '1px solid rgba(139, 92, 246, 0.4)'
                  : '1px solid rgba(99, 116, 163, 0.2)',
                color: isOff ? '#c4b5fd' : '#9ba8c9',
                boxShadow: isOff ? '0 0 14px rgba(139, 92, 246, 0.2)' : 'none',
                transform: isOff ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {isOff
                ? <ToggleRight className="h-4 w-4" style={{ color: '#a78bfa' }} />
                : <ToggleLeft className="h-4 w-4" style={{ color: '#5c6b8c' }} />
              }
              <span>{constraint}</span>
              {isOff && (
                <span className="text-[9px] font-bold uppercase tracking-wider rounded px-1.5 py-0.5"
                  style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#a78bfa' }}>
                  OFF
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

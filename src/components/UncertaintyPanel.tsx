'use client';

import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface UncertaintyPanelProps {
  disclosure: string;
}

export default function UncertaintyPanel({ disclosure }: UncertaintyPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'rgba(13, 17, 32, 0.7)',
        border: '1px solid rgba(99, 116, 163, 0.2)',
        backdropFilter: 'blur(12px)',
      }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-5 text-left transition-colors cursor-pointer"
        style={{ background: 'transparent' }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99, 116, 163, 0.06)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: 'rgba(99, 116, 163, 0.12)', border: '1px solid rgba(99, 116, 163, 0.2)' }}>
            <ShieldAlert className="h-4 w-4" style={{ color: '#9ba8c9' }} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ba8c9' }}>
              Uncertainty &amp; Boundaries
            </h4>
            <p className="text-[10px] font-medium leading-none mt-1" style={{ color: '#5c6b8c' }}>
              What the simulator cannot verify about your situation
            </p>
          </div>
        </div>
        {isOpen
          ? <ChevronUp className="h-4 w-4" style={{ color: '#5c6b8c' }} />
          : <ChevronDown className="h-4 w-4" style={{ color: '#5c6b8c' }} />
        }
      </button>

      {isOpen && (
        <div className="p-5 pt-0 space-y-4"
          style={{ borderTop: '1px solid rgba(99, 116, 163, 0.15)' }}>
          <p className="text-xs font-medium leading-relaxed pt-4" style={{ color: '#9ba8c9' }}>
            {disclosure}
          </p>
          <div className="rounded-xl p-4 text-[11px] leading-relaxed"
            style={{
              background: 'rgba(59, 111, 255, 0.06)',
              border: '1px solid rgba(59, 111, 255, 0.2)',
              color: '#7ba7ff',
            }}>
            <strong>Responsible AI Disclosure:</strong> Crossroads is a decision-support assistant designed to surface implicit assumptions and simulate hypothetical futures. It cannot replace human judgment, professional financial planning, or career counseling. The final choice always remains yours.
          </div>
        </div>
      )}
    </div>
  );
}

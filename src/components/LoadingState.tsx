'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Compass, CheckCircle2, Loader2, Globe } from 'lucide-react';
import { AnalysisResult } from '../lib/types';

const MESSAGES = [
  'Surfacing hidden assumptions in your framing...',
  'Modeling 30, 60, and 90-day realistic narratives...',
  'Calculating constraints boundary intersections...',
  'Weighing options against your priority values...',
  'Identifying non-obvious hidden costs and risk vectors...',
  'Honoring uncertainty and framing choices with clarity...',
];

export default function LoadingState({
  message,
  analysis,
  onComplete,
}: {
  message?: string;
  analysis?: AnalysisResult;
  onComplete?: () => void;
}) {
  const [msgIdx, setMsgIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  // Animation states for research logs
  const [visibleQueries, setVisibleQueries] = useState<number[]>([]);
  const [currentChecking, setCurrentChecking] = useState<number | null>(null);
  const [statusText, setStatusText] = useState('Initiating AI search agent...');

  // Standard rotating messages if no analysis
  useEffect(() => {
    if (analysis) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
        setVisible(true);
      }, 300);
    }, 3200);
    return () => clearInterval(interval);
  }, [analysis]);

  // Sequential research query animator
  useEffect(() => {
    if (!analysis || !onComplete) return;

    const queries = analysis.agent_search_queries || [];
    if (queries.length === 0) {
      // No search queries, complete instantly
      onComplete();
      return;
    }

    const statuses = [
      '🔍 Accessing live educational tuition databases...',
      '🔍 Querying global market compensations...',
      '🔍 Indexing location safety & rent profiles...',
      '🔍 Cross-checking real-world opportunity parameters...',
    ];

    let queryIdx = 0;
    
    const runSequence = () => {
      if (queryIdx < queries.length) {
        const idx = queryIdx;
        setCurrentChecking(idx);
        setVisibleQueries((prev) => [...prev, idx]);
        setStatusText(statuses[idx % statuses.length] || 'Verifying metrics...');

        // Wait 1200ms to simulate research, then mark as checked
        setTimeout(() => {
          setCurrentChecking(null);
          queryIdx++;
          // Wait 600ms before starting next query
          setTimeout(runSequence, 600);
        }, 1200);
      } else {
        // All done
        setStatusText('✅ Research complete! Synthesizing cognitive tradeoff models...');
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    };

    // Start sequence after 800ms delay
    const startTimeout = setTimeout(runSequence, 800);
    return () => clearTimeout(startTimeout);
  }, [analysis, onComplete]);

  if (analysis) {
    const queries = analysis.agent_search_queries || [];
    const sources = analysis.agent_sources || [];

    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-6"
        style={{
          background: 'rgba(250, 249, 245, 0.97)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
        }}>

        {/* Ambient background glows */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #f59e0b 0%, #3b82f6 50%, transparent 70%)' }} />
        </div>

        <div className="w-full max-w-lg relative z-10 flex flex-col gap-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 border border-amber-200 text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              Agent Research Pipeline
            </div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
              Web Grounding Diagnostics
            </h2>
            <p className="text-[11px] font-medium text-slate-500 max-w-sm mx-auto leading-relaxed">
              Verifying real-world variables, tuition baselines, cost indexes, and market compensations.
            </p>
          </div>

          {/* Diagnostic Console Box */}
          <div className="rounded-2xl p-5 md:p-6 border border-slate-200 bg-white shadow-[0_12px_40px_rgba(17,24,39,0.1)] ">
            {/* Status Line */}
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-700 border-b border-slate-200 pb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-slate-600">{statusText}</span>
            </div>

            {/* Terminal Lines */}
            <div className="space-y-3 font-mono text-[11px] text-left leading-relaxed max-h-[280px] overflow-y-auto pr-1">
              {queries.map((q, idx) => {
                const isVisible = visibleQueries.includes(idx);
                const isChecking = currentChecking === idx;
                const isResolved = isVisible && !isChecking;

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-2.5 rounded-lg bg-slate-50 border border-slate-200/60 p-3"
                  >
                    {isChecking ? (
                      <Loader2 className="h-3.5 w-3.5 text-indigo-600 animate-spin mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 mt-0.5 shrink-0" />
                    )}
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">SEARCH: &ldquo;{q}&rdquo;</span>
                        <span className={`text-[8px] font-black uppercase tracking-wider ${isChecking ? 'text-indigo-600' : 'text-emerald-700'}`}>
                          {isChecking ? 'RUNNING' : 'RESOLVED'}
                        </span>
                      </div>
                      {isResolved && sources[idx] && (
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 hover:text-slate-600 transition-colors">
                          <Globe className="h-2.5 w-2.5" />
                          <span className="truncate max-w-[280px]">Grounded via: {sources[idx].title}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{ background: '#f4f3ef' }}>

      <div className="flex flex-col items-center max-w-md text-center">
        {/* Nature-themed loading indicator */}
        <div className="relative flex h-24 w-24 items-center justify-center mb-8">
          <div className="absolute inset-0 rounded-full animate-breathe"
            style={{ background: '#d8f3dc', border: '1px solid #b7d4c4' }} />
          <div className="absolute h-16 w-16 rounded-full"
            style={{ background: '#fff', border: '1px solid #dedad2' }} />
          <Compass className="h-8 w-8 animate-spin-slow relative z-10" style={{ color: '#2d6a4f' }} />
        </div>

        <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', fontWeight: 400, color: '#1b1b18', marginBottom: '12px' }}>
          Analyzing your crossroads
        </h2>

        <p style={{
          fontSize: '15px', color: '#2d6a4f', fontWeight: 500,
          minHeight: '22px', transition: 'opacity 0.3s ease',
          opacity: visible ? 1 : 0,
        }}>
          {message || MESSAGES[msgIdx]}
        </p>

        {/* Progress bar */}
        <div style={{ width: '200px', height: '4px', borderRadius: '100px', background: '#eae8e1', marginTop: '32px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '100px', background: '#2d6a4f',
            width: `${((msgIdx + 1) / MESSAGES.length) * 100}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        <p style={{ marginTop: '24px', fontSize: '14px', color: '#7c7b72', lineHeight: 1.6, maxWidth: '360px' }}>
          We&apos;re surfacing hidden assumptions, modeling scenarios, and building your clarity workspace.
        </p>
      </div>
    </div>
  );
}

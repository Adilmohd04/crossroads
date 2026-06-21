'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, ArrowDown, CheckCircle2 } from 'lucide-react';
import { IntakeData, ActionPlanResult } from '../lib/types';

interface CommitmentMomentProps {
  intake: IntakeData;
  actionPlan: ActionPlanResult;
  onStart: () => void;
  isStarted: boolean;
}

export default function CommitmentMoment({
  intake,
  actionPlan,
  onStart,
  isStarted,
}: CommitmentMomentProps) {
  const [timestamp, setTimestamp] = useState<string | null>(null);

  useEffect(() => {
    // Check if it was already committed
    try {
      const historyJson = localStorage.getItem('crossroads_journal_history');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        const match = history.find((h: any) => h.decision === intake.decision && h.chosen_path === actionPlan.chosen_path);
        if (match && match.committedAt) {
          setTimestamp(match.committedAt);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [intake, actionPlan]);

  const handleCommit = () => {
    const timeStr = new Date().toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    setTimestamp(timeStr);
    
    // Write timestamp to localStorage entry
    try {
      const historyJson = localStorage.getItem('crossroads_journal_history');
      if (historyJson) {
        const history = JSON.parse(historyJson);
        const match = history.find(
          (h: any) => h.decision === intake.decision && h.chosen_path === actionPlan.chosen_path
        );
        if (match) {
          match.committedAt = timeStr;
          localStorage.setItem('crossroads_journal_history', JSON.stringify(history));
        }
      }
    } catch (e) {
      console.error(e);
    }

    onStart();
  };

  const day1Action = actionPlan.plan[0];

  return (
    <div
      className="w-full glass p-6 md:p-10 relative overflow-hidden transition-all duration-500"
      style={{
        border: '2px double rgba(10, 60, 47, 0.25)',
        boxShadow: isStarted 
          ? '0 4px 20px rgba(10, 60, 47, 0.02)' 
          : '0 8px 32px rgba(10, 60, 47, 0.05)',
      }}
    >
      {/* Background glow meshes */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Badge */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <span className="text-[10px] font-black tracking-wider uppercase text-amber-800" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Path Commitment
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl text-emerald-950"
            style={{ fontFamily: "'Fraunces', serif" }}>
            You are starting on <span className="font-extrabold text-amber-800">&ldquo;{actionPlan.chosen_path}&rdquo;</span> today.
          </h2>
          <p className="text-xs font-semibold text-emerald-800">
            You have stopped analyzing. You are taking active control.
          </p>
        </div>

        {/* Fear reframing */}
        {intake.fear && (
          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/12 text-left" style={{ background: '#fdfbf7', border: '1.5px solid rgba(10,60,47,0.1)' }}>
            <p className="text-[10px] font-black tracking-wider uppercase text-emerald-800 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Reframing Your Stated Fear
            </p>
            <p className="text-xs font-semibold italic text-slate-700 leading-relaxed">
              &ldquo;{intake.fear}&rdquo;
            </p>
            <p className="text-[11px] font-semibold text-amber-800 mt-2 leading-normal">
              💡 Your 7-day action roadmap has specific tasks built directly into it to address this fear and establish recovery nets.
            </p>
          </div>
        )}

        {/* Prominent Day 1 action */}
        <div className="rounded-2xl p-5 md:p-6 text-left"
          style={{
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
          }}>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-400/10 px-2.5 py-0.5 rounded-full" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Day 1 Focus
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-widest font-mono">
              Immediate Action
            </span>
          </div>
          <h4 className="text-base font-bold text-slate-800 leading-relaxed mb-3">
            {day1Action.action}
          </h4>
          <p className="text-[11px] font-medium text-slate-500 italic border-t border-amber-500/10 pt-3">
            <strong>Why now:</strong> {day1Action.why_first}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          {timestamp ? (
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2.5 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="h-4 w-4" />
              <span>Committed at {timestamp}</span>
            </div>
          ) : (
            <button
              onClick={handleCommit}
              className="wood-btn"
              style={{ padding: '12px 28px' }}
            >
              I&apos;m starting now
            </button>
          )}

          {!isStarted && !timestamp ? (
            <button
              onClick={onStart}
              className="wood-btn-light"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Skip commitment & view details</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          ) : (
            isStarted && (
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                <span>Timeline Unlocked Below</span>
                <ArrowDown className="h-3 w-3" />
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

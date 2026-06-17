'use client';

import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import {
  BookOpen, Calendar, Compass, Trash2, CheckCircle2,
  MessageSquare, PenLine, Sparkles
} from 'lucide-react';
import { DecisionJournalEntry } from '../../lib/types';

export default function JournalPage() {
  const [history, setHistory] = useState<DecisionJournalEntry[]>([]);
  const [activeReflectId, setActiveReflectId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crossroads_journal_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load journal history', e);
    }
  }, []);

  const handleDeleteEntry = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('crossroads_journal_history', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Clear your entire decision journal? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('crossroads_journal_history');
    }
  };

  const handleSaveReflection = (id: string) => {
    const updated = history.map((entry) =>
      entry.id === id ? { ...entry, reflections: reflectionText } : entry
    );
    setHistory(updated);
    localStorage.setItem('crossroads_journal_history', JSON.stringify(updated));
    setActiveReflectId(null);
    setReflectionText('');
  };

  const startReflection = (entry: DecisionJournalEntry) => {
    setActiveReflectId(entry.id);
    setReflectionText(entry.reflections || '');
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-fade-up">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6"
          style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.2)' }}>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #3b6fff, #8b5cf6)',
                  boxShadow: '0 4px 16px rgba(59, 111, 255, 0.35)',
                }}>
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
              <h2 className="text-2xl font-black tracking-tight" style={{ color: '#f0f4ff' }}>
                Decision Journal
              </h2>
            </div>
            <p className="text-sm font-medium" style={{ color: '#5c6b8c' }}>
              Your persistent second-brain — every committed decision, logged for reflection.
            </p>
          </div>

          {history.length > 0 && (
            <button onClick={handleClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                color: '#fb7185',
              }}>
              <Trash2 className="h-3.5 w-3.5" />
              Clear History
            </button>
          )}
        </div>

        {/* ── CONTENT ── */}
        {history.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl mx-auto max-w-xl space-y-6"
            style={{
              background: 'rgba(13, 17, 32, 0.6)',
              border: '1px solid rgba(99, 116, 163, 0.15)',
              backdropFilter: 'blur(16px)',
            }}>
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 111, 255, 0.2), rgba(139, 92, 246, 0.2))',
                  border: '1px solid rgba(59, 111, 255, 0.25)',
                }}>
                <BookOpen className="h-7 w-7" style={{ color: '#7ba7ff' }} />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4" style={{ color: '#f59e0b' }} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold" style={{ color: '#f0f4ff' }}>Journal is Empty</h3>
              <p className="text-sm font-medium max-w-xs leading-relaxed" style={{ color: '#5c6b8c' }}>
                When you commit to a path in the Decision Cockpit, Crossroads logs your choice here for future reflection.
              </p>
            </div>
            <a href="/"
              className="btn-primary">
              <Compass className="h-4 w-4" />
              Analyze a Decision
            </a>
          </div>
        ) : (
          /* Entries */
          <div className="space-y-5">
            {history.map((entry, entryIdx) => (
              <div
                key={entry.id}
                className="rounded-2xl p-5 md:p-6 space-y-4 transition-all duration-300 relative group animate-fade-up"
                style={{
                  background: 'rgba(13, 17, 32, 0.72)',
                  border: '1px solid rgba(99, 116, 163, 0.18)',
                  backdropFilter: 'blur(14px)',
                  animationDelay: `${entryIdx * 0.05}s`,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 116, 163, 0.35)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99, 116, 163, 0.18)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  style={{
                    background: 'rgba(244, 63, 94, 0.08)',
                    border: '1px solid rgba(244, 63, 94, 0.15)',
                    color: '#fb7185',
                  }}
                  title="Delete Entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                {/* Entry Meta */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold"
                  style={{ color: '#5c6b8c' }}>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{entry.date}</span>
                  </div>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                    style={{
                      background: 'rgba(59, 111, 255, 0.12)',
                      border: '1px solid rgba(59, 111, 255, 0.2)',
                      color: '#7ba7ff',
                    }}>
                    Committed
                  </span>
                </div>

                {/* Decision title */}
                <h3 className="text-base font-extrabold leading-snug max-w-[85%]"
                  style={{ color: '#f0f4ff' }}>
                  {entry.decision}
                </h3>

                {/* Committed path + confidence */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl p-4"
                  style={{
                    background: 'rgba(8, 11, 20, 0.5)',
                    border: '1px solid rgba(99, 116, 163, 0.12)',
                  }}>
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#3a4a6b' }}>
                      Committed Choice
                    </span>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: '#10b981' }} />
                      <span className="text-xs font-bold" style={{ color: '#34d399' }}>
                        {entry.chosen_path}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: '#3a4a6b' }}>
                      Commit Confidence
                    </span>
                    <div className="text-sm font-black mono-value" style={{
                      background: 'linear-gradient(90deg, #3b6fff, #8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}>
                      {entry.confidence}% Likely
                    </div>
                  </div>
                </div>

                {/* Options modeled */}
                <div className="text-[11px] font-semibold" style={{ color: '#5c6b8c' }}>
                  <span className="mr-1.5" style={{ color: '#3a4a6b' }}>Options modeled:</span>
                  {entry.options.join('  ·  ')}
                </div>

                {/* Reflections */}
                <div className="pt-3 space-y-3"
                  style={{ borderTop: '1px solid rgba(99, 116, 163, 0.12)' }}>
                  {entry.reflections ? (
                    <div className="rounded-xl p-4 space-y-2"
                      style={{
                        background: 'rgba(59, 111, 255, 0.06)',
                        border: '1px solid rgba(59, 111, 255, 0.2)',
                      }}>
                      <div className="flex items-center gap-1.5 text-xs font-bold"
                        style={{ color: '#7ba7ff' }}>
                        <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                        Reflection Note
                      </div>
                      <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>
                        {entry.reflections}
                      </p>
                      <button onClick={() => startReflection(entry)}
                        className="text-[10px] font-bold cursor-pointer transition-colors"
                        style={{ color: '#5c6b8c' }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#7ba7ff')}
                        onMouseLeave={e => (e.currentTarget.style.color = '#5c6b8c')}>
                        Edit Reflection ↗
                      </button>
                    </div>
                  ) : activeReflectId !== entry.id ? (
                    <button onClick={() => startReflection(entry)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                      style={{
                        background: 'rgba(99, 116, 163, 0.08)',
                        border: '1px solid rgba(99, 116, 163, 0.2)',
                        color: '#9ba8c9',
                      }}>
                      <PenLine className="h-3.5 w-3.5" />
                      Add Reflection Check-in
                    </button>
                  ) : null}

                  {activeReflectId === entry.id && (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold" style={{ color: '#9ba8c9' }}>
                        How is this choice panning out?
                      </label>
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Write notes about how this decision is working in real life. Are your assumptions holding true?"
                        rows={3}
                        className="field resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveReflection(entry.id)}
                          className="btn-primary py-2 text-xs">
                          Save Log
                        </button>
                        <button
                          onClick={() => { setActiveReflectId(null); setReflectionText(''); }}
                          className="btn-ghost text-xs">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

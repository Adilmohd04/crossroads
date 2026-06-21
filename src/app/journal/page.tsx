'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header';
import {
  BookOpen, Calendar, Compass, Trash2, CheckCircle2,
  MessageSquare, PenLine, Sparkles, Brain, AlertTriangle,
  TrendingUp, Shield, Zap, RefreshCw, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DecisionJournalEntry, DecisionDNA } from '../../lib/types';
import {
  getReflectionReminders,
  getLocalPatterns,
  generateDecisionDNA,
} from '../../lib/secondBrain';

export default function JournalPage() {
  const [history, setHistory] = useState<DecisionJournalEntry[]>([]);
  const [activeReflectId, setActiveReflectId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState<string>('');
  const [decisionDNA, setDecisionDNA] = useState<DecisionDNA | null>(null);
  const [isGeneratingDNA, setIsGeneratingDNA] = useState(false);
  const [dnaError, setDnaError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('crossroads_journal_history');
      if (saved) setHistory(JSON.parse(saved));
    } catch (e) {
      console.error('Failed to load journal history', e);
    }
    // Load cached DNA
    try {
      const cachedDNA = localStorage.getItem('crossroads_decision_dna');
      if (cachedDNA) setDecisionDNA(JSON.parse(cachedDNA));
    } catch (e) { /* ignore */ }
  }, []);

  const reflectionReminders = getReflectionReminders(history);
  const localPatterns = getLocalPatterns(history);

  const handleGenerateDNA = useCallback(async () => {
    if (history.length < 2) return;
    setIsGeneratingDNA(true);
    setDnaError('');
    try {
      const dna = await generateDecisionDNA(history);
      if (dna) {
        setDecisionDNA(dna);
        localStorage.setItem('crossroads_decision_dna', JSON.stringify(dna));
      }
    } catch (e) {
      setDnaError('Failed to generate profile. Try again.');
    } finally {
      setIsGeneratingDNA(false);
    }
  }, [history]);

  const handleDeleteEntry = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    setHistory(updated);
    localStorage.setItem('crossroads_journal_history', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm('Clear your entire decision journal? This cannot be undone.')) {
      setHistory([]);
      localStorage.removeItem('crossroads_journal_history');
      localStorage.removeItem('crossroads_decision_dna');
      setDecisionDNA(null);
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

  const sentimentColors = {
    positive: { bg: 'var(--green-dim)', border: 'rgba(34, 90, 61, 0.15)', text: 'var(--green)' },
    neutral: { bg: 'rgba(227, 222, 195, 0.18)', border: 'var(--border-light)', text: 'var(--muted)' },
    cautionary: { bg: 'var(--wood-soft)', border: 'rgba(184, 122, 76, 0.15)', text: 'var(--wood)' },
  };

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--canvas)' }}>
      <Header />
      <main className="flex-1">
        {/* redone header landscape background for journal */}
        <section style={{ 
          position: 'relative',
          padding: '80px 20px 100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, #e0f2fe 0%, #ffedd5 50%, var(--canvas) 100%)',
        }}>
          {/* Dawn sun */}
          <div style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '240px',
            height: '240px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #fffbeb 15%, rgba(234, 88, 12, 0.15) 60%, transparent 100%)',
            filter: 'blur(6px)',
            opacity: 0.85,
            zIndex: 1,
            pointerEvents: 'none',
          }} />

          {/* Layered Ridge SVG */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '80px', zIndex: 2, pointerEvents: 'none', opacity: 0.25 }}>
            <svg className="w-full h-full" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="none">
              <path d="M0,80 L0,40 Q150,55 280,30 Q410,5 580,35 Q750,65 920,20 Q1090,-25 1260,15 L1440,25 L1440,80 Z" fill="#1b4d3e" />
            </svg>
          </div>

          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50px', zIndex: 3, pointerEvents: 'none' }}>
            <svg className="w-full h-full" viewBox="0 0 1440 50" preserveAspectRatio="none" fill="none">
              <path d="M0,50 Q150,43 280,50 Q440,30 600,45 Q740,30 900,43 Q1060,30 1340,40 L1440,42 L1440,50 Z" fill="var(--canvas)" />
            </svg>
          </div>

          {/* Content */}
          <div style={{ width: '100%', maxWidth: '1000px', position: 'relative', zIndex: 10, textAlign: 'center' }}>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', color: 'var(--green)', fontWeight: 600, marginBottom: '16px' }}>
              Second Brain Journal
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--body)', maxWidth: '600px', margin: '0 auto' }}>
              Your persistent decision memory — compounding intelligence across every life crossroads.
            </p>
            {history.length > 0 && (
              <div className="flex justify-center mt-6">
                <button onClick={handleClearAll}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  style={{ background: 'rgba(155, 34, 38, 0.05)', border: '1px solid rgba(155, 34, 38, 0.15)', color: 'var(--error)' }}>
                  <Trash2 className="h-3.5 w-3.5" /> Clear History
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Content columns */}
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 animate-fade-up">

        {/* ═══ REFLECTION REMINDERS BANNER ═══ */}
        {reflectionReminders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--wood-soft)', border: '1px solid rgba(184, 122, 76, 0.15)', backdropFilter: 'none' }}>
            <div className="flex items-center gap-2">
              <Clock className="h-4.5 w-4.5" style={{ color: 'var(--wood)' }} />
              <h4 className="text-sm font-bold" style={{ color: 'var(--wood)' }}>
                Reflection Check-in Due
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black" style={{ background: 'var(--wood)', color: '#fff' }}>
                {reflectionReminders.length} pending
              </span>
            </div>
            <p className="text-xs font-medium" style={{ color: 'var(--body)' }}>
              Your second brain works best with feedback loops. These decisions are 30+ days old with no reflection logged.
            </p>
            <div className="flex flex-wrap gap-2">
              {reflectionReminders.map((r) => (
                <button key={r.entryId} onClick={() => {
                  const entry = history.find(h => h.id === r.entryId);
                  if (entry) startReflection(entry);
                }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  style={{ background: 'rgba(255, 255, 255, 0.6)', border: '1px solid rgba(184, 122, 76, 0.25)', color: 'var(--wood)' }}>
                  <PenLine className="h-3 w-3" />
                  <span className="truncate max-w-[200px]">{r.chosen_path}</span>
                  <span className="text-[9px] opacity-70">({r.overdueDays}d overdue)</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ═══ DECISION DNA PANEL ═══ */}
        {history.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass p-6 space-y-5 relative overflow-hidden"
            style={{ border: '2px double rgba(10, 60, 47, 0.2)' }}>
            
            <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none opacity-25"
              style={{ background: 'radial-gradient(circle at 100% 0%, var(--wood-soft), transparent 70%)' }} />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'var(--green-soft)', border: '1px solid var(--border-light)' }}>
                  <Brain className="h-4.5 w-4.5" style={{ color: 'var(--green)' }} />
                </div>
                <div>
                  <h4 className="text-sm font-bold" style={{ color: 'var(--ink)', fontFamily: "'Fraunces', serif" }}>Your Decision DNA</h4>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
                    What {history.length} decisions reveal about how you think
                  </p>
                </div>
              </div>
              <button onClick={handleGenerateDNA} disabled={isGeneratingDNA}
                className="wood-btn-light"
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw className={`h-3.5 w-3.5 ${isGeneratingDNA ? 'animate-spin' : ''}`} />
                {isGeneratingDNA ? 'Analyzing...' : decisionDNA ? 'Refresh' : 'Generate Profile'}
              </button>
            </div>

            {dnaError && (
              <p className="text-xs font-bold" style={{ color: 'var(--error)' }}>{dnaError}</p>
            )}

            {decisionDNA && (
              <div className="space-y-4 relative z-10">
                {/* Summary */}
                <div className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border-light)' }}>
                  {history.length < 5 && (
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#774936' }}>
                      ⚠️ Early pattern ({history.length} decisions) — treat as hypothesis, not conclusion
                    </p>
                  )}
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--body)' }}>
                    {decisionDNA.summary}
                  </p>
                </div>

                {/* Patterns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {decisionDNA.patterns.map((p, idx) => {
                    const colors = sentimentColors[p.sentiment] || sentimentColors.neutral;
                    return (
                      <div key={idx} className="rounded-xl p-3.5 space-y-1.5"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}>
                        <div className="flex items-center gap-1.5">
                          {p.sentiment === 'positive' && <TrendingUp className="h-3.5 w-3.5" style={{ color: colors.text }} />}
                          {p.sentiment === 'cautionary' && <AlertTriangle className="h-3.5 w-3.5" style={{ color: colors.text }} />}
                          {p.sentiment === 'neutral' && <Sparkles className="h-3.5 w-3.5" style={{ color: colors.text }} />}
                          <span className="text-[11px] font-bold" style={{ color: colors.text }}>{p.pattern}</span>
                        </div>
                        <p className="text-[10px] font-medium leading-relaxed" style={{ color: 'var(--body)' }}>{p.insight}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Blind Spot */}
                <div className="rounded-xl p-3.5 flex items-start gap-2.5"
                  style={{ background: 'rgba(155, 34, 38, 0.05)', border: '1px solid rgba(155, 34, 38, 0.15)' }}>
                  <Shield className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--error)' }}>Watch For</span>
                    <p className="text-[11px] font-medium leading-relaxed mt-0.5" style={{ color: 'var(--muted)' }}>
                      {decisionDNA.blind_spot}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!decisionDNA && !isGeneratingDNA && (
              <div className="text-center py-6">
                <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                  Click &ldquo;Generate Profile&rdquo; to analyze your decision-making patterns across all journal entries.
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══ LOCAL PATTERNS (always visible if 2+ entries) ═══ */}
        {localPatterns.length > 0 && !decisionDNA && (
          <div className="rounded-2xl p-5 space-y-3"
            style={{ background: 'var(--green-dim)', border: '1.5px solid rgba(34, 90, 61, 0.15)' }}>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: 'var(--green)' }} />
              <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Quick Patterns Detected</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {localPatterns.map((p, idx) => {
                const colors = sentimentColors[p.sentiment] || sentimentColors.neutral;
                return (
                  <div key={idx} className="rounded-lg p-3 text-xs"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}`, color: 'var(--body)' }}>
                    <span className="font-bold block mb-0.5" style={{ color: colors.text }}>{p.pattern}</span>
                    <span className="text-[10px] leading-relaxed">{p.insight}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ JOURNAL ENTRIES ═══ */}
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass mx-auto max-w-xl space-y-6"
            style={{ border: '2px double rgba(10, 60, 47, 0.25)' }}>
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl mx-auto"
                style={{ background: 'var(--green-soft)', border: '1.5px solid var(--border)' }}>
                <Brain className="h-7 w-7" style={{ color: 'var(--green)' }} />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-4 w-4" style={{ color: 'var(--green)' }} />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold" style={{ color: 'var(--ink)', fontFamily: "'Fraunces', serif" }}>Your Second Brain is Empty</h3>
              <p className="text-sm font-medium max-w-xs leading-relaxed" style={{ color: 'var(--muted)' }}>
                Each decision you commit builds your personal intelligence. After 2+ entries, pattern recognition activates and your brain starts learning who you are.
              </p>
            </div>
            <a href="/" className="wood-btn">
              <Compass className="h-4 w-4" /> Analyze Your First Decision
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                Decision Memory ({history.length} {history.length === 1 ? 'entry' : 'entries'})
              </h3>
            </div>

            {history.map((entry, entryIdx) => {
              const hasReminder = reflectionReminders.some(r => r.entryId === entry.id);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: entryIdx * 0.04 }}
                  className="glass p-5 md:p-6 space-y-4 relative group"
                  style={{
                    background: '#fdfbf7',
                    borderColor: hasReminder ? 'rgba(184, 122, 76, 0.4)' : 'rgba(10, 60, 47, 0.15)',
                    borderWidth: '2px',
                    borderStyle: 'double',
                    boxShadow: hasReminder ? '0 4px 20px rgba(184, 122, 76, 0.06)' : 'var(--shadow)',
                  }}
                >
                  {/* Delete button */}
                  <button onClick={() => handleDeleteEntry(entry.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                    style={{ background: 'rgba(155, 34, 38, 0.05)', border: '1px solid rgba(155, 34, 38, 0.15)', color: 'var(--error)' }}
                    title="Delete Entry">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  {/* Reminder badge */}
                  {hasReminder && (
                    <div className="absolute top-4 right-14 flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold animate-pulse"
                      style={{ background: 'var(--wood-soft)', border: '1px solid rgba(184, 122, 76, 0.25)', color: 'var(--wood)' }}>
                      <Clock className="h-2.5 w-2.5" /> Reflection Due
                    </div>
                  )}

                  {/* Entry Meta */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold" style={{ color: 'var(--muted)' }}>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{entry.date}</span>
                    </div>
                    <span>·</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider"
                      style={{ background: 'var(--green-soft)', border: '1px solid var(--border-light)', color: 'var(--green)' }}>
                      Committed
                    </span>
                    {entry.category && (
                      <>
                        <span>·</span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold capitalize"
                          style={{ background: 'var(--green-dim)', border: '1px solid rgba(34, 90, 61, 0.12)', color: 'var(--green)' }}>
                          {entry.category}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Decision title */}
                  <h3 className="text-base font-extrabold leading-snug max-w-[85%]" style={{ color: 'var(--ink)' }}>
                    {entry.decision}
                  </h3>

                  {/* Committed path — prominent */}
                  <div style={{ background: '#f0fdf4', border: '1px solid #d1e7dd', borderRadius: '12px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <CheckCircle2 style={{ width: '16px', height: '16px', color: '#2d6a4f', flexShrink: 0 }} />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
                        You chose
                      </span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#1b1b18', marginBottom: '4px' }}>
                      {entry.chosen_path}
                    </p>
                    <p style={{ fontSize: '12px', color: '#7c7b72' }}>
                      Committed at {entry.confidence}% confidence · {entry.date}
                    </p>
                  </div>

                  {/* What was rejected */}
                  {entry.options && entry.options.filter(o => o !== entry.chosen_path).length > 0 && (
                    <div style={{ fontSize: '12px', color: '#7c7b72' }}>
                      <span style={{ fontWeight: 600 }}>Paths not taken: </span>
                      {entry.options.filter(o => o !== entry.chosen_path).join(' · ')}
                    </div>
                  )}

                  {/* Values at time of decision */}
                  {entry.values && entry.values.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {entry.values.slice(0, 4).map((v, vi) => (
                        <span key={vi} className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border-light)', color: 'var(--body)' }}>
                          #{vi + 1} {v}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Reflections */}
                  <div className="pt-3 space-y-3" style={{ borderTop: '1px solid var(--border-light)' }}>
                    {entry.reflections ? (
                      <div className="rounded-xl p-4 space-y-2"
                        style={{ background: 'var(--green-dim)', border: '1px solid rgba(34, 90, 61, 0.15)' }}>
                        <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: 'var(--green)' }}>
                          <MessageSquare className="h-3.5 w-3.5 shrink-0" /> Reflection Note
                        </div>
                        <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--body)' }}>{entry.reflections}</p>
                        <button onClick={() => startReflection(entry)}
                          className="text-[10px] font-bold cursor-pointer transition-colors" style={{ color: 'var(--muted)' }}>
                          Edit Reflection ↗
                        </button>
                      </div>
                    ) : activeReflectId !== entry.id ? (
                      <button onClick={() => startReflection(entry)}
                        className="wood-btn-light"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <PenLine className="h-3.5 w-3.5" />
                        {hasReminder ? 'Write Reflection (30 days overdue)' : 'Add Reflection Check-in'}
                      </button>
                    ) : null}

                    {activeReflectId === entry.id && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold" style={{ color: 'var(--body)' }}>
                          How is this choice working out? What would you tell past-you?
                        </label>
                        <textarea
                          value={reflectionText}
                          onChange={(e) => setReflectionText(e.target.value)}
                          placeholder="Was the assumption the AI surfaced correct? Are the hidden costs showing up? What surprised you?"
                          rows={3}
                          className="parchment-input resize-none"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveReflection(entry.id)} className="wood-btn py-2 text-xs">Save Log</button>
                          <button onClick={() => { setActiveReflectId(null); setReflectionText(''); }} className="wood-btn-light text-xs">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

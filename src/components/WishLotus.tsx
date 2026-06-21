'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Send, Sparkles, Beaker, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ReleasedLotus {
  id: number;
  text: string;
  top: number;
  speed: number;
  biasLabel?: string;
  biasExplanation?: string;
}

const BIAS_PATTERNS = [
  {
    label: 'Anticipatory Regret',
    keywords: ['what if', 'what if i\'m wrong', 'regret', 'later regret', 'future me'],
    explanation: 'You\'re pre-living a future feeling of regret. The question isn\'t "will I regret it?" — it\'s "which regret can I live with?"'
  },
  {
    label: 'Loss Aversion',
    keywords: ['lose', 'losing', 'can\'t afford', 'too expensive', 'waste money', 'cost', 'waste'],
    explanation: 'Losses feel twice as painful as gains feel good. You\'re overweighing what you might lose vs what you might gain.'
  },
  {
    label: 'Catastrophizing',
    keywords: ['what if i fail', 'worst case', 'disaster', 'terrible', 'ruin', 'destroy', 'fall apart', 'nightmare'],
    explanation: 'Your brain is projecting the worst possible outcome. Most fears never materialize — and when they do, you handle them better than you expect.'
  },
  {
    label: 'Social Comparison Bias',
    keywords: ['everyone else', 'people my age', 'behind', 'compared to', 'they have', 'others'],
    explanation: 'You\'re measuring your behind-the-scenes against everyone else\'s highlight reel. Comparison is the thief of joy.'
  },
  {
    label: 'Sunk Cost Fallacy',
    keywords: ['already invested', 'can\'t waste', 'too much time', 'already spent', 'can\'t give up', 'walk away'],
    explanation: 'Past investment doesn\'t justify future commitment. Ask: "If I had never started, would I start today?"'
  },
  {
    label: 'Status Quo Bias',
    keywords: ['too late', 'already decided', 'can\'t change', 'stuck', 'no choice', 'too far', 'late'],
    explanation: 'You believe your path is fixed. Most doors are not locked — you just haven\'t tried the handle.'
  },
  {
    label: 'Social Conformity',
    keywords: ['what will people think', 'disappoint', 'let them down', 'expectations', 'others think', 'family says', 'friends will'],
    explanation: 'You\'re prioritizing external approval over internal alignment. The people who matter won\'t mind, and the people who mind don\'t matter.'
  },
  {
    label: 'Analysis Paralysis',
    keywords: ['need more info', 'not ready', 'don\'t know enough', 'research more', 'wait until', 'not sure yet', 'too many options'],
    explanation: 'More information rarely makes the decision easier — it just expands the decision space. You know enough to choose.'
  },
  {
    label: 'Scarcity Bias',
    keywords: ['only chance', 'last opportunity', 'never again', 'one shot', 'once in a lifetime'],
    explanation: 'Rare opportunities feel more valuable than they are. There will always be another door — the question is whether this one aligns with you.'
  },
  {
    label: 'Impostor Syndrome',
    keywords: ['not good enough', 'unqualified', 'don\'t belong', 'fake', 'fraud', 'not ready for this'],
    explanation: 'Competence is not the absence of doubt — it\'s acting despite it. You were chosen or considered for a reason.'
  },
  {
    label: 'Overchoice / Decision Fatigue',
    keywords: ['too many options', 'overwhelmed', 'can\'t decide', 'paralyzed', 'too much', 'confused'],
    explanation: 'More options don\'t lead to better decisions — they lead to more regret about the ones you don\'t pick. Narrow to 2-3 real paths.'
  },
  {
    label: 'Halo Effect',
    keywords: ['perfect', 'ideal', 'dream', 'amazing opportunity', 'too good'],
    explanation: 'One positive attribute is coloring your entire view. No option is all good or all bad — examine the trade-offs separately.'
  },
];

const DEMO_WORRIES = [
  'What if I regret my choice later?',
  'I can\'t afford to make a mistake',
  'Everyone else seems to know what they\'re doing',
  'What will my family think?',
  'I\'ve already invested too much time to change now',
];

function detectBias(text: string) {
  const lower = text.toLowerCase();
  for (const pattern of BIAS_PATTERNS) {
    if (pattern.keywords.some(k => lower.includes(k))) {
      return { label: pattern.label, explanation: pattern.explanation };
    }
  }
  return null;
}

export default function WishLotus() {
  const [worryInput, setWorryInput] = useState('');
  const [released, setReleased] = useState<ReleasedLotus[]>([]);
  const [showMessage, setShowMessage] = useState(false);
  const [showJournalSaved, setShowJournalSaved] = useState(false);

  const biasResult = useMemo(() => {
    if (worryInput.trim().length < 5) return null;
    return detectBias(worryInput);
  }, [worryInput]);

  const handleRelease = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!worryInput.trim()) return;

    const bias = detectBias(worryInput);

    const newLotus: ReleasedLotus = {
      id: Date.now(),
      text: worryInput.trim(),
      top: 10 + Math.random() * 50,
      speed: 14 + Math.random() * 6,
      biasLabel: bias?.label,
      biasExplanation: bias?.explanation,
    };

    setReleased((prev) => [...prev, newLotus]);
    setWorryInput('');

    // Save to journal
    try {
      const stored = localStorage.getItem('crossroads_worries');
      const worries = stored ? JSON.parse(stored) : [];
      worries.push({
        id: newLotus.id,
        text: newLotus.text,
        biasLabel: bias?.label || null,
        biasExplanation: bias?.explanation || null,
        releasedAt: new Date().toISOString(),
      });
      localStorage.setItem('crossroads_worries', JSON.stringify(worries));
      setShowJournalSaved(true);
      setTimeout(() => setShowJournalSaved(false), 4000);
    } catch {}

    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4500);
    setTimeout(() => {
      setReleased((prev) => prev.filter((l) => l.id !== newLotus.id));
    }, newLotus.speed * 1000);
  }, [worryInput]);

  const loadDemoWorry = useCallback(() => {
    const random = DEMO_WORRIES[Math.floor(Math.random() * DEMO_WORRIES.length)];
    setWorryInput(random);
  }, []);

  return (
    <div className="relative">
      {/* Stream overlay for drifting lotus flowers */}
      <div className="fixed bottom-[80px] left-0 w-full pointer-events-none z-50 overflow-hidden h-[120px]">
        <AnimatePresence>
          {released.map((l) => (
            <div
              key={l.id}
              className="absolute left-0 flex flex-col items-center"
              style={{
                top: `${l.top}%`,
                animation: `lotus-drift ${l.speed}s linear forwards`,
              }}
            >
              <div className="flex flex-col items-center drop-shadow-[0_4px_12px_rgba(244,63,94,0.35)]">
                <svg width="40" height="28" viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19C10 21 26 21 32 19C28 17.5 8 17.5 4 19Z" fill="#0d9488" opacity="0.85" />
                  <path d="M18 2C15 6 10 9 6 14C11 15 16 14 18 11C20 14 25 15 30 14C26 9 21 6 18 2Z" fill="#fbcfe8" opacity="0.9" />
                  <path d="M18 6C16 9 12 11 9 15C13 16 16 15 18 13C20 15 23 16 27 15C24 11 20 9 18 6Z" fill="#f43f5e" />
                  <circle cx="18" cy="12" r="2" fill="#fbbf24" />
                </svg>
                <div className="mt-1 max-w-[100px] bg-white/95 backdrop-blur-[4px] text-[8px] text-teal-900 font-bold py-0.5 px-2 rounded-full border border-teal-500/20 shadow-sm truncate">
                  {l.text}
                </div>
                {l.biasLabel && (
                  <div className="mt-0.5 max-w-[100px] bg-rose-50/90 backdrop-blur-[4px] text-[7px] text-rose-700 font-bold py-0.5 px-2 rounded-full border border-rose-200/40 truncate">
                    {l.biasLabel}
                  </div>
                )}
              </div>
            </div>
          ))}
        </AnimatePresence>
      </div>

      <div className="glass p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>Bias & Worry Release Lotus Pond</h4>
            <p className="text-[11px] font-medium" style={{ color: 'var(--muted)' }}>
              Write down your doubts or anxious thoughts, release them into the sanctuary stream, and watch them drift away.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDemoWorry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
            style={{
              background: 'rgba(13, 148, 136, 0.1)',
              border: '1px solid rgba(13, 148, 136, 0.2)',
              color: '#0d9488',
            }}
          >
            <Beaker className="h-3 w-3" />
            Try Demo
          </button>
        </div>

        {/* Real-time bias detection */}
        <AnimatePresence>
          {biasResult && (
            <motion.div
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              className="rounded-xl p-3 overflow-hidden"
              style={{
                background: 'rgba(244, 63, 94, 0.06)',
                border: '1px solid rgba(244, 63, 94, 0.15)',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#be123c' }}>
                  🔬 Cognitive Bias Detected
                </span>
              </div>
              <p className="text-[11px] font-extrabold" style={{ color: '#881337' }}>
                {biasResult.label}
              </p>
              <p className="text-[10.5px] leading-relaxed mt-1 font-medium" style={{ color: '#4c0519' }}>
                {biasResult.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRelease} className="flex gap-2">
          <input
            type="text"
            value={worryInput}
            onChange={(e) => setWorryInput(e.target.value)}
            placeholder="Write an anxiety (e.g. 'Fear of regret', 'Worried about cost')..."
            className="field flex-1"
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '1.5px solid rgba(13, 148, 136, 0.15)',
              color: 'var(--ink)',
            }}
            maxLength={60}
          />
          <button
            type="submit"
            className="btn-primary py-2.5 px-4 shrink-0 flex items-center gap-1.5"
            style={{
              background: 'var(--green-light)',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.15)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#12c08c'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--green-light)'}
            disabled={!worryInput.trim()}
          >
            <Send className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">Release</span>
          </button>
        </form>

        <AnimatePresence>
          {showMessage && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] font-semibold text-teal-600 text-center"
            >
              🍃 Your worry drifts away down the forest stream. Focus on what you can influence.
              {released.length > 0 && released[released.length - 1]?.biasLabel && (
                <span className="block text-[10px] text-rose-500 font-bold mt-0.5">
                  Bias identified: {released[released.length - 1].biasLabel}
                </span>
              )}
            </motion.p>
          )}
          {showJournalSaved && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-semibold text-teal-500 text-center"
            >
              <BookOpen className="h-3 w-3 inline mr-1" />
              Saved to your Worry Journal
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
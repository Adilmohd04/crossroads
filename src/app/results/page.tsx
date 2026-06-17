'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import AssumptionCard from '../../components/AssumptionCard';
import ComparisonView from '../../components/ComparisonView';
import UncertaintyPanel from '../../components/UncertaintyPanel';
import DecisionMoment from '../../components/DecisionMoment';
import LoadingState from '../../components/LoadingState';
import OpportunityBoard from '../../components/OpportunityBoard';

// Interactive additions
import DimensionSliders from '../../components/DimensionSliders';
import RadarChart from '../../components/RadarChart';
import ScoreBar from '../../components/ScoreBar';
import WhatIfPanel from '../../components/WhatIfPanel';
import RunwaySimulator from '../../components/RunwaySimulator';
import {
  DimensionWeights,
  calculateCompositeScore,
  initializeWeightsFromValues
} from '../../lib/scoring';
import { RotateCcw } from 'lucide-react';

function SectionHeader({
  number,
  title,
  subtitle,
  accent = '#3b6fff',
}: {
  number: string;
  title: string;
  subtitle: string;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 mb-5">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-black mono-value px-2 py-0.5 rounded-md"
          style={{ background: `${accent}18`, color: accent, border: `1px solid ${accent}30` }}>
          {number}
        </span>
        <h3 className="text-sm font-black tracking-wide uppercase" style={{ color: '#f0f4ff' }}>
          {title}
        </h3>
      </div>
      <p className="text-[11px] font-medium" style={{ color: '#5c6b8c' }}>{subtitle}</p>
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(99,116,163,0.3), transparent)' }} />
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const { intake, analysis, isLoading, loadingMessage, error, resetApp } = useApp();

  const [weights, setWeights] = useState<DimensionWeights>({
    financial: 50,
    emotional: 50,
    growth: 50,
    stability: 50,
    relationships: 50,
  });

  const [toggledOffConstraints, setToggledOffConstraints] = useState<string[]>([]);

  useEffect(() => {
    if (intake?.values) setWeights(initializeWeightsFromValues(intake.values));
  }, [intake]);

  useEffect(() => {
    if (!intake && !isLoading) router.push('/');
  }, [intake, isLoading, router]);

  const handleToggleConstraint = (constraint: string) => {
    setToggledOffConstraints((prev) =>
      prev.includes(constraint) ? prev.filter((c) => c !== constraint) : [...prev, constraint]
    );
  };

  const liveScores = useMemo(() => {
    if (!analysis) return {};
    const scores: Record<string, number> = {};
    analysis.scenarios.forEach((s) => {
      const modifiedScores = { ...s.dimension_scores };
      toggledOffConstraints.forEach((c) => {
        let dim: keyof typeof s.dimension_scores | null = null;
        const lowerC = c.toLowerCase();
        if (lowerC.includes('money') || lowerC.includes('savings') || lowerC.includes('debt') || lowerC.includes('lease') || lowerC.includes('housing')) {
          dim = 'financial';
        } else if (lowerC.includes('geographic')) {
          dim = 'relationships';
        } else if (lowerC.includes('time') || lowerC.includes('deadline') || lowerC.includes('visa')) {
          dim = 'stability';
        } else if (lowerC.includes('health')) {
          dim = 'emotional';
        } else if (lowerC.includes('experience')) {
          dim = 'growth';
        } else if (lowerC.includes('relationship') || lowerC.includes('family')) {
          dim = 'relationships';
        }
        if (dim) {
          const currentVal = modifiedScores[dim];
          if (currentVal < 75) {
            modifiedScores[dim] = currentVal + Math.round((75 - currentVal) * 0.5);
          }
        }
      });
      scores[s.option_name] = calculateCompositeScore(modifiedScores, weights);
    });
    return scores;
  }, [analysis, weights, toggledOffConstraints]);

  // Base scores with NO constraints toggled — used to compute delta badges
  const baseScores = useMemo(() => {
    if (!analysis) return {};
    const scores: Record<string, number> = {};
    analysis.scenarios.forEach((s) => {
      scores[s.option_name] = calculateCompositeScore(s.dimension_scores, weights);
    });
    return scores;
  }, [analysis, weights]);

  const winningPath = useMemo(() => {
    if (!analysis) return null;
    let max = -1; let name = null;
    analysis.scenarios.forEach((s) => {
      const score = liveScores[s.option_name] ?? 0;
      if (score > max) { max = score; name = s.option_name; }
    });
    return name;
  }, [analysis, liveScores]);

  if (isLoading) return <LoadingState message={loadingMessage} />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md space-y-4 rounded-2xl p-6"
            style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <h2 className="text-base font-bold" style={{ color: '#fb7185' }}>Analysis Failed</h2>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>{error}</p>
            <button onClick={resetApp}
              className="btn-primary w-full justify-center">
              <RotateCcw className="h-4 w-4" /> Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!analysis || !intake) return null;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">

        {/* ── PAGE TITLE ── */}
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{
                background: 'rgba(59, 111, 255, 0.12)',
                border: '1px solid rgba(59, 111, 255, 0.25)',
                color: '#7ba7ff',
              }}>
              Decision Cockpit
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: '#f0f4ff' }}>
            Your Decision Analysis
          </h2>
          <p className="mt-1.5 text-sm font-medium" style={{ color: '#5c6b8c' }}>
            Simulating pathways for: &ldquo;{intake.decision}&rdquo;
          </p>
          {/* Gradient rule */}
          <div className="mt-5 h-px w-full"
            style={{ background: 'linear-gradient(90deg, rgba(59,111,255,0.4), rgba(139,92,246,0.3), transparent)' }} />
        </div>

        {/* ── SECTION 1: ASSUMPTIONS ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.05s' }}>
          <SectionHeader
            number="01"
            title="Assumptions Surfaced"
            subtitle="Before comparing, challenge these underlying premises baked into your framing."
            accent="#f59e0b"
          />
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {analysis.assumptions.map((item, idx) => (
              <AssumptionCard key={item.assumption + idx} assumption={item} index={idx} />
            ))}
          </div>
        </section>

        {/* ── SECTION 2: COCKPIT ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.10s' }}>
          <SectionHeader
            number="02"
            title="Interactive Simulation Cockpit"
            subtitle="Adjust priority weights dynamically — watch the radar morph and scores recalculate live."
            accent="#3b6fff"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <DimensionSliders weights={weights} onChange={setWeights} />
            <RadarChart scenarios={analysis.scenarios} />
          </div>
        </section>

        {/* ── WHAT-IF PANEL ── */}
        {intake.constraints && intake.constraints.length > 0 && (
          <section className="animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <WhatIfPanel
              selectedConstraints={intake.constraints}
              toggledOffConstraints={toggledOffConstraints}
              onToggle={handleToggleConstraint}
            />
          </section>
        )}

        {/* ── RUNWAY SIMULATOR ── */}
        {intake.savings !== undefined && intake.monthly_budget !== undefined && (
          <section className="animate-fade-up" style={{ animationDelay: '0.20s' }}>
            <RunwaySimulator
              savings={intake.savings}
              initialMonthlyBudget={intake.monthly_budget}
              scenarios={analysis.scenarios}
            />
          </section>
        )}

        {/* ── SECTION 3: SCORES ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.25s' }}>
          <SectionHeader
            number="03"
            title="Weighted Match Scores"
            subtitle="Live-calculated match percentages, dynamically updating with slider movements."
            accent="#10b981"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.scenarios.map((scenario, idx) => {
              const score = liveScores[scenario.option_name] ?? 0;
              const base = baseScores[scenario.option_name] ?? score;
              const delta = toggledOffConstraints.length > 0 ? score - base : 0;
              return (
                <ScoreBar
                  key={scenario.option_name}
                  label={scenario.option_name}
                  score={score}
                  index={idx}
                  isWinning={scenario.option_name === winningPath}
                  delta={delta}
                />
              );
            })}
          </div>
        </section>

        {/* ── SECTION 4: SCENARIO DETAILS ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.30s' }}>
          <SectionHeader
            number="04"
            title="Scenario Details & Milestones"
            subtitle="30, 60, and 90-day timeline projections with hidden costs and risks for each path."
            accent="#8b5cf6"
          />
          <ComparisonView scenarios={analysis.scenarios} liveScores={liveScores} />
        </section>

        {/* ── SECTION 5: RECOMMENDED OPPORTUNITIES ── */}
        <section className="animate-fade-up" style={{ animationDelay: '0.33s' }}>
          <OpportunityBoard />
        </section>

        {/* ── SECTION 6: UNCERTAINTY ── */}
        <section className="max-w-4xl mx-auto animate-fade-up" style={{ animationDelay: '0.35s' }}>
          <UncertaintyPanel disclosure={analysis.uncertainty_disclosure} />
        </section>

        {/* ── SECTION 7: DECISION MOMENT ── */}
        <section className="pt-4 pb-12 animate-fade-up" style={{ animationDelay: '0.40s' }}>
          <DecisionMoment options={intake.options} />
        </section>
      </main>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import ComparisonView from '../../components/ComparisonView';
import UncertaintyPanel from '../../components/UncertaintyPanel';
import LoadingState from '../../components/LoadingState';
import OpportunityBoard from '../../components/OpportunityBoard';
import FutureTimeline from '../../components/FutureTimeline';
import PhaseDivider from '../../components/PhaseDivider';
import SystemArchitecture from '../../components/SystemArchitecture';
import AssumptionPhase from '../../components/AssumptionPhase';
import CommitmentPhase from '../../components/CommitmentPhase';
import InteractiveTrailMap from '../../components/InteractiveTrailMap';
import ResultsHeroHeader from '../../components/ResultsHeroHeader';
import AgentResearchLogs from '../../components/AgentResearchLogs';
import PriorityScoresCard from '../../components/PriorityScoresCard';
import { NatureGuideId } from '../../components/NatureGuideSelector';

// Interactive additions
import DimensionSliders from '../../components/DimensionSliders';
import RadarChart from '../../components/RadarChart';
import WhatIfPanel from '../../components/WhatIfPanel';
import RunwaySimulator from '../../components/RunwaySimulator';
import StressTestPanel from '../../components/StressTestPanel';
import SoundscapeToggle from '../../components/SoundscapeToggle';
import {
  DimensionWeights,
  calculateCompositeScore,
  initializeWeightsFromValues
} from '../../lib/scoring';
import {
  trackSliderChange,
  trackConstraintToggle,
  markPhaseStart,
  markPhaseEnd,
  generateBehaviorInsights,
  resetBehaviorTracker,
  trackRunwayInteraction,
  BehaviorInsight,
} from '../../lib/behaviorTracker';
import { RotateCcw, Globe, ExternalLink, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Animation Variants ─── */
const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.4 },
  },
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function ResultsPage() {
  const router = useRouter();
  const { intake, analysis, isLoading, loadingMessage, error, resetApp } = useApp();

  const [activeGuide, setActiveGuide] = useState<NatureGuideId>('owl');

  useEffect(() => {
    const saved = localStorage.getItem('crossroads_nature_guide') as NatureGuideId;
    if (saved) setActiveGuide(saved);

    const handleGuideChange = (e: Event) => {
      const guideId = (e as CustomEvent).detail;
      if (guideId) setActiveGuide(guideId);
    };
    window.addEventListener('nature-guide-change', handleGuideChange);
    return () => window.removeEventListener('nature-guide-change', handleGuideChange);
  }, []);

  const [weights, setWeights] = useState<DimensionWeights>({
    financial: 50,
    emotional: 50,
    growth: 50,
    stability: 50,
    relationships: 50,
  });

  const [toggledOffConstraints, setToggledOffConstraints] = useState<string[]>([]);
  const [isResearchAnimating, setIsResearchAnimating] = useState(true);

  // Clarity Workspace interactive checklist states
  const [confrontedAssumptions, setConfrontedAssumptions] = useState<boolean[]>([false, false, false]);
  const [hasAdjustedSliders, setHasAdjustedSliders] = useState(false);
  const [hasToggledConstraints, setHasToggledConstraints] = useState(false);
  const [hasInteractedRunway, setHasInteractedRunway] = useState(false);

  // Parallel Universe Sandbox states
  const [sandboxSavings, setSandboxSavings] = useState<number>(0);
  const [sandboxDeferral, setSandboxDeferral] = useState<number>(0);
  const [decisionDna, setDecisionDna] = useState<any>(null);
  const [hasDnaHistory, setHasDnaHistory] = useState<boolean>(false);

  // Progressive reveal: sections unlock as user engages
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [insightVisible, setInsightVisible] = useState(false);
  const [behaviorInsights, setBehaviorInsights] = useState<BehaviorInsight[]>([]);
  const [activeStressor, setActiveStressor] = useState<string | null>(null);

  // Reset behavior tracker on mount & load DNA
  useEffect(() => {
    resetBehaviorTracker();
    markPhaseStart('assumptions');

    try {
      const savedDna = localStorage.getItem('crossroads_decision_dna');
      const savedHistory = localStorage.getItem('crossroads_journal_history');
      if (savedDna && savedHistory) {
        const parsedDna = JSON.parse(savedDna);
        const parsedHistory = JSON.parse(savedHistory);
        if (parsedHistory.length >= 2) {
          setDecisionDna(parsedDna);
          setHasDnaHistory(true);
        }
      }
    } catch (e) {
      console.error('Failed to load Decision DNA for results page:', e);
    }
  }, []);

  useEffect(() => {
    if (intake?.values) setWeights(initializeWeightsFromValues(intake.values));
    if (intake) {
      setSandboxSavings(intake.savings || 0);
      setSandboxDeferral(0);
    }
  }, [intake]);

  // Phase progression: unlock next section when user completes current
  useEffect(() => {
    const assumptionsResolved = confrontedAssumptions.filter(Boolean).length;
    if (assumptionsResolved >= 2 && currentPhase === 1) {
      markPhaseEnd('assumptions');
      markPhaseStart('simulation');
      setTimeout(() => setCurrentPhase(2), 600);
    }
  }, [confrontedAssumptions, currentPhase]);

  useEffect(() => {
    if (hasAdjustedSliders && currentPhase === 2) {
      setTimeout(() => setCurrentPhase(3), 600);
      showInsight("Your priorities are set. See how each path performs across your values.");
    }
  }, [hasAdjustedSliders, currentPhase]);

  useEffect(() => {
    if (hasToggledConstraints && currentPhase < 4) {
      markPhaseEnd('simulation');
      setTimeout(() => setCurrentPhase(4), 600);
      const insights = generateBehaviorInsights(intake);
      if (insights.length > 0) {
        setBehaviorInsights(insights);
      }
    }
  }, [hasToggledConstraints, currentPhase]);

  // AI micro-commentary
  const showInsight = (msg: string) => {
    setAiInsight(msg);
    setInsightVisible(true);
    setTimeout(() => setInsightVisible(false), 6000);
  };

  const handleWeightChange = (newWeights: DimensionWeights) => {
    setWeights(newWeights);
    if (!hasAdjustedSliders) {
      setHasAdjustedSliders(true);
    }
    Object.entries(newWeights).forEach(([dim, val]) => {
      if (val !== (weights as any)[dim]) {
        trackSliderChange(dim, val);
      }
    });
    const maxDim = Object.entries(newWeights).sort((a, b) => b[1] - a[1])[0];
    const minDim = Object.entries(newWeights).sort((a, b) => a[1] - b[1])[0];
    if (maxDim[1] >= 95 && minDim[1] <= 15) {
      showInsight(`You're heavily prioritizing ${maxDim[0]} while ignoring ${minDim[0]}. Is that a conscious choice or an impulse?`);
    }
  };

  useEffect(() => {
    if (!intake && !isLoading) router.push('/');
  }, [intake, isLoading, router]);

  useEffect(() => {
    if (analysis) {
      setIsResearchAnimating(true);
    }
  }, [analysis]);

  const handleToggleConstraint = (constraint: string) => {
    setToggledOffConstraints((prev) => {
      const wasOff = prev.includes(constraint);
      const next = wasOff ? prev.filter((c) => c !== constraint) : [...prev, constraint];
      trackConstraintToggle(constraint);
      if (!wasOff) {
        showInsight(`What if "${constraint}" didn't exist? Watch how scores shift.`);
      }
      return next;
    });
    setHasToggledConstraints(true);
  };

  const handleConfrontAssumption = (idx: number) => {
    setConfrontedAssumptions((prev) => {
      const next = [...prev];
      next[idx] = true;
      const total = next.filter(Boolean).length;
      
      let msg = '';
      if (activeGuide === 'owl') {
        if (total === 1) msg = "🦉 Wise Owl: One blind spot exposed. Examine the next assumption—caution saves years.";
        else if (total === 2) msg = "🦉 Wise Owl: Two down. Safety metrics loaded. Let's calibrate the simulation below.";
        else if (total === 3) msg = "🦉 Wise Owl: All assumptions audited. We are ready to evaluate raw data.";
      } else if (activeGuide === 'eagle') {
        if (total === 1) msg = "🦅 Bold Eagle: First barrier cleared. Rise above details and scan the next assumption.";
        else if (total === 2) msg = "🦅 Bold Eagle: Two down. Unlocking the 10,000ft cockpit below. Focus on compound potential!";
        else if (total === 3) msg = "🦅 Bold Eagle: Clear skies. Your growth vision is fully aligned.";
      } else {
        if (total === 1) msg = "🦊 Clever Fox: Smart detour! Bias outmaneuvered. Let's check the next corner.";
        else if (total === 2) msg = "🦊 Clever Fox: Two down. Path unlocked. Let's search for creative workarounds below!";
        else if (total === 3) msg = "🦊 Clever Fox: All obstacles cleared. Ready to pick the most tactical route.";
      }
      
      if (msg) showInsight(msg);
      return next;
    });
  };

  const modifiedScenarios = useMemo(() => {
    if (!analysis) return [];
    return analysis.scenarios.map((s) => {
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

      // Apply Parallel Universe Sliders logic
      const originalSavings = intake?.savings || 0;
      const savingsDelta = sandboxSavings - originalSavings;
      
      // Every $2,000 delta boosts or reduces the financial score by 1 point (capped at +/- 25)
      if (savingsDelta !== 0) {
        const financialDelta = Math.round(savingsDelta / 2000);
        const clampedDelta = Math.max(-25, Math.min(25, financialDelta));
        modifiedScores.financial = Math.max(0, Math.min(100, modifiedScores.financial + clampedDelta));
      }

      // Delaying decision timeline reduces urgency stress (boosting stability by 4 pts/month and emotional by 3 pts/month)
      if (sandboxDeferral > 0) {
        const stabilityBoost = sandboxDeferral * 4;
        const emotionalBoost = sandboxDeferral * 3;
        modifiedScores.stability = Math.max(0, Math.min(100, modifiedScores.stability + stabilityBoost));
        modifiedScores.emotional = Math.max(0, Math.min(100, modifiedScores.emotional + emotionalBoost));
      }

      return { ...s, dimension_scores: modifiedScores };
    });
  }, [analysis, toggledOffConstraints, intake?.savings, sandboxSavings, sandboxDeferral]);

  const { adjustedScenarios, adjustedWeights } = useMemo(() => {
    const adjScenarios = modifiedScenarios.map((s) => {
      const adjustedScores = { ...s.dimension_scores };
      
      if (activeStressor === 'recession') {
        adjustedScores.financial = Math.max(0, adjustedScores.financial - 20);
      } else if (activeStressor === 'burnout') {
        const drag = s.dimension_scores.stability < 60 ? 30 : 15;
        adjustedScores.emotional = Math.max(0, adjustedScores.emotional - drag);
      } else if (activeStressor === 'windfall') {
        adjustedScores.financial = Math.min(100, adjustedScores.financial + 20);
      } else if (activeStressor === 'relocation') {
        const pathName = s.option_name.toLowerCase();
        const isHometownOrRemote = pathName.includes('remote') || 
                                   pathName.includes('hometown') || 
                                   pathName.includes('stay') || 
                                   pathName.includes('local');
        if (isHometownOrRemote) {
          adjustedScores.relationships = Math.min(100, adjustedScores.relationships + 20);
        } else {
          adjustedScores.relationships = Math.max(0, adjustedScores.relationships - 25);
        }
      }
      return { ...s, dimension_scores: adjustedScores };
    });

    const adjWeights = { ...weights };
    if (activeStressor === 'recession') {
      adjWeights.stability = Math.min(100, adjWeights.stability + 30);
    } else if (activeStressor === 'burnout') {
      adjWeights.emotional = Math.min(100, adjWeights.emotional + 30);
    } else if (activeStressor === 'windfall') {
      adjWeights.financial = 10;
    } else if (activeStressor === 'relocation') {
      adjWeights.relationships = Math.min(100, adjWeights.relationships + 30);
    }

    return { adjustedScenarios: adjScenarios, adjustedWeights: adjWeights };
  }, [modifiedScenarios, weights, activeStressor]);

  const liveScores = useMemo(() => {
    const scores: Record<string, number> = {};
    adjustedScenarios.forEach((s) => {
      scores[s.option_name] = calculateCompositeScore(s.dimension_scores, adjustedWeights);
    });
    return scores;
  }, [adjustedScenarios, adjustedWeights]);

  const baseScores = useMemo(() => {
    if (!analysis) return {};
    const scores: Record<string, number> = {};
    analysis.scenarios.forEach((s) => {
      const adjustedScores = { ...s.dimension_scores };
      const adjWeights = { ...weights };
      
      if (activeStressor === 'recession') {
        adjustedScores.financial = Math.max(0, adjustedScores.financial - 20);
        adjWeights.stability = Math.min(100, adjWeights.stability + 30);
      } else if (activeStressor === 'burnout') {
        const drag = s.dimension_scores.stability < 60 ? 30 : 15;
        adjustedScores.emotional = Math.max(0, adjustedScores.emotional - drag);
        adjWeights.emotional = Math.min(100, adjWeights.emotional + 30);
      } else if (activeStressor === 'windfall') {
        adjustedScores.financial = Math.min(100, adjustedScores.financial + 20);
        adjWeights.financial = 10;
      } else if (activeStressor === 'relocation') {
        const pathName = s.option_name.toLowerCase();
        const isHometownOrRemote = pathName.includes('remote') || 
                                   pathName.includes('hometown') || 
                                   pathName.includes('stay') || 
                                   pathName.includes('local');
        if (isHometownOrRemote) {
          adjustedScores.relationships = Math.min(100, adjustedScores.relationships + 20);
        } else {
          adjustedScores.relationships = Math.max(0, adjustedScores.relationships - 25);
        }
        adjWeights.relationships = Math.min(100, adjWeights.relationships + 30);
      }
      
      scores[s.option_name] = calculateCompositeScore(adjustedScores, adjWeights);
    });
    return scores;
  }, [analysis, weights, activeStressor]);

  // Compute per-constraint impact scores for the WhatIfPanel ranking
  const constraintImpactScores = useMemo(() => {
    if (!analysis || !intake?.constraints) return {};
    const impacts: Record<string, number> = {};

    const classifyDim = (c: string): (keyof typeof analysis.scenarios[0]['dimension_scores'])| null => {
      const lc = c.toLowerCase();
      if (lc.includes('money') || lc.includes('savings') || lc.includes('debt') || lc.includes('lease') || lc.includes('housing') || lc.includes('budget') || lc.includes('salary') || lc.includes('cost')) return 'financial';
      if (lc.includes('geographic') || lc.includes('location') || lc.includes('distance')) return 'relationships';
      if (lc.includes('time') || lc.includes('deadline') || lc.includes('visa') || lc.includes('contract')) return 'stability';
      if (lc.includes('health') || lc.includes('stress') || lc.includes('anxiety') || lc.includes('burnout')) return 'emotional';
      if (lc.includes('experience') || lc.includes('skill') || lc.includes('qualification')) return 'growth';
      if (lc.includes('relationship') || lc.includes('family') || lc.includes('partner')) return 'relationships';
      return null;
    };

    intake.constraints.forEach((constraint) => {
      const dim = classifyDim(constraint);
      if (!dim) { impacts[constraint] = 0; return; }

      // Simulate toggling just this one constraint and measure avg delta
      let totalDelta = 0;
      analysis.scenarios.forEach((s) => {
        const original = calculateCompositeScore(s.dimension_scores, weights);
        const boosted = { ...s.dimension_scores };
        const currentVal = boosted[dim];
        if (currentVal < 75) {
          boosted[dim] = currentVal + Math.round((75 - currentVal) * 0.5);
        }
        const newScore = calculateCompositeScore(boosted, weights);
        totalDelta += newScore - original;
      });
      impacts[constraint] = Math.round(totalDelta / analysis.scenarios.length);
    });

    return impacts;
  }, [analysis, intake?.constraints, weights]);

  // Dynamic Clarity Index Calculation
  const runwayActive = intake?.savings !== undefined && intake?.monthly_budget !== undefined;
  const assumptionsResolvedCount = confrontedAssumptions.filter(Boolean).length;
  const assumptionsClarity = assumptionsResolvedCount * 15;
  const slidersClarity = hasAdjustedSliders ? 20 : 0;
  const constraintsClarity = hasToggledConstraints ? 15 : 0;
  const runwayClarity = runwayActive ? (hasInteractedRunway ? 10 : 0) : 0;
  const maxPossible = 10 + 45 + 20 + 15 + (runwayActive ? 10 : 0);
  const rawClarity = 10 + assumptionsClarity + slidersClarity + constraintsClarity + runwayClarity;
  const clarityIndex = Math.min(100, Math.round((rawClarity / maxPossible) * 100));
  const isLocked = clarityIndex < 80;

  const checklist = {
    assumptionsResolvedCount,
    hasAdjustedSliders,
    hasToggledConstraints,
    hasInteractedRunway,
    runwayActive,
  };

  /* ─── Early Returns ─── */
  if (isLoading) return <LoadingState message={loadingMessage} />;

  if (error) {
    return (
      <div className="flex min-h-screen flex-col" style={{ background: 'var(--canvas)' }}>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-5 rounded-xl p-8"
            style={{ background: '#ffffff', border: '1px solid var(--border)' }}>
            <h2 className="text-xl font-bold" style={{ color: '#141413', fontFamily: "'Fraunces', serif" }}>
              Something went wrong
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#3d3b35' }}>{error}</p>
            <button onClick={resetApp}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: '#2d6a4f' }}>
              <RotateCcw className="h-4 w-4" /> Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!intake) return null;

  if (!analysis) {
    return (
      <div className="flex min-h-screen flex-col" style={{ background: 'var(--canvas)' }}>
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-5 rounded-xl p-8"
            style={{ background: '#ffffff', border: '1px solid var(--border)' }}>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mx-auto"
              style={{ background: 'rgba(234,88,12,0.1)', border: '1px solid rgba(234,88,12,0.2)' }}>
              <Globe className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold" style={{ color: '#141413', fontFamily: "'Fraunces', serif" }}>
              Analysis didn&#39;t load
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#3d3b35' }}>
              We have your decision saved but couldn&apos;t retrieve the analysis. 
              This can happen if the API call was interrupted.
            </p>
            <button onClick={resetApp}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold text-white transition-colors"
              style={{ background: '#2d6a4f' }}>
              <RotateCcw className="h-4 w-4" /> Try Again
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (isResearchAnimating) {
    return (
      <LoadingState
        analysis={analysis}
        onComplete={() => setIsResearchAnimating(false)}
      />
    );
  }

  /* ─── Main Render ─── */
  return (
    <div className={`flex min-h-screen flex-col theme-${activeGuide}`} style={{ background: 'var(--canvas)' }}>
      <Header />

      {/* ── AI MICRO-INSIGHT TOAST ── */}
      <AnimatePresence>
        {insightVisible && aiInsight && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg px-6 py-4 rounded-xl flex items-start gap-3"
            style={{
              background: '#ffffff',
              border: '1px solid #dedad2',
              boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(192,112,68,0.08)',
            }}>
            <span className="text-lg shrink-0">🧠</span>
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#3d3b35' }}>{aiInsight}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Offline Resilience Note ── */}
      {analysis.is_mock && (
        <div className="mx-auto w-full max-w-4xl px-6 pt-6">
          <div className="flex items-center gap-3 p-3 rounded-xl text-sm"
            style={{ background: '#f0fdf4', border: '1px solid #d1e7dd', color: '#2d6a4f' }}>
            <span className="text-base">🌿</span>
            <span>Running in <strong>local intelligence mode</strong> — scenarios generated from our behavioral science engine. Live web grounding activates when connected.</span>
          </div>
        </div>
      )}

      <main className="flex-1">
        <ResultsHeroHeader />

        {/* ── Phase Progress Stepper ── */}
        <div className="mx-auto w-full max-w-4xl px-6 pt-6">
          <div className="flex items-center justify-between gap-1 px-1"
            style={{ borderBottom: '1px solid rgba(45, 106, 79, 0.15)', paddingBottom: '14px' }}>
            {[
              { num: 1, label: 'Assumptions', sublabel: 'Confront blind spots' },
              { num: 2, label: 'Simulation', sublabel: 'Stress-test weights' },
              { num: 3, label: 'Projections', sublabel: 'Explore futures' },
              { num: 4, label: 'Commit', sublabel: 'Make your choice' },
            ].map((phase, i) => {
              const isActive = phase.num === currentPhase;
              const isPast = phase.num < currentPhase;
              return (
                <React.Fragment key={phase.num}>
                  <div className="flex flex-col items-center min-w-0">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full text-[10px] font-black transition-all duration-300"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #2d6a4f, #40916c)'
                          : isPast
                          ? '#2d6a4f'
                          : 'rgba(45, 106, 79, 0.12)',
                        color: isActive || isPast ? '#ffffff' : 'rgba(45, 106, 79, 0.5)',
                        border: !isActive && !isPast ? '1.5px solid rgba(45, 106, 79, 0.2)' : 'none',
                        boxShadow: isActive ? '0 0 0 4px rgba(45,106,79,0.15)' : 'none',
                      }}>
                      {isPast ? '✓' : phase.num}
                    </div>
                    <span className="mt-1.5 text-[9px] font-bold tracking-wider text-center leading-tight"
                      style={{
                        color: isActive ? '#2d6a4f' : isPast ? '#3d3b35' : 'rgba(61, 59, 53, 0.5)',
                        maxWidth: '70px',
                      }}>
                      {phase.label}
                    </span>
                    <span className="text-[7px] font-medium text-center leading-tight"
                      style={{ color: 'rgba(61, 59, 53, 0.4)' }}>
                      {phase.sublabel}
                    </span>
                  </div>
                  {i < 3 && (
                    <div className="flex-1 h-px mx-1 mt-[-18px] self-center"
                      style={{ background: isPast ? '#2d6a4f' : 'rgba(45, 106, 79, 0.12)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Render Decision DNA Banner if available */}
        {hasDnaHistory && decisionDna && (
          <div className="mx-auto w-full max-w-4xl px-6 pt-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-5 md:p-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
              style={{
                background: 'rgba(139, 92, 246, 0.08)',
                border: '1.5px solid rgba(139, 92, 246, 0.25)',
                boxShadow: '0 8px 30px rgba(139, 92, 246, 0.05)',
              }}
            >
              <div className="flex gap-4 items-start">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0"
                  style={{
                    background: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                  }}>
                  <Brain className="h-5.5 w-5.5 text-purple-700" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-700">
                      🧠 Your Decision History
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                      Past Patterns Found
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: "'Fraunces', serif" }}>
                    We noticed a pattern from your previous decisions
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed max-w-2xl font-medium">
                    From an earlier session, you had a tendency toward <strong className="text-purple-800">“{decisionDna.blind_spot}”</strong>. 
                    The simulator has woven that insight into today's analysis — so your scores reflect not just your current situation, 
                    but a gentle nudge away from the bias your past self revealed.
                  </p>
                </div>
              </div>
              <div className="text-xs text-purple-800 font-bold bg-purple-50 px-3 py-2 rounded-xl border border-purple-100 shrink-0 select-none">
                🧬 DNA Factored In
              </div>
            </motion.div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            PHASE 1: CONFRONT ASSUMPTIONS
        ════════════════════════════════════════════════════════════════ */}
        <AssumptionPhase
          analysis={analysis}
          confrontedAssumptions={confrontedAssumptions}
          onConfront={handleConfrontAssumption}
          clarityIndex={clarityIndex}
        />

        {/* ════════════════════════════════════════════════════════════════
            PHASE 2: SIMULATION WORKSPACE
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {currentPhase >= 2 && (
            <motion.section
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sectionVariants}
              className="py-16 px-6"
              style={{ background: 'transparent' }}
            >
              <div className="max-w-6xl mx-auto">
                <PhaseDivider />

                {/* Phase heading */}
                <div className="mb-12 max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--green-light)', fontFamily: 'Outfit, sans-serif' }}>
                    Phase II: Stress-Test Weights
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
                    style={{ color: 'var(--green)', fontFamily: "'Fraunces', serif" }}>
                    Now, let&apos;s test what actually matters to you.
                  </h2>
                  <p className="text-base leading-relaxed"
                    style={{ color: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
                    <strong>How this works:</strong> Drag each slider to tell us how much you care about that dimension.
                    The radar chart on the right updates instantly — showing which option fits YOUR priorities best.
                    Then try toggling off a constraint to see: &ldquo;What if that limitation didn&apos;t exist?&rdquo;
                  </p>
                </div>

                {/* Two-column: Sliders + Radar */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  {/* Left: Controls */}
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8"
                  >
                    <motion.div variants={cardVariants}
                      className="rounded-xl p-6"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <DimensionSliders
                        weights={weights}
                        onChange={handleWeightChange}
                        onInteraction={() => setHasAdjustedSliders(true)}
                      />
                    </motion.div>

                    {/* What-If Panel */}
                    {intake.constraints && intake.constraints.length > 0 && (
                      <motion.div variants={cardVariants}
                        className="rounded-xl p-6"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <WhatIfPanel
                          selectedConstraints={intake.constraints}
                          toggledOffConstraints={toggledOffConstraints}
                          onToggle={handleToggleConstraint}
                          onInteraction={() => setHasToggledConstraints(true)}
                          impactScores={constraintImpactScores}
                          sandboxSavings={sandboxSavings}
                          setSandboxSavings={setSandboxSavings}
                          sandboxDeferral={sandboxDeferral}
                          setSandboxDeferral={setSandboxDeferral}
                          originalSavings={intake.savings}
                        />
                      </motion.div>
                    )}

                    {/* Runway Simulator */}
                    {intake.savings !== undefined && intake.monthly_budget !== undefined && (
                      <motion.div variants={cardVariants}
                        className="rounded-xl p-6"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                        <RunwaySimulator
                          savings={intake.savings}
                          initialMonthlyBudget={intake.monthly_budget}
                          scenarios={analysis.scenarios}
                          onInteraction={() => { setHasInteractedRunway(true); trackRunwayInteraction(); }}
                        />
                      </motion.div>
                    )}

                    {/* Dynamic Flight Simulator / Stress Tester */}
                    <motion.div variants={cardVariants}
                      className="rounded-xl p-6"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <StressTestPanel
                        activeStressor={activeStressor}
                        onToggle={(id) => setActiveStressor(id)}
                      />
                    </motion.div>
                  </motion.div>

                  {/* Right: Radar + Scores */}
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-8 lg:sticky lg:top-8"
                  >
                    <motion.div variants={cardVariants}
                      className="rounded-xl p-6"
                      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                      <RadarChart
                        scenarios={adjustedScenarios}
                        weights={adjustedWeights}
                        baselineScenarios={(toggledOffConstraints.length > 0 || sandboxSavings !== (intake?.savings || 0) || sandboxDeferral > 0) ? analysis.scenarios : undefined}
                      />
                    </motion.div>

                    <PriorityScoresCard
                       scenarios={analysis.scenarios}
                       liveScores={liveScores}
                       baseScores={baseScores}
                       toggledOffConstraints={toggledOffConstraints}
                       sandboxSavings={sandboxSavings}
                       sandboxDeferral={sandboxDeferral}
                       originalSavings={intake.savings || 0}
                       cardVariants={cardVariants}
                     />
                  </motion.div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3: SCENARIOS & COMPARISON
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {currentPhase >= 3 && (
            <motion.section
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={sectionVariants}
              className="py-16 px-6"
              style={{ background: 'transparent' }}
            >
              <div className="max-w-6xl mx-auto">
                <PhaseDivider />

                {/* Phase heading */}
                <div className="mb-12 max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-widest mb-3"
                    style={{ color: 'var(--green-light)', fontFamily: 'Outfit, sans-serif' }}>
                    Phase III: Projections & Scenarios
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
                    style={{ color: 'var(--green)', fontFamily: "'Fraunces', serif" }}>
                    Explore your possible futures.
                  </h2>
                  <p className="text-base leading-relaxed"
                    style={{ color: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
                    Click between paths and scrub through time below. Focus on three things:
                    <strong> the hidden cost</strong> (what you haven&apos;t priced in),
                    <strong> the biggest risk</strong> (what could go wrong), and
                    <strong> what you give up</strong> (the trade-off no one mentions).
                  </p>
                </div>

                {/* Interactive Trail Map */}
                <motion.div variants={cardVariants} className="glass p-6 mb-8">
                  <InteractiveTrailMap scenarios={adjustedScenarios} />
                </motion.div>

                {/* ONE-PARAGRAPH SUMMARY — for users who won't read everything */}
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <div style={{ background: '#f0fdf4', border: '1px solid #d1e7dd', borderRadius: '16px', padding: '20px 24px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#2d6a4f', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      The short version
                    </p>
                    <p style={{ fontSize: '15px', color: '#1b1b18', lineHeight: 1.7 }}>
                      {(() => {
                        const sorted = [...adjustedScenarios].sort((a, b) => b.confidence - a.confidence);
                        const highest = sorted[0];
                        const lowest = sorted[sorted.length - 1];
                        return `The most likely outcome based on your constraints is "${highest?.option_name}" (${highest?.confidence}% confidence). The riskiest path is "${lowest?.option_name}" — primarily because: ${lowest?.biggest_risk?.toLowerCase()}. Use the timeline below to explore what each option actually looks like month by month.`;
                      })()}
                    </p>
                  </div>
                </motion.div>

                {/* Interactive Future Timeline */}
                <motion.div variants={cardVariants} initial="hidden" animate="visible">
                  <FutureTimeline scenarios={adjustedScenarios} toggledOffConstraints={toggledOffConstraints} />
                </motion.div>

                {/* Detailed Comparison View */}
                <motion.div variants={cardVariants} initial="hidden" animate="visible" style={{ marginTop: '32px' }}>
                  <ComparisonView scenarios={adjustedScenarios} liveScores={liveScores} />
                </motion.div>

                {/* Opportunities */}
                <div className="mt-16">
                  <div className="mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold mb-3"
                      style={{ color: 'var(--green)', fontFamily: "'Fraunces', serif" }}>
                      Real opportunities, not generic advice
                    </h3>
                    <p className="text-base leading-relaxed"
                      style={{ color: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
                      AI-searched programs, jobs, and resources matched to your specific situation.
                    </p>
                  </div>
                  <OpportunityBoard />
                </div>

                {/* Uncertainty */}
                <div className="mt-12 max-w-3xl mx-auto">
                  <UncertaintyPanel disclosure={analysis.uncertainty_disclosure} />
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 4: COMMIT
        ════════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {currentPhase >= 4 && (
            <CommitmentPhase
              intake={intake}
              analysis={analysis}
              confrontedAssumptions={confrontedAssumptions}
              behaviorInsights={behaviorInsights}
              isLocked={isLocked}
              clarityIndex={clarityIndex}
              checklist={checklist}
              liveScores={liveScores}
            />
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER SECTIONS (always visible after phase 1)
        ════════════════════════════════════════════════════════════════ */}
        {currentPhase >= 2 && (
          <div className="py-12 px-6" style={{ background: 'transparent' }}>
            <div className="max-w-4xl mx-auto space-y-8">

              {/* Why AI Architecture Slide Card */}
              <SystemArchitecture />

              <AgentResearchLogs analysis={analysis} />
            </div>
          </div>
        )}

      </main>
      
      {/* Synthetic Nature Soundscape Toggle */}
      <SoundscapeToggle />
    </div>
  );
}

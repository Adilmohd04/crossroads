'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Check, 
  ChevronUp, 
  ChevronDown, 
  AlertCircle,
  Zap
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { 
  IntakeData, 
  DecisionCategory, 
  CONSTRAINT_OPTIONS, 
  VALUE_OPTIONS, 
  DECISION_CATEGORIES,
  validateIntake
} from '../lib/types';

const STEPS = [
  { id: 1, title: 'The Decision' },
  { id: 2, title: 'The Options' },
  { id: 3, title: 'Constraints' },
  { id: 4, title: 'Core Values' },
  { id: 5, title: 'Timeline & Fear' }
];

export default function IntakeForm() {
  const { submitIntake } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form States
  const [decision, setDecision] = useState('');
  const [category, setCategory] = useState<DecisionCategory>('career');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [customConstraint, setCustomConstraint] = useState('');
  const [rankedValues, setRankedValues] = useState<string[]>([]);
  const [timeline, setTimeline] = useState('');
  const [fear, setFear] = useState('');
  const [savings, setSavings] = useState('');
  const [monthlyBudget, setMonthlyBudget] = useState('');
  
  // Validation State
  const [stepErrors, setStepErrors] = useState<string[]>([]);

  // One-click demo data loader — fills all 5 steps for judge demo
  const loadDemoData = () => {
    setCategory('career');
    setDecision('I have a full-time offer from a Series B tech startup and I have also been accepted into a top MBA program. The offer expires in 3 weeks. I need to decide which path to take.');
    setOptions(['Accept the startup job offer', 'Enroll in the MBA program']);
    setSelectedConstraints(['Limited money/savings', 'Time pressure (deadline approaching)']);
    setRankedValues(['Financial Security', 'Personal Growth', 'Work-Life Balance', 'Emotional Wellbeing']);
    setTimeline('3 weeks — startup offer expires July 5th');
    setFear('Making the wrong call and spending years wondering what would have happened if I chose the other path');
    setSavings('18000');
    setMonthlyBudget('3200');
    setStepErrors([]);
    // Jump directly to step 5 so the user just hits submit
    setCurrentStep(5);
  };

  // Helpers for options
  const handleAddOption = () => {
    if (options.length < 4) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const updated = [...options];
      updated.splice(index, 1);
      setOptions(updated);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  // Helpers for constraints
  const toggleConstraint = (constraint: string) => {
    if (selectedConstraints.includes(constraint)) {
      setSelectedConstraints(selectedConstraints.filter((c) => c !== constraint));
    } else {
      setSelectedConstraints([...selectedConstraints, constraint]);
    }
  };

  // Helpers for values
  const handleValueClick = (val: string) => {
    if (rankedValues.includes(val)) {
      setRankedValues(rankedValues.filter((v) => v !== val));
    } else {
      if (rankedValues.length < 5) {
        setRankedValues([...rankedValues, val]);
      }
    }
  };

  const moveRankedValue = (index: number, direction: 'up' | 'down') => {
    const newRanked = [...rankedValues];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx >= 0 && targetIdx < newRanked.length) {
      const temp = newRanked[index];
      newRanked[index] = newRanked[targetIdx];
      newRanked[targetIdx] = temp;
      setRankedValues(newRanked);
    }
  };

  // Step validation
  const validateStep = (step: number): boolean => {
    setStepErrors([]);
    const errors: string[] = [];

    if (step === 1) {
      if (!decision.trim()) {
        errors.push('Please describe the decision you are facing.');
      }
    } else if (step === 2) {
      const nonEmpties = options.filter(o => o.trim());
      if (nonEmpties.length < 2) {
        errors.push('Please enter at least 2 options to compare.');
      }
      if (options.some(o => o.trim() === '')) {
        errors.push('Option fields cannot be left empty.');
      }
    } else if (step === 3) {
      if (selectedConstraints.length === 0 && !customConstraint.trim()) {
        errors.push('Please select at least 1 constraint or enter a custom constraint.');
      }
    } else if (step === 4) {
      if (rankedValues.length < 2) {
        errors.push('Please rank at least 2 values to weight your decisions.');
      }
    } else if (step === 5) {
      if (!timeline.trim()) {
        errors.push('Please specify a timeline for this decision.');
      }
      if (!fear.trim()) {
        errors.push('Please express your biggest fear about making this choice.');
      }
    }

    if (errors.length > 0) {
      setStepErrors(errors);
      return false;
    }
    return true;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setStepErrors([]);
    setCurrentStep(currentStep - 1);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    // Combine constraints
    const finalConstraints = [...selectedConstraints];
    if (customConstraint.trim()) {
      finalConstraints.push(customConstraint.trim());
    }

    const data: IntakeData = {
      decision: decision.trim(),
      options: options.map(o => o.trim()),
      constraints: finalConstraints,
      values: rankedValues,
      timeline: timeline.trim(),
      fear: fear.trim(),
      category,
      savings: savings ? parseFloat(savings) : undefined,
      monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : undefined,
    };

    submitIntake(data);
  };

  // Framer Motion presets
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' as const }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -50 : 50,
      opacity: 0,
      transition: { duration: 0.2, ease: 'easeIn' as const }
    })
  };

  return (
    <div className="w-full max-w-3xl rounded-2xl p-6 md:p-10" style={{
      background: 'rgba(13, 17, 32, 0.80)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(99, 116, 163, 0.2)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
    }}>
      {/* One-click demo banner (step 1 only) */}
      {currentStep === 1 && (
        <div className="mb-6 flex items-center justify-between rounded-xl px-4 py-3"
          style={{ background: 'rgba(59, 111, 255, 0.06)', border: '1px solid rgba(59, 111, 255, 0.18)' }}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>Quick Start</p>
            <p className="text-xs font-semibold mt-0.5" style={{ color: '#9ba8c9' }}>Load a sample career decision to see Crossroads in action</p>
          </div>
          <button
            type="button"
            id="demo-load-btn"
            onClick={loadDemoData}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-black transition-all duration-200 shrink-0 ml-4"
            style={{
              background: 'rgba(59, 111, 255, 0.2)',
              border: '1px solid rgba(59, 111, 255, 0.4)',
              color: '#7ba7ff',
              boxShadow: '0 0 12px rgba(59, 111, 255, 0.2)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59, 111, 255, 0.3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(59, 111, 255, 0.2)')}
          >
            <Zap className="h-3.5 w-3.5" />
            Try Demo
          </button>
        </div>
      )}

      {/* Step Progress indicators */}
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.15)' }}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
            Step {currentStep} of 5
          </span>
          <h2 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
            {STEPS[currentStep - 1].title}
          </h2>
        </div>
        <div className="flex h-1.5 w-full gap-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(99, 116, 163, 0.15)' }}>
          {STEPS.map((step) => (
            <div
              key={step.id}
              className="h-full flex-1 rounded-full transition-all duration-500"
              style={{
                background: step.id <= currentStep
                  ? 'linear-gradient(90deg, #3b6fff, #8b5cf6)'
                  : 'transparent',
                boxShadow: step.id <= currentStep ? '0 0 6px rgba(59, 111, 255, 0.4)' : 'none',
              }}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="min-h-[320px] flex flex-col justify-between">
        <div className="flex-1">
          {/* Validation Alerts */}
          {stepErrors.length > 0 && (
            <div className="mb-6 rounded-xl p-4 text-xs font-medium flex items-start gap-2" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.2)', color: '#fb7185' }}>
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
              <div className="flex flex-col gap-1">
                {stepErrors.map((err, i) => (
                  <span key={i}>{err}</span>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait" custom={1}>
            {currentStep === 1 && (
              <motion.div
                key="step1"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#5c6b8c' }}>
                    What category fits your decision?
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {DECISION_CATEGORIES.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className="flex flex-col items-start rounded-xl p-3.5 text-left transition-all cursor-pointer"
                        style={{
                          background: category === cat.value ? 'rgba(59, 111, 255, 0.15)' : 'rgba(8, 11, 20, 0.5)',
                          border: category === cat.value ? '1px solid rgba(59, 111, 255, 0.4)' : '1px solid rgba(99, 116, 163, 0.18)',
                          boxShadow: category === cat.value ? '0 0 12px rgba(59, 111, 255, 0.2)' : 'none',
                        }}
                      >
                        <span className="text-xs font-bold" style={{ color: category === cat.value ? '#7ba7ff' : '#e2e8f0' }}>{cat.label}</span>
                        <span className="mt-1 text-[10px] line-clamp-1 leading-normal" style={{ color: '#5c6b8c' }}>
                          {cat.examples}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="decision" className="block text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                    Describe the decision you are facing
                  </label>
                  <textarea
                    id="decision"
                    value={decision}
                    onChange={(e) => setDecision(e.target.value)}
                    placeholder="e.g. I am a recent CS graduate trying to choose between accepting a mid-level SWE role at a local mid-sized startup or pursuing a 2-year Master's in AI at a top university..."
                    className="field h-28 leading-relaxed resize-none"
                  />
                  <p className="text-[11px] leading-normal" style={{ color: '#5c6b8c' }}>
                    Give details: what's the core conflict? The more specific details you add, the better your analysis will be.
                  </p>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#5c6b8c' }}>
                      What options are you considering?
                    </label>
                    <p className="text-xs" style={{ color: '#5c6b8c' }}>
                      List 2 to 4 concrete paths you are choosing between.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {options.map((option, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                          style={{ background: 'rgba(59, 111, 255, 0.15)', color: '#7ba7ff' }}>
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`e.g. ${
                            idx === 0 
                              ? 'Accept the $75k Software Engineer role' 
                              : idx === 1 
                              ? "Pursue the MS in AI at University" 
                              : 'Try bootstrapping my own startup idea'
                          }`}
                          className="field"
                        />
                        {options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(idx)}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer"
                            style={{ color: '#5c6b8c' }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {options.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer"
                      style={{ border: '1px dashed rgba(99, 116, 163, 0.35)', color: '#9ba8c9', background: 'transparent' }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Option</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#5c6b8c' }}>
                    What constraints are bounding you?
                  </label>
                  <p className="text-xs mb-4" style={{ color: '#5c6b8c' }}>
                    Select all parameters that limit your options right now.
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {CONSTRAINT_OPTIONS.map((c) => {
                      const isSelected = selectedConstraints.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleConstraint(c)}
                          className="flex items-center gap-2.5 rounded-xl p-3.5 text-left text-xs font-semibold transition-all cursor-pointer"
                          style={{
                            background: isSelected ? 'rgba(59, 111, 255, 0.12)' : 'rgba(8, 11, 20, 0.5)',
                            border: isSelected ? '1px solid rgba(59, 111, 255, 0.35)' : '1px solid rgba(99, 116, 163, 0.18)',
                            color: isSelected ? '#7ba7ff' : '#9ba8c9',
                          }}
                        >
                          <div
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md border transition-all"
                            style={{
                              background: isSelected ? '#3b6fff' : 'transparent',
                              borderColor: isSelected ? '#3b6fff' : 'rgba(99, 116, 163, 0.4)',
                              color: '#fff',
                            }}
                          >
                            {isSelected && <Check className="h-3 w-3" />}
                          </div>
                          <span className="line-clamp-1">{c}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic sub-form for Limited money/savings */}
                <AnimatePresence>
                  {selectedConstraints.includes('Limited money/savings') && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden p-4 rounded-xl space-y-4"
                      style={{
                        background: 'rgba(59, 111, 255, 0.06)',
                        border: '1px solid rgba(59, 111, 255, 0.2)',
                      }}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#7ba7ff' }}>
                        <span>💰 Cash Runway Simulator Variables</span>
                      </div>
                      <p className="text-[10px] font-semibold leading-normal" style={{ color: '#5c6b8c' }}>
                        Providing these variables enables live financial runway projections on your dashboard.
                      </p>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                            Current Savings ($)
                          </label>
                          <input
                            type="number"
                            value={savings}
                            onChange={(e) => setSavings(e.target.value)}
                            placeholder="e.g. 15000"
                            min="0"
                            className="field"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                            Target Monthly Cost ($)
                          </label>
                          <input
                            type="number"
                            value={monthlyBudget}
                            onChange={(e) => setMonthlyBudget(e.target.value)}
                            placeholder="e.g. 2500"
                            min="0"
                            className="field"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  <label htmlFor="custom-constraint" className="block text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                    Any other custom constraint? (Optional)
                  </label>
                  <input
                    id="custom-constraint"
                    type="text"
                    value={customConstraint}
                    onChange={(e) => setCustomConstraint(e.target.value)}
                    placeholder="e.g. My lease ends in 2 months, I need to stay near my family network..."
                    className="field"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="grid grid-cols-1 gap-6 md:grid-cols-2"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1" style={{ color: '#5c6b8c' }}>
                      Rank Your Core Values
                    </label>
                    <p className="text-xs" style={{ color: '#5c6b8c' }}>
                      Click up to 5 values. Selection order = your priority rank.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {VALUE_OPTIONS.map((val) => {
                      const isRanked = rankedValues.includes(val);
                      const rankIdx = rankedValues.indexOf(val);
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => handleValueClick(val)}
                          disabled={!isRanked && rankedValues.length >= 5}
                          className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-40"
                          style={{
                            background: isRanked ? 'linear-gradient(135deg, #3b6fff, #6366f1)' : 'rgba(8, 11, 20, 0.6)',
                            border: isRanked ? '1px solid rgba(59, 111, 255, 0.5)' : '1px solid rgba(99, 116, 163, 0.2)',
                            color: isRanked ? '#fff' : '#9ba8c9',
                            boxShadow: isRanked ? '0 2px 10px rgba(59, 111, 255, 0.3)' : 'none',
                          }}
                        >
                          {isRanked && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/20 text-[10px] font-black">
                              {rankIdx + 1}
                            </span>
                          )}
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl p-5 space-y-4" style={{ background: 'rgba(8, 11, 20, 0.5)', border: '1px solid rgba(99, 116, 163, 0.15)' }}>
                  <h3 className="text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                    Your Priority Ranking:
                  </h3>
                  {rankedValues.length === 0 ? (
                    <div className="flex h-28 items-center justify-center rounded-lg text-xs font-medium" style={{ border: '1px dashed rgba(99, 116, 163, 0.2)', color: '#3a4a6b' }}>
                      No values selected yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <AnimatePresence>
                        {rankedValues.map((val, idx) => (
                          <motion.div
                            key={val}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center justify-between rounded-lg px-3.5 py-2.5"
                            style={{ background: 'rgba(13, 17, 32, 0.8)', border: '1px solid rgba(99, 116, 163, 0.15)' }}
                          >
                            <div className="flex items-center gap-2">
                              <span className="flex h-5 w-5 items-center justify-center rounded-md text-xs font-bold"
                                style={{ background: 'rgba(59, 111, 255, 0.15)', color: '#7ba7ff' }}>
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold" style={{ color: '#e2e8f0' }}>
                                {val}
                              </span>
                            </div>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveRankedValue(idx, 'up')}
                                className="rounded-md p-1 transition-colors disabled:opacity-30 cursor-pointer"
                                style={{ color: '#5c6b8c' }}
                              >
                                <ChevronUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === rankedValues.length - 1}
                                onClick={() => moveRankedValue(idx, 'down')}
                                className="rounded-md p-1 transition-colors disabled:opacity-30 cursor-pointer"
                                style={{ color: '#5c6b8c' }}
                              >
                                <ChevronDown className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 5 && (
              <motion.div
                key="step5"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label htmlFor="timeline" className="block text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                    What is your timeline for deciding?
                  </label>
                  <input
                    id="timeline"
                    type="text"
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    placeholder="e.g. Need to respond to the job offer within 10 days"
                    className="field"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fear" className="block text-[10px] font-black uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
                    What is your biggest fear regarding this decision?
                  </label>
                  <textarea
                    id="fear"
                    value={fear}
                    onChange={(e) => setFear(e.target.value)}
                    placeholder="e.g. That I will make the 'safe' choice and regret not specializing in AI research, or that I will fail in grad school and end up with immense debt and no job."
                    className="field h-28 leading-relaxed resize-none"
                  />
                  <p className="text-[11px] leading-normal" style={{ color: '#5c6b8c' }}>
                    This fear provides deep emotional context that helps the AI challenge assumptions and outline downside risks.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Form controls */}
        <div className="mt-8 flex items-center justify-between pt-6" style={{ borderTop: '1px solid rgba(99, 116, 163, 0.15)' }}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="btn-ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary px-7 py-3"
            >
              <span>Run AI Simulator</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

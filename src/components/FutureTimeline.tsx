'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scenario } from '../lib/types';
import { Clock, ChevronRight, AlertTriangle, Eye, Gift, Sparkles } from 'lucide-react';

interface FutureTimelineProps {
  scenarios: Scenario[];
  toggledOffConstraints?: string[];
}

function getSimulatedShift(constraint: string, optionName: string, month: 30 | 60 | 90): string {
  const c = constraint.toLowerCase();
  
  if (c.includes('money') || c.includes('savings') || c.includes('debt') || c.includes('budget') || c.includes('cost')) {
    if (month === 30) {
      return `💰 With financial pressure removed, your first month on "${optionName}" is spent focused on deep learning/onboarding rather than daily budget anxiety. You set up a premium workspace and clear your head.`;
    } else if (month === 60) {
      return `💰 Two months in, you invest in premium tools, courses, or travel. Your focus shifts from survival to compounding your skills and building long-term equity.`;
    } else {
      return `💰 By day 90, you are taking bolder, higher-upside bets on "${optionName}" because you have a cash buffer. The risk of burnout is drastically reduced.`;
    }
  }
  
  if (c.includes('time') || c.includes('deadline') || c.includes('limits')) {
    if (month === 30) {
      return `⏳ Without the ticking clock, you negotiate a delayed start. You spend the first 30 days clearing your head, preparing, and starting with 100% battery.`;
    } else if (month === 60) {
      return `⏳ Working at your own pace, you dive deeper into complex tasks. You do not cut corners, and the quality of your output on "${optionName}" stands out.`;
    } else {
      return `⏳ Three months in, you avoid the typical "rushed launch" mistakes. You have established a sustainable, long-term velocity.`;
    }
  }
  
  if (c.includes('geographic') || c.includes('location') || c.includes('lease') || c.includes('housing')) {
    if (month === 30) {
      return `🌍 Relocation barriers dissolve. You find housing directly in the primary hub rather than negotiating remote compromises or long commutes.`;
    } else if (month === 60) {
      return `🌍 You attend in-person meetups and office sessions. The organic networking opportunities of being physically present boost your momentum on "${optionName}".`;
    } else {
      return `🌍 By day 90, you have built a strong local community. You avoid the isolation of remote-only structures and feel a deep sense of belonging.`;
    }
  }

  if (c.includes('relationship') || c.includes('family') || c.includes('partner')) {
    if (month === 30) {
      return `🤝 Clear boundaries and upfront alignment are established. You begin "${optionName}" with full focus, having resolved relational friction early.`;
    } else if (month === 60) {
      return `🤝 You establish a healthy communication routine. Relational support acts as an accelerator for your work, rather than a distraction.`;
    } else {
      return `🤝 You achieve balance. Your professional progress and personal relationships reinforce each other, building sustainable happiness.`;
    }
  }

  // General fallback
  if (month === 30) {
    return `🌿 Without "${constraint}", your first 30 days are smoother. You focus on executing the core path without defensive compromises.`;
  } else if (month === 60) {
    return `🌿 Day 60 shows accelerated growth. You take risks that were previously blocked by this constraint.`;
  } else {
    return `🌿 By day 90, you have capitalized on your freedom. Toggling this constraint off has boosted your path alignment score.`;
  }
}

export default function FutureTimeline({ scenarios, toggledOffConstraints = [] }: FutureTimelineProps) {
  const [activeScenario, setActiveScenario] = useState(0);
  const [activeMonth, setActiveMonth] = useState<30 | 60 | 90>(30);

  const scenario = scenarios[activeScenario];
  if (!scenario) return null;

  const narrative = activeMonth === 30 ? scenario.narrative_30_days
    : activeMonth === 60 ? scenario.narrative_60_days
    : scenario.narrative_90_days;

  const monthColors = { 30: '#2d6a4f', 60: '#774936', 90: '#9b2226' };

  return (
    <div style={{ background: '#fff', border: '1px solid #dedad2', borderRadius: '20px', padding: '28px', marginTop: '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#1b1b18', marginBottom: '8px' }}>
          See your future unfold
        </h3>
        <p style={{ fontSize: '14px', color: '#7c7b72' }}>
          Pick a path below, then scrub through time to see what each month looks like.
        </p>
      </div>

      {/* Scenario selector tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {scenarios.map((s, i) => (
          <button
            key={s.option_name}
            onClick={() => setActiveScenario(i)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: activeScenario === i ? 700 : 500,
              background: activeScenario === i ? '#2d6a4f' : '#eae8e1',
              color: activeScenario === i ? '#fff' : '#3d3b35',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {s.option_name}
          </button>
        ))}
      </div>

      {/* Timeline scrubber */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '24px', background: '#eae8e1', borderRadius: '12px', padding: '4px' }}>
        {([30, 60, 90] as const).map((month) => (
          <button
            key={month}
            onClick={() => setActiveMonth(month)}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              background: activeMonth === month ? '#fff' : 'transparent',
              color: activeMonth === month ? monthColors[month] : '#7c7b72',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeMonth === month ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Clock size={14} />
            Day {month}
          </button>
        ))}
      </div>

      {/* Animated narrative */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeScenario}-${activeMonth}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          style={{ minHeight: '180px' }}
        >
          {/* The story */}
          <div style={{
            background: '#f4f3ef',
            borderRadius: '14px',
            padding: '20px',
            borderLeft: `4px solid ${monthColors[activeMonth]}`,
            marginBottom: '16px',
          }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: monthColors[activeMonth], textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {scenario.option_name} — Day {activeMonth}
            </p>
            <p style={{ fontSize: '15px', color: '#1b1b18', lineHeight: 1.7 }}>
              {narrative}
            </p>
          </div>

          {/* Dynamic simulated narrative shift when constraints are removed */}
          {toggledOffConstraints && toggledOffConstraints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #a7f3d0',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
              }}
            >
              <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#047857', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Sparkles size={14} /> Simulated Future Shift:
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {toggledOffConstraints.map((c) => (
                  <p key={c} style={{ fontSize: '13px', color: '#064e3b', lineHeight: 1.6, margin: 0 }}>
                    {getSimulatedShift(c, scenario.option_name, activeMonth)}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Quick stats for this scenario */}
          <div style={{ display: 'grid', gridTemplateColumns: '0.8fr 1.6fr 1.6fr', gap: '12px', alignItems: 'stretch' }}>
            <div style={{ background: '#f0fdf4', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1e7dd' }}>
              <div style={{ fontSize: '11px', color: '#2d6a4f', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Eye size={12} /> Confidence
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#1b4332' }}>{scenario.confidence}%</div>
            </div>
            <div style={{ background: '#fef9f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', textAlign: 'left', border: '1px solid #fae0c4' }}>
              <div style={{ fontSize: '11px', color: '#774936', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(119,73,54,0.15)', paddingBottom: '3px' }}>
                <AlertTriangle size={12} /> Biggest Risk
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#774936', lineHeight: 1.4 }}>{scenario.biggest_risk}</div>
            </div>
            <div style={{ background: '#faf0f0', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', textAlign: 'left', border: '1px solid #f5c2c2' }}>
              <div style={{ fontSize: '11px', color: '#9b2226', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px', borderBottom: '1px solid rgba(155,34,38,0.15)', paddingBottom: '3px' }}>
                <Gift size={12} /> What You Give Up
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#9b2226', lineHeight: 1.4 }}>{scenario.what_you_give_up}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation hint */}
      <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#7c7b72', fontSize: '12px' }}>
        <Clock size={14} />
        <span>Toggling constraints above updates these months with simulated shifts</span>
      </div>
    </div>
  );
}

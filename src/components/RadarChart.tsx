'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scenario } from '../lib/types';
import { DimensionWeights } from '../lib/scoring';

interface RadarChartProps {
  scenarios: Scenario[];
  weights: DimensionWeights;
  baselineScenarios?: Scenario[]; // Original scenarios before What-If
}

export default function RadarChart({ scenarios, weights, baselineScenarios }: RadarChartProps) {
  const cx = 160;
  const cy = 148;
  const radius = 95;

  const dimensions = [
    { key: 'financial',     label: 'Financial' },
    { key: 'growth',        label: 'Growth' },
    { key: 'relationships', label: 'Relations' },
    { key: 'stability',     label: 'Stability' },
    { key: 'emotional',     label: 'Emotional' },
  ] as const;

  // Rich colour palette
  const optionColors = [
    {
      stroke: 'rgba(37, 99, 235, 0.95)',
      fill:   'rgba(37, 99, 235, 0.12)',
      dot:    '#2563eb',
      label:  '#1d4ed8',
      ghostStroke: 'rgba(37, 99, 235, 0.3)',
      ghostFill: 'rgba(37, 99, 235, 0.04)',
    },
    {
      stroke: 'rgba(13, 148, 136, 0.95)',
      fill:   'rgba(13, 148, 136, 0.12)',
      dot:    '#0d9488',
      label:  '#0f766e',
      ghostStroke: 'rgba(13, 148, 136, 0.3)',
      ghostFill: 'rgba(13, 148, 136, 0.04)',
    },
    {
      stroke: 'rgba(217, 119, 6, 0.95)',
      fill:   'rgba(217, 119, 6, 0.12)',
      dot:    '#d97706',
      label:  '#b45309',
      ghostStroke: 'rgba(217, 119, 6, 0.3)',
      ghostFill: 'rgba(217, 119, 6, 0.04)',
    },
    {
      stroke: 'rgba(124, 58, 237, 0.95)',
      fill:   'rgba(124, 58, 237, 0.12)',
      dot:    '#7c3aed',
      label:  '#6d28d9',
      ghostStroke: 'rgba(124, 58, 237, 0.3)',
      ghostFill: 'rgba(124, 58, 237, 0.04)',
    },
  ];

  const hasGhosts = baselineScenarios && baselineScenarios.length > 0;

  const getCoordinates = (value: number, index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const dist = (value / 100) * radius;
    return { x: cx + dist * Math.cos(angle), y: cy + dist * Math.sin(angle) };
  };

  const getLabelCoordinates = (index: number) => {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / 5;
    const labelDist = radius + 26;
    const x = cx + labelDist * Math.cos(angle);
    const y = cy + labelDist * Math.sin(angle);
    let textAnchor: 'start' | 'middle' | 'end' = 'middle';
    if (Math.cos(angle) > 0.1) textAnchor = 'start';
    if (Math.cos(angle) < -0.1) textAnchor = 'end';
    let dominantBaseline: 'middle' | 'hanging' | 'auto' = 'middle';
    if (Math.sin(angle) > 0.8) dominantBaseline = 'hanging';
    if (Math.sin(angle) < -0.8) dominantBaseline = 'auto';
    return { x, y, textAnchor, dominantBaseline };
  };

  const gridRings = [25, 50, 75, 100].map((level) => {
    const points = dimensions
      .map((_, idx) => {
        const { x, y } = getCoordinates(level, idx);
        return `${x},${y}`;
      })
      .join(' ');
    return { level, points };
  });

  // Calculate ghost points for baseline scenarios
  const ghostPolygons = useMemo(() => {
    if (!baselineScenarios) return [];
    return baselineScenarios.map((scenario) => {
      return dimensions
        .map((dim, dimIdx) => {
          const rawVal = scenario.dimension_scores[dim.key] || 0;
          const weight = weights[dim.key] ?? 50;
          const val = Math.round((rawVal * weight) / 100);
          const { x, y } = getCoordinates(val, dimIdx);
          return `${x},${y}`;
        })
        .join(' ');
    });
  }, [baselineScenarios, weights]);

  return (
    <div className="flex flex-col items-center justify-between rounded-2xl p-5 h-full md:p-6"
      style={{
        background: '#f4f3ef',
        backdropFilter: 'none',
        border: '1px solid rgba(180, 172, 160, 0.8)',
      }}>

      {/* Header */}
      <div className="w-full pb-3" style={{ borderBottom: '1px solid rgba(180, 172, 160, 0.6)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b7355, #2d6a4f)' }} />
          <h4 className="text-sm font-bold" style={{ color: '#141413' }}>Profile Shapes</h4>
          {hasGhosts && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-bold"
              style={{
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#7c3aed',
                border: '1px solid rgba(139, 92, 246, 0.25)',
              }}
            >
              ⚡ What-If Active
            </motion.span>
          )}
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#3d3b35' }}>
          {hasGhosts
            ? 'Dashed = before. Solid = after removing constraints. See which path grows most.'
            : 'Each shape is one of your options. Bigger shape = better fit for your current priorities. Drag the sliders to see shapes change.'
          }
        </p>
      </div>

      {/* SVG */}
      <div className="relative flex items-center justify-center w-full my-2 aspect-square max-w-[290px]">
        <svg viewBox="0 0 320 296" className="w-full h-full overflow-visible">
          {/* Defs: glows */}
          <defs>
            {optionColors.map((c, i) => (
              <filter key={i} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            {/* Pulse animation for ghost comparison */}
            <filter id="ghost-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid rings */}
          {gridRings.map((ring) => (
            <polygon
              key={ring.level}
              points={ring.points}
              fill="none"
              stroke={ring.level === 100 ? 'rgba(180, 172, 160, 1)' : 'rgba(180, 172, 160, 0.6)'}
              strokeWidth={ring.level === 100 ? 1.5 : 1}
              strokeDasharray={ring.level !== 100 ? '3,3' : undefined}
            />
          ))}

          {/* Ring labels (25, 50, 75) */}
          {[25, 50, 75].map((level) => {
            const { y } = getCoordinates(level, 0); // top axis
            return (
              <text key={level} x={cx + 4} y={y - 3}
                fontSize="7" fill="rgba(60, 60, 55, 0.6)"
                textAnchor="start" fontWeight="600">
                {level}
              </text>
            );
          })}

          {/* Axis lines */}
          {dimensions.map((_, idx) => {
            const end = getCoordinates(100, idx);
            return (
              <line key={idx} x1={cx} y1={cy} x2={end.x} y2={end.y}
                stroke="rgba(180, 172, 160, 0.7)" strokeWidth="1" />
            );
          })}

          {/* Axis labels */}
          {dimensions.map((dim, idx) => {
            const { x, y, textAnchor, dominantBaseline } = getLabelCoordinates(idx);
            return (
              <text key={dim.key} x={x} y={y}
                textAnchor={textAnchor}
                dominantBaseline={dominantBaseline}
                fontSize="9.5"
                fontWeight="700"
                fill="rgba(40, 40, 37, 0.9)"
                letterSpacing="0.06em"
                style={{ textTransform: 'uppercase' }}>
                {dim.label}
              </text>
            );
          })}

          {/* GHOST polygons (baseline/original scores) — dashed, faded */}
          {hasGhosts && ghostPolygons.map((ghostPoints, idx) => {
            const colors = optionColors[idx % optionColors.length];
            if (!colors) return null;
            return (
              <motion.polygon
                key={`ghost-${idx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                points={ghostPoints}
                fill={colors.ghostFill}
                stroke={colors.ghostStroke}
                strokeWidth="1.5"
                strokeDasharray="4,3"
                strokeLinejoin="round"
                filter="url(#ghost-glow)"
              />
            );
          })}

          {/* Active scenario polygons */}
          {scenarios.map((scenario, idx) => {
            const colors = optionColors[idx % optionColors.length];
            if (!colors) return null;

            const pointsString = dimensions
              .map((dim, dimIdx) => {
                const rawVal = scenario.dimension_scores[dim.key] || 0;
                const weight = weights[dim.key] ?? 50;
                const val = Math.round((rawVal * weight) / 100);
                const { x, y } = getCoordinates(val, dimIdx);
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <g key={scenario.option_name}>
                <motion.polygon
                  animate={{ points: pointsString }}
                  transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="2"
                  strokeLinejoin="round"
                  filter={`url(#glow-${idx})`}
                />
                {dimensions.map((dim, dimIdx) => {
                  const rawVal = scenario.dimension_scores[dim.key] || 0;
                  const weight = weights[dim.key] ?? 50;
                  const val = Math.round((rawVal * weight) / 100);
                  const { x, y } = getCoordinates(val, dimIdx);
                  return (
                    <motion.circle
                      key={dim.key}
                      animate={{ cx: x, cy: y }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      r="4.5"
                      fill={colors.dot}
                      stroke="#f4f3ef"
                      strokeWidth="1.5"
                      style={{ filter: `drop-shadow(0 0 4px ${colors.dot})` }}
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-2 pt-3"
        style={{ borderTop: '1px solid rgba(180, 172, 160, 0.6)' }}>
        {scenarios.map((scenario, idx) => {
          const colors = optionColors[idx % optionColors.length];
          if (!colors) return null;
          return (
            <div key={scenario.option_name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0"
                style={{ background: colors.dot, boxShadow: `0 0 6px ${colors.dot}` }} />
              <span className="text-[10px] font-semibold truncate max-w-[110px]"
                style={{ color: colors.label }}>
                {scenario.option_name}
              </span>
            </div>
          );
        })}
        {hasGhosts && (
          <div className="col-span-2 flex items-center gap-2 mt-1 pt-2"
            style={{ borderTop: '1px dashed rgba(180, 172, 160, 0.5)' }}>
            <svg width="20" height="10">
              <line x1="0" y1="5" x2="20" y2="5"
                stroke="rgba(100, 100, 100, 0.5)" strokeWidth="1.5" strokeDasharray="3,2" />
            </svg>
            <span className="text-[9px] font-semibold" style={{ color: '#6c6a64' }}>
              Original shape (before removing constraints)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

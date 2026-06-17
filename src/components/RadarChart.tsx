'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Scenario } from '../lib/types';

interface RadarChartProps {
  scenarios: Scenario[];
}

export default function RadarChart({ scenarios }: RadarChartProps) {
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
      stroke: 'rgba(59, 111, 255, 0.9)',
      fill:   'rgba(59, 111, 255, 0.15)',
      dot:    '#3b6fff',
      label:  '#7ba7ff',
    },
    {
      stroke: 'rgba(16, 185, 129, 0.9)',
      fill:   'rgba(16, 185, 129, 0.12)',
      dot:    '#10b981',
      label:  '#34d399',
    },
    {
      stroke: 'rgba(245, 158, 11, 0.9)',
      fill:   'rgba(245, 158, 11, 0.12)',
      dot:    '#f59e0b',
      label:  '#fbbf24',
    },
    {
      stroke: 'rgba(139, 92, 246, 0.9)',
      fill:   'rgba(139, 92, 246, 0.12)',
      dot:    '#8b5cf6',
      label:  '#a78bfa',
    },
  ];

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

  return (
    <div className="flex flex-col items-center justify-between rounded-2xl p-5 h-full md:p-6"
      style={{
        background: 'rgba(13, 17, 32, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 116, 163, 0.2)',
      }}>

      {/* Header */}
      <div className="w-full pb-3" style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #8b5cf6, #3b6fff)' }} />
          <h4 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>Profile Shapes</h4>
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#5c6b8c' }}>
          Visual comparison across all 5 dimensions. Balanced shapes represent stable choices.
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
          </defs>

          {/* Grid rings */}
          {gridRings.map((ring) => (
            <polygon
              key={ring.level}
              points={ring.points}
              fill="none"
              stroke={ring.level === 100 ? 'rgba(99, 116, 163, 0.35)' : 'rgba(99, 116, 163, 0.12)'}
              strokeWidth={ring.level === 100 ? 1.5 : 1}
              strokeDasharray={ring.level !== 100 ? '3,3' : undefined}
            />
          ))}

          {/* Ring labels (25, 50, 75) */}
          {[25, 50, 75].map((level) => {
            const { y } = getCoordinates(level, 0); // top axis
            return (
              <text key={level} x={cx + 4} y={y - 3}
                fontSize="7" fill="rgba(99, 116, 163, 0.5)"
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
                stroke="rgba(99, 116, 163, 0.18)" strokeWidth="1" />
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
                fill="rgba(155, 168, 201, 0.8)"
                letterSpacing="0.06em"
                style={{ textTransform: 'uppercase' }}>
                {dim.label}
              </text>
            );
          })}

          {/* Scenario polygons */}
          {scenarios.map((scenario, idx) => {
            const colors = optionColors[idx % optionColors.length];
            if (!colors) return null;

            // Memoize per-scenario points so only dimension_scores changes trigger recompute
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const pointsString = useMemo(() =>
              dimensions
                .map((dim, dimIdx) => {
                  const val = scenario.dimension_scores[dim.key] || 0;
                  const { x, y } = getCoordinates(val, dimIdx);
                  return `${x},${y}`;
                })
                .join(' '),
              // eslint-disable-next-line react-hooks/exhaustive-deps
              [scenario.dimension_scores]
            );

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
                  const val = scenario.dimension_scores[dim.key] || 0;
                  const { x, y } = getCoordinates(val, dimIdx);
                  return (
                    <motion.circle
                      key={dim.key}
                      animate={{ cx: x, cy: y }}
                      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
                      r="4.5"
                      fill={colors.dot}
                      stroke="rgba(8, 11, 20, 0.8)"
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
        style={{ borderTop: '1px solid rgba(99, 116, 163, 0.15)' }}>
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
      </div>
    </div>
  );
}

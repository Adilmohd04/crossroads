'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

type HeroTheme = 'dawn' | 'noon' | 'dusk';

const THEMES: Record<HeroTheme, {
  name: string;
  icon: string;
  description: string;
  sky: string;
  sunBg: string;
  sunTop: string;
  sunScale: string;
  sunInnerBg: string;
  sunInnerTop: string;
  sunInnerScale: string;
  farFarRidge: string;
  farRidge: string;
  midRidge: string;
  nearRidge: string;
  foreground: string;
  forest: string;
  deer: string;
  path: string;
}> = {
  dawn: {
    name: 'Dawn Horizon',
    icon: '🌅',
    description: 'Explore options with curious eyes.',
    sky: 'linear-gradient(180deg, #fde6c8 0%, #f5e0c5 15%, #ecd9c0 28%, #e0d4b8 42%, #cfd5b0 58%, #b8c8a0 75%, #a3b899 92%, #8eaa86 100%)',
    sunBg: 'radial-gradient(circle, #ffd07a 0%, rgba(255,200,100,0.3) 50%, transparent 75%)',
    sunTop: '13%',
    sunScale: '1.0',
    sunInnerBg: 'radial-gradient(circle, #fff5d8 0%, #ffd989 60%, transparent 80%)',
    sunInnerTop: '19%',
    sunInnerScale: '1.0',
    farFarRidge: '#bcd2bb',
    farRidge: '#9cb89e',
    midRidge: '#6e9070',
    nearRidge: '#3d6a47',
    foreground: '#3a5a3e',
    forest: '#1f4a2c',
    deer: '#1f3a25',
    path: '#e8c896',
  },
  noon: {
    name: 'Daylight Clarity',
    icon: '☀️',
    description: 'Evaluate paths with sharp logic.',
    sky: 'linear-gradient(180deg, #e3f2fd 0%, #bbdefb 18%, #90caf9 35%, #a5d6a7 55%, #81c784 72%, #66bb6a 88%, #4caf50 100%)',
    sunBg: 'radial-gradient(circle, #fffbe0 0%, rgba(255,253,220,0.45) 45%, transparent 70%)',
    sunTop: '7%',
    sunScale: '1.25',
    sunInnerBg: 'radial-gradient(circle, #ffffff 0%, #fff9d0 50%, transparent 80%)',
    sunInnerTop: '11%',
    sunInnerScale: '1.15',
    farFarRidge: '#bfdfc9',
    farRidge: '#9ec5a9',
    midRidge: '#73ab81',
    nearRidge: '#479159',
    foreground: '#3e6b47',
    forest: '#255c34',
    deer: '#23492e',
    path: '#d2b788',
  },
  dusk: {
    name: 'Sunset Wisdom',
    icon: '🌇',
    description: 'Reflect and commit with quiet peace.',
    sky: 'linear-gradient(180deg, #e8daef 0%, #fadbd8 20%, #f8c471 45%, #eb984e 65%, #d35400 80%, #a04000 92%, #78281f 100%)',
    sunBg: 'radial-gradient(circle, #ff7b54 0%, rgba(255,123,84,0.35) 50%, transparent 75%)',
    sunTop: '18%',
    sunScale: '1.4',
    sunInnerBg: 'radial-gradient(circle, #ffe5d9 0%, #ff8a65 60%, transparent 80%)',
    sunInnerTop: '23%',
    sunInnerScale: '1.25',
    farFarRidge: '#dfbfa8',
    farRidge: '#ca9b84',
    midRidge: '#aa7356',
    nearRidge: '#824729',
    foreground: '#5c3822',
    forest: '#331b0e',
    deer: '#261308',
    path: '#f2c78a',
  }
};

const LEFT_TREES = [
  { x: 50, y: 520, s: 1.2 },
  { x: 75, y: 518, s: 0.95 },
  { x: 100, y: 525, s: 1.1 },
  { x: 125, y: 512, s: 0.8 },
  { x: 150, y: 522, s: 1.0 },
  { x: 175, y: 515, s: 0.9 },
  { x: 200, y: 525, s: 1.15 },
  { x: 225, y: 512, s: 0.85 },
  { x: 250, y: 520, s: 1.05 },
  { x: 275, y: 510, s: 0.75 }
];

const RIGHT_TREES = [
  { x: 1165, y: 510, s: 0.8 },
  { x: 1190, y: 520, s: 1.0 },
  { x: 1215, y: 515, s: 0.9 },
  { x: 1240, y: 525, s: 1.15 },
  { x: 1265, y: 512, s: 0.85 },
  { x: 1290, y: 522, s: 1.0 },
  { x: 1315, y: 515, s: 0.95 },
  { x: 1340, y: 528, s: 1.1 },
  { x: 1365, y: 512, s: 0.8 },
];

const MIDGROUND_TREES_LEFT = [
  { x: 120, y: 460, s: 0.7 },
  { x: 140, y: 458, s: 0.6 },
  { x: 160, y: 462, s: 0.65 },
  { x: 180, y: 455, s: 0.5 },
  { x: 200, y: 463, s: 0.7 },
  { x: 220, y: 458, s: 0.55 },
  { x: 240, y: 465, s: 0.65 },
  { x: 260, y: 454, s: 0.45 },
  { x: 280, y: 462, s: 0.6 },
  { x: 300, y: 456, s: 0.5 },
  { x: 320, y: 464, s: 0.7 },
  { x: 340, y: 455, s: 0.55 },
  { x: 360, y: 463, s: 0.6 },
  { x: 380, y: 458, s: 0.45 }
];

const MIDGROUND_TREES_RIGHT = [
  { x: 1060, y: 458, s: 0.5 },
  { x: 1080, y: 464, s: 0.65 },
  { x: 1100, y: 455, s: 0.55 },
  { x: 1120, y: 462, s: 0.7 },
  { x: 1140, y: 458, s: 0.6 },
  { x: 1160, y: 465, s: 0.65 },
  { x: 1180, y: 454, s: 0.45 },
  { x: 1200, y: 462, s: 0.6 },
  { x: 1220, y: 456, s: 0.5 },
  { x: 1240, y: 464, s: 0.7 },
  { x: 1260, y: 455, s: 0.55 },
  { x: 1280, y: 463, s: 0.6 },
  { x: 1300, y: 458, s: 0.45 }
];

export default function NatureHero({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState<HeroTheme>('dawn');
  const t = THEMES[activeTheme];

  return (
    <section style={{ position: 'relative', overflow: 'hidden', minHeight: '720px' }}>
      {/* Sky gradient */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: t.sky,
        transition: 'background 1.5s ease-in-out',
      }} />

      {/* Drifting clouds */}
      <svg style={{ position: 'absolute', top: '8%', left: 0, width: '100%', height: '20%', zIndex: 1, overflow: 'visible' }}>
        <g className="cloud-1" opacity="0.45">
          <ellipse cx="0" cy="20" rx="60" ry="15" fill="#fff" />
          <ellipse cx="40" cy="15" rx="40" ry="12" fill="#fff" />
        </g>
        <g className="cloud-2" opacity="0.35">
          <ellipse cx="0" cy="40" rx="50" ry="12" fill="#fff" />
          <ellipse cx="30" cy="35" rx="35" ry="10" fill="#fff" />
        </g>
        <g className="cloud-3" opacity="0.4">
          <ellipse cx="0" cy="60" rx="70" ry="14" fill="#fff" />
        </g>
      </svg>

      {/* Sun glow & core */}
      <motion.div
        animate={{ 
          opacity: 1, 
          scale: Number(t.sunScale),
          top: t.sunTop
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          width: '220px', height: '220px', borderRadius: '50%',
          background: t.sunBg,
          zIndex: 1, filter: 'blur(2px)',
        }}
      />
      <motion.div
        animate={{ 
          scale: Number(t.sunInnerScale),
          top: t.sunInnerTop
        }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
        style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          width: '100px', height: '100px', borderRadius: '50%',
          background: t.sunInnerBg,
          zIndex: 1,
        }}
      />

      {/* Noon Shimmering Conic Sunrays */}
      {activeTheme === 'noon' && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', top: '2%', left: '50%', marginLeft: '-150px',
            width: '300px', height: '300px', zIndex: 1,
            background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.06) 0deg 15deg, transparent 15deg 30deg)',
            borderRadius: '50%', pointerEvents: 'none',
          }}
        />
      )}

      {/* Theme Switcher Pill Selector */}
      <div style={{
        position: 'absolute', top: '20px', right: '20px', zIndex: 25,
        background: 'rgba(255, 255, 255, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.65)',
        borderRadius: '30px', padding: '4px',
        display: 'flex', gap: '2px',
        boxShadow: '0 8px 32px rgba(10, 60, 47, 0.08)'
      }}>
        {(Object.keys(THEMES) as HeroTheme[]).map((themeKey) => {
          const themeInfo = THEMES[themeKey];
          const isSelected = activeTheme === themeKey;
          return (
            <button
              key={themeKey}
              onClick={() => setActiveTheme(themeKey)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 14px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 600,
                fontFamily: "'Outfit', sans-serif",
                cursor: 'pointer', border: 'none',
                background: isSelected ? 'var(--green)' : 'transparent',
                color: isSelected ? '#fff' : 'var(--muted)',
                transition: 'all 0.25s ease',
              }}
              title={themeInfo.description}
            >
              <span>{themeInfo.icon}</span>
              <span className="theme-btn-text">{themeInfo.name.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Mountain layers SVG */}
      <svg
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', zIndex: 2 }}
        viewBox="0 0 1440 580"
        preserveAspectRatio="none"
      >
        {/* Far far ridge - Smooth curved path */}
        <motion.path
          d="M0,360 Q200,290 400,340 T800,250 T1200,300 T1440,240 L1440,580 L0,580 Z"
          fill={t.farFarRidge} opacity="0.4"
          style={{ transition: 'fill 1.5s ease-in-out', transformOrigin: 'center bottom' }}
          animate={{ x: [-8, 8, -8], y: [0, 3, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Layered mountain mist (Drifting between ridges) */}
        <path
          d="M0,380 Q300,350 600,390 T1200,360 T1440,380 L1440,430 L0,430 Z"
          fill="#ffffff" opacity="0.12"
          style={{ animation: 'mistDrift 50s linear infinite' }}
        />

        {/* Far ridge - Smooth curved path */}
        <motion.path
          d="M0,400 Q180,330 380,380 T780,290 T1180,340 T1440,290 L1440,580 L0,580 Z"
          fill={t.farRidge} opacity="0.55"
          style={{ transition: 'fill 1.5s ease-in-out', transformOrigin: 'center bottom' }}
          animate={{ x: [6, -6, 6], y: [0, -2, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Layered mountain mist 2 */}
        <path
          d="M0,420 Q250,400 550,430 T1150,410 T1440,420 L1440,480 L0,480 Z"
          fill="#ffffff" opacity="0.08"
          style={{ animation: 'mistDrift 70s linear infinite', animationDelay: '-25s' }}
        />

        {/* Mid ridge - Smooth curved path */}
        <motion.path
          d="M0,440 Q160,370 360,420 T760,330 T1160,380 T1440,340 L1440,580 L0,580 Z"
          fill={t.midRidge} opacity="0.7"
          style={{ transition: 'fill 1.5s ease-in-out', transformOrigin: 'center bottom' }}
          animate={{ x: [-4, 4, -4], y: [0, 4, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Midground pine trees left (visual occlusion behind near ridge) */}
        <g fill={t.forest} opacity="0.65" style={{ transition: 'fill 1.5s ease-in-out' }}>
          {MIDGROUND_TREES_LEFT.map((tree, idx) => (
            <g key={`mgt-l-${idx}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
              <rect x="-1" y="0" width="2" height="6" opacity="0.5" fill="#3e2723" />
              <path d="M 0,-30 C 1,-25 2,-23 4,-21 C 2,-21 1.5,-21 1.5,-21 C 2.5,-16 4.5,-14 7,-12 C 4,-12 3,-12 3,-12 C 4.5,-6 6.5,-4 10,0 C -10,0 -4.5,-6 -3,-12 C -3,-12 -4,-12 -7,-12 C -4.5,-14 -2.5,-16 -1.5,-21 C -1.5,-21 -2,-21 -4,-21 C -2,-23 -1,-25 0,-30 Z" />
            </g>
          ))}
        </g>

        {/* Midground pine trees right (visual occlusion behind near ridge) */}
        <g fill={t.forest} opacity="0.65" style={{ transition: 'fill 1.5s ease-in-out' }}>
          {MIDGROUND_TREES_RIGHT.map((tree, idx) => (
            <g key={`mgt-r-${idx}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
              <rect x="-1" y="0" width="2" height="6" opacity="0.5" fill="#3e2723" />
              <path d="M 0,-30 C 1,-25 2,-23 4,-21 C 2,-21 1.5,-21 1.5,-21 C 2.5,-16 4.5,-14 7,-12 C 4,-12 3,-12 3,-12 C 4.5,-6 6.5,-4 10,0 C -10,0 -4.5,-6 -3,-12 C -3,-12 -4,-12 -7,-12 C -4.5,-14 -2.5,-16 -1.5,-21 C -1.5,-21 -2,-21 -4,-21 C -2,-23 -1,-25 0,-30 Z" />
            </g>
          ))}
        </g>

        {/* Near ridge - Smooth curved path */}
        <motion.path
          d="M0,480 Q140,410 340,460 T740,360 T1140,420 T1440,395 L1440,580 L0,580 Z"
          fill={t.nearRidge} opacity="0.85"
          style={{ transition: 'fill 1.5s ease-in-out', transformOrigin: 'center bottom' }}
          animate={{ x: [2, -2, 2], y: [0, -1, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Dawn Mist Effect */}
        {activeTheme === 'dawn' && (
          <g opacity="0.25">
            <ellipse cx="360" cy="460" rx="300" ry="12" fill="#ffffff" filter="blur(8px)" />
            <ellipse cx="1080" cy="480" rx="250" ry="10" fill="#ffffff" filter="blur(6px)" />
          </g>
        )}

        {/* Dusk Fireflies */}
        {activeTheme === 'dusk' && (
          <g>
            {[
              { cx: 340, cy: 520, delay: 0 },
              { cx: 480, cy: 500, delay: 1.5 },
              { cx: 620, cy: 510, delay: 0.8 },
              { cx: 800, cy: 530, delay: 2.2 },
              { cx: 950, cy: 490, delay: 1.1 },
              { cx: 1150, cy: 510, delay: 3.0 },
              { cx: 1300, cy: 535, delay: 0.5 },
            ].map((ff, idx) => (
              <g key={idx}>
                <circle cx={ff.cx} cy={ff.cy} r="3" fill="#d9f99d" opacity="0.8">
                  <animate attributeName="opacity" values="0.1;0.9;0.1" dur="4s" begin={`${ff.delay}s`} repeatCount="indefinite" />
                  <animate attributeName="r" values="2;4;2" dur="4s" begin={`${ff.delay}s`} repeatCount="indefinite" />
                </circle>
                <circle cx={ff.cx} cy={ff.cy} r="8" fill="#a3e635" opacity="0.25" filter="blur(2px)">
                  <animate attributeName="opacity" values="0.05;0.35;0.05" dur="4s" begin={`${ff.delay}s`} repeatCount="indefinite" />
                </circle>
              </g>
            ))}
          </g>
        )}

        {/* Pine trees forest left - Upright overlapping fir design */}
        <g fill={t.forest} style={{ transition: 'fill 1.5s ease-in-out' }}>
          {LEFT_TREES.map((tree, idx) => (
            <g key={`lt-${idx}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
              {/* Trunk */}
              <rect x="-1" y="0" width="2" height="6" opacity="0.75" fill="#3e2723" />
              {/* Detailed Pine tree path */}
              <path d="M 0,-30 C 1,-25 2,-23 4,-21 C 2,-21 1.5,-21 1.5,-21 C 2.5,-16 4.5,-14 7,-12 C 4,-12 3,-12 3,-12 C 4.5,-6 6.5,-4 10,0 C -10,0 -4.5,-6 -3,-12 C -3,-12 -4,-12 -7,-12 C -4.5,-14 -2.5,-16 -1.5,-21 C -1.5,-21 -2,-21 -4,-21 C -2,-23 -1,-25 0,-30 Z" />
            </g>
          ))}
        </g>

        {/* Pine trees forest right - Upright overlapping fir design */}
        <g fill={t.forest} style={{ transition: 'fill 1.5s ease-in-out' }}>
          {RIGHT_TREES.map((tree, idx) => (
            <g key={`rt-${idx}`} transform={`translate(${tree.x}, ${tree.y}) scale(${tree.s})`}>
              {/* Trunk */}
              <rect x="-1" y="0" width="2" height="6" opacity="0.75" fill="#3e2723" />
              {/* Detailed Pine tree path */}
              <path d="M 0,-30 C 1,-25 2,-23 4,-21 C 2,-21 1.5,-21 1.5,-21 C 2.5,-16 4.5,-14 7,-12 C 4,-12 3,-12 3,-12 C 4.5,-6 6.5,-4 10,0 C -10,0 -4.5,-6 -3,-12 C -3,-12 -4,-12 -7,-12 C -4.5,-14 -2.5,-16 -1.5,-21 C -1.5,-21 -2,-21 -4,-21 C -2,-23 -1,-25 0,-30 Z" />
            </g>
          ))}
        </g>

        {/* Foreground grass clearing */}
        <path
          d="M0,580 L0,540 C300,535 500,548 720,540 C940,548 1140,535 1440,540 L1440,580 Z"
          fill={t.foreground} style={{ transition: 'fill 1.5s ease-in-out' }}
        />

        {/* Forking path */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.8, ease: 'easeInOut' }}
          d="M720,580 L710,545 L685,510 L660,475 L630,440 L595,410"
          stroke={t.path} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9"
          style={{ transition: 'stroke 1.5s ease-in-out' }}
        />
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2.5, delay: 0.8, ease: 'easeInOut' }}
          d="M720,580 L730,545 L755,510 L780,475 L810,440 L845,410"
          stroke={t.path} strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.9"
          style={{ transition: 'stroke 1.5s ease-in-out' }}
        />
        {/* Glow at the fork */}
        <circle cx="720" cy="580" r="14" fill="#ffd989" opacity="0.5">
          <animate attributeName="r" values="12;20;12" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.3;0.7;0.3" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Deer silhouette — majestic alert left-facing stag clearing */}
        <g fill={t.deer} opacity="0.95" transform="translate(1050, 485)" style={{ transition: 'fill 1.5s ease-in-out' }}>
          {/* Back far leg (shadowed, jointed hock) */}
          <path d="M 12,-4 C 10,6 8,15 9,20 C 10,23 9,26 9,30 L 11.5,30 C 12.5,26 13,23 12.5,20 C 11.5,15 13.5,6 15,-4 Z" opacity="0.5" />
          
          {/* Front far leg (shadowed, jointed knee) */}
          <path d="M -7,-5 C -8,5 -9,14 -9,19 C -8.5,23 -9,26 -9,30 L -6.5,30 C -6,26 -5.5,23 -6,19 C -6.5,14 -5.5,5 -4.5,-5 Z" opacity="0.5" />

          {/* Main contoured body (chest, back spine, and rump) */}
          <path d="M 18,-8 C 21,2 14,5 6,4 C -2,3 -9,2 -12,-5 C -13,-12 -3,-10 8,-8 C 13,-7 16,-12 18,-8 Z" />
          
          {/* Tail */}
          <path d="M 18,-8 C 21,-8 22,-5 21,-2 C 19,-2 18,-4 17,-7 Z" />

          {/* Back near leg (muscular thigh, knee joint, and ankle/hoof) */}
          <path d="M 16,-4 C 18,6 16,16 17,21 C 18,24 17,27 17,30 L 19.5,30 C 20.5,27 21,24 20,21 C 18.5,16 20.5,6 21,-4 Z" />
          
          {/* Front near leg (muscular shoulder, tapered joints, hoof) */}
          <path d="M -10,-5 C -12,5 -12.5,15 -12,20 C -11.5,24 -12,27 -12,30 L -9.5,30 C -9,27 -8.5,24 -9,20 C -9.5,15 -8.5,5 -7.5,-5 Z" />

          {/* Elegant alert neck & head group */}
          <g className="deer-neck-head">
            {/* Neck (graceful curve, thicker at shoulder, tapering to head) */}
            <path d="M -9,-5 C -9,-14 -13,-22 -18,-30 C -20,-27 -22,-26 -23,-25 C -17,-22 -13,-14 -12,-5 Z" />
            
            {/* Snout and Head */}
            <path d="M -18,-30 C -20,-34 -25,-32 -27,-29 C -28,-27 -26,-25 -23,-25 C -20,-25 -19,-27 -18,-30 Z" />
            
            {/* Ears */}
            <path d="M -17,-31 C -15,-36 -12,-37 -14,-34 C -15,-32 -16,-31 -17,-31 Z" />

            {/* Antlers branching - beautiful branching stag antlers */}
            <path d="M -18,-31 C -21,-38 -26,-43 -33,-47 C -30,-44 -26,-39 -22,-34 C -24,-38 -27,-41 -29,-45 C -25,-41 -22,-37 -20,-33 C -21,-35 -23,-37 -25,-40 C -22,-36 -19,-33 -18,-31 C -15,-38 -9,-43 -2,-47 C -5,-44 -9,-39 -13,-34 C -11,-38 -8,-41 -6,-45 C -10,-41 -13,-37 -15,-33 C -14,-35 -12,-37 -10,-40 C -13,-36 -16,-33 -17,-31 Z" />
          </g>
        </g>

        {/* Campfire on left side of clearing */}
        <g transform="translate(310, 545)">
          {/* Logs */}
          <ellipse cx="0" cy="8" rx="14" ry="2.5" fill="#5a3a25" />
          <ellipse cx="-2" cy="5" rx="13" ry="2.5" fill="#7a4d35" />
          {/* Flames */}
          <motion.path
            d="M-6,4 Q-3,-8 0,-2 Q3,-12 6,-2 Q3,-6 0,4 Z"
            fill="#ff8c3d"
            animate={{ d: [
              "M-6,4 Q-3,-8 0,-2 Q3,-12 6,-2 Q3,-6 0,4 Z",
              "M-6,4 Q-3,-10 0,-3 Q3,-14 6,-3 Q3,-7 0,4 Z",
              "M-6,4 Q-3,-8 0,-2 Q3,-12 6,-2 Q3,-6 0,4 Z",
            ] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.path
            d="M-3,2 Q0,-6 2,0 Q4,-8 5,-1 Z"
            fill="#ffc457"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          
          {/* Embers floating up with wavy motion */}
          <motion.circle
            cx="0" cy="-15" r="1.2" fill="#ffb84d"
            animate={{ 
              cy: [-15, -65],
              cx: [0, 6, -6, 2],
              opacity: [1, 0.9, 0.4, 0] 
            }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.circle
            cx="3" cy="-10" r="0.8" fill="#ff9a3a"
            animate={{ 
              cy: [-10, -60],
              cx: [3, -3, 5, 0],
              opacity: [1, 0.8, 0.3, 0] 
            }}
            transition={{ duration: 3.6, repeat: Infinity, delay: 0.9, ease: 'easeOut' }}
          />
          <motion.circle
            cx="-2" cy="-12" r="1" fill="#ffc457"
            animate={{ 
              cy: [-12, -70],
              cx: [-2, 4, -4, 1],
              opacity: [1, 0.9, 0.5, 0] 
            }}
            transition={{ duration: 2.9, repeat: Infinity, delay: 0.4, ease: 'easeOut' }}
          />
        </g>

        {/* Small wildflowers in clearing */}
        <g opacity="0.6">
          <circle cx="200" cy="558" r="2" fill="#f0c2d1" />
          <circle cx="450" cy="555" r="2" fill="#fff5b8" />
          <circle cx="850" cy="557" r="2" fill="#f0c2d1" />
          <circle cx="1100" cy="555" r="2" fill="#fff5b8" />
        </g>
      </svg>

      {/* Animated swallows — multiple flocks at different heights */}
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '50%', zIndex: 3, pointerEvents: 'none', overflow: 'visible' }}>
        <g className="bird-flock-1">
          <BirdShape x={0} y={120} size={1} index={1} />
          <BirdShape x={20} y={130} size={0.85} index={2} />
          <BirdShape x={42} y={125} size={0.9} index={3} />
        </g>
        <g className="bird-flock-2">
          <BirdShape x={0} y={180} size={0.7} index={2} />
          <BirdShape x={18} y={188} size={0.6} index={3} />
        </g>
        <g className="bird-flock-3">
          <BirdShape x={0} y={90} size={0.55} opacity={0.5} index={1} />
        </g>
        <g className="bird-flock-4">
          <BirdShape x={0} y={210} size={0.8} opacity={0.6} index={3} />
          <BirdShape x={22} y={205} size={0.7} opacity={0.55} index={2} />
        </g>
      </svg>

      {/* Children */}
      <div style={{ position: 'relative', zIndex: 10 }}>{children}</div>

      <style>{`
        .bird-flock-1 { animation: birdFly 22s linear infinite; }
        .bird-flock-2 { animation: birdFly 28s linear infinite; animation-delay: -10s; }
        .bird-flock-3 { animation: birdFly 35s linear infinite; animation-delay: -18s; }
        .bird-flock-4 { animation: birdFly 30s linear infinite; animation-delay: -22s; }
        .cloud-1 { animation: cloudDrift 60s linear infinite; }
        .cloud-2 { animation: cloudDrift 80s linear infinite; animation-delay: -25s; }
        .cloud-3 { animation: cloudDrift 100s linear infinite; animation-delay: -50s; }
        @keyframes birdFly { 
          0%{transform:translate(-100px,0)} 
          50%{transform:translate(700px,-25px)} 
          100%{transform:translate(1500px,0)} 
        }
        @keyframes cloudDrift {
          0%{transform:translateX(-200px)} 
          100%{transform:translateX(1700px)}
        }
        @keyframes mistDrift {
          0% { transform: translateX(0); }
          50% { transform: translateX(-150px); }
          100% { transform: translateX(0); }
        }
        @keyframes wingFlap {
          0%, 100% { transform: scaleY(1.1) translateY(0); }
          50% { transform: scaleY(0.15) translateY(1px); }
        }
        @keyframes deerAlertLook {
          0%, 100% { transform: rotate(0deg) translateY(0) translateX(0); }
          30%, 55% { transform: rotate(-3deg) translateY(-0.2px) translateX(-0.2px); }
          75%, 90% { transform: rotate(2deg) translateY(0.1px) translateX(0.1px); }
        }
        .deer-neck-head {
          transform-origin: -9px -5px;
          animation: deerAlertLook 12s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .theme-btn-text { display: none; }
        }
      `}</style>
    </section>
  );
}

function BirdShape({ x, y, size = 1, opacity = 0.7, index = 0 }: { x: number; y: number; size?: number; opacity?: number; index?: number }) {
  const delay = `${(index * -0.15).toFixed(2)}s`;
  const duration = `${(0.35 + (index % 3) * 0.08).toFixed(2)}s`;
  return (
    <g transform={`translate(${x},${y}) scale(${size})`} opacity={opacity}>
      <g style={{ transformOrigin: '14.5px 2px', animation: `wingFlap ${duration} ease-in-out infinite ${delay}` }}>
        {/* Soaring swallow profile path */}
        <path d="M 0,0 C 4,-3 9,-4 13,-1 C 14,0 15,0 16,-1 C 20,-4 25,-3 29,0 C 25,2 22,2 19,4 C 18,3 16,3 15,5 C 14,9 13,12 11,15 C 12,11 13,7 13,5 C 12,3 10,3 9,4 C 6,2 2,2 0,0 Z" fill="#2d3b35" />
      </g>
    </g>
  );
}



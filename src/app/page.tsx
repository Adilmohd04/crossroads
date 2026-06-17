'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import IntakeForm from '../components/IntakeForm';
import LoadingState from '../components/LoadingState';
import { EyeOff, Compass, ListTodo, AlertCircle, Zap, Brain, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: EyeOff,
    title: 'Assumption Challenger',
    desc: 'Surfaces 3 hidden blind spots in your thinking before any modeling begins.',
    color: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.2)',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  {
    icon: BarChart3,
    title: 'Live Simulation Cockpit',
    desc: 'Morphing radar chart and weighted sliders recalculate scores in real-time.',
    color: '#3b6fff',
    glow: 'rgba(59, 111, 255, 0.2)',
    bg: 'rgba(59, 111, 255, 0.08)',
    border: 'rgba(59, 111, 255, 0.2)',
  },
  {
    icon: Brain,
    title: 'What-If Toggles',
    desc: 'Remove constraints instantly to discover which limitation is actually the bottleneck.',
    color: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.2)',
    bg: 'rgba(139, 92, 246, 0.08)',
    border: 'rgba(139, 92, 246, 0.2)',
  },
  {
    icon: Compass,
    title: 'Runway Simulator',
    desc: 'Live financial burn-rate projection showing months of runway per path.',
    color: '#10b981',
    glow: 'rgba(16, 185, 129, 0.2)',
    bg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  {
    icon: ListTodo,
    title: '7-Day Action Plan',
    desc: 'Translates your chosen path into concrete, reversibility-tagged daily actions.',
    color: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.2)',
    bg: 'rgba(6, 182, 212, 0.08)',
    border: 'rgba(6, 182, 212, 0.2)',
  },
  {
    icon: Zap,
    title: 'Decision Journal',
    desc: 'A persistent second brain that logs every decision for future reflection check-ins.',
    color: '#f43f5e',
    glow: 'rgba(244, 63, 94, 0.2)',
    bg: 'rgba(244, 63, 94, 0.08)',
    border: 'rgba(244, 63, 94, 0.2)',
  },
];

export default function Home() {
  const { isLoading, loadingMessage, error, clearError } = useApp();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {isLoading && <LoadingState message={loadingMessage} />}

      <main className="flex-1 flex flex-col items-center px-4 py-12 md:py-20">

        {/* ── HERO ── */}
        <div className="mx-auto w-full max-w-3xl text-center space-y-8 mb-14 animate-fade-up">

          {/* Floating orb accents */}
          <div className="pointer-events-none absolute left-1/4 top-24 w-72 h-72 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #3b6fff 0%, transparent 70%)', animation: 'orb-drift 12s ease-in-out infinite' }} />
          <div className="pointer-events-none absolute right-1/4 top-40 w-56 h-56 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', animation: 'orb-drift 16s ease-in-out infinite reverse' }} />

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: 'rgba(59, 111, 255, 0.1)',
              border: '1px solid rgba(59, 111, 255, 0.25)',
              color: '#7ba7ff',
            }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3b6fff' }} />
            USAII Global AI Hackathon 2026
          </div>

          {/* Headline */}
          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tight leading-tight sm:text-5xl md:text-6xl"
              style={{ color: '#f0f4ff' }}>
              See What You
              <span className="relative ml-3 inline-block">
                <span style={{
                  background: 'linear-gradient(135deg, #3b6fff 0%, #8b5cf6 50%, #06b6d4 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Can't See</span>
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-base font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>
              An AI decision simulator that surfaces hidden assumptions, stress-tests your thinking with interactive controls, and hands you a concrete 7-day execution plan.
            </p>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-2">
            {[
              { val: '5', label: 'Dimensions Scored' },
              { val: '90', label: 'Days Modeled' },
              { val: '∞', label: 'What-If Toggles' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black" style={{
                  background: 'linear-gradient(135deg, #3b6fff, #8b5cf6)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>{val}</div>
                <div className="text-[11px] font-semibold mt-0.5" style={{ color: '#5c6b8c' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FEATURES GRID ── */}
        <div className="w-full max-w-4xl mb-14">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex items-start gap-3 p-4 rounded-2xl transition-all duration-300 group cursor-default animate-fade-up"
                  style={{
                    background: f.bg,
                    border: `1px solid ${f.border}`,
                    animationDelay: `${i * 0.07}s`,
                    backdropFilter: 'blur(10px)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 30px ${f.glow}`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                  }}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: `${f.color}20`, border: `1px solid ${f.color}30` }}>
                    <Icon className="h-4 w-4" style={{ color: f.color }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold leading-tight" style={{ color: '#f0f4ff' }}>{f.title}</h4>
                    <p className="mt-1 text-[10px] font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 w-full max-w-3xl rounded-2xl p-4 flex items-start justify-between gap-3 animate-fade-in"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
            }}>
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" style={{ color: '#fb7185' }} />
              <p className="text-xs font-semibold leading-relaxed" style={{ color: '#fb7185' }}>{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-[10px] font-bold uppercase transition-colors shrink-0 cursor-pointer"
              style={{ color: '#5c6b8c' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* The Form */}
        <IntakeForm />
      </main>
    </div>
  );
}

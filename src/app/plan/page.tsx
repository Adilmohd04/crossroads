'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import ActionPlan from '../../components/ActionPlan';
import LoadingState from '../../components/LoadingState';
import { RotateCcw } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const { 
    intake, 
    actionPlan, 
    isLoading, 
    loadingMessage,
    error,
    resetApp 
  } = useApp();

  // Redirect if someone visits this URL without an action plan
  useEffect(() => {
    if (!actionPlan && !isLoading) {
      router.push('/results');
    }
  }, [actionPlan, isLoading, router]);

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md space-y-4 rounded-2xl p-6"
            style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
            <h2 className="text-base font-bold" style={{ color: '#fb7185' }}>Plan Generation Failed</h2>
            <p className="text-xs font-medium leading-relaxed" style={{ color: '#9ba8c9' }}>{error}</p>
            <button onClick={resetApp}
              className="btn-primary w-full justify-center cursor-pointer">
              <RotateCcw className="h-4 w-4" /> Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!actionPlan || !intake) {
    return null; // Let the redirect trigger in useEffect
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 space-y-8 animate-fade-up">
        {/* Page header */}
        <div className="animate-fade-up">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <div className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: '#67e8f9',
              }}>
              Action Roadmap
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl" style={{ color: '#f0f4ff' }}>
            Pathway Execution Guide
          </h2>
          <p className="mt-1.5 text-sm font-medium" style={{ color: '#5c6b8c' }}>
            A concrete 7-day action roadmap for: <span className="text-cyan-400 font-bold">&ldquo;{actionPlan.chosen_path}&rdquo;</span>
          </p>
          {/* Gradient rule */}
          <div className="mt-5 h-px w-full"
            style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.4), rgba(139,92,246,0.3), transparent)' }} />
        </div>

        {/* Action Plan timeline & checklists */}
        <ActionPlan actionPlan={actionPlan} />
      </main>
    </div>
  );
}


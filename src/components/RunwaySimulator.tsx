'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, PiggyBank } from 'lucide-react';
import { Scenario } from '../lib/types';

interface RunwaySimulatorProps {
  savings: number;
  initialMonthlyBudget: number;
  scenarios: Scenario[];
}

export default function RunwaySimulator({
  savings,
  initialMonthlyBudget,
  scenarios,
}: RunwaySimulatorProps) {
  const [monthlyBudget, setMonthlyBudget] = useState(initialMonthlyBudget);

  const getCashFlowForScenario = (optionName: string, budget: number) => {
    const name = optionName.toLowerCase();
    if (name.includes('job') || name.includes('work') || name.includes('offer') || name.includes('accept') || name.includes('employ')) {
      const income = Math.round(budget * 1.85);
      const netFlow = income - budget;
      return { netFlow, description: `Salary: +$${income}/mo (Net: +$${netFlow}/mo)`, type: 'surplus' as const };
    } else if (name.includes('grad') || name.includes('school') || name.includes('master') || name.includes('study') || name.includes('degree')) {
      const tuitionDrag = 1500;
      const netFlow = -(budget + tuitionDrag);
      return { netFlow, description: `Living cost + tuition drag: -$${Math.abs(netFlow)}/mo`, type: 'deficit-heavy' as const };
    } else if (name.includes('startup') || name.includes('bootstra') || name.includes('business') || name.includes('found') || name.includes('product')) {
      const overhead = Math.round(budget * 0.3);
      const netFlow = -(budget + overhead);
      return { netFlow, description: `Living cost + operation costs: -$${Math.abs(netFlow)}/mo`, type: 'deficit-moderate' as const };
    } else {
      return { netFlow: -budget, description: `Living budget: -$${Math.abs(budget)}/mo`, type: 'deficit' as const };
    }
  };

  const projectBalances = (optionName: string) => {
    const { netFlow, description, type } = getCashFlowForScenario(optionName, monthlyBudget);
    const monthlyBalances: number[] = [];
    let currentBalance = savings;
    let crisisMonth: number | null = null;
    for (let month = 1; month <= 12; month++) {
      currentBalance += netFlow;
      monthlyBalances.push(Math.max(0, currentBalance));
      if (currentBalance <= 0 && crisisMonth === null) crisisMonth = month;
    }
    return { monthlyBalances, crisisMonth, netFlow, description, type, finalBalance: currentBalance };
  };

  return (
    <div className="rounded-2xl p-5 space-y-6 md:p-6"
      style={{
        background: 'rgba(13, 17, 32, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
      }}>

      {/* Header */}
      <div className="flex items-start gap-3 pb-4" style={{ borderBottom: '1px solid rgba(16, 185, 129, 0.15)' }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
          style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
          <PiggyBank className="h-4.5 w-4.5" style={{ color: '#34d399' }} />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>Live Cash Runway Simulator</h4>
          <p className="mt-1 text-[11px] font-medium leading-relaxed" style={{ color: '#5c6b8c' }}>
            Stress-test your runway over 12 months based on savings of{' '}
            <span className="font-bold" style={{ color: '#34d399' }}>${savings.toLocaleString()}</span>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Slider control panel */}
        <div className="md:col-span-1 rounded-xl p-4 space-y-4"
          style={{ background: 'rgba(8, 11, 20, 0.5)', border: '1px solid rgba(99, 116, 163, 0.15)' }}>
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#5c6b8c' }}>
              Simulation Variable
            </span>
            <span className="text-[11px] font-bold mono-value px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              ${monthlyBudget.toLocaleString()}/mo
            </span>
          </div>
          <div className="space-y-2">
            <span className="block text-xs font-bold" style={{ color: '#e2e8f0' }}>Survival Budget Cost</span>
            <input
              type="range"
              min="500"
              max={Math.max(10000, initialMonthlyBudget * 2.5)}
              step="100"
              value={monthlyBudget}
              onChange={(e) => setMonthlyBudget(parseInt(e.target.value))}
              className="slider-range w-full"
            />
            <p className="text-[10px] font-medium leading-normal" style={{ color: '#5c6b8c' }}>
              Adjust monthly burn rate to simulate tighter or wider budgets.
            </p>
          </div>
        </div>

        {/* Projection bars */}
        <div className="md:col-span-2 space-y-5">
          {scenarios.map((sc) => {
            const { monthlyBalances, crisisMonth, netFlow, description } = projectBalances(sc.option_name);
            const hasSurplus = netFlow >= 0;

            return (
              <div key={sc.option_name} className="space-y-2 pb-4 last:pb-0"
                style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.1)' }}>

                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold truncate max-w-[160px] sm:max-w-xs" style={{ color: '#e2e8f0' }}>
                    {sc.option_name}
                  </span>
                  {hasSurplus ? (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md font-bold"
                      style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#34d399' }}>
                      <CheckCircle className="h-3.5 w-3.5 shrink-0" /> Infinite Runway
                    </span>
                  ) : (
                    <span className="text-[10px] flex items-center gap-1 px-2 py-0.5 rounded-md font-bold"
                      style={
                        crisisMonth && crisisMonth <= 3
                          ? { background: 'rgba(244, 63, 94, 0.12)', border: '1px solid rgba(244, 63, 94, 0.25)', color: '#fb7185' }
                          : { background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#fbbf24' }
                      }>
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Runway: {crisisMonth} Months
                    </span>
                  )}
                </div>

                <div className="text-[10px] font-semibold" style={{ color: '#5c6b8c' }}>{description}</div>

                {/* 12-month visual blocks */}
                <div className="flex gap-1 w-full pt-1">
                  {monthlyBalances.map((bal, mIdx) => {
                    const isBankrupt = bal <= 0;
                    return (
                      <motion.div
                        key={mIdx}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: 1 }}
                        transition={{ delay: mIdx * 0.03, duration: 0.25 }}
                        className="flex-1 flex flex-col items-center"
                        style={{ transformOrigin: 'bottom' }}>
                        <div className="h-5 w-full rounded-md flex items-center justify-center text-[8px] font-bold select-none"
                          style={
                            hasSurplus
                              ? { background: 'rgba(16, 185, 129, 0.5)', border: '1px solid rgba(16, 185, 129, 0.6)', color: '#fff' }
                              : isBankrupt
                              ? { background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', color: '#fb7185' }
                              : { background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16, 185, 129, 0.35)', color: '#34d399' }
                          }>
                          M{mIdx + 1}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {!hasSurplus && crisisMonth && (
                  <p className="text-[9px] font-bold italic" style={{ color: '#fb7185' }}>
                    ⚠️ Cash runs out in Month {crisisMonth + 1}. Income must begin before then.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

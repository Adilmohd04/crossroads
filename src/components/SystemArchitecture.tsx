'use client';

import React from 'react';

export default function SystemArchitecture() {
  return (
    <div className="rounded-xl p-6 space-y-4 animate-fade-in" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <span className="text-xl">🧪</span>
        <div>
          <h4 className="text-sm font-bold" style={{ color: 'var(--ink)' }}>System Architecture: Why This Requires AI</h4>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Technical justification: Crossroads intentionally combines deterministic rules with LLM reasoning</p>
        </div>
      </div>
      <div className="overflow-x-auto pt-3 border-t border-dashed" style={{ borderColor: 'var(--border-light)' }}>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="py-2.5 font-bold text-slate-700">Capabilities</th>
              <th className="py-2.5 font-bold text-slate-700 text-center">Deterministic Rules Engine</th>
              <th className="py-2.5 font-bold text-emerald-800 text-center bg-emerald-50/50 rounded-t-lg">LLM Reasoning Engine (Gemini)</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Cost adjustments, base budget math & savings runway</td>
              <td className="py-3 text-center text-emerald-600 font-bold">✓ (Defensible COL math)</td>
              <td className="py-3 text-center text-slate-400">✗ (Prone to math hallucinations)</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Hidden assumption extraction & cognitive bias mapping</td>
              <td className="py-3 text-center text-slate-400">✗ (Too unstructured for rules)</td>
              <td className="py-3 text-center text-emerald-600 font-bold bg-emerald-50/30">✓ (Identifies thinking flaws)</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Stated values vs. interactive behavior contradiction analysis</td>
              <td className="py-3 text-center text-slate-400">✗ (Requires contextual synthesis)</td>
              <td className="py-3 text-center text-emerald-600 font-bold bg-emerald-50/30">✓ (Detects hidden tension)</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Personalized 90-day future scenario narratives</td>
              <td className="py-3 text-center text-slate-400">✗ (Cannot generate prose text)</td>
              <td className="py-3 text-center text-emerald-600 font-bold bg-emerald-50/30">✓ (Highly custom story generation)</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold text-slate-700">Cross-decision DNA pattern learning & memory logs</td>
              <td className="py-3 text-center text-slate-400">✗ (Static code does not learn)</td>
              <td className="py-3 text-center text-emerald-600 font-bold bg-emerald-50/30 rounded-b-lg">✓ (Builds cognitive partner history)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

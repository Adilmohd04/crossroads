'use client';

import React from 'react';
import { Globe, ExternalLink } from 'lucide-react';
import { AnalysisResult } from '../lib/types';

interface AgentResearchLogsProps {
  analysis: AnalysisResult;
}

export default function AgentResearchLogs({ analysis }: AgentResearchLogsProps) {
  if (!analysis.agent_search_queries || analysis.agent_search_queries.length === 0) {
    return null;
  }

  return (
    <details className="rounded-xl p-6 cursor-pointer select-none group transition-all [&_summary::-webkit-details-marker]:hidden bg-[var(--card)] border border-[var(--border)]">
      <summary className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--surface)] border border-[var(--border)]">
            <Globe className="h-4 w-4 text-[var(--green-light)]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[var(--ink)]">
              Agent Research Logs
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Live search queries and cited web sources
            </p>
          </div>
        </div>
        <span className="text-sm font-medium group-open:hidden text-[var(--green-light)]">View ↗</span>
        <span className="text-sm font-medium hidden group-open:inline text-[var(--green-light)]">Hide ↘</span>
      </summary>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 mt-4 cursor-default select-text border-t border-[var(--border)]">
        {/* Queries */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Search Queries
          </h5>
          <div className="space-y-2">
            {analysis.agent_search_queries.map((q, idx) => (
              <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium bg-[var(--surface)] border border-[var(--border)] text-[var(--body)]">
                <span className="text-[var(--green-light)]">🔍</span>
                <span>{q}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
            Cited Sources
          </h5>
          {analysis.agent_sources && analysis.agent_sources.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analysis.agent_sources.map((src, idx) => (
                <a
                  key={idx}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors bg-[var(--surface)] border border-[var(--border)] text-[var(--body)] hover:bg-[var(--surface)]/80"
                >
                  <Globe className="h-3.5 w-3.5 text-[var(--green-light)]" />
                  <span>{src.title}</span>
                  <ExternalLink className="h-3 w-3 text-[var(--muted)]" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm italic text-[var(--muted)]">No web citations registered.</p>
          )}
        </div>
      </div>
    </details>
  );
}

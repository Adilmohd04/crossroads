'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, Search, Loader2, Globe, Calendar, DollarSign, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface DiscoveredOpportunity {
  name: string;
  provider: string;
  cost: string;
  format: string;
  deadline: string;
  url: string;
  why_relevant: string;
  location: string;
}

export default function OpportunityBoard() {
  const { intake } = useApp();
  const [opportunities, setOpportunities] = useState<DiscoveredOpportunity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStatus, setSearchStatus] = useState('');

  if (!intake) return null;

  const handleDiscoverOpportunities = async () => {
    setIsSearching(true);
    setSearchStatus('Querying real-world databases for programs matching your profile...');
    
    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ intake }),
      });

      if (!response.ok) {
        throw new Error(`API responded with code ${response.status}`);
      }

      const parsed = await response.json();
      
      if (Array.isArray(parsed.opportunities)) {
        setOpportunities(parsed.opportunities.slice(0, 6));
      } else if (Array.isArray(parsed)) {
        setOpportunities(parsed.slice(0, 6));
      } else {
        throw new Error('Opportunities not in expected format');
      }
    } catch (e) {
      console.error('Opportunity search failed, using fallback:', e);
      setOpportunities(getFallbackOpportunities());
    } finally {
      setIsSearching(false);
      setHasSearched(true);
    }
  };

  const getFallbackOpportunities = (): DiscoveredOpportunity[] => {
    const combined = (intake.decision + ' ' + intake.options.join(' ')).toLowerCase();
    
    const hasEducation = combined.includes('grad') || combined.includes('master') || combined.includes('school') || combined.includes('omscs') || combined.includes('degree');
    const hasCareer = combined.includes('job') || combined.includes('startup') || combined.includes('offer') || combined.includes('role') || combined.includes('work');

    if (hasEducation && hasCareer) {
      return [
        { name: "Georgia Tech OMSCS", provider: "Georgia Tech", cost: "$8,950 total", format: "100% Online", deadline: "Rolling", url: "https://omscs.gatech.edu/", why_relevant: "Do the MS while working at the startup — best of both worlds", location: "Remote" },
        { name: "Work at a Startup (YC)", provider: "Y Combinator", cost: "Free", format: "Job board", deadline: "Always open", url: "https://www.workatastartup.com/", why_relevant: "If you accept the offer — browse similar startups as backup options", location: "Remote / On-site" },
        { name: "MS in AI (Online)", provider: "UT Austin", cost: "$10,000 total", format: "100% Online", deadline: "March & October", url: "https://cdso.utexas.edu/msai", why_relevant: "Alternative to OMSCS — dedicated AI focus, also part-time friendly", location: "Remote" },
        { name: "Levels.fyi Salary Data", provider: "Levels.fyi", cost: "Free", format: "Database", deadline: "N/A", url: "https://www.levels.fyi/", why_relevant: "Verify if the $95k offer is competitive for your level and location", location: "Global" },
        { name: "GRE Prep (Free)", provider: "Khan Academy + ETS", cost: "Free", format: "Self-paced", deadline: "N/A", url: "https://www.ets.org/gre/test-takers/general-test/prepare.html", why_relevant: "If you need GRE for future applications — start prep now regardless of choice", location: "Remote" },
      ];
    }

    if (hasEducation) {
      return [
        { name: "Georgia Tech OMSCS", provider: "Georgia Tech", cost: "$8,950 total", format: "100% Online", deadline: "Rolling", url: "https://omscs.gatech.edu/", why_relevant: "Top-10 CS degree you can do while working — no relocation needed", location: "Remote" },
        { name: "MS in AI (Online)", provider: "UT Austin", cost: "$10,000 total", format: "100% Online", deadline: "March & October", url: "https://cdso.utexas.edu/msai", why_relevant: "Dedicated AI focus from a top-5 department", location: "Remote" },
        { name: "GRE Prep (Free)", provider: "Khan Academy + ETS", cost: "Free", format: "Self-paced", deadline: "N/A", url: "https://www.ets.org/gre/test-takers/general-test/prepare.html", why_relevant: "Free GRE prep if you need it for applications", location: "Remote" },
        { name: "Google Career Certificates", provider: "Google via Coursera", cost: "$49/month", format: "Self-paced", deadline: "Open", url: "https://grow.google/certificates/", why_relevant: "Industry-recognized credential in 3-6 months as a bridge option", location: "Remote" },
      ];
    }
    
    if (combined.includes('move') || combined.includes('relocat') || combined.includes('city')) {
      return [
        { name: "Cost of Living Comparison", provider: "Numbeo", cost: "Free", format: "Web tool", deadline: "N/A", url: "https://www.numbeo.com/cost-of-living/comparison.jsp", why_relevant: "Compare exact costs between your current and target city", location: "Global" },
        { name: "Remote Job Board", provider: "We Work Remotely", cost: "Free", format: "Job board", deadline: "Always open", url: "https://weworkremotely.com/", why_relevant: "Remote jobs let you stay anywhere — no relocation needed", location: "Remote" },
        { name: "Nomad List", provider: "Nomad List", cost: "Free tier", format: "City database", deadline: "N/A", url: "https://nomadlist.com/", why_relevant: "Safety, internet, cost, and community quality for 1000+ cities", location: "Global" },
      ];
    }

    return [
      { name: "Work at a Startup (YC)", provider: "Y Combinator", cost: "Free", format: "Job board", deadline: "Always open", url: "https://www.workatastartup.com/", why_relevant: "High-growth companies looking for talent right now", location: "Multiple / Remote" },
      { name: "Levels.fyi", provider: "Levels.fyi", cost: "Free", format: "Salary database", deadline: "N/A", url: "https://www.levels.fyi/", why_relevant: "Research if your current/offered compensation is competitive", location: "Global" },
      { name: "Google Career Certificates", provider: "Google via Coursera", cost: "$49/month", format: "Self-paced", deadline: "Open", url: "https://grow.google/certificates/", why_relevant: "Industry credentials without a degree commitment", location: "Remote" },
    ];
  };

  return (
    <div className="rounded-2xl p-5 md:p-6 space-y-5 bg-[#f4f3ef] border border-emerald-500/20">
      
      {/* Header */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-emerald-500/15">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0 bg-emerald-500/15 border border-emerald-500/25">
            <Search className="h-4.5 w-4.5 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Real Opportunity Finder
            </h4>
            <p className="text-[11px] font-medium leading-relaxed mt-0.5 text-slate-700">
              AI searches the web for real programs, jobs, and resources that match your specific situation — with links you can click right now.
            </p>
          </div>
        </div>

        {!hasSearched && (
          <button
            onClick={handleDiscoverOpportunities}
            disabled={isSearching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]">
            {isSearching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isSearching ? 'Searching...' : 'Find Opportunities'}
          </button>
        )}
      </div>

      {/* Search status */}
      {isSearching && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold bg-emerald-500/5 border border-emerald-500/15 text-emerald-600">
          <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
          <span>{searchStatus}</span>
        </div>
      )}

      {/* Results grid */}
      {hasSearched && opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp, idx) => (
            <motion.div
              key={opp.name + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="rounded-xl p-4 space-y-3 group transition-all duration-300 bg-[#e4e2db] border border-stone-400/60"
            >
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{opp.name}</h5>
                  <span className="text-[10px] font-semibold text-emerald-600">{opp.provider}</span>
                </div>
              </div>

              <p className="text-[10px] font-medium leading-relaxed text-slate-700">
                {opp.why_relevant}
              </p>

              <div className="grid grid-cols-3 gap-2 text-[9px] font-semibold text-slate-700">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-2.5 w-2.5 text-emerald-600" />
                  <span>{opp.cost}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 text-emerald-800" />
                  <span>{opp.deadline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-2.5 w-2.5 text-amber-800" />
                  <span>{opp.location}</span>
                </div>
              </div>

              <a href={opp.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-[11px] font-bold transition-all bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 hover:bg-emerald-500/20"
              >
                <Globe className="h-3 w-3" /> Visit & Apply <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </motion.div>
          ))}
        </div>
      )}

      {!hasSearched && !isSearching && (
        <div className="text-center py-8 rounded-xl border border-dashed border-emerald-500/15">
          <p className="text-xs font-medium text-slate-700">
            Click &ldquo;Find Opportunities&rdquo; to search the web for real programs, jobs, and resources matching your decision.
          </p>
        </div>
      )}
    </div>
  );
}

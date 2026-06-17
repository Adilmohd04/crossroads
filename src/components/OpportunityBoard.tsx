'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ExternalLink, Award, DollarSign, Calendar, Globe } from 'lucide-react';

interface Opportunity {
  name: string;
  provider: string;
  metric: string;
  metricLabel: string;
  format: string;
  duration: string;
  url: string;
  description: string;
}

export default function OpportunityBoard() {
  const { intake } = useApp();

  if (!intake) return null;

  const decisionLower = intake.decision.toLowerCase();
  const optionsLower = intake.options.map(o => o.toLowerCase()).join(' ');
  const combined = decisionLower + ' ' + optionsLower;

  const isEducation =
    intake.category === 'education' ||
    combined.includes('master') ||
    combined.includes('school') ||
    combined.includes('degree') ||
    combined.includes('bootcamp') ||
    combined.includes('course');

  const isRelocation =
    combined.includes('move') ||
    combined.includes('relocate') ||
    combined.includes('city') ||
    combined.includes('cities');

  // 1. Curated real-world education opportunities
  const educationOpportunities: Opportunity[] = [
    {
      name: "Online MS in Computer Science (OMSCS)",
      provider: "Georgia Institute of Technology",
      metric: "$8,950",
      metricLabel: "Total Tuition",
      format: "100% Online (Asynchronous)",
      duration: "2–3 Years (Part-Time)",
      url: "https://omscs.gatech.edu/",
      description: "Highly prestigious, top-tier MSCS degree designed specifically for working software engineers. Allows full-time employment compilation."
    },
    {
      name: "Master of Science in Artificial Intelligence",
      provider: "University of Texas at Austin",
      metric: "$10,000",
      metricLabel: "Total Tuition",
      format: "100% Online (Asynchronous)",
      duration: "1.5–3 Years (Flexible)",
      url: "https://cdso.utexas.edu/msai",
      description: "Dedicated AI degree covering deep learning, reinforcement learning, and NLP from a top-10 US computer science department."
    },
    {
      name: "M.Tech in Software Systems (Data Science / AI)",
      provider: "BITS Pilani (WILP)",
      metric: "₹2.4 Lakhs",
      metricLabel: "Estimated Tuition",
      format: "Online (Weekend Lectures)",
      duration: "2 Years (Part-Time)",
      url: "https://bits-pilani-wilp.ac.in/",
      description: "Work Integrated Learning Programme designed for corporate professionals in India. Classes fit around standard employment hours."
    }
  ];

  // 2. Curated real-world career pivot resources
  const careerOpportunities: Opportunity[] = [
    {
      name: "Work at a Startup (YC Jobs Portal)",
      provider: "Y Combinator",
      metric: "Varies",
      metricLabel: "Salary + Equity",
      format: "Remote / Hybrid / On-Site",
      duration: "Full-Time",
      url: "https://www.workatastartup.com/",
      description: "Direct application pipeline to hundreds of early-stage, fast-growing AI and software startups backed by Y Combinator."
    },
    {
      name: "Google Advanced Data Analytics Certificate",
      provider: "Google (via Coursera)",
      metric: "$49 / month",
      metricLabel: "Coursera Subscription",
      format: "100% Online (Self-Paced)",
      duration: "3–6 Months",
      url: "https://www.coursera.org/professional-certificates/google-advanced-data-analytics",
      description: "Build practical, job-ready skills in Python, statistics, and machine learning models. High signal value for career transitioners."
    },
    {
      name: "Freelance AI Engineering Pipeline",
      provider: "Upwork & Toptal",
      metric: "$50–$150/hr",
      metricLabel: "Average Freelance Rate",
      format: "100% Remote",
      duration: "Project-Based",
      url: "https://www.upwork.com/",
      description: "Build a portfolio of small AI/integrations projects while keeping your day job. Excellent for testing market demand with zero risk."
    }
  ];

  // 3. Curated real-world relocation comparison metrics
  const relocationOpportunities: Opportunity[] = [
    {
      name: "Cost of Living Comparison Index",
      provider: "Numbeo Database",
      metric: "Free Tool",
      metricLabel: "Access Cost",
      format: "Interactive Web Portal",
      duration: "Instant Search",
      url: "https://www.numbeo.com/cost-of-living/",
      description: "Compare rent, restaurant prices, grocery indices, and local purchasing power between your current city and your target cities."
    },
    {
      name: "Remote Work & Digital Nomad Hub",
      provider: "Nomad List",
      metric: "$10 / month",
      metricLabel: "Membership",
      format: "Global Community Database",
      duration: "Instant Search",
      url: "https://nomadlist.com/",
      description: "Check internet speed, safety ratings, weather profiles, and expat/nomad community quality for over 1,200 cities worldwide."
    }
  ];

  const activeList = isEducation
    ? educationOpportunities
    : isRelocation
      ? relocationOpportunities
      : careerOpportunities;

  const titleText = isEducation
    ? "Recommended Programs & Options"
    : isRelocation
      ? "Relocation Comparison Resources"
      : "Career Pivot & Startup Portals";

  return (
    <div className="flex flex-col gap-6 rounded-2xl p-5 md:p-6"
      style={{
        background: 'rgba(13, 17, 32, 0.75)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 116, 163, 0.2)',
      }}>
      
      {/* Title */}
      <div className="w-full pb-3" style={{ borderBottom: '1px solid rgba(99, 116, 163, 0.15)' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1.5 h-4 rounded-full" style={{ background: 'linear-gradient(180deg, #10b981, #3b6fff)' }} />
          <h4 className="text-sm font-bold" style={{ color: '#f0f4ff' }}>
            {titleText}
          </h4>
        </div>
        <p className="text-[11px] font-medium leading-relaxed" style={{ color: '#5c6b8c' }}>
          Real-world opportunities matching your decision profile. Click to check official requirements and admission structures.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {activeList.map((opp) => (
          <div
            key={opp.name}
            className="group relative flex flex-col justify-between rounded-xl p-4 transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(99, 116, 163, 0.12)',
            }}
          >
            {/* Header info */}
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16, 185, 129, 0.08)' }}>
                  {opp.provider}
                </span>
              </div>
              <h5 className="text-xs font-bold mb-2 transition-colors duration-200 group-hover:text-blue-400"
                style={{ color: '#e0e7ff' }}>
                {opp.name}
              </h5>
              <p className="text-[10px] leading-relaxed mb-4" style={{ color: '#9ba8c9' }}>
                {opp.description}
              </p>
            </div>

            {/* Badges and Action button */}
            <div className="space-y-3 pt-3" style={{ borderTop: '1px solid rgba(99, 116, 163, 0.08)' }}>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-medium" style={{ color: '#5c6b8c' }}>
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-blue-400" />
                  <div>
                    <span className="block font-bold text-[8px] text-slate-500 uppercase">Cost</span>
                    <span className="text-slate-300 font-semibold">{opp.metric}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-purple-400" />
                  <div>
                    <span className="block font-bold text-[8px] text-slate-500 uppercase">Format</span>
                    <span className="text-slate-300 font-semibold truncate max-w-[80px] block">{opp.format}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold text-center transition-all duration-200"
                style={{
                  background: 'rgba(59, 111, 255, 0.08)',
                  border: '1px solid rgba(59, 111, 255, 0.2)',
                  color: '#7ba7ff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 111, 255, 0.15)';
                  e.currentTarget.style.borderColor = 'rgba(59, 111, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 111, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(59, 111, 255, 0.2)';
                }}
              >
                View Portal <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

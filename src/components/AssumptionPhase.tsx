'use client';

import React from 'react';
import { motion } from 'framer-motion';
import AssumptionCard from './AssumptionCard';
import ClarityMeter from './ClarityMeter';
import WishLotus from './WishLotus';
import { AnalysisResult } from '../lib/types';

interface AssumptionPhaseProps {
  analysis: AnalysisResult;
  confrontedAssumptions: boolean[];
  onConfront: (index: number) => void;
  clarityIndex: number;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

const staggerContainer = {
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export default function AssumptionPhase({
  analysis,
  confrontedAssumptions,
  onConfront,
  clarityIndex,
}: AssumptionPhaseProps) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
      className="py-12 px-6"
      style={{ background: 'transparent' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Clarity meter - fixed top right area */}
        <div className="flex justify-end mb-8">
          <ClarityMeter value={clarityIndex} />
        </div>

        {/* Phase heading */}
        <div className="mb-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--green-light)', fontFamily: 'Outfit, sans-serif' }}>
            Phase I: Confront Assumptions
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5"
            style={{ color: 'var(--green)', fontFamily: "'Fraunces', serif" }}>
            First, let&apos;s find your blind spots.
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl"
            style={{ color: 'var(--body)', fontFamily: 'Inter, sans-serif' }}>
            Before comparing options, we need to challenge how you&apos;re thinking about this.
            Below are 3 assumptions your brain is making without realizing it. 
            Read each one and click &ldquo;Confront&rdquo; when you&apos;ve absorbed it.
            After confronting 2, the simulation workspace unlocks.
          </p>
        </div>

        {/* Assumption Cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {analysis.assumptions.map((item, idx) => (
            <motion.div key={item.assumption + idx} variants={cardVariants}>
              <AssumptionCard
                assumption={item}
                index={idx}
                isConfronted={confrontedAssumptions[idx]}
                onConfront={() => onConfront(idx)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Progress indicator & Wish Lotus Pond */}
        <div className="mt-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {confrontedAssumptions.map((done, i) => (
                <div
                  key={i}
                  className="h-2 w-8 rounded-full transition-colors duration-500"
                  style={{ background: done ? 'var(--green-light)' : 'var(--faint)' }}
                />
              ))}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              {confrontedAssumptions.filter(Boolean).length} of {confrontedAssumptions.length} confronted
              {confrontedAssumptions.filter(Boolean).length < 2 && ' — need 2 to continue'}
            </span>
          </div>

          {/* Emotional Grounding Wish Lotus Pond */}
          <div className="w-full md:max-w-sm">
            <WishLotus />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

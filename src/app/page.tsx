'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import Header from '../components/Header';
import IntakeForm from '../components/IntakeForm';
import LoadingState from '../components/LoadingState';
import NatureHero from '../components/NatureHero';
import { AlertCircle, Eye, Compass, Map } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const { isLoading, loadingMessage, error, clearError } = useApp();

  return (
    <div style={{ background: '#f4f3ef', minHeight: '100vh' }}>
      <Header />
      {isLoading && <LoadingState message={loadingMessage} />}

      <main>
        {/* ── HERO ── */}
        <NatureHero>
          <div style={{ textAlign: 'center', padding: '100px 20px 60px', maxWidth: '680px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            <div style={{
              background: 'rgba(255, 254, 250, 0.78)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.65)',
              borderRadius: '24px',
              padding: '40px 32px',
              boxShadow: '0 20px 50px rgba(45, 106, 79, 0.06), 0 4px 12px rgba(0,0,0,0.02)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}>
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                style={{
                  fontFamily: "'Fraunces', serif", fontWeight: 400,
                  fontSize: 'clamp(2.5rem, 6vw, 3.6rem)',
                  color: '#1b3a2a', marginBottom: '16px',
                  letterSpacing: '-0.02em', lineHeight: 1.15,
                }}
              >
                Two paths diverge.<br />
                <em style={{ color: '#2d6a4f', fontStyle: 'italic' }}>Which one is yours?</em>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                style={{ fontSize: '16.5px', color: '#3d3b35', maxWidth: '480px', margin: '0 auto 28px', lineHeight: 1.65 }}
              >
                An AI thinking partner that surfaces your hidden assumptions,
                stress-tests your priorities, and reveals where each path actually leads.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                onClick={() => document.getElementById('begin')?.scrollIntoView({ behavior: 'smooth' })}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '14px 28px',
                  background: '#2d6a4f', color: '#fff', border: 'none',
                  borderRadius: '50px', fontSize: '15px', fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 6px 20px rgba(45,106,79,0.25)',
                }}
              >
                Begin your decision
              </motion.button>
            </div>
          </div>
        </NatureHero>

        {/* ── DEMO MODE BANNER ── */}
        <section style={{ padding: '20px 20px 0', background: '#f4f3ef' }}>
          <div style={{ maxWidth: '680px', margin: '0 auto' }}>
            <div style={{ background: '#f0fdf4', border: '1.5px solid #d1e7dd', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '22px' }}>🌱</span>
              <p style={{ fontSize: '13px', color: '#1b4332', fontWeight: 600, flex: 1, minWidth: '200px' }}>
                No API key needed. The app works fully with our local scenario engine — just scroll down and begin.
              </p>
              <span style={{ fontSize: '10px', color: '#2d6a4f', background: '#d8f5e3', borderRadius: '20px', padding: '4px 12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                Try it now →
              </span>
            </div>
          </div>
        </section>

        {/* ── 3 PILLARS — connected to project core ── */}
        <section style={{ padding: '80px 20px 60px', background: '#f4f3ef' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ textAlign: 'center', marginBottom: '48px' }}
            >
              <p className="section-label" style={{ marginBottom: '10px' }}>How it works</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', color: '#1b1b18', fontWeight: 400 }}>
                Three doors before the decision.
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
              {[
                { icon: Eye, title: 'See what you can\'t see', desc: 'AI names the cognitive biases hidden in how you framed the choice.', color: '#2d6a4f' },
                { icon: Map, title: 'Walk every path', desc: 'Drag sliders, toggle constraints, watch outcomes shift in real time.', color: '#774936' },
                { icon: Compass, title: 'Choose with clarity', desc: 'Commit when you\'re ready — get a 7-day plan with real opportunity links.', color: '#d4a373' },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <motion.div
                    key={p.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    style={{ background: '#fff', border: '1px solid #dedad2', borderRadius: '20px', padding: '28px 24px', boxShadow: '0 2px 8px rgba(27,27,24,0.04)' }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${p.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                      <Icon style={{ width: '22px', height: '22px', color: p.color }} />
                    </div>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '20px', color: '#1b1b18', marginBottom: '8px', fontWeight: 500 }}>{p.title}</h3>
                    <p style={{ fontSize: '14px', color: '#3d3b35', lineHeight: 1.6 }}>{p.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FORM ── */}
        <section id="begin" style={{ padding: '40px 20px 80px', background: '#eae8e1' }}>
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <p className="section-label" style={{ marginBottom: '8px' }}>Begin</p>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontFamily: "'Fraunces', serif", color: '#1b1b18', fontWeight: 400 }}>
                Tell us your crossroads.
              </h2>
              <p style={{ fontSize: '14px', color: '#7c7b72', marginTop: '6px' }}>5 questions. 2 minutes. No signup.</p>
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', background: '#fff', border: '1px solid #dedad2', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px' }}>
                <AlertCircle size={16} style={{ color: '#9b2226', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '14px', color: '#1b1b18', flex: 1 }}>{error}</p>
                <button onClick={clearError} style={{ fontSize: '12px', color: '#7c7b72', background: 'none', border: 'none', cursor: 'pointer' }}>Dismiss</button>
              </div>
            )}
            <div style={{ background: '#fff', border: '1px solid #dedad2', borderRadius: '20px', padding: 'clamp(20px, 4vw, 32px)', boxShadow: '0 4px 16px rgba(27,27,24,0.05)' }}>
              <IntakeForm />
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer style={{ padding: '32px 20px', borderTop: '1px solid #dedad2', background: '#f4f3ef', textAlign: 'center' }}>
          <p style={{ fontFamily: "'Fraunces', serif", fontSize: '16px', color: '#2d6a4f', fontWeight: 500 }}>Crossroads</p>
          <p style={{ fontSize: '13px', color: '#7c7b72', marginTop: '4px' }}>The AI structures the thinking. The human owns the decision.</p>
        </footer>
      </main>
    </div>
  );
}

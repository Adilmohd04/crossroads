'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import Header from '../../components/Header';
import ActionPlan from '../../components/ActionPlan';
import CommitmentMoment from '../../components/CommitmentMoment';
import LoadingState from '../../components/LoadingState';
import SoundscapeToggle from '../../components/SoundscapeToggle';
import { NatureGuideId } from '../../components/NatureGuideSelector';
import { RotateCcw } from 'lucide-react';

export default function PlanPage() {
  const router = useRouter();
  const {
    intake,
    actionPlan,
    isLoading,
    loadingMessage,
    error,
    resetApp,
  } = useApp();

  const [isStarted, setIsStarted] = useState(false);
  const [activeGuide, setActiveGuide] = useState<NatureGuideId>('owl');

  useEffect(() => {
    const saved = localStorage.getItem('crossroads_nature_guide') as NatureGuideId;
    if (saved) setActiveGuide(saved);

    const handleGuideChange = (e: Event) => {
      const guideId = (e as CustomEvent).detail;
      if (guideId) setActiveGuide(guideId);
    };
    window.addEventListener('nature-guide-change', handleGuideChange);
    return () => window.removeEventListener('nature-guide-change', handleGuideChange);
  }, []);

  // Redirect if someone visits this URL without an action plan
  useEffect(() => {
    if (!actionPlan && !isLoading) {
      router.push('/results');
    }
  }, [actionPlan, isLoading, router]);

  // Check if already committed on mount
  useEffect(() => {
    try {
      const historyJson = localStorage.getItem('crossroads_journal_history');
      if (historyJson && intake && actionPlan) {
        const history = JSON.parse(historyJson);
        const match = history.find(
          (h: any) => h.decision === intake.decision && h.chosen_path === actionPlan.chosen_path
        );
        if (match && match.committedAt) {
          setIsStarted(true);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, [intake, actionPlan]);

  if (isLoading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
        <Header />
        <main style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '96px 24px',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: '#ffffff',
            border: '1px solid #dedad2',
            borderRadius: '16px',
            padding: '48px 40px',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.75rem',
              fontWeight: 600,
              color: '#1b1b18',
              marginBottom: '16px',
            }}>
              Something went wrong
            </h2>
            <p style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '15px',
              lineHeight: 1.7,
              color: '#3d3b35',
              marginBottom: '32px',
            }}>
              {error}
            </p>
            <button
              onClick={resetApp}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                background: '#2d6a4f',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'transform 0.15s ease',
              }}
            >
              <RotateCcw size={16} />
              Start Over
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (!actionPlan || !intake) {
    return null;
  }

  return (
    <div className={`flex min-h-screen flex-col theme-${activeGuide}`} style={{ background: 'var(--canvas)' }}>
      <Header />

      <main style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '48px 24px 120px',
      }}>
        {/* Strategic header */}
        <section style={{ marginBottom: '72px', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--green-light)',
            marginBottom: '16px',
          }}>
            Your strategic brief
          </p>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 600,
            color: 'var(--green)',
            lineHeight: 1.2,
            marginBottom: '20px',
          }}>
            Your path forward
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '17px',
            lineHeight: 1.7,
            color: 'var(--body)',
            maxWidth: '540px',
            margin: '0 auto',
          }}>
            You chose{' '}
            <span style={{
              color: 'var(--green-light)',
              fontWeight: 600,
            }}>
              {actionPlan.chosen_path}
            </span>
            . Here&apos;s your personalized roadmap to make it real.
          </p>
        </section>

        {/* Offline mode indicator */}
        {actionPlan.is_mock && (
          <div style={{
            textAlign: 'center',
            marginBottom: '64px',
          }}>
            <span style={{
              display: 'inline-block',
              fontFamily: "'Inter', sans-serif",
              fontSize: '12px',
              fontWeight: 500,
              color: '#2d6a4f',
              background: '#f0fdf4',
              border: '1px solid #d1e7dd',
              borderRadius: '20px',
              padding: '6px 16px',
            }}>
              🌿 Local intelligence mode active
            </span>
          </div>
        )}

        {/* Commitment Moment */}
        <section style={{ marginBottom: '80px' }}>
          <CommitmentMoment
            intake={intake}
            actionPlan={actionPlan}
            onStart={() => setIsStarted(true)}
            isStarted={isStarted}
          />
        </section>

        {/* Action Plan — revealed after commitment */}
        {isStarted && (
          <section style={{ marginBottom: '96px' }}>
            <div style={{
              marginBottom: '32px',
              paddingBottom: '20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <h2 style={{
                fontFamily: "'Fraunces', serif",
                fontSize: '2rem',
                fontWeight: 600,
                color: 'var(--green)',
                marginBottom: '8px',
              }}>
                Your 7-day roadmap
              </h2>
              <p style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '15px',
                color: 'var(--body)',
                lineHeight: 1.6,
              }}>
                Each step is designed to build momentum. Take them one at a time.
              </p>
            </div>
            <ActionPlan actionPlan={actionPlan} />
          </section>
        )}

        {/* Start another decision link */}
        <section style={{
          textAlign: 'center',
          paddingTop: '48px',
          borderTop: '1px solid var(--border)',
        }}>
          <button
            onClick={resetApp}
            className="wood-btn-light"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <RotateCcw size={15} />
            Start another decision
          </button>
        </section>
      </main>

      {/* Synthetic Nature Soundscape Toggle */}
      <SoundscapeToggle />
    </div>
  );
}

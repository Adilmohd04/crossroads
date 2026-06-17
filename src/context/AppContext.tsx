'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IntakeData, AnalysisResult, ActionPlanResult } from '../lib/types';
import { analyzeDecision, generateActionPlan as fetchActionPlan } from '../lib/gemini';

interface AppContextType {
  intake: IntakeData | null;
  analysis: AnalysisResult | null;
  selectedPath: string | null;
  actionPlan: ActionPlanResult | null;
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  submitIntake: (data: IntakeData) => Promise<void>;
  selectPath: (pathName: string) => Promise<void>;
  resetApp: () => void;
  clearError: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  // Core states
  const [intake, setIntake] = useState<IntakeData | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [actionPlan, setActionPlan] = useState<ActionPlanResult | null>(null);

  // Status states
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedIntake = localStorage.getItem('crossroads_intake');
      const savedAnalysis = localStorage.getItem('crossroads_analysis');
      const savedSelectedPath = localStorage.getItem('crossroads_selected_path');
      const savedActionPlan = localStorage.getItem('crossroads_action_plan');

      if (savedIntake) setIntake(JSON.parse(savedIntake));
      if (savedAnalysis) setAnalysis(JSON.parse(savedAnalysis));
      if (savedSelectedPath) setSelectedPath(savedSelectedPath);
      if (savedActionPlan) setActionPlan(JSON.parse(savedActionPlan));
    } catch (e) {
      console.error('Failed to load state from localStorage', e);
    }
  }, []);

  const clearError = () => setError(null);

  // Submit intake form -> triggers Prompt 1
  const submitIntake = async (data: IntakeData) => {
    setIsLoading(true);
    setError(null);
    setLoadingMessage('Deconstructing hidden assumptions & simulating realistic futures...');

    try {
      // Clean previous run data
      setAnalysis(null);
      setSelectedPath(null);
      setActionPlan(null);
      localStorage.removeItem('crossroads_analysis');
      localStorage.removeItem('crossroads_selected_path');
      localStorage.removeItem('crossroads_action_plan');

      // Save intake state
      setIntake(data);
      localStorage.setItem('crossroads_intake', JSON.stringify(data));

      // Call API
      const result = await analyzeDecision(data);
      setAnalysis(result);
      localStorage.setItem('crossroads_analysis', JSON.stringify(result));

      // Navigate to results page
      router.push('/results');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong during decision analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select path -> triggers Prompt 2
  const selectPath = async (pathName: string) => {
    if (!intake || !analysis) {
      setError('Missing decision context. Please start over.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingMessage(`Building your concrete 7-day action plan for: ${pathName}...`);

    try {
      setSelectedPath(pathName);
      localStorage.setItem('crossroads_selected_path', pathName);

      // Find the biggest risk for this option
      const scenario = analysis.scenarios.find(
        (s) => s.option_name.toLowerCase() === pathName.toLowerCase()
      );
      const risk = scenario?.biggest_risk || 'unanticipated execution bottlenecks';

      const plan = await fetchActionPlan(intake, pathName, risk);
      setActionPlan(plan);
      localStorage.setItem('crossroads_action_plan', JSON.stringify(plan));

      // Save decision to journal history in localStorage
      try {
        const historyJson = localStorage.getItem('crossroads_journal_history');
        const history = historyJson ? JSON.parse(historyJson) : [];
        
        const newEntry = {
          id: Date.now().toString(),
          date: new Date().toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          decision: intake.decision,
          chosen_path: pathName,
          confidence: scenario?.confidence || 75,
          options: intake.options,
        };
        
        localStorage.setItem(
          'crossroads_journal_history',
          JSON.stringify([newEntry, ...history])
        );
      } catch (e) {
        console.error('Failed to save journal entry:', e);
      }

      router.push('/plan');
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate action plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset all state to start over
  const resetApp = () => {
    setIntake(null);
    setAnalysis(null);
    setSelectedPath(null);
    setActionPlan(null);
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');

    try {
      localStorage.removeItem('crossroads_intake');
      localStorage.removeItem('crossroads_analysis');
      localStorage.removeItem('crossroads_selected_path');
      localStorage.removeItem('crossroads_action_plan');
    } catch (e) {
      console.error('Failed to clear localStorage', e);
    }

    router.push('/');
  };

  return (
    <AppContext.Provider
      value={{
        intake,
        analysis,
        selectedPath,
        actionPlan,
        isLoading,
        loadingMessage,
        error,
        submitIntake,
        selectPath,
        resetApp,
        clearError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

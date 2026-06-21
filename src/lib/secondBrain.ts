/**
 * Second Brain Intelligence Engine
 * 
 * This module provides cross-session learning, pattern recognition,
 * and proactive reflection capabilities that make Crossroads a true
 * "Second Brain" — not just a one-shot decision tool.
 */
import { DecisionJournalEntry, DecisionDNA, DecisionPattern, ReflectionReminder } from './types';

// ═══════════════════════════════════════════════════════════════
// REFLECTION REMINDERS — proactive "check in on past decisions"
// ═══════════════════════════════════════════════════════════════

const REFLECTION_INTERVAL_DAYS = 30;

export function getReflectionReminders(history: DecisionJournalEntry[]): ReflectionReminder[] {
  const now = new Date();
  const reminders: ReflectionReminder[] = [];

  history.forEach((entry) => {
    // Skip entries that already have reflections
    if (entry.reflections && entry.reflections.trim().length > 20) return;

    const committedDate = entry.committedAt
      ? new Date(entry.committedAt)
      : new Date(entry.date);

    const daysSinceCommit = Math.floor(
      (now.getTime() - committedDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceCommit >= REFLECTION_INTERVAL_DAYS) {
      reminders.push({
        entryId: entry.id,
        decision: entry.decision,
        chosen_path: entry.chosen_path,
        dueDate: new Date(committedDate.getTime() + REFLECTION_INTERVAL_DAYS * 86400000).toLocaleDateString(),
        overdueDays: daysSinceCommit - REFLECTION_INTERVAL_DAYS,
      });
    }
  });

  return reminders;
}

// ═══════════════════════════════════════════════════════════════
// LOCAL PATTERN RECOGNITION — fast, no API needed
// ═══════════════════════════════════════════════════════════════

export function getLocalPatterns(history: DecisionJournalEntry[]): DecisionPattern[] {
  if (history.length < 2) return [];

  const patterns: DecisionPattern[] = [];

  // Pattern: Dominant value
  const allValues = history.flatMap((h) => h.values || []);
  const valueCounts: Record<string, number> = {};
  allValues.forEach((v) => { valueCounts[v] = (valueCounts[v] || 0) + 1; });
  const topValue = Object.entries(valueCounts).sort((a, b) => b[1] - a[1])[0];
  if (topValue && topValue[1] >= 2) {
    const pct = Math.round((topValue[1] / history.length) * 100);
    patterns.push({
      pattern: `"${topValue[0]}" dominates your decisions`,
      insight: `In ${topValue[1]} of ${history.length} decisions (${pct}%), you ranked "${topValue[0]}" as a top priority. This is a core driver — but watch whether it's a genuine value or a fear-driven default.`,
      occurrences: topValue[1],
      sentiment: 'positive',
    });
  }

  // Pattern: Confidence calibration
  const avgConfidence = history.reduce((s, h) => s + h.confidence, 0) / history.length;
  const highConfCount = history.filter(h => h.confidence >= 75).length;
  if (highConfCount >= 2) {
    patterns.push({
      pattern: `You commit with high certainty (${Math.round(avgConfidence)}% avg)`,
      insight: `${highConfCount} of ${history.length} decisions were made at 75%+ confidence. You tend to commit decisively once you've processed a choice — but high confidence doesn't always mean the right choice. Watch for overconfidence in uncertain domains.`,
      occurrences: highConfCount,
      sentiment: 'cautionary',
    });
  } else if (history.filter(h => h.confidence < 65).length >= 2) {
    const lowCount = history.filter(h => h.confidence < 65).length;
    patterns.push({
      pattern: `You commit with uncertainty (${Math.round(avgConfidence)}% avg)`,
      insight: `${lowCount} of ${history.length} decisions were made below 65% confidence. You're thoughtful and acknowledge uncertainty — but this pattern can also indicate analysis paralysis. At some point, imperfect commitment beats perfect indecision.`,
      occurrences: lowCount,
      sentiment: 'cautionary',
    });
  }

  // Pattern: Category clustering
  const categoryCounts: Record<string, number> = {};
  history.forEach((h) => {
    if (h.category) categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
  });
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  if (topCategory && topCategory[1] >= 2) {
    patterns.push({
      pattern: `Recurring "${topCategory[0]}" crossroads`,
      insight: `You've faced ${topCategory[1]} "${topCategory[0]}" decisions here. This is a repeating theme in your life right now. Consider building a personal decision framework for this domain — so you're not starting from scratch each time.`,
      occurrences: topCategory[1],
      sentiment: 'neutral',
    });
  }

  // Pattern: Persistent constraint
  const allConstraints = history.flatMap((h) => h.constraints || []);
  const constraintCounts: Record<string, number> = {};
  allConstraints.forEach((c) => { constraintCounts[c] = (constraintCounts[c] || 0) + 1; });
  const topConstraint = Object.entries(constraintCounts).sort((a, b) => b[1] - a[1])[0];
  if (topConstraint && topConstraint[1] >= 2) {
    patterns.push({
      pattern: `"${topConstraint[0]}" blocks you repeatedly`,
      insight: `This constraint appeared in ${topConstraint[1]} of your decisions. Ask yourself: is this truly immovable, or have you stopped questioning it? If it's appeared this many times, solving it directly might be more valuable than working around it.`,
      occurrences: topConstraint[1],
      sentiment: 'cautionary',
    });
  }

  // Pattern: Stability vs growth orientation
  const stabilityValues = ['Financial stability', 'Security/predictability', 'Work-life balance'];
  const growthValues = ['Career advancement', 'Intellectual growth', 'Adventure/novelty', 'Making an impact'];
  let stabilityScore = 0, growthScore = 0;
  history.forEach(h => {
    (h.values || []).forEach((v, idx) => {
      const weight = Math.max(1, 5 - idx);
      if (stabilityValues.includes(v)) stabilityScore += weight;
      if (growthValues.includes(v)) growthScore += weight;
    });
  });
  if (stabilityScore > growthScore * 1.5) {
    patterns.push({
      pattern: 'Safety-first orientation',
      insight: `Your value rankings consistently prioritize stability over growth. This means you tend to choose the option with less downside over the option with more upside. That's not wrong — but be honest about whether you're optimizing for safety or genuinely thriving.`,
      occurrences: history.length,
      sentiment: 'cautionary',
    });
  } else if (growthScore > stabilityScore * 1.5) {
    patterns.push({
      pattern: 'Growth-first orientation',
      insight: `You consistently prioritize growth and advancement over security. You're willing to take on uncertainty for upside. This creates momentum — but watch whether you're taking on risk without adequate safety nets.`,
      occurrences: history.length,
      sentiment: 'positive',
    });
  }

  // Pattern: Reversibility tendency — do they pick the reversible option?
  if (history.length >= 2) {
    // Check if we have action plans to infer reversibility preference
    // We approximate by checking chosen paths against alternatives
    const chosenLower = history.map(h => h.chosen_path?.toLowerCase() || '');
    // Look for reversible-sounding choices (test, try, apply, start small, part-time)
    const reversibleKeywords = ['test', 'try', 'apply', 'start small', 'part-time', 'explore', 'sample', 'dip', 'trial'];
    let reversibleCount = 0;
    chosenLower.forEach(c => {
      if (reversibleKeywords.some(k => c.includes(k))) reversibleCount++;
    });
    if (reversibleCount >= 2) {
      patterns.push({
        pattern: 'You prefer reversible first steps',
        insight: `In ${reversibleCount} of ${history.length} decisions, you chose a path that can be unwound. You value optionality and exit routes — this is smart, but make sure "keeping doors open" isn't becoming a reason to never commit fully to any door.`,
        occurrences: reversibleCount,
        sentiment: 'neutral',
      });
    }
  }

  return patterns.slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════
// AI-POWERED DECISION DNA — deep cross-session analysis
// ═══════════════════════════════════════════════════════════════

export async function generateDecisionDNA(history: DecisionJournalEntry[]): Promise<DecisionDNA | null> {
  if (history.length < 2) return null;

  try {
    const response = await fetch('/api/decision-dna', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history }),
    });

    if (response.ok) {
      return await response.json();
    }
    console.warn('API Decision DNA generation failed, falling back.');
  } catch (e) {
    console.error('Failed to generate DNA via API:', e);
  }

  // Fallback if API fails
  const localPatterns = getLocalPatterns(history);
  const avgConf = Math.round(history.reduce((s, h) => s + h.confidence, 0) / history.length);
  const topVal = history.flatMap(h => h.values || []).reduce((acc: Record<string,number>, v) => { acc[v] = (acc[v]||0)+1; return acc; }, {});
  const dominant = Object.entries(topVal).sort((a,b) => b[1]-a[1])[0]?.[0] || 'stability';
  const topCat = history.map(h => h.category).filter(Boolean).reduce((acc: Record<string,number>, c) => { acc[c!] = (acc[c!]||0)+1; return acc; }, {});
  const dominantCat = Object.entries(topCat).sort((a,b) => b[1]-a[1])[0]?.[0] || 'career';
  return {
    summary: `After ${history.length} decisions, a pattern emerges: you consistently prioritize "${dominant}" and your decisions cluster around "${dominantCat}" crossroads. You commit at ${avgConf}% average confidence — ${avgConf >= 75 ? 'decisive, but watch for overconfidence in uncertain domains' : avgConf >= 60 ? 'thoughtful and measured' : 'cautious — make sure careful thinking isn\'t becoming analysis paralysis'}.`,
    patterns: localPatterns.length > 0 ? localPatterns : [
      { pattern: 'Building your profile', insight: 'Make 1-2 more decisions to unlock deeper pattern analysis.', occurrences: history.length, sentiment: 'neutral' as const }
    ],
    blind_spot: `Your most recurring constraint is "${history.flatMap(h => h.constraints || []).reduce((best: {v:string,c:number}, cur) => { const count = history.filter(h => h.constraints?.includes(cur)).length; return count > best.c ? {v:cur, c:count} : best; }, {v:'time pressure', c:0}).v}." Ask yourself: is this truly immovable, or have you stopped questioning it?`,
    generated_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT INJECTION — feed past decisions into new analysis
// ═══════════════════════════════════════════════════════════════

export function buildHistoryContext(history: DecisionJournalEntry[]): string {
  if (!history || history.length === 0) return '';

  const recent = history.slice(0, 5); // Max 5 most recent
  
  const ctx = recent.map((entry) => 
    `- Previously chose "${entry.chosen_path}" for "${entry.decision}" (confidence: ${entry.confidence}%, values: ${(entry.values || []).slice(0, 3).join(', ')})`
  ).join('\n');

  return `
IMPORTANT CONTEXT — PAST DECISIONS BY THIS SAME USER:
The user has made ${history.length} previous life decisions through this system. Here are the most recent:
${ctx}

Use this history to:
1. Surface assumptions that REPEAT from their past decisions (e.g., "You assumed growth required relocation last time too — but that wasn't true")
2. Note if they consistently underweight or overweight certain dimensions
3. Make scenarios more personalized by referencing their established patterns
Do NOT recommend based on past choices — just use them to sharpen your assumption extraction.
`;
}

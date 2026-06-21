export interface CashFlowResult {
  netFlow: number;
  description: string;
  type: 'surplus' | 'deficit-heavy' | 'deficit-moderate' | 'deficit';
  income: number;
  adjustedLivingCost: number;
  extraCosts: number;
  colMultiplier: number;
}

export function getCashFlowForScenario(optionName: string, baseBudget: number): CashFlowResult {
  const name = optionName.toLowerCase();
  
  // 1. Cost of Living Adjustment
  let multiplier = 1.0;
  let colNote = '';
  if (
    name.includes('sf') || 
    name.includes('san francisco') || 
    name.includes('ny') || 
    name.includes('new york') || 
    name.includes('london') || 
    name.includes('boston') || 
    name.includes('seattle') || 
    name.includes('city') || 
    name.includes('reloc') || 
    name.includes('move')
  ) {
    multiplier = 1.45;
    colNote = ' (SF/NY COL: 1.45x)';
  } else if (
    name.includes('stay') || 
    name.includes('hometown') || 
    name.includes('local') || 
    name.includes('home') || 
    name.includes('lease') || 
    name.includes('parent')
  ) {
    multiplier = 0.85;
    colNote = ' (Hometown COL: 0.85x)';
  }
  const adjustedLivingCost = Math.round(baseBudget * multiplier);

  // 2. Income & Overhead Projections
  let income = 0;
  let extraCosts = 0;
  let costDescription = '';

  if (
    name.includes('job') || 
    name.includes('work') || 
    name.includes('offer') || 
    name.includes('accept') || 
    name.includes('employ') || 
    name.includes('career') || 
    name.includes('remote job')
  ) {
    const baseSalary = 
      name.includes('sf') || 
      name.includes('san francisco') || 
      name.includes('ny') || 
      name.includes('new york') 
        ? 6800 
        : 4800;
    income = Math.round(baseSalary);
    costDescription = `Income: +$${income}/mo | Living cost: -$${adjustedLivingCost}/mo${colNote}`;
  } else if (
    name.includes('startup') || 
    name.includes('found') || 
    name.includes('business') || 
    name.includes('bootstra') || 
    name.includes('product')
  ) {
    income = Math.round(adjustedLivingCost * 0.4); // small stipend
    extraCosts = Math.round(adjustedLivingCost * 0.2); // operational overhead
    costDescription = `Stipend: +$${income}/mo | Living cost: -$${adjustedLivingCost}/mo${colNote} | Ops: -$${extraCosts}/mo`;
  } else if (
    name.includes('grad') || 
    name.includes('school') || 
    name.includes('study') || 
    name.includes('degree') || 
    name.includes('master') || 
    name.includes('bootcamp')
  ) {
    extraCosts = 1100; // Tuition drag
    costDescription = `Tuition: -$${extraCosts}/mo | Living cost: -$${adjustedLivingCost}/mo${colNote}`;
  } else if (name.includes('remote') && (name.includes('stay') || name.includes('hometown'))) {
    income = 4500; // remote job salary
    costDescription = `Remote Salary: +$${income}/mo | Living cost: -$${adjustedLivingCost}/mo${colNote}`;
  } else {
    income = 0;
    costDescription = `Living cost: -$${adjustedLivingCost}/mo${colNote}`;
  }

  const netFlow = income - (adjustedLivingCost + extraCosts);
  let type: 'surplus' | 'deficit-heavy' | 'deficit-moderate' | 'deficit' = 'deficit';
  if (netFlow >= 0) {
    type = 'surplus';
  } else if (Math.abs(netFlow) > adjustedLivingCost * 0.4) {
    type = 'deficit-heavy';
  } else {
    type = 'deficit-moderate';
  }
  
  return {
    netFlow,
    description: `${costDescription} (Net: ${netFlow >= 0 ? '+' : '-'}$${Math.abs(netFlow)}/mo)`,
    type,
    income,
    adjustedLivingCost,
    extraCosts,
    colMultiplier: multiplier
  };
}

export function projectBalances(optionName: string, savings: number, monthlyBudget: number) {
  const { netFlow, description, type, income, adjustedLivingCost, extraCosts, colMultiplier } = getCashFlowForScenario(optionName, monthlyBudget);
  const monthlyBalances: number[] = [];
  let currentBalance = savings;
  let crisisMonth: number | null = null;
  for (let month = 1; month <= 12; month++) {
    currentBalance += netFlow;
    monthlyBalances.push(Math.max(0, currentBalance));
    if (currentBalance <= 0 && crisisMonth === null) crisisMonth = month;
  }
  return { monthlyBalances, crisisMonth, netFlow, description, type, finalBalance: currentBalance, income, adjustedLivingCost, extraCosts, colMultiplier };
}

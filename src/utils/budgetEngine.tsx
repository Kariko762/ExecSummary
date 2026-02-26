/**
 * BUDGET CALCULATION ENGINE
 * 
 * Handles term-based financial calculations with proration
 * - CAPEX: One-time costs (no term multiplier)
 * - OPEX: Recurring costs (multiply by term)
 * - FTE: Prorated by start month + headcount
 * - IDSW: Custom consulting (one-time or recurring)
 */

export interface LineItem {
  id: string;
  name: string;
  costType: 'CAPEX' | 'OPEX' | 'FTE' | 'IDSW';
  amount: number;
  term: number; // years
  startMonth: string; // "January 2026", "June 2026"
  headcount?: number; // for FTE
  description?: string;
  vendor?: string;
  notes?: string;
}

export interface Project {
  id: string;
  name: string;
  unit: string;
  owner: string;
  status: string;
  lineItems: LineItem[];
}

export interface FinancialPlan {
  title: string;
  fiscalYear: number;
  fiscalYearStart: string;
  currency: string;
  planningHorizon: number;
  projects: Project[];
}

// Month name to number mapping
const MONTHS: Record<string, number> = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};

/**
 * Calculate months remaining in fiscal year from start month
 */
export function getMonthsInFirstYear(startMonth: string, fiscalYearStart: string = 'January'): number {
  const match = startMonth.match(/^(\w+)\s+(\d{4})$/);
  if (!match) return 12;
  
  const month = match[1];
  const fiscalStartNum = MONTHS[fiscalYearStart] || 1;
  const startNum = MONTHS[month] || 1;
  
  // Calculate months from start to end of fiscal year
  if (startNum >= fiscalStartNum) {
    return 13 - startNum; // e.g., June = 7 months (Jun-Dec)
  } else {
    return 13 - startNum + 12 - fiscalStartNum; // Handle fiscal year crossing
  }
}

/**
 * Calculate first year prorated amount
 */
export function calculateFirstYearAmount(item: LineItem, fiscalYearStart: string = 'January'): number {
  const monthsInYear = getMonthsInFirstYear(item.startMonth, fiscalYearStart);
  const proration = monthsInYear / 12;
  
  switch (item.costType) {
    case 'CAPEX':
    case 'IDSW':
      // One-time costs - full amount in first year
      return item.amount * (item.headcount || 1);
    
    case 'OPEX':
    case 'FTE':
      // Recurring costs - prorated by months
      return item.amount * proration * (item.headcount || 1);
    
    default:
      return item.amount;
  }
}

/**
 * Calculate total commitment over full term
 */
export function calculateTotalCommitment(item: LineItem, fiscalYearStart: string = 'January'): number {
  const firstYear = calculateFirstYearAmount(item, fiscalYearStart);
  const headcount = item.headcount || 1;
  
  switch (item.costType) {
    case 'CAPEX':
    case 'IDSW':
      // One-time - just first year
      return firstYear;
    
    case 'OPEX':
    case 'FTE':
      // Recurring - first year (prorated) + remaining years (full)
      const remainingYears = Math.max(0, item.term - 1);
      const annualAmount = item.amount * headcount;
      return firstYear + (annualAmount * remainingYears);
    
    default:
      return item.amount;
  }
}

/**
 * Calculate year-by-year breakdown
 */
export function calculateYearByYear(item: LineItem, fiscalYearStart: string = 'January'): number[] {
  const years: number[] = [];
  const headcount = item.headcount || 1;
  const annualAmount = item.amount * headcount;
  
  for (let i = 0; i < item.term; i++) {
    if (i === 0) {
      // First year - prorated
      years.push(calculateFirstYearAmount(item, fiscalYearStart));
    } else {
      // Subsequent years
      switch (item.costType) {
        case 'OPEX':
        case 'FTE':
          years.push(annualAmount);
          break;
        case 'CAPEX':
        case 'IDSW':
          years.push(0); // One-time costs don't repeat
          break;
      }
    }
  }
  
  return years;
}

/**
 * Calculate project totals
 */
export function calculateProjectTotals(project: Project, fiscalYearStart: string = 'January') {
  const firstYear = project.lineItems.reduce(
    (sum, item) => sum + calculateFirstYearAmount(item, fiscalYearStart),
    0
  );
  
  const totalCommitment = project.lineItems.reduce(
    (sum, item) => sum + calculateTotalCommitment(item, fiscalYearStart),
    0
  );
  
  // Calculate by cost type
  const byCostType: Record<string, number> = {
    CAPEX: 0,
    OPEX: 0,
    FTE: 0,
    IDSW: 0
  };
  
  project.lineItems.forEach(item => {
    byCostType[item.costType] += calculateTotalCommitment(item, fiscalYearStart);
  });
  
  return {
    firstYear,
    totalCommitment,
    byCostType
  };
}

/**
 * Calculate grand totals across all projects
 */
export function calculateGrandTotals(plan: FinancialPlan) {
  let firstYearTotal = 0;
  let totalCommitment = 0;
  
  const byCostType: Record<string, number> = {
    CAPEX: 0,
    OPEX: 0,
    FTE: 0,
    IDSW: 0
  };
  
  const byProject: Record<string, number> = {};
  const byUnit: Record<string, number> = {};
  
  plan.projects.forEach(project => {
    const projectTotals = calculateProjectTotals(project, plan.fiscalYearStart);
    
    firstYearTotal += projectTotals.firstYear;
    totalCommitment += projectTotals.totalCommitment;
    
    // Aggregate by cost type
    Object.keys(projectTotals.byCostType).forEach(type => {
      byCostType[type] += projectTotals.byCostType[type];
    });
    
    // Aggregate by project
    byProject[project.name] = projectTotals.totalCommitment;
    
    // Aggregate by unit
    if (!byUnit[project.unit]) byUnit[project.unit] = 0;
    byUnit[project.unit] += projectTotals.totalCommitment;
  });
  
  return {
    firstYearTotal,
    totalCommitment,
    byCostType,
    byProject,
    byUnit
  };
}

/**
 * Generate year-by-year forecast for entire plan
 */
export function generateForecast(plan: FinancialPlan): Record<number, number> {
  const forecast: Record<number, number> = {};
  
  for (let year = 0; year < plan.planningHorizon; year++) {
    forecast[year + 1] = 0;
  }
  
  plan.projects.forEach(project => {
    project.lineItems.forEach(item => {
      const yearlyAmounts = calculateYearByYear(item, plan.fiscalYearStart);
      yearlyAmounts.forEach((amount, idx) => {
        if (forecast[idx + 1] !== undefined) {
          forecast[idx + 1] += amount;
        }
      });
    });
  });
  
  return forecast;
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get cost type color
 */
export function getCostTypeColor(costType: string): string {
  switch (costType) {
    case 'CAPEX': return 'text-purple-400 bg-purple-400/10';
    case 'OPEX': return 'text-blue-400 bg-blue-400/10';
    case 'FTE': return 'text-green-400 bg-green-400/10';
    case 'IDSW': return 'text-orange-400 bg-orange-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
}

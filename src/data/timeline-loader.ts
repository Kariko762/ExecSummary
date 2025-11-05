import { ExecutiveSummary, ExecutiveIQ, TimelineItem } from '../types';

// Import summaries
const summaryModules = import.meta.glob('./summaries/*.json', { eager: true });
const summaries: ExecutiveSummary[] = Object.values(summaryModules)
  .map((module: any) => ({ ...module.default, type: 'summary' as const }));

// Import ExecutiveIQ articles
const execIQModules = import.meta.glob('./executive-iq/*.json', { eager: true });
const execIQArticles: ExecutiveIQ[] = Object.values(execIQModules)
  .map((module: any) => ({ ...module.default, type: 'executive-iq' as const }));

// Combine and sort by date (newest first)
export const timelineItems: TimelineItem[] = [...summaries, ...execIQArticles]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

// Helper function to check item type
export function isExecutiveSummary(item: TimelineItem): item is ExecutiveSummary {
  return 'departments' in item;
}

export function isExecutiveIQ(item: TimelineItem): item is ExecutiveIQ {
  return 'category' in item;
}

// Keep original exports for backwards compatibility
export const executiveSummaries = summaries;

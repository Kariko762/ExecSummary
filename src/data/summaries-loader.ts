import { ExecutiveSummary } from '../types';

// This file auto-imports all JSON files from the summaries folder
const summaryModules = import.meta.glob('./summaries/*.json', { eager: true });

export const executiveSummaries: ExecutiveSummary[] = Object.values(summaryModules)
  .map((module: any) => module.default)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date, newest first

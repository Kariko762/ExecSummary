import { StrategicInitiative } from '../types';

// This file auto-imports all JSON files from the initiatives folder
const initiativeModules = import.meta.glob('./initiatives/*.json', { eager: true });

export const strategicInitiatives: StrategicInitiative[] = Object.values(initiativeModules)
  .map((module: any) => module.default)
  .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()); // Sort by date, newest first

import { Organization } from '../types';

// Auto-import all organization JSON files
const orgModules = import.meta.glob('./organizations/*.json', { eager: true });

export const organizations: Organization[] = Object.values(orgModules)
  .map((module: any) => module.default);

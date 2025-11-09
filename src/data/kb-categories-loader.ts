// Auto-imports all KB category JSON files
const categoryModules = import.meta.glob('./kb-categories/*.json', { eager: true });

export interface KBCategory {
  id: string;
  name: string;
  type: 'technical' | 'support' | 'business' | 'training';
  description: string;
  icon: string;
  color: string;
  status: 'draft' | 'published';
  _enabled?: boolean;
  _completed?: boolean;
}

export const kbCategories: KBCategory[] = Object.values(categoryModules)
  .map((module: any) => module.default)
  .filter((category: any) => category.status !== 'draft')
  .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

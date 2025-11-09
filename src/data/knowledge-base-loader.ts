// Auto-imports all KB article JSON files
const articleModules = import.meta.glob('./knowledge-base/*.json', { eager: true });

export interface KBArticle {
  id: string;
  quarter?: string;  // Unused for KB but required by Template Builder
  year?: number;     // Unused for KB but required by Template Builder
  date: string;      // Publication date
  title: string;
  category: string;  // References KBCategory.id
  tags: string[];
  author: string;
  publishDate: string;
  overview: string;
  prerequisites?: string[];
  steps?: Array<{
    title: string;
    description: string;
    codeExample?: string;
  }>;
  codeExamples?: Array<{
    title: string;
    code: string;
    language?: string;
  }>;
  troubleshooting?: Array<{
    issue: string;
    solution: string;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  relatedArticles?: string[]; // Array of article IDs
  status: 'draft' | 'published';
  [key: string]: any; // Allow dynamic sections from template
}

export const kbArticles: KBArticle[] = Object.values(articleModules)
  .map((module: any) => module.default)
  .filter((article: any) => article.status !== 'draft')
  .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

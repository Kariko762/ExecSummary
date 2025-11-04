export interface ExecutiveSummary {
  id: string;
  quarter: string;
  year: number;
  date: string;
  title: string;
  highlights: string[];
  keyMetrics: {
    revenue: number;
    growth: number;
    customers: number;
    satisfaction: number;
  };
  departments: DepartmentData[];
  initiatives: Initiative[];
  risks: Risk[];
  outlook: string;
  
  // NEW: Demo Services Group specific metrics
  activityMetrics?: {
    demoStudio: {
      demosRegistered: number;
      demosLinkedToDeals: number;
      wonACV: number;
      conversionRate: number;
    };
    hoursByLOB: {
      capitalMarkets: { support: number; prep: number; demo: number; };
      banking: { support: number; prep: number; demo: number; };
    };
    activityMixPercentages: {
      capitalMarkets: { support: number; prep: number; demo: number; };
      banking: { support: number; prep: number; demo: number; };
    };
  };
  
  topAssets?: Array<{
    name: string;
    count: number;
    category: string;
  }>;
  
  weeklyFocus?: string[];
  
  issuesAndBlockers?: IssueBlocker[];
}

export interface DepartmentData {
  name: string;
  performance: number;
  budget: number;
  headcount: number;
  achievements: string[];
}

export interface Initiative {
  name: string;
  status: 'completed' | 'on-track' | 'at-risk' | 'delayed';
  progress: number;
  owner: string;
  impact: 'high' | 'medium' | 'low';
}

export interface Risk {
  description: string;
  severity: 'high' | 'medium' | 'low';
  mitigation: string;
}

export interface IssueBlocker {
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  action: string;
  remediation: string;
  timeline: string;
  outcome: string;
  status: 'open' | 'in-progress' | 'resolved';
}

export interface MetricTrend {
  period: string;
  revenue: number;
  customers: number;
  growth: number;
}

export interface Organization {
  id: string;
  name: string;
  lastUpdated: string;
  keyHighlights: string[];
  strategicProjects: StrategicProject[];
  supportActivities: SupportActivity[];
  demoInsights: DemoInsights;
}

export interface StrategicProject {
  id: string;
  name: string;
  status: 'completed' | 'on-track' | 'at-risk' | 'delayed';
  progress: number;
  owner: string;
  dueDate: string;
  executiveSummary: string;
}

export interface SupportActivity {
  id: string;
  type: 'incident' | 'request' | 'enhancement';
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'resolved';
  description: string;
  impact: string;
}

export interface DemoInsights {
  demosThisWeek: number;
  hoursInvested: number;
  topRequests: string[];
  wins: string[];
}

export interface ExecutiveSummary {
  id: string;
  quarter: string;
  year: number;
  date: string;
  title: string;
  status?: 'draft' | 'published'; // Optional status field for CMS
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
  
  // CMS Content Enablement Flags
  _enabled_highlights?: boolean;
  _enabled_keyMetrics?: boolean;
  _enabled_activityMetrics?: boolean;
  _enabled_topAssets?: boolean;
  _enabled_weeklyFocus?: boolean;
  _enabled_departments?: boolean;
  _enabled_initiatives?: boolean;
  _enabled_risks?: boolean;
  _enabled_issuesAndBlockers?: boolean;
  _enabled_outlook?: boolean;
  
  // CMS Completion Tracking
  _completed_highlights?: boolean;
  _completed_risks?: boolean;
}

export interface ExecutiveIQ {
  id: string;
  quarter: string;
  year: number;
  date: string;
  title: string;
  subtitle?: string;
  category: 'strategy' | 'innovation' | 'market-insight' | 'thought-leadership' | 'transformation';
  keyMetrics?: {
    revenue: number;
    growth: number;
    customers: number;
    satisfaction: number;
  };
  executiveSummary: string;
  keyTakeaways: string[];
  strategicImplications: string[];
  recommendations: string[];
  trendAnalysis?: {
    title: string;
    subtitle: string;
    categories: Array<{
      name: string;
      icon: string;
      trends: Array<{
        metric: string;
        value2023: string;
        value2024: string;
        change: string;
        impact: 'critical' | 'high' | 'medium' | 'low';
      }>;
    }>;
  };
  supportingData?: {
    chartTitle: string;
    data: Array<{ label: string; value: number; }>;
  }[];
  relatedInitiatives?: string[];
  outlook: string;
}

export type TimelineItem = ExecutiveSummary | ExecutiveIQ;

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

// Strategic Initiative Types
export interface StrategicInitiative {
  id: string;
  title: string;
  lastUpdated: string;
  tags: string[]; // e.g., ["AI/ML", "Sales Enablement", "Platform"]
  currentStatus?: CurrentStatus;
  executiveSummary?: InitiativeExecutiveSummary;
  problemStatement?: ProblemStatement;
  smartGoals?: SmartGoals;
  proposedSolution?: ProposedSolution;
  roi?: ReturnOnInvestment;
  swotAnalysis?: SwotAnalysis;
  budget?: BudgetRequest;
  timeline?: ProjectTimeline;
  resources?: ResourceRequirements;
  riskAssessment?: RiskAssessment;
  kpis?: KpisMetrics;
  governance?: GovernanceOversight;
  dependencies?: DependenciesAssumptions;
  appendices?: SupportingAppendices;
}

export interface CurrentStatus {
  projectStage: 'concept' | 'pilot' | 'mvp' | 'scaling' | 'production';
  progressToDate: string[];
  stakeholderEngagement: StakeholderEngagement[];
  challengesEncountered: string[];
  urgencyTiming: string;
}

export interface StakeholderEngagement {
  name: string;
  role: string;
  supportLevel: 'champion' | 'supportive' | 'neutral' | 'resistant';
}

export interface InitiativeExecutiveSummary {
  overview: string;
  strategicAlignment: string[];
  benefits: string[];
  outcomes: string[];
}

export interface ProblemStatement {
  issue: string;
  businessImpact: string;
  marketContext: string;
  operationalContext: string;
}

export interface SmartGoals {
  specific: string[];
  measurable: string[];
  achievable: string[];
  relevant: string[];
  timeBound: string[];
}

export interface ProposedSolution {
  description: string;
  keyFeatures: string[];
  innovations: string[];
  alternativesConsidered: Alternative[];
}

export interface Alternative {
  name: string;
  pros: string[];
  cons: string[];
  rationale: string;
}

export interface ReturnOnInvestment {
  financialBenefits: FinancialBenefit[];
  strategicBenefits: string[];
  costSavings: string[];
  revenueImpact: string[];
  efficiencyGains: string[];
  paybackPeriod: string;
  longTermValue: string;
}

export interface FinancialBenefit {
  description: string;
  amount: number;
  timeframe: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface BudgetRequest {
  totalFunding: number;
  breakdown: BudgetBreakdown[];
  oneTimeCosts: number;
  recurringCosts: number;
  contingency: number;
}

export interface BudgetBreakdown {
  category: string;
  amount: number;
  description: string;
}

export interface ProjectTimeline {
  startDate: string;
  endDate: string;
  phases: TimelinePhase[];
  milestones: Milestone[];
  criticalPath: string[];
}

export interface TimelinePhase {
  name: string;
  startDate: string;
  endDate: string;
  deliverables: string[];
  dependencies: string[];
}

export interface Milestone {
  name: string;
  date: string;
  description: string;
  status: 'completed' | 'on-track' | 'at-risk' | 'delayed';
}

export interface ResourceRequirements {
  internalStaffing: StaffingRequirement[];
  externalVendors: VendorRequirement[];
  toolsPlatforms: ToolRequirement[];
  infrastructure: string[];
}

export interface StaffingRequirement {
  role: string;
  count: number;
  duration: string;
  expertise: string[];
}

export interface VendorRequirement {
  vendor: string;
  service: string;
  cost: number;
  duration: string;
}

export interface ToolRequirement {
  tool: string;
  purpose: string;
  cost: number;
}

export interface RiskAssessment {
  risks: RiskItem[];
  overallRiskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface RiskItem {
  risk: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  contingency: string;
  owner: string;
}

export interface KpisMetrics {
  leadingIndicators: KpiMetric[];
  laggingIndicators: KpiMetric[];
  trackingFrequency: string;
  reportingOwner: string;
}

export interface KpiMetric {
  name: string;
  description: string;
  target: string;
  measurement: string;
}

export interface GovernanceOversight {
  sponsor: string;
  stakeholders: string[];
  decisionMakingStructure: string;
  reportingCadence: string;
  escalationPath: string[];
}

export interface DependenciesAssumptions {
  externalDependencies: Dependency[];
  internalDependencies: Dependency[];
  assumptions: Assumption[];
}

export interface Dependency {
  dependency: string;
  owner: string;
  requiredBy: string;
  status: 'secured' | 'pending' | 'at-risk';
}

export interface Assumption {
  assumption: string;
  impact: string;
  validationStatus: 'validated' | 'unvalidated' | 'invalid';
}

export interface SupportingAppendices {
  ganttChartUrl?: string;
  financialModels?: string[];
  marketResearch?: string[];
  technicalDiagrams?: string[];
  mockups?: string[];
}

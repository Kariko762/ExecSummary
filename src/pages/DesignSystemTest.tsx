import React, { useState } from 'react';
import { RadialChartRenderer } from '../renderers/RadialChartRenderer';
import { PieChartRenderer } from '../renderers/PieChartRenderer';
import { LineChartRenderer } from '../renderers/LineChartRenderer';
import { BarChartRenderer } from '../renderers/BarChartRenderer';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';
import { RefreshCw } from 'lucide-react';

// Reusable component wrapper with reload button
const AssetTestCard: React.FC<{
  title: string;
  assetId: string;
  children: React.ReactNode;
}> = ({ title, assetId, children }) => {
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setKey(prev => prev + 1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={handleReload}
          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all duration-200 group"
          title="Reload to see animation"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
      <div key={key}>
        {children}
      </div>
    </div>
  );
};

export const DesignSystemTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Hero Banner with Gauge */}
        <div className="bg-gradient-to-r from-fis-eggplant to-fis-raspberry dark:from-fis-eggplant/90 dark:to-fis-raspberry/90 rounded-2xl p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-5xl font-roobert-bold text-white mb-4">
                🌟 Hero Layout Example
              </h1>
              <p className="text-white/90 text-lg mb-6">
                Full-width hero banner with large gauge showing key metric
              </p>
              <div className="flex gap-3 text-sm">
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30">
                  supportsHero: true
                </div>
                <div className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg border border-white/30">
                  Connected Display Mode
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <AssetRenderEngine
                type="gauge"
                data={{
                  value: 94,
                  label: 'Success Rate',
                  suffix: '%',
                  size: 'large'
                }}
              />
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h1 className="text-4xl font-roobert-bold text-gray-900 dark:text-white mb-2">
            Complete Design System Test Page
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            All 26 asset types + Hero layout + 4 legacy renderers - Test light/dark theme compatibility
          </p>
          <div className="flex gap-4 text-sm flex-wrap">
            <div className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 rounded-lg">
              \ud83c\udf1f Hero Layout
            </div>
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
              7 Chart Types
            </div>
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
              6 List Types
            </div>
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">
              4 Basic Types
            </div>
            <div className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg">
              5 Complex Types
            </div>
            <div className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
              4 Executive Formats
            </div>
          </div>
        </div>

        {/* CHART TYPES - 6 assets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              📊 Chart Types (7)
            </h2>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
              Includes Gauge
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Radial Progress Chart */}
            <AssetTestCard title="1. Radial Progress Chart" assetId="radial-1">
              <AssetRenderEngine
                type="radialProgressChart"
                data={[
                  { name: 'Revenue', value: 85 },
                  { name: 'Profit', value: 65 },
                  { name: 'Growth', value: 92 }
                ]}
              />
            </AssetTestCard>

            {/* 2. Pie Chart */}
            <AssetTestCard title="2. Pie Chart" assetId="pie-1">
              <AssetRenderEngine
                type="pieChart"
                data={[
                  { name: 'Sales', value: 400 },
                  { name: 'Marketing', value: 300 },
                  { name: 'Operations', value: 200 },
                  { name: 'R&D', value: 278 }
                ]}
              />
            </AssetTestCard>

            {/* 3. Bar Chart */}
            <AssetTestCard title="3. Bar Chart (Multi-Series)" assetId="bar-1">
              <AssetRenderEngine
                type="barChart"
                data={[
                  { name: 'Jan', Revenue: 4000, Profit: 2400 },
                  { name: 'Feb', Revenue: 3000, Profit: 1398 },
                  { name: 'Mar', Revenue: 2000, Profit: 9800 },
                  { name: 'Apr', Revenue: 2780, Profit: 3908 }
                ]}
              />
            </AssetTestCard>

            {/* 4. Line Chart */}
            <AssetTestCard title="4. Line Chart (Multi-Series)" assetId="line-1">
              <AssetRenderEngine
                type="lineChart"
                data={[
                  { name: 'Jan', Revenue: 4000, Profit: 2400, Growth: 2400 },
                  { name: 'Feb', Revenue: 3000, Profit: 1398, Growth: 2210 },
                  { name: 'Mar', Revenue: 2000, Profit: 9800, Growth: 2290 },
                  { name: 'Apr', Revenue: 2780, Profit: 3908, Growth: 2000 },
                  { name: 'May', Revenue: 1890, Profit: 4800, Growth: 2181 },
                  { name: 'Jun', Revenue: 2390, Profit: 3800, Growth: 2500 }
                ]}
              />
            </AssetTestCard>

            {/* 5. Metric Card */}
            <AssetTestCard title="5. Metric Card" assetId="metric-1">
              <AssetRenderEngine
                type="metricCard"
                data={[
                  { title: 'Revenue', value: '$1,230,000', style: 'highlight', icon: 'dollar', iconColor: 'green' },
                  { title: 'Customers', value: '263', style: 'standard', icon: 'users', iconColor: 'navy' }
                ]}
              />
            </AssetTestCard>

            {/* 6. Gauge (Single Metric) */}
            <AssetTestCard title="6. Gauge (Single Metric)" assetId="gauge-1">
              <AssetRenderEngine
                type="gauge"
                data={{
                  value: 82,
                  label: 'Overall Adoption Rate',
                  suffix: '%',
                  size: 'large'
                }}
              />
            </AssetTestCard>

            {/* 7. Code Block */}
            <AssetTestCard title="7. Code Block" assetId="code-1">
              <AssetRenderEngine
                type="codeBlock"
                data="const example = 'Design System Test';\nconsole.log(example);"
              />
            </AssetTestCard>

          </div>
        </section>

        {/* LIST TYPES - 7 assets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              📝 List Types (6)
            </h2>
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
              Lists & Arrays
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 8. Highlights List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                7. Highlights List (Numbered)
              </h3>
              <AssetRenderEngine
                type="highlightsList"
                data={[
                  'Banking NA Titled Microsite - First Draft Published',
                  'GTM Team Support - Office of the CTO Template Completed',
                  'SNOW Migration - Dashboard launch by Nov 14'
                ]}
              />
            </div>

            {/* 8. Bullet List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                8. Bullet List
              </h3>
              <AssetRenderEngine
                type="bulletList"
                data={[
                  'First item in the list',
                  'Second item with more detail',
                  'Third item for completion'
                ]}
              />
            </div>

            {/* 9. Checklist Items */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                9. Checklist Items (Completed)
              </h3>
              <AssetRenderEngine
                type="checklistItems"
                data={[
                  'Comprehensive stakeholder interviews with 6 key clients',
                  'Collected competitive analysis of leading financial service portals',
                  'Detailed preliminary requirements document'
                ]}
              />
            </div>

            {/* 10. Progress Bar List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                10. Progress Bar List
              </h3>
              <AssetRenderEngine
                type="progressBarList"
                data={[
                  { title: 'Banking NA Titled Microsite', subtitle: 'Demo Business', percentage: 75, status: 'On Track' },
                  { title: 'SNOW Migration Dashboard', subtitle: 'Demo Operations', percentage: 85, status: 'On Track' },
                  { title: 'International Issuing Hub', subtitle: 'Demo Enablement', percentage: 30, status: 'At Risk' }
                ]}
              />
            </div>

            {/* 11. Key-Value List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                11. Key-Value List
              </h3>
              <AssetRenderEngine
                type="keyValueList"
                data={{
                  'Role': 'Chief Executive Officer',
                  'Department': 'Executive Leadership',
                  'Location': 'New York, NY',
                  'Reports To': 'Board of Directors'
                }}
              />
            </div>

            {/* 12. Nested Cards */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                12. Nested Cards (Array of Objects)
              </h3>
              <AssetRenderEngine
                type="nestedCards"
                data={[
                  { title: 'Team Lead', value: 'Sarah Johnson' },
                  { title: 'Members', value: '12' },
                  { title: 'Projects', value: '8' }
                ]}
              />
            </div>

          </div>
        </section>

        {/* BASIC TEXT TYPES - 4 assets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              ✏️ Basic Text Types (4)
            </h2>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm">
              Text & Rich Content
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 14. Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                14. Text Input
              </h3>
              <AssetRenderEngine
                type="text"
                data="Sample text content"
              />
            </div>

            {/* 15. Textarea */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                15. Text Area
              </h3>
              <AssetRenderEngine
                type="textarea"
                data="This is a longer text block that spans multiple lines and can contain detailed information about the project status and key achievements."
              />
            </div>

            {/* 16. Rich Text */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                16. Rich Text (Markdown)
              </h3>
              <AssetRenderEngine
                type="richText"
                data="This is **bold text** and this is *italic text* with inline formatting support for rich content."
              />
            </div>

            {/* 17. Quote Block */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                17. Quote Block
              </h3>
              <AssetRenderEngine
                type="quote"
                data="Strong momentum across Demo Services Group with key wins in Banking Microsite and SNOW migration."
              />
            </div>

          </div>
        </section>

        {/* COMPLEX TYPES - 5 assets */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              🔧 Complex Types (5)
            </h2>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-lg text-sm">
              Advanced Components
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* 18. Status Board */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                18. Status Board (Issues & Blockers)
              </h3>
              <AssetRenderEngine
                type="statusBoard"
                data={{
                  columns: [
                    {
                      title: 'On Track',
                      items: [
                        'Demo environment performance improvements ongoing',
                        'New deployment process in testing'
                      ]
                    },
                    {
                      title: 'At Risk',
                      items: [
                        'Titled Performance & Import Failures - unreliable search/browse',
                        'Timeline: End of November 2024'
                      ]
                    },
                    {
                      title: 'Blocked',
                      items: [
                        'Shift Payment Audit Trail - excessive work flagged'
                      ]
                    }
                  ]
                }}
              />
            </div>

            {/* 19. Risk Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                19. Risk Card
              </h3>
              <AssetRenderEngine
                type="riskCard"
                data={[
                  {
                    type: 'high-impact',
                    title: 'International Issuing Hub delayed due to Money 20/20',
                    description: 'Timeline delays expected due to conference schedule conflicts',
                    mitigation: 'ER expected to approve asset transfer this week'
                  }
                ]}
              />
            </div>

            {/* 20. Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                20. Timeline
              </h3>
              <AssetRenderEngine
                type="timeline"
                data={[
                  { 
                    date: 'Q1 2024', 
                    title: 'Project Kickoff', 
                    description: 'Assembled cross-functional team of 12 members across Engineering, Design, and Product. Conducted stakeholder interviews with 25+ key decision-makers. Established project governance framework and RACI matrix. Completed market analysis identifying 3 key competitive advantages. Budget approved: $2.4M over 18 months.',
                    completed: true,
                    metadata: {
                      'Team Size': '12 members',
                      'Budget': '$2.4M',
                      'Duration': '18 months',
                      'Stakeholders': '25+'
                    }
                  },
                  { 
                    date: 'Q2 2024', 
                    title: 'Development Phase', 
                    description: 'Sprint 1-8 completed with 95% velocity achieved. Implemented core authentication system (OAuth 2.0 + SAML), data pipeline architecture (processing 10M+ events/day), and microservices foundation (12 services deployed). Tech stack: React 18, TypeScript, Node.js, PostgreSQL, Redis. Passed security audit with zero critical findings.',
                    completed: true,
                    metadata: {
                      'Sprints': '8 completed',
                      'Velocity': '95%',
                      'Services': '12 deployed',
                      'Events/Day': '10M+'
                    }
                  },
                  { 
                    date: 'Q3 2024', 
                    title: 'Testing & QA', 
                    description: 'Executed 2,400+ test cases across functional, integration, performance, and security testing. Load testing validated 50K concurrent users with <200ms response time. Penetration testing by third-party firm (WhiteHat Security). UAT with 150 beta users achieving 4.7/5 satisfaction score. Resolved 342 bugs (0 severity-1, 8 severity-2 remaining).',
                    completed: false,
                    metadata: {
                      'Test Cases': '2,400+',
                      'Concurrent Users': '50K',
                      'Response Time': '<200ms',
                      'UAT Score': '4.7/5'
                    }
                  },
                  { 
                    date: 'Q4 2024', 
                    title: 'Launch', 
                    description: 'Phased rollout strategy: 10% Week 1, 25% Week 2, 50% Week 3, 100% Week 4. Marketing campaign across 6 channels targeting 500K prospects. Customer success team trained (40 CSMs certified). Monitoring infrastructure: Datadog, PagerDuty, Sentry. SLA targets: 99.9% uptime, <500ms P95 latency. Revenue target: $5M ARR by end of Q1 2025.',
                    completed: false,
                    metadata: {
                      'Target Users': '500K',
                      'CSMs Trained': '40',
                      'SLA Uptime': '99.9%',
                      'Revenue Target': '$5M ARR'
                    }
                  }
                ]}
              />
            </div>

            {/* 21. Two-Column Comparison */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                21. Four Block Grid (2x2)
              </h3>
              <AssetRenderEngine
                type="twoColumnComparison"
                data={{
                  topLeftTitle: 'The Issue',
                  topLeftContent: 'Current client portal is outdated, lacks mobile optimization, and generates 200+ support calls per month.',
                  topRightTitle: 'Business Impact',
                  topRightContent: 'Portal deficiencies contributed to loss of 2 major clients ($800K AUM). Annual support costs exceed $150K.',
                  bottomLeftTitle: 'Market Context',
                  bottomLeftContent: 'Competitors have launched modern, mobile-first portals. 78% of clients expect banking-grade digital experiences.',
                  bottomRightTitle: 'Operational Context',
                  bottomRightContent: 'Legacy technology stack with limited expertise. IT team spends 40% of maintenance time on portal issues.'
                }}
              />
            </div>

            {/* 22. Budget Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                23. Budget Breakdown
              </h3>
              <AssetRenderEngine
                type="budgetBreakdown"
                data={{
                  title: 'Q4 2025 Operating Budget',
                  currency: 'USD',
                  period: 'Q4 2025',
                  totalBudget: 5250000,
                  totalActual: 4875000,
                  categories: [
                    {
                      id: 'personnel',
                      name: 'Personnel & Compensation',
                      icon: 'Users',
                      budgeted: 3200000,
                      actual: 3150000,
                      variance: -50000,
                      variancePercent: -1.6,
                      status: 'on-track',
                      color: 'emerald',
                      lineItems: [
                        {
                          id: 'p1',
                          name: 'Base Salaries',
                          budgeted: 2400000,
                          actual: 2400000,
                          variance: 0,
                          summary: 'Core compensation for 45 full-time employees across Engineering, Product, Sales, and Support teams. Salaries aligned with market rates per Radford compensation survey.',
                          justification: 'Critical for talent retention in competitive tech market. Zero variance achieved through accurate headcount forecasting and minimal turnover (2% annually).',
                          owner: 'Sarah Chen, VP HR',
                          lastUpdated: '2025-12-01'
                        },
                        {
                          id: 'p2',
                          name: 'Benefits & Insurance',
                          budgeted: 500000,
                          actual: 480000,
                          variance: -20000,
                          summary: 'Comprehensive benefits package including health insurance (medical, dental, vision), 401k matching, life insurance, and wellness programs.',
                          explanation: 'Lower enrollment in premium health plans than projected. 15% of employees opted for high-deductible plans vs. 10% forecasted.',
                          justification: 'Benefits package essential for competitive recruiting. $20K savings from plan selection without reducing coverage quality.',
                          owner: 'Sarah Chen, VP HR',
                          lastUpdated: '2025-11-28'
                        },
                        {
                          id: 'p3',
                          name: 'Performance Bonuses',
                          budgeted: 200000,
                          actual: 180000,
                          variance: -20000,
                          summary: 'Quarterly performance bonuses tied to individual and team OKR achievement. Bonus pool represents 8% of base salary budget.',
                          explanation: 'Q3 bonus payout at 90% due to two key product launches delayed to Q4. Engineering team hit only 80% of sprint velocity targets.',
                          justification: 'Performance-based compensation drives accountability and results. Savings will roll into Q4 bonus pool for successful launches.',
                          owner: 'Michael Torres, CFO',
                          lastUpdated: '2025-12-05'
                        },
                        {
                          id: 'p4',
                          name: 'Training & Development',
                          budgeted: 100000,
                          actual: 90000,
                          variance: -10000,
                          summary: 'Professional development including conferences, certifications, online courses (Udemy, Pluralsight), and internal training programs.',
                          explanation: 'Two planned conferences cancelled (re:Invent, KubeCon). Team shifted to virtual attendance saving $10K in travel and hotel costs.',
                          justification: 'Continuous learning critical for maintaining technical edge. Virtual format provided 80% of value at 50% of cost.',
                          owner: 'David Kim, CTO',
                          lastUpdated: '2025-11-30'
                        }
                      ]
                    },
                    {
                      id: 'technology',
                      name: 'Technology & Infrastructure',
                      icon: 'Server',
                      budgeted: 1200000,
                      actual: 1100000,
                      variance: -100000,
                      variancePercent: -8.3,
                      status: 'on-track',
                      color: 'blue',
                      lineItems: [
                        {
                          id: 't1',
                          name: 'Cloud Services (AWS/Azure)',
                          budgeted: 600000,
                          actual: 550000,
                          variance: -50000,
                          summary: 'Multi-cloud infrastructure across AWS (primary) and Azure (backup/DR). Includes EC2, RDS, S3, Lambda, and Azure VM/Storage services.',
                          explanation: 'Migration to Reserved Instances completed in Q2, generating 25% savings vs. on-demand pricing. Right-sizing eliminated 15 underutilized instances.',
                          justification: 'Cloud-first strategy enables global scalability. $50K savings reinvested in enhanced monitoring (Datadog) and security tools (Snyk).',
                          owner: 'David Kim, CTO',
                          lastUpdated: '2025-12-03'
                        },
                        {
                          id: 't2',
                          name: 'Software Licenses',
                          budgeted: 300000,
                          actual: 280000,
                          variance: -20000,
                          summary: 'Enterprise licenses for development tools (GitHub Enterprise, JetBrains, Figma), productivity suite (Microsoft 365), and business applications (Salesforce, Slack).',
                          explanation: 'Negotiated 15% discount on GitHub Enterprise renewal by committing to 3-year contract. Eliminated 8 unused Figma seats.',
                          justification: 'Modern tooling essential for developer productivity. Annual license audits ensure cost optimization without impacting team efficiency.',
                          owner: 'Jessica Martinez, VP Engineering',
                          lastUpdated: '2025-11-25'
                        },
                        {
                          id: 't3',
                          name: 'Hardware & Equipment',
                          budgeted: 200000,
                          actual: 180000,
                          variance: -20000,
                          summary: 'Laptops (MacBook Pro, Dell XPS), monitors, networking equipment, and office technology infrastructure including video conferencing systems.',
                          explanation: 'Delayed hardware refresh for 12 team members from Q4 to Q1 2026 due to extended device lifespan. Existing MacBooks running well on macOS Sonoma.',
                          justification: 'Quality hardware reduces support tickets and increases productivity. Strategic timing of refresh cycles optimizes budget utilization.',
                          owner: 'Robert Johnson, IT Director',
                          lastUpdated: '2025-12-02'
                        },
                        {
                          id: 't4',
                          name: 'Security & Compliance',
                          budgeted: 100000,
                          actual: 90000,
                          variance: -10000,
                          summary: 'Security tools (Okta, Duo, CrowdStrike), compliance certifications (SOC 2, ISO 27001), penetration testing, and security training programs.',
                          explanation: 'Annual SOC 2 audit completed under budget ($45K vs. $50K estimated). Penetration test deferred to align with major product release in Q1.',
                          justification: 'Security investment non-negotiable for enterprise customers. Savings demonstrate mature security posture reducing audit scope.',
                          owner: 'Alex Thompson, CISO',
                          lastUpdated: '2025-11-29'
                        }
                      ]
                    },
                    {
                      id: 'operations',
                      name: 'Operations',
                      icon: 'Settings',
                      budgeted: 850000,
                      actual: 625000,
                      variance: -225000,
                      variancePercent: -26.5,
                      status: 'at-risk',
                      color: 'amber',
                      lineItems: [
                        {
                          id: 'o1',
                          name: 'Office Rent & Facilities',
                          budgeted: 400000,
                          actual: 300000,
                          variance: -100000,
                          summary: 'Office lease for 12,000 sq ft in downtown tech hub. Includes rent, utilities, janitorial services, building maintenance, and parking.',
                          explanation: 'Renegotiated lease at 25% reduction by committing to 5-year term. Hybrid work policy reduced required square footage from 15,000 to 12,000 sq ft.',
                          justification: 'Physical office remains important for collaboration and culture. Flexible workspace design accommodates hybrid schedule (60% remote).',
                          owner: 'Emily Rodriguez, COO',
                          lastUpdated: '2025-12-04'
                        },
                        {
                          id: 'o2',
                          name: 'Marketing & Events',
                          budgeted: 250000,
                          actual: 175000,
                          variance: -75000,
                          summary: 'Marketing campaigns, trade shows, customer events, sponsorships, and brand initiatives. Includes booth construction, swag, travel, and promotional materials.',
                          explanation: 'Major trade show (Dreamforce) cancelled due to low expected ROI. Pivoted $50K to digital campaigns achieving 3x better lead conversion.',
                          justification: 'Strategic reallocation from field events to digital yields better metrics. Savings fund Q1 product launch campaign.',
                          owner: 'Amanda Lee, CMO',
                          lastUpdated: '2025-12-06'
                        },
                        {
                          id: 'o3',
                          name: 'Travel & Expenses',
                          budgeted: 150000,
                          actual: 120000,
                          variance: -30000,
                          summary: 'Business travel including flights, hotels, meals, and ground transportation for customer meetings, conferences, team offsites, and sales calls.',
                          explanation: 'Virtual-first policy reduced domestic travel 40%. International client meetings still in-person (EMEA expansion requires face time).',
                          justification: 'Travel essential for closing enterprise deals and team building. Hybrid approach balances relationship building with cost efficiency.',
                          owner: 'Marcus Williams, VP Sales',
                          lastUpdated: '2025-11-27'
                        },
                        {
                          id: 'o4',
                          name: 'Supplies & Equipment',
                          budgeted: 50000,
                          actual: 30000,
                          variance: -20000,
                          summary: 'Office supplies, furniture, kitchen equipment, branded merchandise, and miscellaneous operational needs.',
                          explanation: 'Bulk purchasing agreement with Staples yielded 30% discount. Reduced office supply consumption due to hybrid work (fewer people in office daily).',
                          justification: 'Well-stocked office improves in-person experience. Smart procurement and usage patterns drive ongoing savings.',
                          owner: 'Emily Rodriguez, COO',
                          lastUpdated: '2025-12-01'
                        }
                      ]
                    }
                  ]
                }}
              />
            </div>

            {/* 23. Forecast Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                23. Forecast Breakdown (Capex/Opex) - Initiative-Based
              </h3>
              <AssetRenderEngine
                type="forecastBreakdown"
                data={{
                  title: '2026 Technology Investment Forecast',
                  currency: 'USD',
                  period: 'FY 2026',
                  initiatives: [
                    {
                      id: 'cloud-migration',
                      name: 'Cloud Migration Project',
                      termYears: 5,
                      costCenters: [
                        {
                          id: 'capex-1',
                          type: 'capex' as const,
                          name: 'Capital Expenditure',
                          removable: false,
                          lineItems: [
                            {
                              id: '1',
                              name: 'Azure Reserved Instances (3-Year)',
                              amount: 120000,
                              description: 'One-time 3-year commitment for compute and storage with 40% savings vs pay-as-you-go',
                              summary: 'Multi-year Azure reservation provides significant cost savings. Covers core infrastructure for customer-facing applications.',
                              justification: '3-year Reserved Instances lock in current pricing and provide predictable costs. Break-even in 18 months vs on-demand.',
                              owner: 'Cloud Architect - James Wilson',
                              lastUpdated: '2025-12-05'
                            },
                            {
                              id: '2',
                              name: 'Migration Services',
                              amount: 80000,
                              description: 'Professional services for workload migration from on-prem to Azure cloud',
                              summary: 'Third-party migration specialists to handle lift-and-shift of 45 production workloads. Includes architecture review and optimization.',
                              justification: 'External expertise accelerates migration timeline by 6 months. Reduces risk of downtime during cutover.',
                              owner: 'Cloud Program Manager - Lisa Chen',
                              lastUpdated: '2025-12-05'
                            }
                          ]
                        },
                        {
                          id: 'opex-1',
                          type: 'opex' as const,
                          name: 'Operating Expenditure',
                          removable: false,
                          lineItems: [
                            {
                              id: '3',
                              name: 'Datadog Enterprise APM',
                              amount: 75000,
                              description: 'Application Performance Monitoring across all production services. Contract starts June 2026.',
                              summary: 'Comprehensive observability platform for 50+ microservices. Real-time alerting, distributed tracing, and log aggregation.',
                              justification: 'Critical for maintaining 99.9% uptime SLA. 5-year commitment secures 30% discount vs annual contracts.',
                              owner: 'DevOps Team - Marcus Rodriguez',
                              lastUpdated: '2025-12-05',
                              contractTerm: 5,
                              annualAmount: 150000,
                              firstYearAmount: 75000,
                              totalCommitment: 750000,
                              startMonth: 'June 2026'
                            },
                            {
                              id: '4',
                              name: 'AWS Backup & DR',
                              amount: 50000,
                              description: 'Cross-region backup and disaster recovery for critical databases. Annual recurring cost.',
                              summary: 'Automated daily backups to separate AWS region. 4-hour RPO, 2-hour RTO for tier-1 systems.',
                              justification: 'Regulatory requirement for financial data protection. Multi-year commit reduces costs 25%.',
                              owner: 'IT Operations - Sarah Kim',
                              lastUpdated: '2025-12-06',
                              contractTerm: 3,
                              annualAmount: 50000,
                              totalCommitment: 150000
                            }
                          ]
                        },
                        {
                          id: 'custom-1',
                          type: 'custom' as const,
                          name: 'IDSW & Consulting',
                          removable: true,
                          customType: 'one-time' as const,
                          lineItems: [
                            {
                              id: '5',
                              name: 'Architecture Review',
                              amount: 50000,
                              description: 'Third-party security and architecture assessment',
                              summary: 'Comprehensive review of cloud architecture for security, compliance, and performance optimization.',
                              justification: 'Required for SOC2 Type 2 certification. One-time engagement with recommendations report.',
                              owner: 'CISO - David Park',
                              lastUpdated: '2025-12-07'
                            }
                          ]
                        }
                      ]
                    },
                    {
                      id: 'crm-migration',
                      name: 'CRM Migration to Salesforce',
                      termYears: 3,
                      costCenters: [
                        {
                          id: 'capex-2',
                          type: 'capex' as const,
                          name: 'Capital Expenditure',
                          removable: false,
                          lineItems: [
                            {
                              id: '6',
                              name: 'Salesforce Enterprise Licenses (100 Users)',
                              amount: 180000,
                              description: 'One-time purchase of 100 Enterprise Edition licenses with unlimited customization',
                              summary: 'Perpetual licenses for sales, service, and marketing teams. Includes Sales Cloud, Service Cloud, and Marketing Cloud.',
                              justification: 'Enterprise tier required for custom integrations with ERP and billing systems. Supports complex sales processes.',
                              owner: 'VP Sales Operations - Jennifer Martinez',
                              lastUpdated: '2025-12-08'
                            },
                            {
                              id: '7',
                              name: 'Data Migration & Integration',
                              amount: 120000,
                              description: 'Professional services for legacy CRM data migration and system integration',
                              summary: 'Certified Salesforce partner to migrate 2.5M customer records, 500K opportunities, and 10 years of historical data.',
                              justification: 'Complex data model requires expert mapping. Includes bi-directional sync with SAP ERP and custom billing platform.',
                              owner: 'CRM Program Manager - Alex Thompson',
                              lastUpdated: '2025-12-08'
                            }
                          ]
                        },
                        {
                          id: 'opex-2',
                          type: 'opex' as const,
                          name: 'Operating Expenditure',
                          removable: false,
                          lineItems: [
                            {
                              id: '8',
                              name: 'Salesforce Platform Fees',
                              amount: 60000,
                              description: 'Annual platform maintenance and support. Starts January 2026.',
                              summary: 'Standard Success Plan with 24/7 phone support, online case management, and quarterly health checks.',
                              justification: '3-year contract locks in pricing before anticipated 15% annual increases. Includes all platform upgrades.',
                              owner: 'IT Director - Rachel Green',
                              lastUpdated: '2025-12-08',
                              contractTerm: 3,
                              annualAmount: 60000,
                              totalCommitment: 180000,
                              startMonth: 'January 2026'
                            },
                            {
                              id: '9',
                              name: 'CPQ & Billing Integration',
                              amount: 45000,
                              description: 'Configure-Price-Quote system with real-time billing integration',
                              summary: 'Salesforce CPQ with custom connectors to billing system. Automated quote generation and approval workflows.',
                              justification: 'Reduces quote-to-cash cycle time by 40%. Eliminates manual pricing errors and improves forecast accuracy.',
                              owner: 'Sales Operations - Michael Brown',
                              lastUpdated: '2025-12-08',
                              contractTerm: 3,
                              annualAmount: 45000,
                              totalCommitment: 135000
                            }
                          ]
                        },
                        {
                          id: 'custom-2',
                          type: 'custom' as const,
                          name: 'Training & Change Management',
                          removable: true,
                          customType: 'yearly' as const,
                          lineItems: [
                            {
                              id: '10',
                              name: 'User Training & Adoption',
                              amount: 30000,
                              description: 'Annual training program for new features and best practices',
                              summary: 'Quarterly workshops, online training library, and dedicated Salesforce admin. Covers new releases and advanced features.',
                              justification: 'Continuous training ensures 80%+ user adoption. Maximizes ROI on platform investment.',
                              owner: 'Change Management - Laura White',
                              lastUpdated: '2025-12-08'
                            }
                          ]
                        },
                        {
                          id: 'custom-3',
                          type: 'custom' as const,
                          name: 'IDSW - Internal Development',
                          removable: true,
                          customType: 'yearly' as const,
                          lineItems: [
                            {
                              id: '11',
                              name: 'Internal Developer Training',
                              amount: 40000,
                              description: 'Annual Salesforce developer certification and training budget for internal team',
                              summary: 'Covers Platform Developer I & II certifications, Trailhead licenses, and advanced training courses for 5 internal developers.',
                              justification: 'In-house expertise reduces dependency on expensive contractors. Certified developers can handle 80% of customization needs internally.',
                              owner: 'Engineering Manager - Kevin Lee',
                              lastUpdated: '2025-12-08'
                            },
                            {
                              id: '12',
                              name: 'Professional Services Hours',
                              amount: 75000,
                              description: 'Annual pool of consulting hours for complex customizations and architecture guidance',
                              summary: '500 hours/year of Salesforce Solution Architect time for quarterly releases, integration support, and performance optimization.',
                              justification: 'Strategic use of external experts for high-complexity work. Augments internal team during peak periods (release cycles).',
                              owner: 'CTO - Robert Davis',
                              lastUpdated: '2025-12-08'
                            },
                            {
                              id: '13',
                              name: 'BAU Maintenance & Support',
                              amount: 85000,
                              description: 'Ongoing platform maintenance, bug fixes, and minor enhancements',
                              summary: 'Dedicated internal team allocation for daily operations: user support, workflow adjustments, data quality, security reviews.',
                              justification: 'Proactive maintenance prevents technical debt. Includes monthly security patches, quarterly health checks, and continuous monitoring.',
                              owner: 'Platform Owner - Emma Wilson',
                              lastUpdated: '2025-12-08'
                            },
                            {
                              id: '14',
                              name: 'Admin Seats & Tooling',
                              amount: 25000,
                              description: 'Additional admin licenses, sandbox environments, and development tools',
                              summary: '5 System Admin licenses, 3 full sandboxes (Dev/QA/UAT), CI/CD tools (Gearset), and monitoring platforms (OwnBackup).',
                              justification: 'Proper dev/test/prod environments ensure zero-downtime deployments. Backup/restore capability required for compliance.',
                              owner: 'DevOps Lead - Chris Anderson',
                              lastUpdated: '2025-12-08'
                            }
                          ]
                        }
                      ]
                    }
                  ],
                  notes: 'Initiative-based forecast with multi-year Opex tracking and custom cost centers'
                }}
              />
            </div>

          </div>
        </section>

        {/* EXECUTIVE SUMMARY FORMATS - 4 types */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
              📋 Executive Summary Formats (4)
            </h2>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-sm">
              Strategic Communication
            </span>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            
            {/* 1. CPSAR Format */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                1. CPSAR (Context, Problem, Solution, Action, Recommendation)
              </h3>
              <AssetRenderEngine
                type="executiveSummaryCPSAR"
                data={{
                  context: "Our current client portal generates 200+ support calls monthly and contributed to the loss of two major clients ($800K AUM). Competitors have launched modern, mobile-first portals that our solution cannot match.",
                  problem: "Legacy technology stack with outdated UI/UX creates poor user experience. 78% of clients now expect banking-grade digital experiences. Current portal lacks mobile optimization and modern security features.",
                  solution: "Build next-generation client portal with React 18, implement responsive design, integrate modern authentication (OAuth 2.0 + SAML), and deploy microservices architecture supporting 50K+ concurrent users.",
                  recommendation: "Approve $2.4M budget for 18-month development initiative. Phased rollout starting Q4 2024. Expected ROI: 60% reduction in support costs ($90K annually) and prevention of future client churn.",
                  asks: [
                    { text: "Budget approval for $2.4M over 18 months", owner: "CFO", dueDate: "2024-12-15" },
                    { text: "Executive sponsor assignment", owner: "CEO", dueDate: "2024-12-10" },
                    { text: "IT resource allocation (12 FTEs)", owner: "CTO", dueDate: "2024-12-20" }
                  ]
                }}
                mode="display"
              />
            </div>

            {/* 2. BLUF Format */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                2. BLUF (Bottom Line Up Front) - Military Style
              </h3>
              <AssetRenderEngine
                type="executiveSummaryBLUF"
                data={{
                  bottomLine: "Recommend immediate approval of $2.4M client portal modernization to prevent further client attrition and reduce $150K annual support costs by 60%. Project ROI breaks even in 18 months.",
                  background: "Current portal built on legacy technology (2015). Generates 200+ monthly support calls. Lost 2 major clients ($800K AUM) citing poor digital experience. Market research shows 78% of clients expect banking-grade portals.",
                  assessment: "Technical debt has reached critical mass. Competitors have modern solutions in production. Current architecture cannot support mobile access or modern security protocols. Support costs trending upward 15% YoY.",
                  recommendation: "Execute 18-month modernization program. Deploy React-based responsive UI, microservices backend, OAuth 2.0 authentication. Phased rollout beginning Q4 2024. Team of 12 FTEs required.",
                  asks: [
                    { text: "Budget approval: $2.4M capital expenditure", owner: "Board of Directors", dueDate: "2024-12-20" },
                    { text: "Executive sponsorship from C-suite", owner: "CEO", dueDate: "2024-12-15" },
                    { text: "Cross-functional team allocation", owner: "COO", dueDate: "2025-01-05" }
                  ]
                }}
                mode="display"
              />
            </div>

            {/* 3. SBAR Format */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                3. SBAR (Situation, Background, Assessment, Recommendation)
              </h3>
              <AssetRenderEngine
                type="executiveSummarySBAR"
                data={{
                  situation: "Client portal modernization required urgently. Current system causing client churn (2 losses = $800K AUM) and excessive support costs ($150K annually). Competitive disadvantage growing as peers deploy modern solutions.",
                  background: "Portal launched 2015 on legacy stack. Never received major upgrade. Mobile usage attempts up 300% but platform not responsive. Security audit flagged authentication vulnerabilities. Support ticket volume increased 15% YoY.",
                  assessment: "Technical assessment confirms complete rebuild necessary - patching not viable. Market analysis shows 78% client expectation for banking-grade digital experience. Risk: Continue losing high-value clients without action. Opportunity: Modern portal positions for growth.",
                  recommendation: "Approve $2.4M modernization initiative. Deploy modern tech stack (React 18, Node.js microservices, OAuth 2.0). 18-month timeline with phased rollout. Team: 12 FTEs across Engineering, Product, Design. Expected outcomes: 60% support cost reduction, zero security vulnerabilities, 50K+ concurrent user capacity.",
                  asks: [
                    { text: "Capital budget approval: $2.4M", owner: "Finance Committee", dueDate: "2024-12-18" },
                    { text: "Technology roadmap alignment", owner: "CTO", dueDate: "2024-12-22" },
                    { text: "Change management support", owner: "VP Operations", dueDate: "2025-01-10" }
                  ]
                }}
                mode="display"
              />
            </div>

            {/* 4. Pyramid Format */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">
                4. Pyramid Principle (McKinsey Style)
              </h3>
              <AssetRenderEngine
                type="executiveSummaryPyramid"
                data={{
                  mainArgument: "We must modernize our client portal immediately to stop client attrition, reduce support costs by $90K annually, and maintain competitive positioning in the wealth management market.",
                  keyPoints: [
                    "Current portal drove loss of $800K AUM and generates $150K annual support costs",
                    "78% of clients expect banking-grade digital experience; we deliver 2015 technology",
                    "Modern solution delivers 60% cost reduction and 50K+ user capacity",
                    "$2.4M investment breaks even in 18 months through saved costs and prevented churn"
                  ],
                  supportingDetails: "Technical analysis confirms legacy architecture cannot be patched - only complete rebuild viable. Market research across 500 wealth management firms shows mobile-first portals now industry standard. Competitive intelligence reveals 8 of 10 direct competitors launched modern portals in past 24 months. Our security audit identified critical authentication vulnerabilities that cannot be resolved without modernization. Customer satisfaction scores for portal declined from 7.2 to 4.8 (out of 10) over past 18 months. Support ticket analysis shows 65% related to mobile access issues and outdated UI. Load testing confirms current infrastructure cannot scale beyond 5K concurrent users - growth projections require 50K capacity by 2026.",
                  nextSteps: "Week 1: Secure executive sponsor and budget approval. Week 2-3: Finalize technical architecture and vendor selection for supplementary services. Week 4: Begin recruitment for 12-person cross-functional team (8 Engineering, 2 Product, 2 Design). Month 2: Complete detailed requirements gathering with top 50 clients. Month 3: Sprint 0 - establish development environment, CI/CD pipeline, and project governance. Months 4-15: Agile development in 2-week sprints with monthly stakeholder demos. Months 16-18: QA, security testing, and phased production rollout (10% → 25% → 50% → 100%).",
                  asks: [
                    { text: "Board approval for $2.4M capital expenditure", owner: "CEO to Board", dueDate: "2024-12-20" },
                    { text: "Executive sponsor assignment (C-level)", owner: "CEO", dueDate: "2024-12-15" },
                    { text: "Resource commitment: 12 FTEs for 18 months", owner: "CTO + VP Product", dueDate: "2025-01-05" },
                    { text: "Marketing alignment for launch communications", owner: "CMO", dueDate: "2025-01-15" }
                  ]
                }}
                mode="display"
              />
            </div>

          </div>
        </section>

        {/* Color Reference */}
        <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-6">
            CSS Variable Color Reference
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <ColorSwatch varName="--brand-primary" label="Brand Primary" />
            <ColorSwatch varName="--brand-secondary" label="Brand Secondary" />
            <ColorSwatch varName="--accent-blue" label="Accent Blue" />
            <ColorSwatch varName="--accent-green" label="Accent Green" />
            <ColorSwatch varName="--accent-yellow" label="Accent Yellow" />
            <ColorSwatch varName="--accent-red" label="Accent Red" />
            <ColorSwatch varName="--semantic-success" label="Success" />
            <ColorSwatch varName="--semantic-warning" label="Warning" />
          </div>
        </section>

        {/* Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-roobert-semibold text-blue-900 dark:text-blue-300 mb-3">
            🧪 Comprehensive Test Instructions
          </h3>
          
          <div className="mb-4">
            <p className="text-blue-800 dark:text-blue-400 font-roobert-medium mb-2">
              This page contains ALL 25 asset types + 4 legacy renderers (29 total components)
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2">
                Test 1: Design System Color Migration
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>Open CMS Design System Manager (localhost:5174)</li>
                <li>Change Brand Primary to #00FF00 (green)</li>
                <li>Change Brand Secondary to #FF6600 (orange)</li>
                <li>Click Save</li>
                <li>Refresh this page → All charts should use new colors</li>
              </ol>
            </div>

            <div>
              <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2">
                Test 2: Light/Dark Theme Compatibility
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>Toggle dark mode (browser/OS setting or VS Code theme)</li>
                <li>Scroll through all 22 assets</li>
                <li>Check: text readability, border visibility, background contrast</li>
                <li>Verify: tooltips, charts, cards all render correctly in both themes</li>
              </ol>
            </div>

            <div>
              <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2">
                Test 3: Interactive Elements
              </h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800 dark:text-blue-400">
                <li>Hover over charts → Check custom tooltips appear</li>
                <li>Verify metric cards show icons in correct colors</li>
                <li>Check status board tabs are readable</li>
                <li>Test progress bars show correct colors (green/orange/red)</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper component for color swatches
const ColorSwatch: React.FC<{ varName: string; label: string }> = ({ varName, label }) => {
  const [color, setColor] = React.useState('');

  React.useEffect(() => {
    const updateColor = () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();
      setColor(value || '#000000');
    };
    updateColor();
  }, [varName]);

  return (
    <div className="flex items-center gap-3">
      <div 
        className="w-12 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <div>
        <div className="text-sm font-roobert-medium text-gray-900 dark:text-white">
          {label}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
          {color}
        </div>
      </div>
    </div>
  );
};

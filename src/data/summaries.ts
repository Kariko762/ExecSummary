import { ExecutiveSummary, MetricTrend } from '../types';

export const executiveSummaries: ExecutiveSummary[] = [
  {
    id: 'week-oct-31-2024',
    quarter: 'Week of Oct 31',
    year: 2024,
    date: '2024-10-31',
    title: 'Demo Services Group - Weekly Executive Update',
    highlights: [
      'Banking NA Tiled Microsite – First Draft Published and endorsed by Michael Driscoll',
      'GTM Team Support – Office of the CFO Template Completed, moving to Figma conversion',
      'SNOW Migration – Built comprehensive reports, dashboard launch by Nov 14',
      'Demo Studio YTD: 263 demos registered, 126 linked to deals, $1.23M won ACV (48% conversion)',
      'Capital Markets leads activity: 2.1× Support, 2.6× Prep, 1.7× Demo hours vs Banking'
    ],
    keyMetrics: {
      revenue: 1230000, // Won ACV
      growth: 48, // Conversion rate
      customers: 263, // Demos Registered
      satisfaction: 0 // Not applicable for weekly update
    },
    activityMetrics: {
      demoStudio: {
        demosRegistered: 263,
        demosLinkedToDeals: 126,
        wonACV: 1230000,
        conversionRate: 48
      },
      hoursByLOB: {
        capitalMarkets: {
          support: 1464,
          prep: 23358,
          demo: 11057
        },
        banking: {
          support: 684,
          prep: 8953,
          demo: 6528
        }
      },
      activityMixPercentages: {
        capitalMarkets: {
          support: 4,
          prep: 65,
          demo: 31
        },
        banking: {
          support: 4,
          prep: 55,
          demo: 41
        }
      }
    },
    topAssets: [
      { name: 'D1 Flex', count: 73, category: 'Banking' },
      { name: 'D1 Flex Mobile 6.0', count: 43, category: 'Banking' },
      { name: 'D1 Flex Mobile (Beacon)', count: 35, category: 'Banking' },
      { name: 'D1 Business', count: 33, category: 'Banking' },
      { name: 'D1 Banker', count: 20, category: 'Banking' }
    ],
    weeklyFocus: [
      'NPS Forms & Feedback Collection',
      'SNOW Migration – Operations Dashboard Finalization',
      'VPN Alternative for Horizon Demo Connectivity (Int. Banking)',
      'Strategic Calls with Pre-Sales Leadership & Coast to define deliverables and timelines',
      'Banking "Run, Grow, Connect, Protect" Microsite – Deploy changes from Michael Driscoll & Richard Chapman',
      'Coast MSA Renewal Discussions – Review requirements and platform ownership (Lance Tapper departed)'
    ],
    departments: [
      {
        name: 'Demo Enablement',
        performance: 65,
        budget: 0,
        headcount: 0,
        achievements: [
          'International Issuing Hub – E6 expected to approve asset transfer this week',
          'Coast engaged Matthew Little (E6 Product Owner) to expedite process',
          'Demo build kickoff pending asset transfer approval'
        ]
      },
      {
        name: 'Demo Operations',
        performance: 85,
        headcount: 0,
        budget: 0,
        achievements: [
          'Built SNOW reports: Open/Closed Requests & Incidents by Engineer',
          'Created Monthly Ticket Trends dashboard',
          'Identified BU data gap in forms – remediation in progress',
          'Public dashboard launch target: November 14'
        ]
      },
      {
        name: 'GTM Support',
        performance: 95,
        budget: 0,
        headcount: 0,
        achievements: [
          'Completed PowerPoint template for Office of the CFO',
          'Next step: Convert to Figma design for Tiled.co import',
          'Banking NA Tiled Microsite first draft endorsed by leadership'
        ]
      },
      {
        name: 'Strategic Initiatives',
        performance: 70,
        budget: 0,
        headcount: 0,
        achievements: [
          'Agentic AI – Demo Insight Hub awaiting Pre-Sales feedback',
          'Banking Microsite presented to Michael Driscoll with strong endorsement',
          'Expansion to Sales Leadership and client socialization planned'
        ]
      }
    ],
    initiatives: [
      {
        name: 'Banking NA Tiled Microsite',
        status: 'on-track',
        progress: 75,
        owner: 'Demo Services',
        impact: 'high'
      },
      {
        name: 'SNOW Migration Dashboard',
        status: 'on-track',
        progress: 85,
        owner: 'Demo Operations',
        impact: 'medium'
      },
      {
        name: 'International Issuing Hub',
        status: 'at-risk',
        progress: 35,
        owner: 'Demo Enablement',
        impact: 'high'
      },
      {
        name: 'Agentic AI – Demo Insight Hub',
        status: 'on-track',
        progress: 60,
        owner: 'Strategic Initiatives',
        impact: 'high'
      }
    ],
    risks: [
      {
        description: 'International Issuing Hub delayed due to Money 20/20 and E6/Coast availability',
        severity: 'medium',
        mitigation: 'E6 expected to approve asset transfer this week; Coast engaged Matthew Little to expedite'
      },
      {
        description: 'Coast MSA Renewal – Owner Lance Tapper has left FIS, unclear ownership',
        severity: 'high',
        mitigation: 'Review MSA requirements and platform ownership; define cost and impact ahead of EoY renewal'
      }
    ],
    issuesAndBlockers: [
      {
        title: 'Tiled Performance & Import Failures',
        description: 'PowerPoint import feature and general Designer performance are unreliable',
        impact: 'high',
        action: 'Developing new deployment and design process',
        remediation: 'Finalize new workflow by end of November',
        timeline: 'End of November 2024',
        outcome: 'Documented guidance for scalable delivery of Tiled interactive experiences',
        status: 'in-progress'
      },
      {
        title: 'Demo Team – Shift Payment Issues',
        description: 'Team member unpaid for weekend work due to lack of shift audit trail',
        impact: 'medium',
        action: 'Implement process to record and approve all shifts, including weekends',
        remediation: 'Monthly reports and visibility into business justification for shift work',
        timeline: 'Immediate',
        outcome: 'Proper compensation and audit trail for all shift work',
        status: 'in-progress'
      },
      {
        title: 'SNOW BU Data Not Mandatory',
        description: 'BU data is not mandatory in SNOW forms, limiting ability to segment by org',
        impact: 'medium',
        action: 'Reviewing form structure to make BU data mandatory',
        remediation: 'Update SNOW form requirements to enforce BU data collection',
        timeline: 'Before Nov 14 dashboard launch',
        outcome: 'Complete organizational segmentation in reporting',
        status: 'in-progress'
      }
    ],
    outlook: 'Strong momentum across Demo Services Group with key wins in Banking Microsite and SNOW migration. Focus areas for next week include finalizing operational dashboards, accelerating International Issuing Hub through E6 approval, and addressing platform tooling challenges (Tiled, Coast MSA). Capital Markets continues to dominate activity hours (70% of total workload), indicating opportunity to balance resources or expand Banking team capacity. Demo-to-deal conversion rate of 48% demonstrates strong alignment between demo quality and sales outcomes.'
  },
  {
    id: 'q4-2024',
    quarter: 'Q4',
    year: 2024,
    date: '2024-12-31',
    title: 'Record Breaking Quarter - Strategic Expansion Complete',
    highlights: [
      'Revenue increased 47% YoY to $12.4M, exceeding projections',
      'Successfully launched in 3 new international markets',
      'Customer base grew to 15,200 (+32% from Q3)',
      'Net Promoter Score reached all-time high of 72',
      'Completed Series B funding round of $25M'
    ],
    keyMetrics: {
      revenue: 12400000,
      growth: 47,
      customers: 15200,
      satisfaction: 72
    },
    departments: [
      {
        name: 'Engineering',
        performance: 94,
        budget: 4200000,
        headcount: 85,
        achievements: [
          'Shipped AI-powered analytics dashboard',
          'Reduced system downtime by 87%',
          'Deployed microservices architecture'
        ]
      },
      {
        name: 'Sales',
        performance: 96,
        budget: 2800000,
        headcount: 42,
        achievements: [
          'Closed 3 enterprise deals >$500K',
          'Expanded team in EMEA region',
          'Hit 147% of quarterly quota'
        ]
      },
      {
        name: 'Marketing',
        performance: 89,
        budget: 1900000,
        headcount: 28,
        achievements: [
          'Generated 2,400 qualified leads',
          'Brand awareness increased 65%',
          'Content engagement up 210%'
        ]
      },
      {
        name: 'Product',
        performance: 92,
        budget: 1500000,
        headcount: 35,
        achievements: [
          'Launched 4 major features',
          'Customer interviews: 156',
          'Feature adoption rate: 78%'
        ]
      }
    ],
    initiatives: [
      {
        name: 'AI Platform Integration',
        status: 'completed',
        progress: 100,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'Global Expansion - Phase 2',
        status: 'completed',
        progress: 100,
        owner: 'Sales',
        impact: 'high'
      },
      {
        name: 'Enterprise Security Certification',
        status: 'on-track',
        progress: 85,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'Partner Ecosystem Development',
        status: 'on-track',
        progress: 72,
        owner: 'Business Dev',
        impact: 'medium'
      }
    ],
    risks: [
      {
        description: 'Increased competition in core markets',
        severity: 'medium',
        mitigation: 'Accelerating product differentiation and patent filings'
      },
      {
        description: 'Potential supply chain delays for Q1',
        severity: 'low',
        mitigation: 'Secured alternative vendors and increased buffer stock'
      }
    ],
    outlook: 'Strong momentum continues into 2025. Focus on operational excellence and strategic partnerships. Targeting $60M ARR by end of year with continued investment in product innovation.'
  },
  {
    id: 'q3-2024',
    quarter: 'Q3',
    year: 2024,
    date: '2024-09-30',
    title: 'Accelerated Growth & Market Validation',
    highlights: [
      'Revenue reached $9.8M (+38% QoQ)',
      'Achieved profitability milestone for first time',
      'Customer retention rate improved to 94%',
      'Launched mobile app with 12K downloads',
      'Won "Best B2B SaaS Innovation" award'
    ],
    keyMetrics: {
      revenue: 9800000,
      growth: 38,
      customers: 11500,
      satisfaction: 68
    },
    departments: [
      {
        name: 'Engineering',
        performance: 91,
        budget: 3800000,
        headcount: 78,
        achievements: [
          'Mobile app launch successful',
          'API response time improved 40%',
          'Zero critical bugs in production'
        ]
      },
      {
        name: 'Sales',
        performance: 93,
        budget: 2400000,
        headcount: 38,
        achievements: [
          'Closed 28 new enterprise accounts',
          'Average deal size up 22%',
          'Pipeline grew to $47M'
        ]
      },
      {
        name: 'Marketing',
        performance: 87,
        budget: 1600000,
        headcount: 24,
        achievements: [
          'Launched rebranding campaign',
          'Event participation: 8 conferences',
          'Social media following +125%'
        ]
      },
      {
        name: 'Product',
        performance: 90,
        budget: 1300000,
        headcount: 32,
        achievements: [
          'User research sessions: 89',
          'Feature satisfaction: 4.6/5',
          'Reduced churn by 15%'
        ]
      }
    ],
    initiatives: [
      {
        name: 'AI Platform Integration',
        status: 'on-track',
        progress: 75,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'Global Expansion - Phase 2',
        status: 'on-track',
        progress: 65,
        owner: 'Sales',
        impact: 'high'
      },
      {
        name: 'Mobile App Launch',
        status: 'completed',
        progress: 100,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'Customer Success Program',
        status: 'completed',
        progress: 100,
        owner: 'Customer Success',
        impact: 'medium'
      }
    ],
    risks: [
      {
        description: 'Scaling infrastructure for growth',
        severity: 'medium',
        mitigation: 'Implementing auto-scaling and load balancing'
      },
      {
        description: 'Talent acquisition in competitive market',
        severity: 'medium',
        mitigation: 'Enhanced benefits package and referral program'
      }
    ],
    outlook: 'Continued strong performance expected in Q4. Focus on international expansion and enterprise features. Preparing for Series B funding round.'
  },
  {
    id: 'q2-2024',
    quarter: 'Q2',
    year: 2024,
    date: '2024-06-30',
    title: 'Strategic Pivot Delivers Results',
    highlights: [
      'Revenue of $7.1M (+29% QoQ)',
      'Enterprise segment grew 156%',
      'Completed SOC 2 Type II certification',
      'Launched partner program with 15 partners',
      'Team expanded to 172 employees'
    ],
    keyMetrics: {
      revenue: 7100000,
      growth: 29,
      customers: 8900,
      satisfaction: 65
    },
    departments: [
      {
        name: 'Engineering',
        performance: 88,
        budget: 3200000,
        headcount: 68,
        achievements: [
          'SOC 2 certification completed',
          'Infrastructure migration to cloud',
          'Released 8 product updates'
        ]
      },
      {
        name: 'Sales',
        performance: 91,
        budget: 2000000,
        headcount: 32,
        achievements: [
          'Enterprise sales up 156%',
          'New sales playbook deployed',
          'Onboarded 15 partners'
        ]
      },
      {
        name: 'Marketing',
        performance: 84,
        budget: 1300000,
        headcount: 20,
        achievements: [
          'Website redesign launched',
          'Generated 1,850 MQLs',
          'Case study library expanded'
        ]
      },
      {
        name: 'Product',
        performance: 87,
        budget: 1100000,
        headcount: 28,
        achievements: [
          'Enterprise features prioritized',
          'User testing program launched',
          'Product-market fit score: 58/100'
        ]
      }
    ],
    initiatives: [
      {
        name: 'SOC 2 Certification',
        status: 'completed',
        progress: 100,
        owner: 'Security',
        impact: 'high'
      },
      {
        name: 'Partner Program Launch',
        status: 'completed',
        progress: 100,
        owner: 'Business Dev',
        impact: 'high'
      },
      {
        name: 'Mobile App Development',
        status: 'on-track',
        progress: 45,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'European Market Entry',
        status: 'on-track',
        progress: 30,
        owner: 'Sales',
        impact: 'medium'
      }
    ],
    risks: [
      {
        description: 'Product complexity increasing',
        severity: 'medium',
        mitigation: 'UX redesign initiative and onboarding improvements'
      },
      {
        description: 'Customer support capacity constraints',
        severity: 'high',
        mitigation: 'Hiring 10 additional support staff and implementing chatbot'
      }
    ],
    outlook: 'Positive trajectory maintained. Enterprise focus proving successful. Continued investment in security and compliance to capture larger deals.'
  },
  {
    id: 'q1-2024',
    quarter: 'Q1',
    year: 2024,
    date: '2024-03-31',
    title: 'Foundation Building & Market Momentum',
    highlights: [
      'Revenue reached $5.5M (+22% QoQ)',
      'Closed Series A funding of $15M',
      'Launched version 2.0 platform',
      'Customer base reached 6,800',
      'Achieved 91% gross retention rate'
    ],
    keyMetrics: {
      revenue: 5500000,
      growth: 22,
      customers: 6800,
      satisfaction: 62
    },
    departments: [
      {
        name: 'Engineering',
        performance: 86,
        budget: 2800000,
        headcount: 58,
        achievements: [
          'Platform 2.0 successfully launched',
          'Reduced technical debt by 35%',
          'Page load times improved 50%'
        ]
      },
      {
        name: 'Sales',
        performance: 88,
        budget: 1600000,
        headcount: 25,
        achievements: [
          'Closed largest deal: $450K',
          'Sales cycle reduced by 18 days',
          'Win rate improved to 32%'
        ]
      },
      {
        name: 'Marketing',
        performance: 82,
        budget: 1000000,
        headcount: 16,
        achievements: [
          'Launched content marketing hub',
          'Organic traffic up 89%',
          'Generated 1,200 qualified leads'
        ]
      },
      {
        name: 'Product',
        performance: 85,
        budget: 900000,
        headcount: 24,
        achievements: [
          'Completed major platform redesign',
          'Customer feedback score: 4.2/5',
          'Feature request backlog organized'
        ]
      }
    ],
    initiatives: [
      {
        name: 'Platform 2.0 Launch',
        status: 'completed',
        progress: 100,
        owner: 'Engineering',
        impact: 'high'
      },
      {
        name: 'Series A Funding',
        status: 'completed',
        progress: 100,
        owner: 'Finance',
        impact: 'high'
      },
      {
        name: 'SOC 2 Certification',
        status: 'on-track',
        progress: 60,
        owner: 'Security',
        impact: 'high'
      },
      {
        name: 'Sales Team Expansion',
        status: 'on-track',
        progress: 75,
        owner: 'Sales',
        impact: 'medium'
      }
    ],
    risks: [
      {
        description: 'Market saturation in core segment',
        severity: 'medium',
        mitigation: 'Expanding into enterprise and adjacent markets'
      },
      {
        description: 'Burn rate increasing with hiring',
        severity: 'low',
        mitigation: 'Series A funding secured, runway extended to 28 months'
      }
    ],
    outlook: 'Strong foundation in place for accelerated growth. Focus on enterprise market and building world-class team. Series A capital enables aggressive expansion.'
  }
];

export const metricTrends: MetricTrend[] = [
  { period: 'Q1 2024', revenue: 5500000, customers: 6800, growth: 22 },
  { period: 'Q2 2024', revenue: 7100000, customers: 8900, growth: 29 },
  { period: 'Q3 2024', revenue: 9800000, customers: 11500, growth: 38 },
  { period: 'Q4 2024', revenue: 12400000, customers: 15200, growth: 47 },
];

/**
 * ASSET LIBRARY - SINGLE SOURCE OF TRUTH
 * 
 * This file defines ALL assets available in the system.
 * Everything else imports from here - no duplication, no conflicts.
 * 
 * Integration Points:
 * - TemplateBuilder: Uses ASSET_LIBRARY for drag-drop palette
 * - AssetTypeReferenceModal: Uses ASSET_LIBRARY for documentation
 * - RenderFactory: Routes based on asset types
 * - EditorModalV2: Uses schemas for rendering
 * - Design System: Styling properties come from AssetStyles below
 */

// ==========================================
// DESIGN SYSTEM INTEGRATION
// ==========================================

export const AssetStyles = {
  // Spacing (from Tailwind design system)
  spacing: {
    xs: 'p-2',      // 8px
    sm: 'p-3',      // 12px
    md: 'p-4',      // 16px
    lg: 'p-6',      // 24px
    xl: 'p-8',      // 32px
  },
  
  // Typography (from Roobert font system)
  typography: {
    heading: {
      h1: 'text-3xl font-roobert-bold',
      h2: 'text-2xl font-roobert-semibold',
      h3: 'text-xl font-roobert-semibold',
      h4: 'text-lg font-roobert-medium',
      h5: 'text-base font-roobert-medium',
    },
    body: {
      large: 'text-base font-roobert-regular',
      normal: 'text-sm font-roobert-regular',
      small: 'text-xs font-roobert-regular',
    },
    label: {
      default: 'text-xs font-roobert-semibold uppercase tracking-wide',
      badge: 'text-xs font-roobert-medium',
    }
  },
  
  // Colors (FIS brand palette)
  colors: {
    primary: {
      navy: 'bg-fis-navy text-white',
      eggplant: 'bg-fis-eggplant text-white',
      raspberry: 'bg-fis-raspberry text-white',
    },
    status: {
      success: 'bg-green-500 text-white',
      warning: 'bg-yellow-500 text-gray-900',
      error: 'bg-red-500 text-white',
      info: 'bg-blue-500 text-white',
    },
    badges: {
      onTrack: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      atRisk: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      blocked: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      complete: 'bg-green-500/20 text-green-600 dark:text-green-400',
    }
  },
  
  // Borders & Shadows (glassmorphism)
  effects: {
    glass: 'backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border border-gray-200/50 dark:border-gray-700/50',
    glassStrong: 'backdrop-blur-lg bg-white/90 dark:bg-gray-800/90 border-2 border-fis-eggplant/30 dark:border-fis-raspberry/30',
    card: 'bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm',
    cardHover: 'hover:shadow-lg hover:border-fis-eggplant/50 dark:hover:border-fis-raspberry/50 transition-all duration-200',
  },
  
  // Rounded corners
  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full',
  }
};

// ==========================================
// ASSET DEFINITION INTERFACE
// ==========================================

export interface AssetDefinition {
  id: string;                    // Unique identifier (e.g., 'metricCard', 'progressBarList')
  name: string;                  // Display name in Template Builder
  type: string;                  // renderAs type for RenderFactory routing
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts' | 'media' | 'executiveSummary';
  description: string;           // What this asset does
  useCase: string;              // When/where to use it (with real examples)
  schema: any;                  // Field schema for rendering
  exampleData: any;             // Example data for previews
  supportsMultiColumn: boolean; // Can this asset be placed in multi-column layouts?
  styling?: {                   // Optional custom styling
    container?: string;         // Container classes
    padding?: string;           // Padding override
    typography?: string;        // Typography override
  };
}

// ==========================================
// ASSET LIBRARY - COMPLETE DEFINITIONS
// ==========================================

export const ASSET_LIBRARY: AssetDefinition[] = [
  
  // ==========================================
  // BASIC TEXT TYPES
  // ==========================================
  
  {
    id: 'text',
    name: 'Text Input',
    type: 'text',
    category: 'basic',
    description: 'Single-line text field for short content',
    useCase: 'Names, titles, short labels, status messages',
    schema: {
      type: 'text',
      renderAs: 'text',
      label: 'Text Input',
      required: false
    },
    exampleData: 'Sample text content',
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      typography: AssetStyles.typography.body.normal
    }
  },
  
  {
    id: 'textarea',
    name: 'Text Area',
    type: 'textarea',
    category: 'basic',
    description: 'Multi-line text field for longer content',
    useCase: 'Descriptions, notes, paragraphs',
    schema: {
      type: 'textarea',
      renderAs: 'textarea',
      label: 'Text Area',
      required: false
    },
    exampleData: 'This is a longer text block that spans multiple lines and can contain detailed information.',
    supportsMultiColumn: true,
    styling: {
      typography: AssetStyles.typography.body.normal
    }
  },
  
  {
    id: 'richText',
    name: 'Rich Text',
    type: 'richText',
    category: 'rich',
    description: 'Rich text with markdown support and inline formatting',
    useCase: 'Executive Summary sections, formatted paragraphs with bold/italic/highlights',
    schema: {
      type: 'richText',
      renderAs: 'richText',
      label: 'Rich Text',
      required: false
    },
    exampleData: 'This is **bold text** and this is *italic text* with inline formatting support.',
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      typography: AssetStyles.typography.body.normal,
      padding: AssetStyles.spacing.md
    }
  },
  
  // ==========================================
  // LIST TYPES
  // ==========================================
  
  {
    id: 'highlightsList',
    name: 'Highlights List (Numbered)',
    type: 'highlightsList',
    category: 'lists',
    description: 'Numbered list with colored circle badges (1-6) and text content',
    useCase: 'Key Highlights, This Week\'s Focus sections - auto-numbered pink badges',
    schema: {
      type: 'array',
      renderAs: 'highlightsList',
      label: 'Highlights',
      required: false
    },
    exampleData: [
      'Banking NA Titled Microsite - First Draft Published and endorsed by Michael Driscoll',
      'GTM Team Support - Office of the CTO Template Completed, moving to Figma conversion',
      'SNOW Migration - Built comprehensive reports, dashboard launch by Nov 14'
    ],
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.md,
      typography: AssetStyles.typography.body.normal
    }
  },
  
  {
    id: 'bulletList',
    name: 'Bullet List',
    type: 'bulletList',
    category: 'lists',
    description: 'Standard bulleted list without numbering',
    useCase: 'General list items, feature lists, action items',
    schema: {
      type: 'array',
      renderAs: 'bulletList',
      label: 'List Items',
      required: false
    },
    exampleData: [
      'First item in the list',
      'Second item with more detail',
      'Third item for completion'
    ],
    supportsMultiColumn: true,
    styling: {
      typography: AssetStyles.typography.body.normal
    }
  },
  
  {
    id: 'checklistItems',
    name: 'Checklist (Completed)',
    type: 'checklistItems',
    category: 'lists',
    description: 'Items with green checkmark icons showing completed status',
    useCase: 'Progress to Date section, completed milestones',
    schema: {
      type: 'array',
      renderAs: 'checklistItems',
      label: 'Completed Items',
      required: false
    },
    exampleData: [
      'Comprehensive stakeholder interviews with 6 key clients',
      'Collected competitive analysis of leading financial service portals',
      'Detailed preliminary requirements document'
    ],
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: 'bg-green-50 dark:bg-green-900/10',
      padding: AssetStyles.spacing.md
    }
  },
  
  {
    id: 'progressBarList',
    name: 'Progress Bar List',
    type: 'progressBarList',
    category: 'lists',
    description: 'List items with label, percentage, colored progress bar, and status badge',
    useCase: 'Strategic Initiatives section - shows completion percentage with On Track/At Risk/Blocked status',
    schema: {
      type: 'progressBarList',
      renderAs: 'progressBarList',
      label: 'Strategic Initiatives',
      required: false,
      fields: {
        title: { type: 'string', renderAs: 'text', label: 'Initiative Title' },
        subtitle: { type: 'string', renderAs: 'text', label: 'Team/Owner' },
        percentage: { type: 'number', renderAs: 'number', label: 'Completion %' },
        status: { type: 'string', renderAs: 'text', label: 'Status (On Track/At Risk/Blocked)' }
      }
    },
    exampleData: [
      { title: 'Banking NA Titled Microsite', subtitle: 'Demo Business', percentage: 75, status: 'On Track' },
      { title: 'SNOW Migration Dashboard', subtitle: 'Demo Operations', percentage: 85, status: 'On Track' },
      { title: 'International Issuing Hub', subtitle: 'Demo Enablement', percentage: 30, status: 'At Risk' }
    ],
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.lg
    }
  },
  
  {
    id: 'progressBarListDetailed',
    name: 'Progress Bar List (Detailed)',
    type: 'progressBarListDetailed',
    category: 'complex',
    description: 'Enhanced progress tracking with executive drill-down. Shows project/task details with owner, dates, budget, and clickable modal for full details.',
    useCase: 'Executive project tracking, strategic initiative monitoring, portfolio management with drill-down capability',
    schema: {
      type: 'progressBarListDetailed',
      renderAs: 'progressBarListDetailed',
      label: 'Strategic Projects',
      required: false,
      fields: {
        title: { type: 'string', renderAs: 'text', label: 'Project Title' },
        owner: { type: 'string', renderAs: 'text', label: 'Project Owner' },
        team: { type: 'string', renderAs: 'text', label: 'Team/Department' },
        startDate: { type: 'string', renderAs: 'text', label: 'Start Date' },
        targetDate: { type: 'string', renderAs: 'text', label: 'Target Completion' },
        percentage: { type: 'number', renderAs: 'number', label: 'Completion %' },
        status: { type: 'string', renderAs: 'text', label: 'Status (On Track/At Risk/Blocked/Complete)' },
        budget: { type: 'string', renderAs: 'text', label: 'Budget/Cost' },
        priority: { type: 'string', renderAs: 'text', label: 'Priority (High/Medium/Low)' },
        description: { type: 'string', renderAs: 'textarea', label: 'Description' },
        milestones: { type: 'string', renderAs: 'textarea', label: 'Key Milestones' },
        risks: { type: 'string', renderAs: 'textarea', label: 'Risks/Issues' },
        dependencies: { type: 'string', renderAs: 'textarea', label: 'Dependencies' }
      }
    },
    exampleData: [
      { 
        title: 'Enterprise Data Platform Modernization', 
        owner: 'Sarah Chen',
        team: 'Platform Engineering',
        startDate: '2025-10-01',
        targetDate: '2026-06-30',
        percentage: 42, 
        status: 'On Track',
        budget: '$2.4M',
        priority: 'High',
        description: 'Migration from legacy data warehouse to modern cloud-based analytics platform with real-time processing capabilities.',
        milestones: 'Phase 1 Complete (Data Migration) | Phase 2 In Progress (API Integration) | Phase 3 Planned (Analytics Dashboards)',
        risks: 'Vendor API integration delays, team capacity constraints in Q2',
        dependencies: 'AWS Infrastructure upgrade, Security compliance review'
      },
      { 
        title: 'Customer 360 Integration Initiative', 
        owner: 'Michael Rodriguez',
        team: 'Customer Experience',
        startDate: '2025-11-15',
        targetDate: '2026-04-15',
        percentage: 68, 
        status: 'On Track',
        budget: '$1.8M',
        priority: 'High',
        description: 'Unified customer data platform integrating CRM, support, and transaction systems for complete customer view.',
        milestones: 'Data Model Defined | CRM Integration Complete | Support System 75% | Transactions Pending',
        risks: 'None currently',
        dependencies: 'Marketing automation platform upgrade'
      },
      { 
        title: 'AI-Powered Support Assistant', 
        owner: 'Dr. Emily Watson',
        team: 'AI/ML Research',
        startDate: '2026-01-05',
        targetDate: '2026-09-30',
        percentage: 15, 
        status: 'At Risk',
        budget: '$3.2M',
        priority: 'Medium',
        description: 'Development of AI assistant for tier-1 customer support with natural language processing and automated ticket resolution.',
        milestones: 'Requirements Gathering Complete | Model Training In Progress | Integration Design Pending',
        risks: 'Model accuracy below target (72% vs 85% goal), training data quality issues',
        dependencies: 'Cloud GPU allocation, Legal compliance review for AI usage'
      }
    ],
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.lg
    }
  },
  
  // ==========================================
  // CARD/METRIC TYPES
  // ==========================================
  
  {
    id: 'metricCard',
    name: 'Metric Card',
    type: 'metricCard',
    category: 'charts',
    description: 'Single metric with icon, label, and large value display. Supports 4 styles (Standard/Highlight/Bold/Total), 12 icons, and 6 DSM colors.',
    useCase: 'Key Metrics section - Revenue $1,230,000, Customers 263, Growth +48%',
    schema: {
      type: 'array',
      renderAs: 'metricCard',
      label: 'Key Metrics',
      required: false,
      fields: {
        title: { type: 'string', renderAs: 'text', label: 'Title' },
        value: { type: 'string', renderAs: 'text', label: 'Value' },
        style: { type: 'string', renderAs: 'select', label: 'Card Style', options: ['standard', 'highlight', 'bold', 'total'] },
        icon: { type: 'string', renderAs: 'select', label: 'Icon', options: ['award', 'dollar', 'users', 'trending', 'target', 'star', 'rocket', 'chart', 'activity', 'zap', 'heart', 'check'] },
        iconColor: { type: 'string', renderAs: 'select', label: 'Icon Color', options: ['eggplant', 'raspberry', 'navy', 'green', 'stone', 'fog'] }
      }
    },
    exampleData: [
      { title: 'Revenue', value: '$1,230,000', style: 'highlight', icon: 'dollar', iconColor: 'green' },
      { title: 'Customers', value: '263', style: 'standard', icon: 'users', iconColor: 'navy' },
      { title: 'Growth', value: '+48%', style: 'bold', icon: 'trending', iconColor: 'green' },
      { title: 'NPS Score', value: '0', style: 'total', icon: 'award', iconColor: 'eggplant' }
    ],
    supportsMultiColumn: false,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.glassStrong,
      padding: AssetStyles.spacing.lg
    }
  },
  
  {
    id: 'gauge',
    name: 'Gauge (Single Metric)',
    type: 'gauge',
    category: 'charts',
    description: 'Single circular gauge showing percentage or value with color-coded progress ring',
    useCase: 'Hero banners - Overall Adoption Rate 82%, Completion Percentage, Success Rate',
    schema: {
      type: 'object',
      renderAs: 'gauge',
      label: 'Gauge Metric',
      required: false,
      fields: {
        value: { type: 'number', renderAs: 'number', label: 'Value (0-100 for %)' },
        label: { type: 'string', renderAs: 'text', label: 'Label' },
        suffix: { type: 'string', renderAs: 'text', label: 'Suffix (%, K, M, etc)' },
        color: { type: 'string', renderAs: 'text', label: 'Custom Color (optional)' },
        size: { type: 'string', renderAs: 'select', label: 'Size', options: ['small', 'medium', 'large'] }
      }
    },
    exampleData: {
      value: 82,
      label: 'Overall Adoption Rate',
      suffix: '%',
      size: 'large'
    },
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.md
    }
  },
  
  {
    id: 'nestedCards',
    name: 'Card List (Array of Objects)',
    type: 'nestedCards',
    category: 'lists',
    description: 'Array of structured objects displayed as cards with add/remove functionality',
    useCase: 'Team members, project items, any array of objects with consistent fields',
    schema: {
      type: 'nestedCards',
      renderAs: 'nestedCards',
      label: 'Items',
      required: false,
      fields: {
        title: { type: 'string', renderAs: 'text', label: 'Title' },
        value: { type: 'string', renderAs: 'text', label: 'Value' }
      }
    },
    exampleData: [
      { title: 'Team Lead', value: 'Sarah Johnson' },
      { title: 'Members', value: '12' }
    ],
    supportsMultiColumn: false,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.md
    }
  },
  
  // ==========================================
  // CHART TYPES
  // ==========================================
  
  {
    id: 'radialProgressChart',
    name: 'Radial Progress Chart',
    type: 'radialProgressChart',
    category: 'charts',
    description: 'Multi-ring donut chart with legend showing percentages',
    useCase: 'Department Performance section - shows multiple metrics in concentric rings',
    schema: {
      type: 'object',
      renderAs: 'radialProgressChart',
      label: 'Department Performance',
      required: false,
      chartConfig: {
        dataKey: 'value',
        maxValue: 100,
        colors: ['#5D2A6D', '#8B4789', '#B565A7', '#E183C5', '#FF9FD8'],
        showPercentage: true,
        thickness: 20
      },
      fields: {
        name: { label: 'Label', renderAs: 'text', required: true },
        value: { label: 'Percentage', renderAs: 'number', required: true }
      }
    },
    exampleData: [
      { name: 'Demo Enablement', value: 65 },
      { name: 'Demo Operations', value: 88 },
      { name: 'GTM Support', value: 96 },
      { name: 'Strategic Initiatives', value: 70 }
    ],
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.xl
    }
  },
  
  {
    id: 'pieChart',
    name: 'Pie Chart',
    type: 'pieChart',
    category: 'charts',
    description: 'Circular chart showing proportions',
    useCase: 'Distribution visualization, market share, category breakdown',
    schema: {
      type: 'pieChart',
      renderAs: 'pieChart',
      required: false,
      chartConfig: {
        dataKey: 'value',
        nameKey: 'name',
        colors: ['#5D2A6D', '#8B4789', '#B565A7', '#E183C5', '#FF9FD8'],
        showLegend: true,
        showTooltip: true,
        innerRadius: 0,
        outerRadius: 80
      },
      fields: {
        name: { label: 'Label', renderAs: 'text', required: true },
        value: { label: 'Value', renderAs: 'number', required: true }
      }
    },
    exampleData: [
      { name: 'Category A', value: 400 },
      { name: 'Category B', value: 300 },
      { name: 'Category C', value: 200 }
    ],
    supportsMultiColumn: true,
    supportsHero: true
  },
  
  {
    id: 'barChart',
    name: 'Bar Chart',
    type: 'barChart',
    category: 'charts',
    description: 'Vertical or horizontal bar chart',
    useCase: 'Comparisons, rankings, time series data',
    schema: {
      type: 'barChart',
      renderAs: 'barChart',
      required: false,
      chartConfig: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        bars: [
          { dataKey: 'value', fill: '#8B4789', name: 'Value' }
        ],
        orientation: 'vertical',
        showGrid: true,
        showLegend: true,
        stacked: false
      },
      fields: {
        name: { label: 'Label', renderAs: 'text', required: true },
        value: { label: 'Value', renderAs: 'number', required: true }
      }
    },
    exampleData: [
      { name: 'Q1', value: 400 },
      { name: 'Q2', value: 600 },
      { name: 'Q3', value: 800 },
      { name: 'Q4', value: 1000 }
    ],
    supportsMultiColumn: true,
    supportsHero: true
  },
  
  {
    id: 'lineChart',
    name: 'Line Chart',
    type: 'lineChart',
    category: 'charts',
    description: 'Line chart showing trends over time. Supports multiple series for comparison.',
    useCase: 'Time series data, trend analysis, monthly metrics, multi-series comparison',
    schema: {
      type: 'lineChart',
      renderAs: 'lineChart',
      required: false,
      chartConfig: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        curveType: 'monotone',
        showGrid: true,
        showLegend: true,
        strokeWidth: 3
      },
      fields: {
        name: { label: 'Label', renderAs: 'text', required: true },
        value: { label: 'Value', renderAs: 'number', required: true }
      }
    },
    exampleData: [
      { name: 'Jan', Series1: 105, Series2: 85, Series3: 60 },
      { name: 'Feb', Series1: 120, Series2: 88, Series3: 70 },
      { name: 'Mar', Series1: 110, Series2: 90, Series3: 75 },
      { name: 'Apr', Series1: 130, Series2: 95, Series3: 80 },
      { name: 'May', Series1: 125, Series2: 102, Series3: 85 },
      { name: 'Jun', Series1: 140, Series2: 105, Series3: 90 }
    ],
    supportsMultiColumn: true,
    supportsHero: true
  },
  
  {
    id: 'stackedBarChart',
    name: 'Stacked Bar Chart',
    type: 'stackedBarChart',
    category: 'charts',
    description: 'Stacked bar chart with multiple data series',
    useCase: 'Multi-category comparisons, activity breakdowns, resource allocation',
    schema: {
      type: 'stackedBarChart',
      renderAs: 'barChart',
      required: false,
      chartConfig: {
        xAxisKey: 'name',
        stacked: true,
        showGrid: true,
        showLegend: true
      }
    },
    exampleData: [
      { name: 'Banking', Support: 150, Prep: 200, Demo: 300 },
      { name: 'Capital Markets', Support: 120, Prep: 180, Demo: 250 }
    ],
    supportsMultiColumn: true
  },
  
  // ==========================================
  // COMPLEX TYPES
  // ==========================================
  
  {
    id: 'statusBoard',
    name: 'Status Board (Issues & Blockers)',
    type: 'statusBoard',
    category: 'complex',
    description: 'Issue tracker with tabs (Open/In Progress/Resolved) and status cards',
    useCase: 'Issues & Blockers section with categorized items and priority badges',
    schema: {
      type: 'statusBoard',
      renderAs: 'statusBoard',
      label: 'Issues & Blockers',
      required: false
    },
    exampleData: {
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
        },
        {
          title: 'Completed',
          items: [
            'Team shift recording and approval process implemented',
            'Demo Team payment issues resolved'
          ]
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: AssetStyles.effects.card,
      padding: AssetStyles.spacing.lg
    }
  },
  
  {
    id: 'riskCard',
    name: 'Risk Card',
    type: 'riskCard',
    category: 'complex',
    description: 'Alert-style card with severity icon (triangle/circle), title, description, and mitigation plan. Supports low (blue), medium (yellow), and high (red) severity levels.',
    useCase: 'Risks & Mitigation section with warning/high severity items',
    schema: {
      type: 'riskCard',
      renderAs: 'objectForm',
      label: 'Risk Item',
      fields: {
        type: { type: 'string', renderAs: 'text', label: 'Type (high-impact/high-severity/medium-impact/medium-severity/low-impact/low-severity)' },
        title: { type: 'string', renderAs: 'text', label: 'Risk Title' },
        description: { type: 'string', renderAs: 'textarea', label: 'Description' },
        mitigation: { type: 'string', renderAs: 'textarea', label: 'Mitigation Plan' }
      }
    },
    exampleData: [
      {
        type: 'low-severity',
        title: 'Vendor Documentation Update Required',
        description: 'API documentation needs minor updates for new endpoints',
        mitigation: 'Technical writing team scheduled to complete updates by end of sprint'
      },
      {
        type: 'high-impact',
        title: 'International Issuing Hub delayed due to Money 20/20 and EG-Coast availability',
        description: 'Timeline delays expected due to conference schedule conflicts',
        mitigation: 'ER expected to approve asset transfer this week, Coast dropped Matthews LIBs to expedite'
      },
      {
        severity: 'high',
        title: 'Critical Security Vulnerability in Payment Gateway',
        description: 'Zero-day exploit discovered in third-party payment processing library',
        mitigation: 'Emergency patch deployment scheduled for tonight, all transactions temporarily routed through backup system'
      }
    ],
    supportsMultiColumn: false,
    styling: {
      container: 'border-l-4',
      padding: AssetStyles.spacing.md
    }
  },
  
  // ==========================================
  // RICH CONTENT TYPES
  // ==========================================
  
  {
    id: 'quote',
    name: 'Quote Block',
    type: 'quote',
    category: 'rich',
    description: 'Blockquote with glassmorphism styling',
    useCase: 'Executive quotes, testimonials, highlighted statements',
    schema: {
      type: 'quote',
      renderAs: 'quote',
      label: 'Quote',
      required: false
    },
    exampleData: 'Strong momentum across Demo Services Group with key wins in Banking Microsite and SNOW migration.',
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      container: AssetStyles.effects.glassStrong,
      padding: AssetStyles.spacing.lg,
      typography: 'text-lg italic'
    }
  },
  
  {
    id: 'codeBlock',
    name: 'Code Block',
    type: 'codeBlock',
    category: 'rich',
    description: 'Code snippet with syntax highlighting',
    useCase: 'Technical documentation, API examples, configuration snippets',
    schema: {
      type: 'codeBlock',
      renderAs: 'codeBlock',
      label: 'Code',
      required: false
    },
    exampleData: 'const example = "code snippet";',
    supportsMultiColumn: true,
    styling: {
      container: 'bg-gray-900 dark:bg-gray-950',
      padding: AssetStyles.spacing.md,
      typography: 'font-mono text-sm'
    }
  },
  
  {
    id: 'keyValueList',
    name: 'Key-Value List',
    type: 'keyValueList',
    category: 'lists',
    description: 'Dynamic key-value pairs with labels (purple labels, add/remove pairs)',
    useCase: 'Executive Details, metadata, structured information',
    schema: {
      type: 'keyValueList',
      renderAs: 'keyValueList',
      label: 'Details',
      required: false
    },
    exampleData: {
      'Role': 'Chief Executive Officer',
      'Department': 'Executive Leadership',
      'Location': 'New York, NY',
      'Reports To': 'Board of Directors'
    },
    supportsMultiColumn: true,
    supportsHero: true,
    styling: {
      typography: AssetStyles.typography.body.normal
    }
  },
  
  {
    id: 'listTop5',
    name: 'Top 5 List (Square Badges)',
    type: 'listTop5',
    category: 'lists',
    description: 'Ranked top 5 list with square numbered badges and values',
    useCase: 'Top products, rankings, leaderboards, most popular items',
    schema: {
      type: 'listTop5',
      renderAs: 'listTop5',
      label: 'Top 5 Items',
      required: false,
      fields: {
        name: { label: 'Name', renderAs: 'text', required: true },
        value: { label: 'Count', renderAs: 'number', required: true }
      }
    },
    exampleData: [
      { name: 'Modern Banking Platform', value: 42 },
      { name: 'Capital Markets Suite', value: 38 },
      { name: 'Digital Payments Hub', value: 31 },
      { name: 'Risk Analytics Engine', value: 27 },
      { name: 'Cloud Treasury', value: 23 }
    ],
    supportsMultiColumn: true,
    styling: {
      typography: AssetStyles.typography.body.small
    }
  },
  
  // ==========================================
  // UTILITY TYPES
  // ==========================================
  
  {
    id: 'hr',
    name: 'Horizontal Rule',
    type: 'hr',
    category: 'basic',
    description: 'Visual separator line',
    useCase: 'Section dividers, visual breaks, multi-column separation',
    schema: {
      type: 'hr',
      renderAs: 'hr',
      required: false
    },
    exampleData: null,
    supportsMultiColumn: true
  },
  
  {
    id: 'number',
    name: 'Number Input',
    type: 'number',
    category: 'basic',
    description: 'Numeric input field',
    useCase: 'Counts, quantities, scores, percentages',
    schema: {
      type: 'number',
      renderAs: 'number',
      label: 'Number',
      required: false
    },
    exampleData: 42,
    supportsMultiColumn: true
  },
  
  // ==========================================
  // ADVANCED LAYOUT TYPES
  // ==========================================
  
  {
    id: 'timeline',
    name: 'Project Milestones',
    type: 'timeline',
    category: 'complex',
    description: 'Horizontal timeline with milestone markers and hover tooltips',
    useCase: 'Project roadmaps, initiative timelines, quarterly goals with dates',
    schema: {
      type: 'timeline',
      renderAs: 'timeline',
      label: 'Timeline',
      required: false,
      fields: {
        date: { type: 'string', renderAs: 'text', label: 'Date' },
        title: { type: 'string', renderAs: 'text', label: 'Milestone Title' },
        note: { type: 'string', renderAs: 'text', label: 'Note Label' },
        description: { type: 'string', renderAs: 'text', label: 'Details' },
        completed: { type: 'boolean', renderAs: 'checkbox', label: 'Completed' }
      }
    },
    exampleData: [
      { date: 'Q1 2024', title: 'Project Kickoff', note: 'TEXT NOTE', description: 'Initial planning session with stakeholders and core team formation', completed: true },
      { date: 'Q2 2024', title: 'Development Phase', note: 'TEXT NOTE', description: 'Technical specifications and business requirements documented', completed: true },
      { date: 'Q3 2024', title: 'Testing & QA', note: 'TEXT NOTE', description: 'Core infrastructure and foundational features deployed to staging', completed: false },
      { date: 'Q4 2024', title: 'Launch', note: 'TEXT NOTE', description: 'Limited release to pilot customers for feedback and validation', completed: false }
    ],
    supportsMultiColumn: false,
    styling: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      padding: AssetStyles.spacing.lg
    }
  },
  
  {
    id: 'twoColumnComparison',
    name: 'Four Block Grid',
    type: 'twoColumnComparison',
    category: 'complex',
    description: '2x2 grid with title and rich text in each block',
    useCase: 'Problem Statement (Issue/Impact/Market/Operations), SWOT Analysis',
    schema: {
      type: 'twoColumnComparison',
      renderAs: 'objectForm',
      label: 'Four Block Grid',
      fields: {
        topLeftTitle: { type: 'string', renderAs: 'text', label: 'Top Left Title' },
        topLeftContent: { type: 'string', renderAs: 'richText', label: 'Top Left Content' },
        topRightTitle: { type: 'string', renderAs: 'text', label: 'Top Right Title' },
        topRightContent: { type: 'string', renderAs: 'richText', label: 'Top Right Content' },
        bottomLeftTitle: { type: 'string', renderAs: 'text', label: 'Bottom Left Title' },
        bottomLeftContent: { type: 'string', renderAs: 'richText', label: 'Bottom Left Content' },
        bottomRightTitle: { type: 'string', renderAs: 'text', label: 'Bottom Right Title' },
        bottomRightContent: { type: 'string', renderAs: 'richText', label: 'Bottom Right Content' }
      }
    },
    exampleData: {
      topLeftTitle: 'The Issue',
      topLeftContent: 'Current client portal is outdated (built in 2016), lacks mobile optimization, and generates 200+ support calls per month due to usability issues. Client feedback consistently cites the portal as a pain point in relationship reviews.',
      topRightTitle: 'Business Impact',
      topRightContent: 'Portal deficiencies contributed to loss of 2 major clients ($800K AUM) in 2024. Annual support costs attributed to portal issues exceed $150K. RFP win rate decreased 12% when portal demos are included.',
      bottomLeftTitle: 'Market Context',
      bottomLeftContent: 'Competitors have launched modern, mobile-first portals with enhanced features. Recent market research shows 78% of clients expect banking-grade digital experiences from all financial service providers.',
      bottomRightTitle: 'Operational Context',
      bottomRightContent: 'Current portal runs on legacy technology stack with limited internal expertise. IT team spends 40% of maintenance time on portal-related issues. No API layer exists for future integrations.'
    },
    supportsMultiColumn: false,
    styling: {
      container: 'grid grid-cols-2 gap-6',
      padding: AssetStyles.spacing.md
    }
  },

  // ==========================================
  // SPACER (LAYOUT UTILITY)
  // ==========================================
  
  {
    id: 'spacer',
    name: 'Spacer',
    type: 'spacer',
    category: 'rich',
    description: 'Invisible placeholder for multi-column layout control',
    useCase: 'Use to create empty spaces in multi-column layouts. Example: Put 2 assets on a 3-column row by adding a spacer in the 3rd position.',
    schema: {
      type: 'spacer',
      renderAs: 'spacer',
      label: 'Spacer',
      required: false
    },
    exampleData: null,
    supportsMultiColumn: true,
    styling: {
      container: 'min-h-[20px]', // Minimal height to ensure visibility in editor
      padding: '0'
    }
  },
  
  // ==========================================
  // ORGANIZATIONAL CHARTS
  // ==========================================
  
  {
    id: 'vendorAsset',
    name: 'Vendor Strategic Identity',
    type: 'vendorAsset',
    category: 'complex',
    description: 'Executive vendor identity card with problems solved, core/extended functions, and success gallery',
    useCase: 'Vendor management pages - displays strategic purpose, capability split (core vs extended), and big wins in a modern asymmetrical layout',
    schema: {
      type: 'object',
      renderAs: 'vendorAsset',
      label: 'Vendor Identity',
      required: false
    },
    exampleData: {
      problemsSolved: '**Manages high-volume customer data processing** to reduce manual entry errors and latency.',
      coreFunctions: [
        'API Integration',
        'Real-time Dashboarding',
        'Automated Reporting'
      ],
      extendedFunctions: [
        'Predictive Analytics',
        'Bulk Data Export',
        'Custom Workflows'
      ],
      bigWins: [
        {
          metric: '-30%',
          title: 'Operational Overhead Saved',
          description: 'Reduced cloud costs by 20%'
        },
        {
          metric: '1M+',
          title: 'Q3 Scale',
          description: 'Supported 1M+ concurrent users.'
        },
        {
          metric: '99.9%',
          title: 'System Uptime',
          description: 'Ensured uninterrupted service delivery'
        }
      ]
    },
    supportsMultiColumn: false,
    supportsHero: true,
    styling: {
      container: 'min-h-[400px]',
      padding: AssetStyles.spacing.lg
    }
  },
  
  {
    id: 'orgChart',
    name: 'Org Chart',
    type: 'orgChart',
    category: 'complex',
    description: 'Interactive organizational hierarchy chart with search, zoom, and export capabilities',
    useCase: 'HR hierarchies, team structures, reporting lines - dynamic data with real-time search and visual navigation',
    schema: {
      type: 'object',
      renderAs: 'orgChart',
      label: 'Organization Chart',
      required: false
    },
    exampleData: {
      nodes: [
        {
          id: '1',
          parentId: null,
          name: 'Sarah Johnson',
          title: 'Chief Executive Officer',
          department: 'Executive Leadership',
          email: 'sarah.johnson@company.com',
          phone: '+1 (555) 100-0001',
          imageUrl: 'https://i.pravatar.cc/150?img=47'
        },
        {
          id: '2',
          parentId: '1',
          name: 'Michael Chen',
          title: 'Chief Technology Officer',
          department: 'Technology',
          email: 'michael.chen@company.com',
          phone: '+1 (555) 100-0002',
          imageUrl: 'https://i.pravatar.cc/150?img=12'
        },
        {
          id: '3',
          parentId: '1',
          name: 'Emily Rodriguez',
          title: 'Chief Financial Officer',
          department: 'Finance',
          email: 'emily.rodriguez@company.com',
          phone: '+1 (555) 100-0003',
          imageUrl: 'https://i.pravatar.cc/150?img=45'
        },
        {
          id: '4',
          parentId: '1',
          name: 'David Park',
          title: 'Chief Operating Officer',
          department: 'Operations',
          email: 'david.park@company.com',
          phone: '+1 (555) 100-0004',
          imageUrl: 'https://i.pravatar.cc/150?img=33'
        },
        {
          id: '5',
          parentId: '2',
          name: 'Jennifer Lee',
          title: 'VP of Engineering',
          department: 'Engineering',
          email: 'jennifer.lee@company.com',
          phone: '+1 (555) 100-0005',
          imageUrl: 'https://i.pravatar.cc/150?img=26'
        },
        {
          id: '6',
          parentId: '2',
          name: 'Robert Taylor',
          title: 'VP of Product',
          department: 'Product',
          email: 'robert.taylor@company.com',
          phone: '+1 (555) 100-0006',
          imageUrl: 'https://i.pravatar.cc/150?img=15'
        },
        {
          id: '7',
          parentId: '3',
          name: 'Amanda White',
          title: 'VP of Finance',
          department: 'Finance',
          email: 'amanda.white@company.com',
          phone: '+1 (555) 100-0007',
          imageUrl: 'https://i.pravatar.cc/150?img=44'
        },
        {
          id: '8',
          parentId: '4',
          name: 'James Wilson',
          title: 'VP of Operations',
          department: 'Operations',
          email: 'james.wilson@company.com',
          phone: '+1 (555) 100-0008',
          imageUrl: 'https://i.pravatar.cc/150?img=52'
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  },

  // ==========================================
  // FINANCIAL / BUDGET TYPES
  // ==========================================
  
  {
    id: 'budgetBreakdown',
    name: 'Executive Budget Breakdown',
    type: 'budgetBreakdown',
    category: 'complex',
    description: 'Full-width financial budget breakdown with line items, variance tracking, and detailed explanations via hover/modal interactions',
    useCase: 'Executive budgets, financial summaries, cost breakdowns - showing planned vs actual spend with drill-down details',
    schema: {
      type: 'object',
      renderAs: 'budgetBreakdown',
      label: 'Budget Breakdown',
      required: false
    },
    exampleData: {
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
              id: 'salaries',
              name: 'Base Salaries',
              budgeted: 2400000,
              actual: 2380000,
              variance: -20000,
              summary: 'Personnel costs running 0.8% under budget due to delayed hiring',
              explanation: 'Savings from delayed Q3 hires rolling into Q4',
              justification: 'Two senior positions remained open through Q3 reorganization',
              owner: 'HR Director',
              lastUpdated: '2025-11-15'
            },
            {
              id: 'benefits',
              name: 'Benefits & Insurance',
              budgeted: 550000,
              actual: 545000,
              variance: -5000,
              summary: 'Employee benefits tracking slightly under budget with improved coverage terms',
              explanation: 'Lower health insurance premiums than projected',
              justification: 'Negotiated favorable group rates with new provider',
              owner: 'Benefits Manager',
              lastUpdated: '2025-11-10'
            },
            {
              id: 'bonuses',
              name: 'Performance Bonuses',
              budgeted: 250000,
              actual: 225000,
              variance: -25000,
              explanation: 'Q3 performance metrics below target',
              justification: 'Market conditions impacted sales targets by 12%',
              owner: 'Compensation Lead',
              lastUpdated: '2025-11-20'
            }
          ]
        },
        {
          id: 'technology',
          name: 'Technology & Infrastructure',
          icon: 'Server',
          budgeted: 1200000,
          actual: 1050000,
          variance: -150000,
          variancePercent: -12.5,
          status: 'on-track',
          color: 'blue',
          lineItems: [
            {
              id: 'cloud',
              name: 'Cloud Services (AWS, Azure)',
              budgeted: 650000,
              actual: 580000,
              variance: -70000,
              explanation: 'Optimization initiatives reduced compute costs',
              justification: 'Infrastructure team implemented auto-scaling and reserved instances',
              owner: 'Cloud Architect',
              lastUpdated: '2025-11-18'
            },
            {
              id: 'licenses',
              name: 'Software Licenses',
              budgeted: 350000,
              actual: 310000,
              variance: -40000,
              explanation: 'Enterprise license renegotiation savings',
              justification: 'Consolidated vendors and secured multi-year discount',
              owner: 'IT Procurement',
              lastUpdated: '2025-11-05'
            },
            {
              id: 'hardware',
              name: 'Hardware & Equipment',
              budgeted: 200000,
              actual: 160000,
              variance: -40000,
              explanation: 'Deferred laptop refresh to Q1 2026',
              justification: 'Extended lifecycle by 6 months based on performance data',
              owner: 'IT Director',
              lastUpdated: '2025-11-12'
            }
          ]
        },
        {
          id: 'operations',
          name: 'Operations & Facilities',
          icon: 'Building2',
          budgeted: 550000,
          actual: 475000,
          variance: -75000,
          variancePercent: -13.6,
          status: 'on-track',
          color: 'violet',
          lineItems: [
            {
              id: 'rent',
              name: 'Office Rent & Utilities',
              budgeted: 350000,
              actual: 325000,
              variance: -25000,
              explanation: 'Reduced office footprint with hybrid work model',
              justification: 'Sublease of 2 floors generating $25K/month revenue',
              owner: 'Facilities Manager',
              lastUpdated: '2025-11-08'
            },
            {
              id: 'supplies',
              name: 'Office Supplies & Equipment',
              budgeted: 120000,
              actual: 90000,
              variance: -30000,
              explanation: 'Lower in-office headcount reduced supply needs',
              justification: 'Average 40% remote work across all departments',
              owner: 'Office Manager',
              lastUpdated: '2025-11-14'
            },
            {
              id: 'travel',
              name: 'Business Travel',
              budgeted: 80000,
              actual: 60000,
              variance: -20000,
              explanation: 'Virtual meetings replacing some in-person conferences',
              justification: 'Travel policy update prioritizing essential trips only',
              owner: 'Operations Director',
              lastUpdated: '2025-11-16'
            }
          ]
        },
        {
          id: 'marketing',
          name: 'Marketing & Customer Acquisition',
          icon: 'TrendingUp',
          budgeted: 300000,
          actual: 325000,
          variance: 25000,
          variancePercent: 8.3,
          status: 'at-risk',
          color: 'amber',
          lineItems: [
            {
              id: 'digital',
              name: 'Digital Advertising',
              budgeted: 180000,
              actual: 195000,
              variance: 15000,
              explanation: 'Increased spend to capitalize on Q4 market opportunity',
              justification: 'ROI tracking shows 3.2x return on incremental investment',
              owner: 'Marketing Director',
              lastUpdated: '2025-11-22'
            },
            {
              id: 'events',
              name: 'Events & Sponsorships',
              budgeted: 80000,
              actual: 90000,
              variance: 10000,
              explanation: 'Added last-minute industry conference sponsorship',
              justification: 'Strategic opportunity to reach 2000+ qualified leads',
              owner: 'Events Manager',
              lastUpdated: '2025-11-19'
            },
            {
              id: 'content',
              name: 'Content Production',
              budgeted: 40000,
              actual: 40000,
              variance: 0,
              explanation: 'On budget - video production and design as planned',
              justification: 'Quarterly content calendar executed per schedule',
              owner: 'Content Lead',
              lastUpdated: '2025-11-17'
            }
          ]
        }
      ],
      notes: 'Overall tracking 7.1% under budget. Marketing overage justified by ROI metrics. Technology savings from optimization initiatives.'
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.lg
    }
  },

  {
    id: 'ganttChart',
    name: 'Gantt Chart (Project Timeline)',
    type: 'ganttChart',
    category: 'complex',
    description: 'Interactive project timeline with organizational groupings, task bars, status tracking, progress indicators, and detailed drill-down modals',
    useCase: 'Strategic initiatives, project roadmaps, multi-org coordination - showing timelines, milestones, dependencies, and progress with collapsible organizational structure',
    schema: {
      type: 'object',
      renderAs: 'ganttChart',
      label: 'Gantt Chart',
      required: false
    },
    exampleData: {
      title: 'Q1 2026 Strategic Initiatives',
      startDate: '2026-01-01',
      endDate: '2026-03-31',
      organizations: [
        {
          id: 'capital-markets',
          name: 'Capital Markets',
          color: 'var(--brand-primary)',
          collapsed: false,
          projects: [
            {
              id: 'titled-rollout',
              name: 'Tiled Rollout',
              tasks: [
                {
                  id: 'license-procurement',
                  name: 'License Procurement',
                  startDate: '2026-01-05',
                  endDate: '2026-01-20',
                  progress: 85,
                  status: 'on-track',
                  owner: 'Sarah Chen',
                  details: {
                    description: 'Procure licenses for 500 users across 3 regions (NA, EMEA, APAC)',
                    milestones: [
                      { date: '2026-01-08', title: 'Vendor Selection Complete', completed: true },
                      { date: '2026-01-15', title: 'Contract Signed', completed: true },
                      { date: '2026-01-20', title: 'Licenses Activated', completed: false }
                    ],
                    blockers: [],
                    dependencies: []
                  }
                },
                {
                  id: 'infrastructure-setup',
                  name: 'Infrastructure Setup',
                  startDate: '2026-01-18',
                  endDate: '2026-02-05',
                  progress: 45,
                  status: 'on-track',
                  owner: 'Mike Rodriguez',
                  details: {
                    description: 'Configure servers, databases, and networking for production deployment',
                    milestones: [
                      { date: '2026-01-22', title: 'Server Provisioning', completed: true },
                      { date: '2026-01-28', title: 'Database Migration', completed: false },
                      { date: '2026-02-05', title: 'Load Testing Complete', completed: false }
                    ],
                    blockers: ['Waiting for security audit approval'],
                    dependencies: ['license-procurement']
                  }
                },
                {
                  id: 'user-training',
                  name: 'User Training & Documentation',
                  startDate: '2026-02-01',
                  endDate: '2026-02-28',
                  progress: 0,
                  status: 'on-track',
                  owner: 'Jennifer Lee',
                  details: {
                    description: 'Create training materials and conduct user onboarding sessions',
                    milestones: [
                      { date: '2026-02-10', title: 'Training Materials Complete', completed: false },
                      { date: '2026-02-20', title: 'Pilot Training Sessions', completed: false },
                      { date: '2026-02-28', title: 'All Users Trained', completed: false }
                    ],
                    blockers: [],
                    dependencies: ['infrastructure-setup']
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'banking-na',
          name: 'Banking (NA)',
          color: 'var(--accent-blue)',
          collapsed: true,
          projects: [
            {
              id: 'core-modernization',
              name: 'Core Banking Modernization',
              tasks: [
                {
                  id: 'api-migration',
                  name: 'API Migration',
                  startDate: '2026-01-10',
                  endDate: '2026-02-15',
                  progress: 60,
                  status: 'on-track',
                  owner: 'Robert Kim',
                  details: {
                    description: 'Migrate legacy APIs to modern RESTful architecture',
                    milestones: [
                      { date: '2026-01-20', title: 'API Design Complete', completed: true },
                      { date: '2026-02-01', title: 'Development Complete', completed: false }
                    ],
                    blockers: [],
                    dependencies: []
                  }
                },
                {
                  id: 'data-migration',
                  name: 'Customer Data Migration',
                  startDate: '2026-02-10',
                  endDate: '2026-03-20',
                  progress: 15,
                  status: 'blocked',
                  owner: 'Amanda Torres',
                  details: {
                    description: 'Migrate 2.5M customer records to new platform',
                    milestones: [
                      { date: '2026-02-15', title: 'Data Mapping Complete', completed: false },
                      { date: '2026-03-01', title: 'Pilot Migration', completed: false }
                    ],
                    blockers: ['Data quality issues identified', 'Compliance review pending'],
                    dependencies: ['api-migration']
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'banking-int',
          name: 'Banking (INT)',
          color: 'var(--accent-green)',
          collapsed: true,
          projects: [
            {
              id: 'multi-currency',
              name: 'Multi-Currency Support',
              tasks: [
                {
                  id: 'forex-integration',
                  name: 'Forex Rate Integration',
                  startDate: '2026-01-15',
                  endDate: '2026-02-28',
                  progress: 90,
                  status: 'completed',
                  owner: 'David Park',
                  details: {
                    description: 'Integrate real-time forex rates from multiple providers',
                    milestones: [
                      { date: '2026-01-25', title: 'Provider Integration', completed: true },
                      { date: '2026-02-10', title: 'Rate Caching System', completed: true },
                      { date: '2026-02-25', title: 'Production Deployment', completed: true }
                    ],
                    blockers: [],
                    dependencies: []
                  }
                }
              ]
            }
          ]
        },
        {
          id: 'payments',
          name: 'PAYMENTS',
          color: 'var(--brand-secondary)',
          collapsed: true,
          projects: [
            {
              id: 'instant-payments',
              name: 'Instant Payments Platform',
              tasks: [
                {
                  id: 'real-time-processing',
                  name: 'Real-Time Processing Engine',
                  startDate: '2026-01-08',
                  endDate: '2026-03-15',
                  progress: 55,
                  status: 'at-risk',
                  owner: 'Lisa Wong',
                  details: {
                    description: 'Build high-performance real-time payment processing system',
                    milestones: [
                      { date: '2026-01-30', title: 'Architecture Review', completed: true },
                      { date: '2026-02-20', title: 'Beta Testing', completed: false },
                      { date: '2026-03-10', title: 'Security Audit', completed: false }
                    ],
                    blockers: ['Performance bottleneck at 10k TPS'],
                    dependencies: []
                  }
                },
                {
                  id: 'fraud-detection',
                  name: 'AI-Powered Fraud Detection',
                  startDate: '2026-02-01',
                  endDate: '2026-03-25',
                  progress: 30,
                  status: 'on-track',
                  owner: 'Carlos Mendez',
                  details: {
                    description: 'Machine learning model for real-time fraud detection',
                    milestones: [
                      { date: '2026-02-15', title: 'Model Training', completed: false },
                      { date: '2026-03-01', title: 'Integration Testing', completed: false }
                    ],
                    blockers: [],
                    dependencies: ['real-time-processing']
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    supportsMultiColumn: false,
    supportsHero: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  },

  {
    id: 'forecastBreakdown',
    name: 'Financial Forecast (Capex/Opex)',
    type: 'forecastBreakdown',
    category: 'complex',
    description: 'Financial forecast planning with Capex (one-time) vs Opex (yearly) classification for investment analysis',
    useCase: 'Budget planning, financial forecasting, investment proposals - showing one-time capital expenses vs recurring operational costs',
    schema: {
      type: 'object',
      renderAs: 'forecastBreakdown',
      label: 'Forecast Breakdown',
      required: false
    },
    exampleData: {
      title: '2026 Technology Investment Forecast',
      currency: 'USD',
      period: 'FY 2026',
      initiatives: [
        {
          id: 'cloud-migration',
          name: 'Cloud Migration Project',
          termYears: 3,
          costCenters: [
            {
              id: 'capex',
              type: 'capex',
              name: 'Capex',
              removable: false,
              lineItems: [
                {
                  id: '1',
                  name: 'Azure Reserved Instances',
                  amount: 120000,
                  description: 'One-time 3-year commitment for compute and storage',
                  summary: 'Multi-year Azure reservation provides 40% savings vs on-demand pricing',
                  justification: 'Current on-premise infrastructure reaching end-of-life. Cloud-first strategy approved.',
                  owner: 'Cloud Architect',
                  lastUpdated: '2025-12-05'
                },
                {
                  id: '2',
                  name: 'Migration Services',
                  amount: 80000,
                  description: 'Professional services for workload migration and optimization',
                  summary: 'Third-party consulting to accelerate migration timeline',
                  owner: 'Cloud Program Manager',
                  lastUpdated: '2025-12-05'
                }
              ]
            },
            {
              id: 'opex',
              type: 'opex',
              name: 'Opex',
              removable: false,
              lineItems: [
                {
                  id: '3',
                  name: 'Annual Cloud Services',
                  amount: 150000,
                  description: 'Ongoing compute, storage, networking costs beyond reserved capacity',
                  summary: 'Variable workloads and development environments',
                  owner: 'IT Operations',
                  lastUpdated: '2025-12-05'
                },
                {
                  id: '4',
                  name: 'Monitoring & Observability',
                  amount: 50000,
                  description: 'Datadog Enterprise license and APM',
                  summary: 'Real-time monitoring across cloud infrastructure',
                  owner: 'DevOps Team',
                  lastUpdated: '2025-12-05'
                }
              ]
            },
            {
              id: 'idsw-1',
              type: 'custom',
              name: 'IDSW',
              removable: true,
              lineItems: [
                {
                  id: '5',
                  name: 'IDSW Support Services',
                  amount: 45000,
                  description: 'Dedicated support from IDSW for cloud migration',
                  summary: 'Architecture review and optimization guidance',
                  owner: 'Cloud Architect',
                  lastUpdated: '2025-12-05'
                }
              ]
            }
          ]
        },
        {
          id: 'security-compliance',
          name: 'Security & Compliance Initiative',
          termYears: 1,
          costCenters: [
            {
              id: 'capex',
              type: 'capex',
              name: 'Capex',
              removable: false,
              lineItems: [
                {
                  id: '6',
                  name: 'SIEM Platform Implementation',
                  amount: 60000,
                  description: 'Splunk Enterprise Security deployment and configuration',
                  summary: 'Centralized security event management and threat detection',
                  justification: 'SOC 2 Type II compliance requirement. Audit findings require centralized logging.',
                  owner: 'Security Architect',
                  lastUpdated: '2025-12-05'
                }
              ]
            },
            {
              id: 'opex',
              type: 'opex',
              name: 'Opex',
              removable: false,
              lineItems: [
                {
                  id: '7',
                  name: 'Managed Security Services',
                  amount: 80000,
                  description: 'SOC services, threat intelligence, incident response',
                  summary: '24/7 security monitoring and response',
                  owner: 'CISO',
                  lastUpdated: '2025-12-05'
                },
                {
                  id: '8',
                  name: 'Compliance & Audit',
                  amount: 40000,
                  description: 'Annual audit fees, penetration testing, compliance consulting',
                  summary: 'SOC 2, ISO 27001, and industry-specific compliance',
                  owner: 'Compliance Manager',
                  lastUpdated: '2025-12-05'
                }
              ]
            }
          ]
        },
        {
          id: 'erp-modernization',
          name: 'ERP System Modernization',
          termYears: 1,
          costCenters: [
            {
              id: 'capex',
              type: 'capex',
              name: 'Capex',
              removable: false,
              lineItems: [
                {
                  id: '9',
                  name: 'NetSuite Upgrade',
                  amount: 100000,
                  description: 'Major version upgrade with new financial modules',
                  summary: 'Enhanced reporting, multi-currency support, advanced revenue recognition',
                  justification: 'Current version end-of-support in Q2 2026. New features required for global expansion.',
                  owner: 'ERP Program Manager',
                  lastUpdated: '2025-12-05'
                }
              ]
            },
            {
              id: 'opex',
              type: 'opex',
              name: 'Opex',
              removable: false,
              lineItems: [
                {
                  id: '10',
                  name: 'Training & Change Management',
                  amount: 30000,
                  description: 'User training, documentation, change management support',
                  summary: 'Ensure successful adoption across 150 users',
                  owner: 'ERP Program Manager',
                  lastUpdated: '2025-12-05'
                }
              ]
            },
            {
              id: 'consulting',
              type: 'custom',
              name: 'Consulting',
              removable: true,
              lineItems: [
                {
                  id: '11',
                  name: 'NetSuite Implementation Partner',
                  amount: 75000,
                  description: 'Certified NetSuite consultants for upgrade and customization',
                  summary: 'Expert guidance to minimize downtime and ensure data integrity',
                  owner: 'ERP Program Manager',
                  lastUpdated: '2025-12-05'
                }
              ]
            }
          ]
        }
      ],
      notes: 'Three strategic initiatives totaling $850K. Cloud Migration (3-year, $445K) is largest investment. Security & Compliance ($180K) addresses audit findings. ERP Modernization ($205K) enables global expansion. Overall split: 42% Capex / 38% Opex / 20% Custom (IDSW & Consulting).'
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.lg
    }
  },

  // ==========================================
  // EXECUTIVE SUMMARIES
  // ==========================================

  // CPSAR: Context, Problem, Solution, Action, Results
  {
    id: 'executiveSummaryCPSAR',
    name: 'Executive Summary (CPSAR)',
    type: 'executiveSummaryCPSAR',
    category: 'executiveSummary',
    description: 'CPSAR Framework: Context, Problem, Solution, Action/Recommendation, Results/Asks',
    useCase: 'Executive summaries, status reports, decision briefs - structured for C-suite',
    schema: {
      type: 'object',
      renderAs: 'executiveSummaryCPSAR',
      label: 'Executive Synthesis',
      required: false
    },
    exampleData: {
      context: 'Q4 2026 strategic initiative tracking across 12 programs ($45M total investment)',
      problem: '3 critical path projects at risk (15% budget overrun, 2-month delay potential)',
      solution: 'Reallocated $2M from Project X, added 3 FTEs, fast-tracked vendor procurement',
      recommendation: 'Approve emergency funding drawdown and extend Q1 deadline by 30 days',
      asks: [
        {
          type: 'budget',
          item: 'Approve $2M emergency funding from Q1 reserves',
          urgency: 'high',
          owner: 'CFO',
          deadline: 'Dec 15, 2025'
        },
        {
          type: 'decision',
          item: 'Extend Project Alpha deadline to Jan 31, 2026',
          urgency: 'medium',
          owner: 'CEO',
          deadline: 'Dec 20, 2025'
        },
        {
          type: 'resource',
          item: 'Approve 3 contractor positions for Q1',
          urgency: 'high',
          owner: 'CHRO',
          deadline: 'Dec 18, 2025'
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  },

  // BLUF: Bottom Line Up Front (Military/Government Style)
  {
    id: 'executiveSummaryBLUF',
    name: 'Executive Summary (BLUF)',
    type: 'executiveSummaryBLUF',
    category: 'executiveSummary',
    description: 'BLUF Framework: Bottom Line Up Front - Answer first, then context',
    useCase: 'Military-style brief, urgent decisions, time-sensitive communications',
    schema: {
      type: 'object',
      renderAs: 'executiveSummaryBLUF',
      label: 'Executive Summary (BLUF)',
      required: false
    },
    exampleData: {
      bottomLine: 'Approve $2M emergency funding by Dec 15 to prevent 3 critical projects from 2-month delay',
      background: 'Q4 tracking 12 strategic programs ($45M). Recent RIF eliminated platform team, creating budget ownership gap.',
      assessment: '3 projects at risk: 15% overrun, resource shortage, vendor procurement delays. Without action, Q1 delivery jeopardized.',
      recommendation: 'Reallocate Q1 reserves, extend deadlines 30 days, approve 3 contractor positions',
      asks: [
        {
          type: 'budget',
          item: 'Approve $2M emergency funding from Q1 reserves',
          urgency: 'high',
          owner: 'CFO',
          deadline: 'Dec 15, 2025'
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  },

  // SBAR: Situation, Background, Assessment, Recommendation (Healthcare/Operations)
  {
    id: 'executiveSummarySBAR',
    name: 'Executive Summary (SBAR)',
    type: 'executiveSummarySBAR',
    category: 'executiveSummary',
    description: 'SBAR Framework: Situation, Background, Assessment, Recommendation',
    useCase: 'Healthcare, operations, incident reports - standardized clinical communication',
    schema: {
      type: 'object',
      renderAs: 'executiveSummarySBAR',
      label: 'Executive Summary (SBAR)',
      required: false
    },
    exampleData: {
      situation: '3 critical projects facing 2-month delay and 15% budget overrun as of Dec 13, 2025',
      background: 'Q4 portfolio: 12 programs, $45M investment. Recent RIF eliminated platform team and budget sponsors.',
      assessment: 'Resource shortage critical. Vendor procurement delayed. Without intervention, Q1 deliverables at risk.',
      recommendation: 'Emergency funding $2M, deadline extension 30 days, 3 contractor approvals',
      asks: [
        {
          type: 'decision',
          item: 'Extend Project Alpha deadline to Jan 31, 2026',
          urgency: 'medium',
          owner: 'CEO',
          deadline: 'Dec 20, 2025'
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  },

  // Pyramid Principle: Main argument first, then supporting points (McKinsey/Consulting)
  {
    id: 'executiveSummaryPyramid',
    name: 'Executive Summary (Pyramid)',
    type: 'executiveSummaryPyramid',
    category: 'executiveSummary',
    description: 'Pyramid Principle: Main argument, key points, supporting details, next steps',
    useCase: 'Consulting briefs, strategic recommendations - structured logical arguments',
    schema: {
      type: 'object',
      renderAs: 'executiveSummaryPyramid',
      label: 'Executive Summary (Pyramid)',
      required: false
    },
    exampleData: {
      mainArgument: 'Immediate $2M funding approval required to salvage Q4 strategic portfolio and prevent cascading Q1 failures',
      keyPoints: [
        'Resource Crisis: RIF eliminated platform team, creating critical skill gaps',
        'Budget Impact: 3 projects showing 15% overrun ($6.75M at risk)',
        'Timeline Pressure: 2-month slip threatens Q1 commitments to board'
      ],
      supportingDetails: 'Portfolio: 12 programs, $45M total investment. Risk concentration: Project Alpha ($18M), Project Beta ($12M), Project Gamma ($15.75M). Mitigation started: reallocated $2M internally, fast-tracked vendor procurement, identified 3 contractor candidates.',
      nextSteps: 'Dec 15: CFO approves emergency funding. Dec 20: CEO extends deadlines. Dec 22: HR approves contractor positions. Jan 5: Resume full velocity.',
      asks: [
        {
          type: 'budget',
          item: 'Approve $2M emergency funding from Q1 reserves',
          urgency: 'high',
          owner: 'CFO',
          deadline: 'Dec 15, 2025'
        }
      ]
    },
    supportsMultiColumn: false,
    styling: {
      container: 'w-full',
      padding: AssetStyles.spacing.md
    }
  }
];


// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get asset definition by ID
 */
export function getAssetById(id: string): AssetDefinition | undefined {
  return ASSET_LIBRARY.find(asset => asset.id === id);
}

/**
 * Get asset definition by type (renderAs)
 */
export function getAssetByType(type: string): AssetDefinition | undefined {
  return ASSET_LIBRARY.find(asset => asset.type === type);
}

/**
 * Get all assets in a category
 */
export function getAssetsByCategory(category: string): AssetDefinition[] {
  return ASSET_LIBRARY.filter(asset => asset.category === category);
}

/**
 * Get all multi-column capable assets
 */
export function getMultiColumnAssets(): AssetDefinition[] {
  return ASSET_LIBRARY.filter(asset => asset.supportsMultiColumn);
}

/**
 * Build field schema from asset type
 */
export function buildFieldSchema(type: string, customFields?: any): any {
  const asset = getAssetByType(type);
  if (!asset) {
    console.warn(`Unknown asset type: ${type}`);
    return { type: 'text', renderAs: 'text' };
  }

  return {
    ...asset.schema,
    ...customFields
  };
}

/**
 * Group assets by category for Template Builder
 * Converts flat asset array into nested structure expected by drag-drop UI
 */
export function groupAssetsByCategory() {
  const categories = [
    { id: 'basic', name: 'Basic Text', color: 'blue' },
    { id: 'lists', name: 'Lists & Arrays', color: 'green' },
    { id: 'charts', name: 'Charts & Metrics', color: 'pink' },
    { id: 'complex', name: 'Complex Layouts', color: 'purple' },
    { id: 'rich', name: 'Rich Content', color: 'orange' },
    { id: 'executiveSummary', name: 'Executive Summary', color: 'red' },
    { id: 'media', name: 'Media (Coming Soon)', color: 'cyan' },
  ];

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    assets: ASSET_LIBRARY.filter(asset => asset.category === cat.id)
  }));
}

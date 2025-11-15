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
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts' | 'media';
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
    supportsMultiColumn: false,
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
    supportsMultiColumn: false,
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
    styling: {
      container: AssetStyles.effects.glassStrong,
      padding: AssetStyles.spacing.lg
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
    supportsMultiColumn: true
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
    supportsMultiColumn: true
  },
  
  {
    id: 'lineChart',
    name: 'Line Chart',
    type: 'lineChart',
    category: 'charts',
    description: 'Line chart showing trends over time',
    useCase: 'Time series data, trend analysis, monthly metrics',
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
      { name: 'Jan', value: 45 },
      { name: 'Feb', value: 52 },
      { name: 'Mar', value: 61 },
      { name: 'Apr', value: 58 },
      { name: 'May', value: 67 },
      { name: 'Jun', value: 74 }
    ],
    supportsMultiColumn: true
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
        severity: { type: 'string', renderAs: 'text', label: 'Severity (low/medium/high)' },
        title: { type: 'string', renderAs: 'text', label: 'Risk Title' },
        description: { type: 'string', renderAs: 'textarea', label: 'Description' },
        mitigation: { type: 'string', renderAs: 'textarea', label: 'Mitigation Plan' }
      }
    },
    exampleData: [
      {
        severity: 'low',
        title: 'Vendor Documentation Update Required',
        description: 'API documentation needs minor updates for new endpoints',
        mitigation: 'Technical writing team scheduled to complete updates by end of sprint'
      },
      {
        severity: 'medium',
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
    supportsMultiColumn: false,
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
    supportsMultiColumn: false,
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
        description: { type: 'string', renderAs: 'text', label: 'Details' },
        completed: { type: 'boolean', renderAs: 'checkbox', label: 'Completed' }
      }
    },
    exampleData: [
      { date: 'Jan 2025', title: 'Project Kickoff', description: 'Initial planning session with stakeholders and core team formation', completed: true },
      { date: 'Feb 2025', title: 'Requirements Finalized', description: 'Technical specifications and business requirements documented', completed: true },
      { date: 'Apr 2025', title: 'Phase 1 Development', description: 'Core infrastructure and foundational features deployed to staging', completed: true },
      { date: 'Jun 2025', title: 'Beta Launch', description: 'Limited release to pilot customers for feedback and validation', completed: false },
      { date: 'Aug 2025', title: 'Feature Expansion', description: 'Additional capabilities based on beta feedback implemented', completed: false },
      { date: 'Oct 2025', title: 'Production Release', description: 'Full rollout to all markets with complete feature set', completed: false },
      { date: 'Dec 2025', title: 'Year-End Review', description: 'Performance analysis, metrics review, and next year planning', completed: false }
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
    { id: 'media', name: 'Media (Coming Soon)', color: 'cyan' },
  ];

  return categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
    assets: ASSET_LIBRARY.filter(asset => asset.category === cat.id)
  }));
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, GripVertical, ChevronRight, ChevronDown, 
  Type, List, Grid, Layers, FileText, BarChart3, Settings,
  Eye, Code, Save, Download, Upload, PlayCircle, TrendingUp, AlertTriangle,
  PieChart, LineChart, Activity, Hash, Calendar, MessageSquare, Palette,
  Key, Quote, Terminal, AlignLeft, AlignCenter, AlignRight, Minus, AlertCircle, Image, Video, Film,
  Columns, ArrowLeft, CheckCircle, XCircle
} from 'lucide-react';
import type { FieldSchema } from '../../../src/types/schema';
import { ChartColors } from '../../../src/design-system';
import EditorModalV2 from './EditorModalV2';
import AssetPreviewModal from './AssetPreviewModal';

interface TemplateBuilderProps {
  onBack: () => void;
  showNotification?: (type: 'success' | 'error' | 'warning', message: string) => void;
}

// Layout zone types for snap layout feature
type LayoutZone = 
  | 'full'        // 100% width
  | 'left-50'     // Left half (50%)
  | 'right-50'    // Right half (50%)
  | 'left-70'     // Left 70%
  | 'right-30'    // Right 30%
  | 'left-30'     // Left 30%
  | 'right-70'    // Right 70%
  | 'left-33'     // Left third
  | 'middle-33'   // Middle third
  | 'right-33';   // Right third

interface TemplateSection {
  id: string;
  name: string;
  expanded: boolean;
  fields: TemplateField[];
  sectionLayoutType?: LayoutZone; // NEW: Track the layout type set by first asset
}

interface LayoutElement {
  id: string;
  type: 'hr';
  position: number; // Position in the template (between sections)
  config?: any;
}

interface TemplateField {
  id: string;
  key: string;
  label: string;
  renderType: string;
  schema: FieldSchema;
  exampleData?: any; // Example data for lists, arrays, or nested cards
  alignment?: 'left' | 'center' | 'right'; // Text alignment (default: 'left')
  
  // NEW: Snap layout properties (optional - backward compatible)
  layoutZone?: LayoutZone;
  rowIndex?: number;  // Which row in the section (0, 1, 2...)
}

// Type alias for compatibility
type Field = TemplateField;

interface AssetCategory {
  id: string;
  name: string;
  icon: typeof Type;
  color: string;
  assets: AssetItem[];
}

interface AssetItem {
  id: string;
  name: string;
  renderType: string;
  description: string;
  schema: FieldSchema;
  icon?: typeof Type; // Optional icon for the asset
  iconColor?: string; // Optional color for the icon
  exampleData?: any; // Example data for preview
  supportsMultiColumn?: boolean; // Whether this asset can be used in multi-column layouts
}

// Asset Library - Available drag sources
const ASSET_LIBRARY: AssetCategory[] = [
  {
    id: 'basic',
    name: 'Basic Inputs',
    icon: Type,
    color: 'blue',
    assets: [
      {
        id: 'text',
        name: 'Text Input',
        renderType: 'text',
        description: 'Simple single-line text',
        schema: { type: 'string', renderAs: 'text', label: 'New Text Field' },
        icon: Type,
        iconColor: 'text-blue-500',
        exampleData: 'Revenue Operations Team',
        supportsMultiColumn: true
      },
      {
        id: 'textarea',
        name: 'Text Area',
        renderType: 'textarea',
        description: 'Multi-line text input',
        schema: { 
          type: 'string', 
          renderAs: 'textarea', 
          label: 'New Text Area',
          placeholder: 'Enter detailed description...'
        },
        icon: AlignLeft,
        iconColor: 'text-blue-600',
        exampleData: 'This quarter we focused on streamlining our sales pipeline and improving customer engagement metrics. Key achievements include 25% reduction in sales cycle time and 40% increase in qualified leads.',
        supportsMultiColumn: true
      },
      {
        id: 'number',
        name: 'Number',
        renderType: 'number',
        description: 'Numeric input',
        schema: { type: 'number', renderAs: 'number', label: 'New Number' },
        icon: Hash,
        iconColor: 'text-blue-700',
        exampleData: 42500,
        supportsMultiColumn: true
      },
      {
        id: 'date',
        name: 'Date Picker',
        renderType: 'text',
        description: 'Date selection',
        schema: { type: 'date', renderAs: 'text', label: 'New Date' },
        icon: Calendar,
        iconColor: 'text-blue-800',
        exampleData: '2025-01-15',
        supportsMultiColumn: true
      }
    ]
  },
  {
    id: 'lists',
    name: 'Lists & Arrays',
    icon: List,
    color: 'green',
    assets: [
      {
        id: 'array',
        name: 'List with Labels',
        renderType: 'keyValueList',
        description: 'Key-value pairs with labels',
        schema: { type: 'object', renderAs: 'keyValueList', label: 'Details' },
        icon: List,
        iconColor: 'text-green-500',
        exampleData: {
          'Role': 'Chief Executive Officer',
          'Department': 'Executive Leadership',
          'Location': 'New York, NY',
          'Reports To': 'Board of Directors'
        },
        supportsMultiColumn: true
      },
      {
        id: 'arrayNoLabels',
        name: 'List (No Labels)',
        renderType: 'listNoTitle',
        description: 'Simple bullet list without labels',
        schema: { type: 'array', renderAs: 'listNoTitle', label: 'New List', itemSchema: { type: 'string', renderAs: 'text' } },
        icon: List,
        iconColor: 'text-green-400',
        exampleData: ['Completed Phase 1 ahead of schedule', 'Reduced operational costs by 30%', 'Hired 5 new team members'],
        supportsMultiColumn: true
      },
      {
        id: 'nestedCards',
        name: 'Card List',
        renderType: 'nestedCards',
        description: 'Array of card objects',
        schema: { 
          type: 'array',
          renderAs: 'nestedCards',
          label: 'New Cards',
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              title: { type: 'string', renderAs: 'text', label: 'Title' },
              value: { type: 'string', renderAs: 'text', label: 'Value' }
            }
          }
        },
        icon: Grid,
        iconColor: 'text-green-600',
        exampleData: [
          { title: 'Revenue', value: '$2.4M' },
          { title: 'Growth', value: '+35%' },
          { title: 'Customers', value: '1,250' },
          { title: 'Retention', value: '94%' }
        ],
        supportsMultiColumn: false
      }
    ]
  },
  {
    id: 'complex',
    name: 'Complex',
    icon: Layers,
    color: 'purple',
    assets: [
      {
        id: 'object',
        name: 'Object',
        renderType: 'object',
        description: 'Nested object structure',
        schema: { 
          type: 'object',
          renderAs: 'objectForm',
          label: 'New Object',
          fields: {
            team: { type: 'string', renderAs: 'text', label: 'Team' },
            lead: { type: 'string', renderAs: 'text', label: 'Lead' },
            members: { type: 'number', renderAs: 'number', label: 'Members' }
          }
        },
        icon: Layers,
        iconColor: 'text-purple-500',
        exampleData: { team: 'RevOps', lead: 'Sarah Johnson', members: 12 },
        supportsMultiColumn: true
      },
      {
        id: 'keyValue',
        name: 'Key-Value Pair',
        renderType: 'keyValue',
        description: 'Key and value fields',
        schema: { 
          type: 'object',
          renderAs: 'objectForm',
          label: 'New Key-Value',
          fields: {
            key: { type: 'string', renderAs: 'text', label: 'Key' },
            value: { type: 'string', renderAs: 'text', label: 'Value' }
          }
        },
        icon: Key,
        iconColor: 'text-purple-600',
        exampleData: { key: 'Status', value: 'On Track' },
        supportsMultiColumn: true
      }
    ]
  },
  {
    id: 'rich',
    name: 'Rich Content',
    icon: FileText,
    color: 'orange',
    assets: [
      {
        id: 'markdown',
        name: 'Markdown Editor',
        renderType: 'richText',
        description: 'Rich markdown content',
        schema: { type: 'string', renderAs: 'richText', label: 'New Markdown' },
        icon: FileText,
        iconColor: 'text-orange-500',
        exampleData: '## Q1 2025 Highlights\n\nWe achieved **record-breaking growth** this quarter:\n\n- Revenue up 35% YoY\n- Customer base expanded to 1,250+\n- Launched 3 major features\n\n> "Best quarter in company history" - CEO',
        supportsMultiColumn: true
      },
      {
        id: 'expression',
        name: 'Expression',
        renderType: 'expression',
        description: 'Dynamic expressions',
        schema: { type: 'string', renderAs: 'expression', label: 'New Expression' },
        icon: Code,
        iconColor: 'text-orange-600',
        exampleData: 'Revenue: {{currency:2400000}} ({{percent:33.3}} growth) {{trend:up}}',
        supportsMultiColumn: true
      },
      {
        id: 'codeBlock',
        name: 'Code Block',
        renderType: 'codeBlock',
        description: 'Code snippet with copy button',
        schema: { type: 'string', renderAs: 'codeBlock', label: 'New Code Block' },
        icon: Terminal,
        iconColor: 'text-orange-700',
        exampleData: 'const calculateGrowth = (current, previous) => {\n  return ((current - previous) / previous * 100).toFixed(2);\n};\n\nconsole.log(calculateGrowth(2400000, 1800000)); // 33.33%',
        supportsMultiColumn: true
      },
      {
        id: 'quote',
        name: 'Quote',
        renderType: 'quote',
        description: 'Blockquote with glassmorphism',
        schema: { type: 'string', renderAs: 'quote', label: 'New Quote' },
        icon: Quote,
        iconColor: 'text-orange-800',
        exampleData: 'Our team executed flawlessly this quarter. The dedication and innovation demonstrated by everyone has positioned us perfectly for continued success.',
        supportsMultiColumn: true
      }
    ]
  },
  {
    id: 'charts',
    name: 'Charts',
    icon: TrendingUp,
    color: 'pink',
    assets: [
      {
        id: 'pieChart',
        name: 'Pie Chart',
        renderType: 'pieChart',
        description: 'Circular proportional chart',
        schema: { 
          type: 'array',
          label: 'New Pie Chart',
          renderAs: 'pieChart',
          chartConfig: {
            dataKey: 'value',
            nameKey: 'name',
            colors: [...ChartColors.palette],
            showLegend: true,
            showTooltip: true,
            innerRadius: 0,
            outerRadius: 80
          },
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              name: { type: 'string', renderAs: 'text', label: 'Label', required: true },
              value: { type: 'number', renderAs: 'number', label: 'Value', required: true }
            }
          }
        },
        icon: PieChart,
        iconColor: 'text-pink-500',
        exampleData: [
          { name: 'Enterprise', value: 45 },
          { name: 'Mid-Market', value: 30 },
          { name: 'SMB', value: 25 }
        ],
        supportsMultiColumn: true
      },
      {
        id: 'barChart',
        name: 'Bar Chart',
        renderType: 'barChart',
        description: 'Vertical or horizontal bars',
        schema: { 
          type: 'array',
          label: 'New Bar Chart',
          renderAs: 'barChart',
          chartConfig: {
            xAxisKey: 'name',
            bars: [{ dataKey: 'value', fill: ChartColors.series.eggplantLight, name: 'Value' }],
            orientation: 'vertical',
            showGrid: true,
            showLegend: true,
            stacked: false
          },
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              name: { type: 'string', renderAs: 'text', label: 'Label', required: true },
              value: { type: 'number', renderAs: 'number', label: 'Value', required: true }
            }
          }
        },
        icon: BarChart3,
        iconColor: 'text-pink-600',
        exampleData: [
          { name: 'Q1', value: 2400 },
          { name: 'Q2', value: 3100 },
          { name: 'Q3', value: 2800 },
          { name: 'Q4', value: 3500 }
        ],
        supportsMultiColumn: true
      },
      {
        id: 'lineChart',
        name: 'Line Chart',
        renderType: 'lineChart',
        description: 'Trend lines over time',
        schema: { 
          type: 'array',
          label: 'New Line Chart',
          renderAs: 'lineChart',
          chartConfig: {
            xAxisKey: 'name',
            lines: [{ dataKey: 'value', stroke: ChartColors.series.eggplantLight, name: 'Value' }],
            showGrid: true,
            showLegend: true,
            showDots: true,
            curved: true
          },
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              name: { type: 'string', renderAs: 'text', label: 'Label', required: true },
              value: { type: 'number', renderAs: 'number', label: 'Value', required: true }
            }
          }
        },
        icon: LineChart,
        iconColor: 'text-pink-700',
        exampleData: [
          { name: 'Jan', value: 650 },
          { name: 'Feb', value: 720 },
          { name: 'Mar', value: 830 },
          { name: 'Apr', value: 900 },
          { name: 'May', value: 1050 },
          { name: 'Jun', value: 1200 }
        ],
        supportsMultiColumn: true
      },
      {
        id: 'radialChart',
        name: 'Radial Chart',
        renderType: 'radialChart',
        description: 'Circular progress/donut',
        schema: { 
          type: 'array',
          label: 'New Radial Chart',
          renderAs: 'radialChart',
          chartConfig: {
            dataKey: 'value',
            maxValue: 100,
            colors: [...ChartColors.palette],
            showPercentage: true,
            thickness: 20
          },
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              name: { type: 'string', renderAs: 'text', label: 'Label', required: true },
              value: { type: 'number', renderAs: 'number', label: 'Value', required: true }
            }
          }
        },
        icon: Activity,
        iconColor: 'text-pink-800',
        exampleData: [
          { name: 'Completion', value: 87 }
        ],
        supportsMultiColumn: true
      }
    ]
  },
  {
    id: 'media',
    name: 'Media',
    icon: Image,
    color: 'cyan',
    assets: [
      {
        id: 'image',
        name: 'Image',
        renderType: 'image',
        description: 'Image upload or URL',
        schema: { 
          type: 'object',
          renderAs: 'image', 
          label: 'New Image',
          fields: {
            src: { type: 'string', renderAs: 'text', label: 'Image URL', placeholder: 'https://example.com/image.jpg', required: true },
            alt: { type: 'string', renderAs: 'text', label: 'Alt Text', placeholder: 'Description for accessibility' },
            autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale', defaultValue: true },
            width: { type: 'number', renderAs: 'number', label: 'Width (px)', placeholder: 'Leave empty for auto' },
            height: { type: 'number', renderAs: 'number', label: 'Height (px)', placeholder: 'Leave empty for auto' },
            caption: { type: 'string', renderAs: 'text', label: 'Caption', placeholder: 'Optional image caption' }
          }
        },
        icon: Image,
        iconColor: 'text-cyan-500',
        exampleData: {
          src: 'https://via.placeholder.com/800x400/6b46c1/ffffff?text=Executive+Summary+Image',
          alt: 'Executive Summary Visualization',
          autoScale: true,
          caption: 'Q4 2024 Performance Dashboard'
        },
        supportsMultiColumn: true
      },
      {
        id: 'video',
        name: 'Video',
        renderType: 'video',
        description: 'Video file upload or URL',
        schema: { 
          type: 'object',
          renderAs: 'video', 
          label: 'New Video',
          fields: {
            src: { type: 'string', renderAs: 'text', label: 'Video URL', placeholder: 'https://example.com/video.mp4', required: true },
            poster: { type: 'string', renderAs: 'text', label: 'Poster Image', placeholder: 'Thumbnail/preview image URL' },
            autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale', defaultValue: true },
            width: { type: 'number', renderAs: 'number', label: 'Width (px)', placeholder: 'Leave empty for auto' },
            height: { type: 'number', renderAs: 'number', label: 'Height (px)', placeholder: 'Leave empty for auto' },
            controls: { type: 'boolean', renderAs: 'checkbox', label: 'Show Controls', defaultValue: true },
            autoplay: { type: 'boolean', renderAs: 'checkbox', label: 'Autoplay', defaultValue: false },
            loop: { type: 'boolean', renderAs: 'checkbox', label: 'Loop', defaultValue: false },
            muted: { type: 'boolean', renderAs: 'checkbox', label: 'Muted', defaultValue: false }
          }
        },
        icon: Video,
        iconColor: 'text-cyan-600',
        exampleData: {
          src: 'https://www.w3schools.com/html/mov_bbb.mp4',
          poster: 'https://via.placeholder.com/800x450/6b46c1/ffffff?text=Video+Preview',
          autoScale: true,
          controls: true,
          autoplay: false,
          loop: false,
          muted: false
        },
        supportsMultiColumn: true
      },
      {
        id: 'embeddedVideo',
        name: 'Embedded Video',
        renderType: 'embeddedVideo',
        description: 'YouTube, Vimeo, or iframe embed',
        schema: { 
          type: 'object',
          renderAs: 'embeddedVideo', 
          label: 'New Embedded Video',
          fields: {
            embedUrl: { type: 'string', renderAs: 'text', label: 'Embed URL', placeholder: 'https://www.youtube.com/embed/...', required: true },
            platform: { type: 'string', renderAs: 'select', label: 'Platform', options: ['youtube', 'vimeo', 'custom'], defaultValue: 'youtube' },
            autoScale: { type: 'boolean', renderAs: 'checkbox', label: 'Auto Scale (16:9)', defaultValue: true },
            width: { type: 'number', renderAs: 'number', label: 'Width (px)', placeholder: 'Leave empty for auto' },
            height: { type: 'number', renderAs: 'number', label: 'Height (px)', placeholder: 'Leave empty for auto' },
            allowFullscreen: { type: 'boolean', renderAs: 'checkbox', label: 'Allow Fullscreen', defaultValue: true },
            title: { type: 'string', renderAs: 'text', label: 'Title', placeholder: 'Video title for accessibility' }
          }
        },
        icon: Film,
        iconColor: 'text-cyan-700',
        exampleData: {
          embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          platform: 'youtube',
          autoScale: true,
          allowFullscreen: true,
          title: 'Executive Presentation Video'
        },
        supportsMultiColumn: true
      }
    ]
  },
  {
    id: 'layout',
    name: 'Layout',
    icon: Grid,
    color: 'gray',
    assets: [
      {
        id: 'hr',
        name: 'Horizontal Rule',
        renderType: 'hr',
        description: 'Visual divider line',
        schema: { 
          type: 'string', 
          label: 'Divider',
          renderAs: 'hr',
          hrConfig: {
            thickness: 1,
            color: ChartColors.ui.grid,
            marginTop: 24,
            marginBottom: 24,
            style: 'solid'
          }
        },
        icon: Minus,
        iconColor: 'text-gray-500',
        exampleData: null,
        supportsMultiColumn: false
      },
      {
        id: 'statusBoard',
        name: 'Table Layout',
        renderType: 'statusBoard',
        description: 'Generic column layout with grouped cards - configurable for any data',
        schema: { 
          type: 'object',
          renderAs: 'statusBoard',
          label: 'Issues & Blockers',
          groupByField: 'status',
          columns: [
            { key: 'open', label: 'Open', color: 'text-red-600 dark:text-red-400' },
            { key: 'in-progress', label: 'In Progress', color: 'text-blue-600 dark:text-blue-400' },
            { key: 'resolved', label: 'Resolved', color: 'text-green-600 dark:text-green-400' }
          ],
          itemSchema: {
            type: 'object',
            renderAs: 'objectForm',
            fields: {
              title: { 
                type: 'string', 
                renderAs: 'text', 
                label: 'Title', 
                required: true,
                displayAs: 'title'
              },
              description: { 
                type: 'string', 
                renderAs: 'textarea', 
                label: 'Description',
                displayAs: 'subtitle'
              },
              priority: { 
                type: 'string', 
                renderAs: 'select', 
                label: 'Priority', 
                options: ['low', 'medium', 'high', 'critical'],
                displayAs: 'badge',
                badgeColors: {
                  'critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
                  'high': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
                  'medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
                  'low': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                }
              },
              action: { 
                type: 'string', 
                renderAs: 'textarea', 
                label: 'Action',
                displayAs: 'label-value'
              },
              timeline: { 
                type: 'string', 
                renderAs: 'text', 
                label: 'Timeline',
                displayAs: 'detail'
              },
              status: { 
                type: 'string', 
                renderAs: 'select', 
                label: 'Status', 
                options: ['open', 'in-progress', 'resolved'], 
                required: true 
              }
            }
          }
        },
        icon: Columns,
        iconColor: 'text-purple-700',
        exampleData: [
          {
            title: 'Tiled Performance & Import Failures',
            description: 'PowerPoint import features and general Designer performance are unreliable',
            priority: 'high',
            action: 'Developing new deployment and design process',
            timeline: 'End of November 2024',
            status: 'in-progress'
          },
          {
            title: 'Demo Team – Shift Payment Issues',
            description: 'Team member unpaid for weekend work due to lack of shift audit trail',
            priority: 'medium',
            action: 'Implement process to record and approve all shifts including weekends',
            timeline: 'Immediate',
            status: 'in-progress'
          },
          {
            title: 'SNOW BU Data Not Mandatory',
            description: 'BU data is not mandatory in SNOW forms, limiting ability to segment by org',
            priority: 'medium',
            action: 'Reviewing form structure to make BU data collection mandatory',
            timeline: 'Before Nov 14 dashboard launch',
            status: 'in-progress'
          }
        ],
        supportsMultiColumn: false
      }
    ]
  }
];

// Snap Zone Overlay Component - Shows layout CHOICES when dragging first asset into empty section
interface SnapZoneOverlayProps {
  sectionId: string;
  onZoneDrop: (zone: LayoutZone) => void;
  hoveredZone: LayoutZone | null;
  onZoneHover: (zone: LayoutZone | null) => void;
}

const SnapZoneOverlay = ({ sectionId, onZoneDrop, hoveredZone, onZoneHover }: SnapZoneOverlayProps) => {
  // Each layout choice represents a complete pattern
  const layoutChoices: Array<{ zone: LayoutZone; label: string; preview: React.ReactNode }> = [
    {
      zone: 'full',
      label: 'Full Width',
      preview: <div className="w-full h-16 border-2 border-gray-400 rounded bg-gray-200/50"></div>
    },
    {
      zone: 'left-50',
      label: '50 / 50',
      preview: (
        <div className="flex gap-2 w-full">
          <div className="flex-1 h-16 border-2 border-gray-400 rounded bg-gray-200/50"></div>
          <div className="flex-1 h-16 border-2 border-gray-300 rounded bg-gray-100/50"></div>
        </div>
      )
    },
    {
      zone: 'left-70',
      label: '70 / 30',
      preview: (
        <div className="flex gap-2 w-full">
          <div className="w-[70%] h-16 border-2 border-gray-400 rounded bg-gray-200/50"></div>
          <div className="w-[30%] h-16 border-2 border-gray-300 rounded bg-gray-100/50"></div>
        </div>
      )
    },
    {
      zone: 'left-30',
      label: '30 / 70',
      preview: (
        <div className="flex gap-2 w-full">
          <div className="w-[30%] h-16 border-2 border-gray-400 rounded bg-gray-200/50"></div>
          <div className="w-[70%] h-16 border-2 border-gray-300 rounded bg-gray-100/50"></div>
        </div>
      )
    },
    {
      zone: 'left-33',
      label: '33 / 33 / 33',
      preview: (
        <div className="flex gap-2 w-full">
          <div className="flex-1 h-16 border-2 border-gray-400 rounded bg-gray-200/50"></div>
          <div className="flex-1 h-16 border-2 border-gray-300 rounded bg-gray-100/50"></div>
          <div className="flex-1 h-16 border-2 border-gray-300 rounded bg-gray-100/50"></div>
        </div>
      )
    }
  ];

  return (
    <div className="absolute inset-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-lg p-6 flex flex-col items-center justify-center pointer-events-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">
          Choose Section Layout
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select a layout pattern for this section
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 w-full max-w-md">
        {layoutChoices.map(({ zone, label, preview }) => (
          <div
            key={zone}
            onDragOver={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onZoneHover(zone); 
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onZoneHover(null);
            }}
            onDrop={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onZoneDrop(zone); 
              onZoneHover(null);
            }}
            className={`p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              hoveredZone === zone
                ? 'bg-fis-eggplant/20 border-fis-eggplant dark:border-fis-raspberry scale-[1.02] shadow-lg'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant/50 hover:bg-fis-eggplant/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-roobert-semibold text-sm text-gray-700 dark:text-gray-300">
                {label}
              </span>
              {hoveredZone === zone && (
                <span className="text-xs text-fis-eggplant dark:text-fis-raspberry font-roobert-semibold">
                  Drop here
                </span>
              )}
            </div>
            {preview}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function TemplateBuilder({ onBack, showNotification: showNotificationProp }: TemplateBuilderProps) {
  // Initialize with standard header section
  const [sections, setSections] = useState<TemplateSection[]>([
    {
      id: 'section-header',
      name: 'Standard Header',
      expanded: false,
      fields: [
        {
          id: 'field-id',
          key: 'id',
          label: 'ID',
          renderType: 'text',
          schema: { type: 'string', renderAs: 'text', label: 'ID', placeholder: 'Auto-generated' }
        },
        {
          id: 'field-quarter',
          key: 'quarter',
          label: 'Quarter',
          renderType: 'text',
          schema: { type: 'string', renderAs: 'text', label: 'Quarter', placeholder: 'e.g., Q1, Jan 15' }
        },
        {
          id: 'field-year',
          key: 'year',
          label: 'Year',
          renderType: 'number',
          schema: { type: 'number', renderAs: 'number', label: 'Year' }
        },
        {
          id: 'field-date',
          key: 'date',
          label: 'Date',
          renderType: 'date',
          schema: { type: 'date', renderAs: 'text', label: 'Date' }
        },
        {
          id: 'field-title',
          key: 'title',
          label: 'Title',
          renderType: 'text',
          schema: { type: 'string', renderAs: 'text', label: 'Title', placeholder: 'Organization - Weekly Executive Update' }
        }
      ]
    }
  ]);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('basic'); // Kept for backwards compatibility but not used in tree view
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['basic'])); // Start with basic expanded
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set<string>();
      // Only allow one category open at a time (accordion behavior)
      if (!prev.has(categoryId)) {
        newSet.add(categoryId);
      }
      // If clicking the already-open category, close it (newSet stays empty)
      return newSet;
    });
  };
  const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null);
  const [draggedField, setDraggedField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<AssetItem | null>(null);
  const [validationResults, setValidationResults] = useState<Array<{check: string; passed: boolean; message: string}>>([]);
  const [validationPassed, setValidationPassed] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState<string>('');
  const [saveTemplateDescription, setSaveTemplateDescription] = useState<string>('');
  const [loadedTemplateName, setLoadedTemplateName] = useState<string>(''); // Track base template name
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // Track if template has been modified
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track if this is the first load
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false);
  
  // Use central notification system or fallback to console
  const showNotification = (type: 'success' | 'error' | 'warning', message: string) => {
    if (showNotificationProp) {
      showNotificationProp(type, message);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  };
  
  const [schemaPropertiesOpen, setSchemaPropertiesOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [showTestEditor, setShowTestEditor] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  
  // Layout system - always enabled (sections have layout types)
  const useSnapLayout = true; // Always use layout system
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [showLayoutGuide, setShowLayoutGuide] = useState(false);
  
  // Standard header default values
  const [headerDefaults, setHeaderDefaults] = useState({
    id: 'template-new',
    quarter: 'Month Day',
    year: new Date().getFullYear(),
    date: new Date().toISOString().split('T')[0],
    title: 'Your Organization Name - Weekly Executive Update'
  });

  const selectedCategory = ASSET_LIBRARY.find(cat => cat.id === selectedCategoryId);

  // Helper: Convert layout zone to Tailwind width class
  const getWidthClass = (zone?: LayoutZone): string => {
    const widthMap: Record<LayoutZone, string> = {
      'full': 'w-full',
      'left-50': 'w-1/2',
      'right-50': 'w-1/2',
      'left-70': 'w-[70%]',
      'right-30': 'w-[30%]',
      'left-30': 'w-[30%]',
      'right-70': 'w-[70%]',
      'left-33': 'w-1/3',
      'middle-33': 'w-1/3',
      'right-33': 'w-1/3',
    };
    return widthMap[zone || 'full'] || 'w-full';
  };

  // Helper: Get zone display name
  const getZoneLabel = (zone: LayoutZone): string => {
    const labelMap: Record<LayoutZone, string> = {
      'full': 'Full Width',
      'left-50': 'Left 50%',
      'right-50': 'Right 50%',
      'left-70': 'Left 70%',
      'right-30': 'Right 30%',
      'left-30': 'Left 30%',
      'right-70': 'Right 70%',
      'left-33': 'Left 33%',
      'middle-33': 'Middle 33%',
      'right-33': 'Right 33%',
    };
    return labelMap[zone];
  };

  // Helper: Group fields by row index
  const groupFieldsByRow = (fields: TemplateField[]): Record<number, TemplateField[]> => {
    return fields.reduce((acc, field) => {
      const row = field.rowIndex ?? 0;
      if (!acc[row]) acc[row] = [];
      acc[row].push(field);
      return acc;
    }, {} as Record<number, TemplateField[]>);
  };

  // NEW: Get layout pattern sequence from base zone
  const getLayoutSequence = (baseZone: LayoutZone): LayoutZone[] => {
    const sequences: Record<string, LayoutZone[]> = {
      'full': ['full'],
      'left-50': ['left-50', 'right-50'],
      'right-50': ['left-50', 'right-50'],
      'left-70': ['left-70', 'right-30'],
      'right-30': ['left-70', 'right-30'],
      'left-30': ['left-30', 'right-70'],
      'right-70': ['left-30', 'right-70'],
      'left-33': ['left-33', 'middle-33', 'right-33'],
      'middle-33': ['left-33', 'middle-33', 'right-33'],
      'right-33': ['left-33', 'middle-33', 'right-33'],
    };
    return sequences[baseZone] || ['full'];
  };

  // NEW: Get next available zone in sequence for a section
  const getNextZoneInSequence = (section: TemplateSection): { zone: LayoutZone; row: number; canAdd: boolean; warning?: string } | null => {
    if (!section.sectionLayoutType) return null;
    
    const sequence = getLayoutSequence(section.sectionLayoutType);
    const fieldsByRow = groupFieldsByRow(section.fields);
    
    // Find the last row
    const maxRow = Math.max(...Object.keys(fieldsByRow).map(Number), -1);
    const lastRow = maxRow >= 0 ? fieldsByRow[maxRow] : [];
    
    // Check if current row has space
    if (lastRow.length < sequence.length) {
      return {
        zone: sequence[lastRow.length],
        row: maxRow >= 0 ? maxRow : 0,
        canAdd: true
      };
    }
    
    // Current row is full, start new row
    return {
      zone: sequence[0],
      row: maxRow + 1,
      canAdd: true
    };
  };

  // NEW: Get icon for layout type
  const getLayoutIcon = (layoutType?: LayoutZone) => {
    if (!layoutType) return null;
    
    const sequence = getLayoutSequence(layoutType);
    if (sequence.length === 1) return '□'; // Full width
    if (sequence.length === 2) {
      if (layoutType.includes('70') || layoutType.includes('30')) {
        return layoutType.includes('70') && layoutType.includes('left') ? '▬▭' : '▭▬'; // 70/30 or 30/70
      }
      return '▭▭'; // 50/50
    }
    if (sequence.length === 3) return '▭▭▭'; // 33/33/33
    return null;
  };

  // Track unsaved changes when sections are modified
  useEffect(() => {
    // Skip tracking on initial load
    if (isInitialLoad) {
      setIsInitialLoad(false);
      return;
    }
    // Mark as dirty whenever sections change after initial load
    if (sections.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [sections]);

  // Fetch templates when load modal opens
  useEffect(() => {
    if (showLoadTemplateModal && availableTemplates.length === 0) {
      fetch('http://localhost:3001/api/templates')
        .then(res => res.json())
        .then(data => setAvailableTemplates(data.templates || []))
        .catch(err => console.error('Failed to load templates:', err));
    }
  }, [showLoadTemplateModal]);

  // Load template into builder
  const loadTemplate = async (templateId: string, templateName: string = '') => {
    try {
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      const result = await response.json();
      
      if (!result.success) throw new Error('Failed to load template');
      
      const templateData = result.template;
      const newSections: TemplateSection[] = [];
      
      // Set the loaded template name
      setLoadedTemplateName(templateName);
      
      // Always add standard header first
      newSections.push({
        id: 'section-header',
        name: 'Standard Header',
        expanded: false,
        fields: [
          { id: 'field-id', key: 'id', label: 'ID', renderType: 'text', schema: { type: 'string', renderAs: 'text', label: 'ID', placeholder: templateData.id || 'Auto-generated' } },
          { id: 'field-quarter', key: 'quarter', label: 'Quarter', renderType: 'text', schema: { type: 'string', renderAs: 'text', label: 'Quarter', placeholder: templateData.quarter || 'e.g., Q1, Jan 15' } },
          { id: 'field-year', key: 'year', label: 'Year', renderType: 'number', schema: { type: 'number', renderAs: 'number', label: 'Year' } },
          { id: 'field-date', key: 'date', label: 'Date', renderType: 'date', schema: { type: 'date', renderAs: 'text', label: 'Date' } },
          { id: 'field-title', key: 'title', label: 'Title', renderType: 'text', schema: { type: 'string', renderAs: 'text', label: 'Title', placeholder: templateData.title || 'Organization - Weekly Executive Update' } }
        ]
      });
      
      // Update header defaults
      setHeaderDefaults({
        id: templateData.id || 'template-new',
        quarter: templateData.quarter || 'Month Day',
        year: templateData.year || new Date().getFullYear(),
        date: templateData.date || new Date().toISOString().split('T')[0],
        title: templateData.title || 'Your Organization Name - Weekly Executive Update'
      });
      
      // Group fields by base key (handle multi-column sections)
      const fieldGroups = new Map<string, string[]>();
      
      Object.keys(templateData).forEach(key => {
        if (key.startsWith('_') || ['id', 'quarter', 'year', 'date', 'title', 'status', 'protectionEnabled'].includes(key)) {
          return;
        }
        
        // Extract base key (remove _0, _1, _2 suffix for multi-column)
        const baseKey = key.replace(/_\d+$/, '');
        
        if (!fieldGroups.has(baseKey)) {
          fieldGroups.set(baseKey, []);
        }
        fieldGroups.get(baseKey)!.push(key);
      });
      
      // Helper: Infer layout type from field count
      const inferLayoutType = (fieldCount: number): LayoutZone => {
        switch (fieldCount) {
          case 1: return 'full';
          case 2: return 'left-50';
          case 3: return 'left-33';
          default: return 'full';
        }
      };
      
      // Helper: Get layout zones for a layout type
      const getLayoutZones = (layoutType: LayoutZone): LayoutZone[] => {
        switch (layoutType) {
          case 'full': return ['full'];
          case 'left-50': return ['left-50', 'right-50'];
          case 'left-33': return ['left-33', 'middle-33', 'right-33'];
          case 'left-70': return ['left-70', 'right-30'];
          case 'left-30': return ['left-30', 'right-70'];
          default: return ['full'];
        }
      };
      
      // Preserve field order from template
      const fieldOrder: string[] = [];
      Object.keys(templateData).forEach(key => {
        if (!key.startsWith('_') && !['id', 'quarter', 'year', 'date', 'title', 'status', 'protectionEnabled'].includes(key)) {
          fieldOrder.push(key);
        }
      });
      
      // Create ordered base keys list (deduplicated)
      const orderedBaseKeys: string[] = [];
      const seenBaseKeys = new Set<string>();
      
      fieldOrder.forEach(key => {
        const baseKey = key.replace(/_\d+$/, '');
        if (!seenBaseKeys.has(baseKey)) {
          orderedBaseKeys.push(baseKey);
          seenBaseKeys.add(baseKey);
        }
      });
      
      // Convert template data sections back to builder format
      orderedBaseKeys.forEach(baseKey => {
        const fieldKeys = fieldGroups.get(baseKey);
        if (!fieldKeys) return;
        
        const layoutType = inferLayoutType(fieldKeys.length);
        const zones = getLayoutZones(layoutType);
        const fields: Field[] = [];
        
        fieldKeys.forEach((key, index) => {
          const itemSchema = templateData[`_${key}_itemSchema`];
          const sectionType = templateData[`_${key}_type`];
          const sectionFields = templateData[`_${key}_fields`]; // Legacy
          const chartConfig = templateData[`_${key}_chartConfig`];
          const alignment = templateData[`_${key}_alignment`] || 'left';
          
          // CRITICAL: Use _type metadata as the renderType (NOT itemSchema.renderAs)
          // itemSchema.renderAs is for editing items, not the field itself
          const renderType = sectionType || 'text';
          
          // Use actual data from template as exampleData (if it exists)
          // Otherwise fall back to ASSET_LIBRARY defaults
          let exampleData = templateData[key];
          if (exampleData === undefined) {
            for (const category of ASSET_LIBRARY) {
              const asset = category.assets.find(a => a.renderType === renderType);
              if (asset) {
                exampleData = asset.exampleData;
                break;
              }
            }
          }
          
          if (renderType || itemSchema) {
            const field: Field = {
              id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              key: key,
              label: formatSectionTitle(key),
              renderType: renderType || 'text',
              schema: {
                type: itemSchema?.type || 'string',
                renderAs: renderType || 'text',
                label: itemSchema?.label || formatSectionTitle(key),
                ...(itemSchema?.itemSchema && { itemSchema: itemSchema.itemSchema }),
                ...(itemSchema?.fields && { fields: itemSchema.fields }), // For object and keyValue types
                ...(sectionFields && !itemSchema && { fields: sectionFields }), // Legacy support
                ...(chartConfig && { chartConfig }),
                ...(itemSchema?.placeholder && { placeholder: itemSchema.placeholder }),
                ...(itemSchema?.suffix && { suffix: itemSchema.suffix }),
                ...(itemSchema?.options && { options: itemSchema.options })
              },
              layoutZone: zones[index] || zones[0],
              rowIndex: 0,
              exampleData: exampleData, // Use actual template data or ASSET_LIBRARY fallback
              alignment: alignment as 'left' | 'center' | 'right'
            };
            
            fields.push(field);
          }
        });
        
        if (fields.length > 0) {
          newSections.push({
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: formatSectionTitle(baseKey),
            expanded: true,
            fields: fields,
            sectionLayoutType: layoutType
          });
        }
      });
      
      setSections(newSections);
      setShowLoadTemplateModal(false);
      setHasUnsavedChanges(false); // Clear unsaved changes after load
      setIsInitialLoad(true); // Treat loaded template as initial state
      showNotification('success', `Template loaded! You can now edit and save as a new template.`);
      
    } catch (error) {
      console.error('Failed to load template:', error);
      showNotification('error', 'Failed to load template');
    }
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .split(/(?=[A-Z])|_|-/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate test data from current template for EditorModalV2
  // Export template as JSON file
  const handleExport = async () => {
    const templateData = await performSave(true); // Get template JSON without saving
    if (!templateData) return;

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${templateData.id || 'new'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('success', 'Template exported successfully!');
  };

  // Test template in EditorModalV2
  const handlePreview = async () => {
    const templateData = await performSave(true); // Get template JSON without saving
    if (templateData) {
      setTestData(templateData);
      setShowTestEditor(true);
    }
  };

  // Drag handlers for assets
  const handleAssetDragStart = (asset: AssetItem) => {
    setDraggedAsset(asset);
  };

  const handleAssetDragEnd = () => {
    setDraggedAsset(null);
    setDragOverSection(null);
  };

  // Drag handlers for existing fields (reordering)
  const handleFieldDragStart = (sectionId: string, fieldId: string) => {
    setDraggedField({ sectionId, fieldId });
  };

  const handleFieldDragEnd = () => {
    setDraggedField(null);
    setDragOverSection(null);
  };

  // Drop handler for section (Classic mode - no zones, or Snap mode sequential placement)
  const handleSectionDrop = (sectionId: string) => {
    if (draggedAsset) {
      const section = sections.find(s => s.id === sectionId);
      if (!section) return;

      // LAYOUT MODE (always enabled)
      if (useSnapLayout) {
        // If section is empty, use first zone from section's layout type
        if (section.fields.length === 0) {
          if (!section.sectionLayoutType) {
            showNotification('error', 'Section has no layout type. Please create section with layout picker.');
            return;
          }
          
          const sequence = getLayoutSequence(section.sectionLayoutType);
          const firstZone = sequence[0];
          
          const newField: TemplateField = {
            id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            key: draggedAsset.id + '_' + Date.now(),
            label: draggedAsset.schema.label || draggedAsset.name,
            renderType: draggedAsset.renderType,
            schema: { ...draggedAsset.schema },
            exampleData: draggedAsset.exampleData,
            layoutZone: firstZone,
            rowIndex: 0
          };

          setSections(prev => prev.map(s => 
            s.id === sectionId
              ? { ...s, fields: [newField] }
              : s
          ));

          setDraggedAsset(null);
          setDragOverSection(null);
          return;
        }

        // Sequential placement for non-empty sections
        const nextPlacement = getNextZoneInSequence(section);
        if (!nextPlacement) {
          showNotification('error', 'Cannot determine next placement zone');
          return;
        }

        if (!nextPlacement.canAdd) {
          showNotification('warning', nextPlacement.warning || 'Cannot add more assets to this row');
          return;
        }

        const newField: TemplateField = {
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          key: draggedAsset.id + '_' + Date.now(),
          label: draggedAsset.schema.label || draggedAsset.name,
          renderType: draggedAsset.renderType,
          schema: { ...draggedAsset.schema },
          exampleData: draggedAsset.exampleData,
          layoutZone: nextPlacement.zone,
          rowIndex: nextPlacement.row
        };

        setSections(prev => prev.map(s => 
          s.id === sectionId
            ? { ...s, fields: [...s.fields, newField] }
            : s
        ));

        setDraggedAsset(null);
        setDragOverSection(null);
        return;
      }

      // CLASSIC MODE - full width
      const newField: TemplateField = {
        id: `field-${Date.now()}`,
        key: draggedAsset.id + '_' + Date.now(),
        label: draggedAsset.schema.label || draggedAsset.name,
        renderType: draggedAsset.renderType,
        schema: { ...draggedAsset.schema },
        exampleData: draggedAsset.exampleData,
        layoutZone: 'full',
        rowIndex: 0
      };

      setSections(prev => prev.map(section => 
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ));

      setDraggedAsset(null);
    } else if (draggedField && draggedField.sectionId !== sectionId) {
      // Move field to different section with new unique ID to prevent duplicates
      const sourceSection = sections.find(s => s.id === draggedField.sectionId);
      const fieldToMove = sourceSection?.fields.find(f => f.id === draggedField.fieldId);
      
      if (fieldToMove) {
        // Create a new field object with a new unique ID
        const movedField = {
          ...fieldToMove,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate truly unique ID
        };
        
        setSections(prev => prev.map(section => {
          if (section.id === draggedField.sectionId) {
            // Remove from source section
            return { ...section, fields: section.fields.filter(f => f.id !== draggedField.fieldId) };
          } else if (section.id === sectionId) {
            // Add to target section with new ID
            return { ...section, fields: [...section.fields, movedField] };
          }
          return section;
        }));
      }
    }
    
    setDragOverSection(null);
  };

  // NEW: Snap layout zone drop handler - ONLY for first asset (sets section layout)
  const handleZoneDrop = (sectionId: string, zone: LayoutZone) => {
    if (!draggedAsset) return;

    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    // This should only be called for empty sections (first asset)
    if (section.fields.length > 0) {
      console.error('handleZoneDrop called on non-empty section - should use handleSectionDrop');
      return;
    }

    // First asset sets the layout type for the entire section
    const sequence = getLayoutSequence(zone);
    const targetZone = sequence[0]; // Always start with first zone in sequence

    // Create new field
    const newField: TemplateField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key: draggedAsset.id + '_' + Date.now(),
      label: draggedAsset.schema.label || draggedAsset.name,
      renderType: draggedAsset.renderType,
      schema: { ...draggedAsset.schema },
      exampleData: draggedAsset.exampleData,
      layoutZone: targetZone,
      rowIndex: 0
    };

    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { 
            ...section, 
            fields: [newField],
            sectionLayoutType: zone // Set the layout type
          }
        : section
    ));

    // Clean up
    setDraggedAsset(null);
    setShowSnapZones(false);
    setHoveredZone(null);
    setTargetDropSection(null);
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    // Only set drag over state if dragging from asset library or moving field to empty section
    if (draggedAsset || (draggedField && draggedField.sectionId !== sectionId)) {
      setDragOverSection(sectionId);
      
      // Auto-expand section when dragging over it in snap mode
      if (useSnapLayout && draggedAsset) {
        setSections(prev => prev.map(section =>
          section.id === sectionId
            ? { ...section, expanded: true }
            : section
        ));
      }
    }
  };

  const handleSectionDragLeave = () => {
    setDragOverSection(null);
  };

  const handleFieldDragOver = (e: React.DragEvent, targetSectionId: string, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Just prevent default to allow drop - don't modify state here!
    // The actual reordering happens in handleFieldDrop
  };

  const handleFieldDrop = (e: React.DragEvent, targetSectionId: string, targetFieldId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedField || draggedField.fieldId === targetFieldId) return;
    
    const sourceSection = sections.find(s => s.id === draggedField.sectionId);
    const draggedFieldData = sourceSection?.fields.find(f => f.id === draggedField.fieldId);
    if (!draggedFieldData) return;
    
    setSections(prev => prev.map(section => {
      if (section.id === draggedField.sectionId && section.id === targetSectionId) {
        // Reordering within same section
        const fields = [...section.fields];
        const draggedIndex = fields.findIndex(f => f.id === draggedField.fieldId);
        const targetIndex = fields.findIndex(f => f.id === targetFieldId);
        
        if (draggedIndex === -1 || targetIndex === -1) return section;
        
        fields.splice(draggedIndex, 1);
        fields.splice(targetIndex, 0, draggedFieldData);
        
        return { ...section, fields };
      } else if (section.id === draggedField.sectionId) {
        // Remove from source section
        return { ...section, fields: section.fields.filter(f => f.id !== draggedField.fieldId) };
      } else if (section.id === targetSectionId) {
        // Moving to different section - create new field with unique ID
        const movedField = {
          ...draggedFieldData,
          id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };
        const fields = [...section.fields];
        const targetIndex = fields.findIndex(f => f.id === targetFieldId);
        fields.splice(targetIndex, 0, movedField);
        return { ...section, fields };
      }
      return section;
    }));
    
    setDraggedField(null);
  };

  // Section drag and drop for reordering
  const handleSectionDragStart = (sectionId: string) => {
    if (sectionId === 'section-header') return; // Don't allow dragging header
    setDraggedSection(sectionId);
  };

  const handleSectionDragEnd = () => {
    setDraggedSection(null);
  };

  const handleSectionDragOverSection = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    // Don't reorder sections if we're dragging a field
    if (draggedField) {
      e.stopPropagation();
      return;
    }
    
    if (!draggedSection || draggedSection === targetSectionId) return;
    if (targetSectionId === 'section-header') return; // Don't allow dropping on header
    
    const draggedIndex = sections.findIndex(s => s.id === draggedSection);
    const targetIndex = sections.findIndex(s => s.id === targetSectionId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Reorder sections
    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);
    setSections(newSections);
  };

  // Section management
  const addSection = () => {
    setShowLayoutPicker(true);
  };

  const createSectionWithLayout = (layoutType: LayoutZone) => {
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length}`,
      expanded: true,
      fields: [],
      sectionLayoutType: layoutType
    };
    setSections([...sections, newSection]);
    setShowLayoutPicker(false);
  };

  const toggleSection = (sectionId: string) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, expanded: !section.expanded }
        : section
    ));
  };

  const removeSection = (sectionId: string) => {
    if (sectionId === 'section-header') {
      showNotification('error', 'Cannot remove the standard header section');
      return;
    }
    if (window.confirm('Remove this section and all its fields?')) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  // Add layout asset as a section (generic for all layout assets)
  const addLayoutAsset = (asset: Asset) => {
    const layoutSection: TemplateSection = {
      id: `layout-${Date.now()}`,
      name: `${asset.name} ${sections.filter(s => s.fields[0]?.renderType === asset.renderType).length + 1}`,
      expanded: true,
      sectionLayoutType: 'full', // Layout assets always full width
      fields: [{
        id: `field-${Date.now()}`,
        key: `${asset.id}_${Date.now()}`,
        label: asset.schema.label || asset.name,
        renderType: asset.renderType,
        schema: { ...asset.schema },
        exampleData: asset.exampleData,
        layoutZone: 'full'
      }]
    };
    setSections([...sections, layoutSection]);
    showNotification('success', `${asset.name} added`);
  };

  // Legacy function - now calls generic
  const addHorizontalRule = () => {
    const hrAsset = ASSET_CATEGORIES.find(c => c.id === 'layout')?.assets.find(a => a.id === 'hr');
    if (hrAsset) addLayoutAsset(hrAsset);
  };

  // Field management
  const removeField = (sectionId: string, fieldId: string) => {
    if (sectionId === 'section-header') {
      showNotification('error', 'Cannot remove required header fields');
      return;
    }
    
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const remainingFields = section.fields.filter(f => f.id !== fieldId);
        return { ...section, fields: remainingFields };
      }
      return section;
    }));
    
    if (selectedField?.fieldId === fieldId) {
      setSelectedField(null);
    }
  };

  const removeAllSections = () => {
    setShowRemoveAllModal(true);
  };

  // Confirm and execute remove all
  const confirmRemoveAll = () => {
    setSections(prev => prev.filter(section => section.id === 'section-header'));
    setSelectedSection('section-header');
    setSelectedField(null);
    setShowRemoveAllModal(false);
    showNotification('success', 'All sections removed (header retained)');
  };

  const updateFieldProperty = (sectionId: string, fieldId: string, property: string, value: any) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId
                ? property === 'key' || property === 'label' || property === 'exampleData' || property === 'alignment'
                  ? { ...field, [property]: value }
                  : { ...field, schema: { ...field.schema, [property]: value } }
                : field
            )
          }
        : section
    ));
  };

  // Validate template structure
  const validateTemplate = () => {
    setIsValidating(true);
    const results: Array<{check: string; passed: boolean; message: string}> = [];

    // Check 1: Has standard header section
    const headerSection = sections.find(s => s.id === 'section-header');
    const hasHeader = !!headerSection;
    results.push({
      check: 'Standard Header',
      passed: hasHeader,
      message: hasHeader ? 'Template includes required standard header' : 'Missing standard header section'
    });

    // Check 2: Header has required fields
    const requiredHeaderFields = ['id', 'quarter', 'year', 'date', 'title'];
    const headerFields = headerSection?.fields.map(f => f.key) || [];
    const hasAllHeaderFields = requiredHeaderFields.every(field => headerFields.includes(field));
    results.push({
      check: 'Required Header Fields',
      passed: hasAllHeaderFields,
      message: hasAllHeaderFields 
        ? 'All required header fields present (id, quarter, year, date, title)' 
        : `Missing header fields: ${requiredHeaderFields.filter(f => !headerFields.includes(f)).join(', ')}`
    });

    // Check 3: Has at least one content section
    const contentSections = sections.filter(s => s.id !== 'section-header');
    const hasContentSections = contentSections.length > 0;
    results.push({
      check: 'Content Sections',
      passed: hasContentSections,
      message: hasContentSections 
        ? `Template has ${contentSections.length} content section(s)` 
        : 'Template needs at least one content section'
    });

    // Check 4: All sections have fields
    const emptySections = sections.filter(s => s.fields.length === 0);
    const noEmptySections = emptySections.length === 0;
    results.push({
      check: 'Section Fields',
      passed: noEmptySections,
      message: noEmptySections 
        ? 'All sections contain fields' 
        : `Empty sections: ${emptySections.map(s => s.name).join(', ')}`
    });

    // Check 5: All field keys are unique
    const allKeys = sections.flatMap(s => s.fields.map(f => f.key));
    const uniqueKeys = new Set(allKeys);
    const allKeysUnique = allKeys.length === uniqueKeys.size;
    results.push({
      check: 'Unique Field Keys',
      passed: allKeysUnique,
      message: allKeysUnique 
        ? 'All field keys are unique' 
        : 'Duplicate field keys detected - each field must have a unique key'
    });

    // Check 6: All fields have valid schemas
    let allSchemasValid = true;
    let invalidSchemas: string[] = [];
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (!field.schema || !field.schema.type) {
          allSchemasValid = false;
          invalidSchemas.push(`${section.name}.${field.key}`);
        }
      });
    });
    results.push({
      check: 'Field Schemas',
      passed: allSchemasValid,
      message: allSchemasValid 
        ? 'All fields have valid schemas' 
        : `Invalid schemas in: ${invalidSchemas.join(', ')}`
    });

    setValidationResults(results);
    const allPassed = results.every(r => r.passed);
    setValidationPassed(allPassed);

    // Auto-proceed if validation passed - give user time to see success
    if (allPassed) {
      setTimeout(() => {
        setIsValidating(false);
      }, 500); // Show "Validating..." briefly
      
      setTimeout(() => {
        setShowValidationModal(false);
        performSave();
      }, 3000); // Keep success message visible for 3 seconds
    } else {
      setIsValidating(false);
    }
  };

  // Open save modal
  const handleSaveClick = () => {
    if (sections.length === 0 || sections.every(s => s.fields.length === 0)) {
      showNotification('error', 'Please add at least one field to your template');
      return;
    }
    setShowSaveModal(true);
  };

  // Handle back button with unsaved changes confirmation
  const handleBack = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedChangesModal(true);
    } else {
      onBack();
    }
  };

  // Start save process with validation
  const saveTemplate = () => {
    if (!saveTemplateName.trim()) {
      showNotification('error', 'Please enter a template name');
      return;
    }
    
    // Close save modal and show validation modal
    setShowSaveModal(false);
    setShowValidationModal(true);
    validateTemplate();
  };

  // Actually save the template (called after validation passes)
  const performSave = async (dryRun: boolean = false) => {
    if (!dryRun) {
      setIsSaving(true);
    }

    try {
      // Convert sections to flat data structure (like summary-template.json)
      const templateData: Record<string, any> = {};
      
      sections.forEach(section => {
        const sectionKey = section.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
        
        // Special handling for standard_header - expand to individual fields
        if (section.id === 'section-header' || sectionKey === 'standard_header') {
          // Standard header fields should be top-level in the JSON
          templateData.id = headerDefaults.id;
          templateData.quarter = headerDefaults.quarter;
          templateData.year = headerDefaults.year;
          templateData.date = headerDefaults.date;
          templateData.title = headerDefaults.title;
          
          // Enable/complete flags for the section
          templateData._enabled_standard_header = true;
          templateData._completed_standard_header = false;
        } else {
          // For all other sections, process fields normally
          section.fields.forEach((field, fieldIndex) => {
            const fieldType = field.renderType; // Use field.renderType (object, keyValue) not schema.renderAs (objectForm)
            
            // If multiple fields in section, use indexed keys (section2_0, section2_1)
            // If single field, use section name directly (section2)
            const fieldKey = section.fields.length > 1 
              ? `${sectionKey}_${fieldIndex}` 
              : sectionKey;
            
            // Save minimal schema metadata - just type and custom fields
            templateData[`_${fieldKey}_type`] = fieldType;
            
            // Save full itemSchema for array types (nestedCards, metricCards, charts, lists)
            if (field.schema.itemSchema) {
              templateData[`_${fieldKey}_itemSchema`] = field.schema.itemSchema;
            }
            // Legacy support: also save just fields if they exist
            else if (field.schema.fields) {
              templateData[`_${fieldKey}_fields`] = field.schema.fields;
            }
            
            // Save chartConfig for chart types
            if (field.schema.chartConfig && (fieldType === 'pieChart' || fieldType === 'barChart' || fieldType === 'lineChart' || fieldType === 'radialChart')) {
              templateData[`_${fieldKey}_chartConfig`] = field.schema.chartConfig;
            }
            
            // Save alignment if not default (left)
            if (field.alignment && field.alignment !== 'left') {
              templateData[`_${fieldKey}_alignment`] = field.alignment;
            }
            
            if (fieldType === 'metricCards') {
              // Use exampleData if provided, otherwise create default
              if (field.exampleData && field.exampleData.length > 0) {
                templateData[fieldKey] = field.exampleData;
              } else {
                // Create an array with one example object
                const exampleItem: Record<string, any> = {};
                if (field.schema.itemSchema?.fields) {
                  Object.entries(field.schema.itemSchema.fields).forEach(([key, itemField]: [string, any]) => {
                    if (itemField.type === 'number') {
                      exampleItem[key] = 0;
                    } else {
                      exampleItem[key] = `Example ${itemField.label}`;
                    }
                  });
                }
                templateData[fieldKey] = [exampleItem];
              }
            } else if (fieldType === 'list' || fieldType === 'listNoTitle') {
              // Use exampleData if provided, otherwise create default
              if (field.exampleData && field.exampleData.length > 0) {
                templateData[fieldKey] = field.exampleData;
              } else {
                templateData[fieldKey] = [`Example ${field.schema.label || section.name} item`];
              }
            } else if (fieldType === 'pieChart' || fieldType === 'barChart' || fieldType === 'lineChart' || fieldType === 'radialChart') {
              // Chart types need array data with name/value structure
              if (field.exampleData && field.exampleData.length > 0) {
                templateData[fieldKey] = field.exampleData;
              } else {
                // Generate sample chart data based on itemSchema fields
                const itemFields = field.schema.itemSchema?.fields;
                if (itemFields && itemFields.name && itemFields.value) {
                  templateData[fieldKey] = [
                    { name: 'A', value: 10 },
                    { name: 'B', value: 20 },
                    { name: 'C', value: 15 },
                    { name: 'D', value: 30 }
                  ];
                } else {
                  // Fallback if no fields defined
                  templateData[fieldKey] = [
                    { label: 'Item 1', value: 10 },
                    { label: 'Item 2', value: 20 }
                  ];
                }
              }
            } else if (fieldType === 'number') {
              templateData[fieldKey] = field.exampleData !== undefined ? field.exampleData : 0;
            } else if (fieldType === 'textarea') {
              templateData[fieldKey] = field.exampleData || `Example: ${field.schema.placeholder || field.schema.label || section.name}`;
            } else {
              // Default: text field and others
              templateData[fieldKey] = field.exampleData || field.schema.placeholder || '';
            }
          });
          
          // Enable the section by default
          templateData[`_enabled_${sectionKey}`] = true;
          templateData[`_completed_${sectionKey}`] = false;
        }
      });
      
      // Add standard metadata
      templateData.status = 'draft';
      templateData.protectionEnabled = false;

      // If dry run, just return the data without saving
      if (dryRun) {
        return templateData;
      }

      const response = await fetch('http://localhost:3001/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveTemplateName,
          description: saveTemplateDescription,
          template: templateData // Changed from 'sections' to 'template'
        })
      });

      const result = await response.json();

      if (result.success) {
        showNotification('success', `Template "${saveTemplateName}" saved successfully!`);
        setLoadedTemplateName(''); // Clear base template name
        setHasUnsavedChanges(false); // Clear unsaved changes flag
        setIsInitialLoad(true); // Treat saved template as initial state
        setSaveTemplateName('');
        setSaveTemplateDescription('');
        setValidationResults([]);
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showNotification('error', 'Failed to save template: ' + (error as Error).message);
    } finally {
      if (!dryRun) {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-3">
                  <Grid className="w-7 h-7 text-fis-raspberry" />
                  Template Builder
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {loadedTemplateName ? `Base Template: ${loadedTemplateName}` : 'Drag and drop assets to build your template'}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowLoadTemplateModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <Upload className="w-4 h-4" />
                Load Template
              </button>
              
              <button 
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button 
                onClick={handlePreview}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <PlayCircle className="w-4 h-4" />
                Test
              </button>
              <button 
                onClick={removeAllSections}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-red-300 dark:border-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-roobert-medium transition-colors">
                <Trash2 className="w-4 h-4" />
                Remove All
              </button>
              <button 
                onClick={handleSaveClick}
                className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Sidebar - Asset Library */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-y-auto">
          <div className="p-4">
            <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-fis-eggplant" />
              Asset Library
            </h3>

            {/* Category Tree */}
            <div className="space-y-1">
              {ASSET_LIBRARY.map(category => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.has(category.id);
                return (
                  <div key={category.id} className="space-y-1">
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-roobert-semibold transition-all ${
                        isExpanded
                          ? 'bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white shadow-md'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <Icon className="w-4 h-4" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isExpanded 
                          ? 'bg-white/20 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {category.assets.length}
                      </span>
                    </button>

                    {/* Category Assets (Expandable) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden pl-6"
                        >
                          <div className="space-y-2 py-2">
                            {category.assets.map(asset => {
                              const isLayoutAsset = category.id === 'layout';
                              const AssetIcon = asset.icon;
                              
                              if (isLayoutAsset) {
                                // Layout assets get an "Add" button + preview
                                return (
                                  <div
                                    key={asset.id}
                                    className="relative group p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {AssetIcon && (
                                        <div className={`p-2 rounded-lg ${asset.iconColor || 'text-gray-500'} bg-gray-100 dark:bg-gray-700`}>
                                          <AssetIcon className="w-5 h-5" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                                          {asset.name}
                                        </div>
                                        <div className="text-xs text-fis-eggplant dark:text-fis-raspberry font-mono">
                                          {asset.renderType}
                                        </div>
                                      </div>
                                      {/* Preview Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewAsset(asset);
                                        }}
                                        className="p-2 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry transition-all opacity-0 group-hover:opacity-100"
                                        title="Preview Asset"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      {/* Add Button */}
                                      <button
                                        onClick={() => addLayoutAsset(asset)}
                                        className="px-3 py-1 rounded bg-fis-eggplant hover:bg-fis-eggplant/90 text-white text-xs font-roobert-medium flex items-center gap-1 transition-colors"
                                      >
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </button>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {asset.description}
                                    </div>
                                  </div>
                                );
                              }
                              
                              // Regular draggable assets
                              return (
                                <div
                                  key={asset.id}
                                  className="relative group"
                                >
                                  <div
                                    draggable
                                    onDragStart={() => handleAssetDragStart(asset)}
                                    onDragEnd={handleAssetDragEnd}
                                    className="p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:shadow-md transition-all"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      {AssetIcon && (
                                        <div className={`p-2 rounded-lg ${asset.iconColor || 'text-gray-500'} bg-gray-100 dark:bg-gray-700`}>
                                          <AssetIcon className="w-5 h-5" />
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                                            {asset.name}
                                          </div>
                                          {asset.supportsMultiColumn && (
                                            <div className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-roobert-bold" title="Supports Multi-Column">
                                              MULTI
                                            </div>
                                          )}
                                        </div>
                                        <div className="text-xs text-fis-eggplant dark:text-fis-raspberry font-mono">
                                          {asset.renderType}
                                        </div>
                                      </div>
                                      {/* Preview Button */}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewAsset(asset);
                                        }}
                                        className="p-2 rounded-lg bg-fis-eggplant/10 hover:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry transition-all opacity-0 group-hover:opacity-100"
                                        title="Preview Asset"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                      {asset.description}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Add Section Button */}
            <button
              onClick={addSection}
              className="w-full mb-4 p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-white/50 dark:hover:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry font-roobert-medium transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Section
            </button>

            {/* Sections */}
            <div className="space-y-4">
              {sections.map(section => {
                const isHeaderSection = section.id === 'section-header';
                return (
                <div
                  key={section.id}
                  draggable={!isHeaderSection}
                  onDragStart={() => handleSectionDragStart(section.id)}
                  onDragEnd={handleSectionDragEnd}
                  onDragOver={(e) => handleSectionDragOverSection(e, section.id)}
                  className={`rounded-xl border-2 shadow-sm overflow-hidden ${
                    isHeaderSection 
                      ? 'bg-fis-eggplant/5 dark:bg-fis-eggplant/10 border-fis-eggplant dark:border-fis-raspberry' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-move'
                  } ${draggedSection === section.id ? 'opacity-50' : ''}`}
                >
                  {/* Section Header */}
                  <div 
                    className={`flex items-center justify-between p-4 border-b cursor-pointer ${
                      isHeaderSection 
                        ? 'bg-fis-eggplant/10 dark:bg-fis-eggplant/20 border-fis-eggplant dark:border-fis-raspberry' 
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    } ${selectedSection === section.id ? 'ring-2 ring-fis-raspberry' : ''}`}
                    onClick={() => {
                      setSelectedSection(section.id);
                      setSelectedField(null); // Deselect any field
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {!isHeaderSection && (
                        <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSection(section.id);
                        }}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      >
                        {section.expanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={section.name}
                        disabled={isHeaderSection}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => setSections(prev => prev.map(s =>
                          s.id === section.id ? { ...s, name: e.target.value } : s
                        ))}
                        placeholder="e.g., Metrics, Summary, Charts"
                        title="Use descriptive names like 'Metrics', 'KPIs', 'Summary' instead of generic 'Section 1'"
                        className={`font-roobert-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-fis-eggplant rounded px-2 py-1 ${
                          isHeaderSection ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                      />
                      {isHeaderSection && (
                        <span className="px-2 py-0.5 rounded-full bg-fis-eggplant text-white text-xs font-roobert-semibold">
                          REQUIRED
                        </span>
                      )}
                      {!isHeaderSection && /^Section\s+\d+$/i.test(section.name) && (
                        <span 
                          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-roobert-semibold"
                          title="Please provide a descriptive section name like 'Metrics', 'Summary', 'KPIs', or 'Charts'"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Rename Section
                        </span>
                      )}
                      {/* Layout Type Icon */}
                      {section.sectionLayoutType && (
                        <span 
                          className="px-2 py-0.5 rounded bg-fis-eggplant/10 dark:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry text-xs font-mono"
                          title={`Layout: ${section.sectionLayoutType}`}
                        >
                          {getLayoutIcon(section.sectionLayoutType)}
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({section.fields.length} fields)
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(section.id);
                      }}
                      disabled={isHeaderSection}
                      className={`p-1.5 rounded transition-colors ${
                        isHeaderSection 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400'
                      }`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Section Content */}
                  {section.expanded && (
                    <div
                      onDrop={() => handleSectionDrop(section.id)}
                      onDragOver={(e) => handleSectionDragOver(e, section.id)}
                      onDragLeave={handleSectionDragLeave}
                      className={`p-4 transition-colors relative min-h-[120px] ${
                        dragOverSection === section.id
                          ? 'bg-fis-eggplant/10 dark:bg-fis-raspberry/10'
                          : ''
                      }`}
                    >
                      {section.fields.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-500 py-8 text-sm">
                          Drag assets here to add fields
                        </div>
                      ) : useSnapLayout ? (
                        /* NEW: Snap Layout - Render fields in rows */
                        <div className="space-y-4">
                          {Object.entries(groupFieldsByRow(section.fields))
                            .sort(([a], [b]) => Number(a) - Number(b))
                            .map(([rowIndex, rowFields]) => (
                            <div key={rowIndex} className="flex gap-4">
                              {rowFields.map(field => (
                                <div
                                  key={field.id}
                                  className={`${getWidthClass(field.layoutZone)}`}
                                >
                                  <div
                                    draggable
                                    onDragStart={() => handleFieldDragStart(section.id, field.id)}
                                    onDragEnd={handleFieldDragEnd}
                                    onClick={() => setSelectedField({ sectionId: section.id, fieldId: field.id })}
                                    className={`p-3 rounded-lg border-2 cursor-move hover:shadow-md transition-all ${
                                      selectedField?.fieldId === field.id
                                        ? 'border-fis-eggplant dark:border-fis-raspberry bg-fis-eggplant/5 dark:bg-fis-raspberry/5'
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                      <div className="flex-1 min-w-0">
                                        <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white truncate">
                                          {field.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 font-mono truncate">
                                          {field.key} • {field.renderType}
                                        </div>
                                        {/* Zone badge */}
                                        <div className="text-[10px] text-fis-eggplant dark:text-fis-raspberry font-roobert-medium mt-1">
                                          {getZoneLabel(field.layoutZone || 'full')}
                                        </div>
                                      </div>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          removeField(section.id, field.id);
                                        }}
                                        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex-shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* Classic Layout - Single column */
                        <div className="space-y-2">
                          {section.fields.map(field => (
                            <div
                              key={field.id}
                              draggable
                              onDragStart={() => handleFieldDragStart(section.id, field.id)}
                              onDragEnd={handleFieldDragEnd}
                              onDragOver={(e) => handleFieldDragOver(e, section.id, field.id)}
                              onDrop={(e) => handleFieldDrop(e, section.id, field.id)}
                              onClick={() => setSelectedField({ sectionId: section.id, fieldId: field.id })}
                              className={`p-3 rounded-lg border-2 cursor-move hover:shadow-md transition-all ${
                                selectedField?.fieldId === field.id
                                  ? 'border-fis-eggplant dark:border-fis-raspberry bg-fis-eggplant/5 dark:bg-fis-raspberry/5'
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                                <div className="flex-1">
                                  <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                                    {field.label}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-500 font-mono">
                                    {field.key} • {field.renderType}
                                  </div>
                                </div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeField(section.id, field.id);
                                  }}
                                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Property Inspector */}
        <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4 text-fis-eggplant" />
              Properties
            </h3>

            {selectedSection === 'section-header' && !selectedField ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20 border border-fis-eggplant/30">
                  <p className="text-xs font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry mb-2">
                    Standard Header Defaults
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    These values will be used as defaults when creating summaries from this template.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Default ID
                  </label>
                  <input
                    type="text"
                    value={headerDefaults.id}
                    onChange={(e) => setHeaderDefaults(prev => ({ ...prev, id: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                    placeholder="template-new"
                  />
                </div>

                <div>
                  <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Default Quarter
                  </label>
                  <input
                    type="text"
                    value={headerDefaults.quarter}
                    onChange={(e) => setHeaderDefaults(prev => ({ ...prev, quarter: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Month Day"
                  />
                </div>

                <div>
                  <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Default Year
                  </label>
                  <input
                    type="number"
                    value={headerDefaults.year}
                    onChange={(e) => setHeaderDefaults(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Default Date
                  </label>
                  <input
                    type="date"
                    value={headerDefaults.date}
                    onChange={(e) => setHeaderDefaults(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                    Default Title
                  </label>
                  <input
                    type="text"
                    value={headerDefaults.title}
                    onChange={(e) => setHeaderDefaults(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Your Organization Name - Weekly Executive Update"
                  />
                </div>
              </div>
            ) : selectedField ? (
              <div className="space-y-4">
                {(() => {
                  const section = sections.find(s => s.id === selectedField.sectionId);
                  const field = section?.fields.find(f => f.id === selectedField.fieldId);
                  if (!field) return null;

                  return (
                    <>
                      <div>
                        <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Field Key
                        </label>
                        <input
                          type="text"
                          value={field.key}
                          onChange={(e) => updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'key', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Label
                        </label>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'label', e.target.value)}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-1 block">
                          Render Type
                        </label>
                        <input
                          type="text"
                          value={field.renderType}
                          disabled
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-mono"
                        />
                      </div>

                      {/* Alignment Selector */}
                      <div>
                        <label className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                          Text Alignment
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'alignment', 'left')}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                              (field.alignment || 'left') === 'left'
                                ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant dark:hover:border-fis-eggplant'
                            }`}
                            title="Align Left"
                          >
                            <AlignLeft className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'alignment', 'center')}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                              field.alignment === 'center'
                                ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant dark:hover:border-fis-eggplant'
                            }`}
                            title="Align Center"
                          >
                            <AlignCenter className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'alignment', 'right')}
                            className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-all ${
                              field.alignment === 'right'
                                ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant dark:hover:border-fis-eggplant'
                            }`}
                            title="Align Right"
                          >
                            <AlignRight className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>

                      {/* Example Data for Text Input */}
                      {field.renderType === 'text' && field.schema?.type !== 'date' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Text
                          </label>
                          <input
                            type="text"
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter example text..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This example will guide users during content creation
                          </p>
                        </div>
                      )}

                      {/* Example Data for Text Area */}
                      {field.renderType === 'textarea' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Text
                          </label>
                          <textarea
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            rows={4}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                            placeholder="Enter example text..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This example will guide users during content creation
                          </p>
                        </div>
                      )}

                      {/* Example Data for Number */}
                      {field.renderType === 'number' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Number
                          </label>
                          <input
                            type="number"
                            value={field.exampleData || 0}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', parseFloat(e.target.value) || 0);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            placeholder="Enter example number..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This example will guide users during content creation
                          </p>
                        </div>
                      )}

                      {/* Example Data for Date */}
                      {field.renderType === 'text' && field.schema?.type === 'date' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Date
                          </label>
                          <input
                            type="date"
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            This example will guide users during content creation
                          </p>
                        </div>
                      )}

                      {/* Example Data for Lists/Arrays */}
                      {(field.renderType === 'list' || field.renderType === 'listNoTitle') && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300">
                              Example Items
                            </label>
                            <button
                              onClick={() => {
                                const newExamples = [...(field.exampleData || []), 'New item'];
                                updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                              }}
                              className="text-xs px-2 py-1 rounded bg-fis-eggplant/10 text-fis-eggplant hover:bg-fis-eggplant/20 font-roobert-medium"
                            >
                              + Add
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(field.exampleData || []).map((item: string, idx: number) => (
                              <div key={idx} className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={item}
                                  onChange={(e) => {
                                    const newExamples = [...(field.exampleData || [])];
                                    newExamples[idx] = e.target.value;
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder={`Item ${idx + 1}`}
                                />
                                <button
                                  onClick={() => {
                                    const newExamples = (field.exampleData || []).filter((_: any, i: number) => i !== idx);
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                  }}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {(!field.exampleData || field.exampleData.length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No example items. Click "+ Add" to add some.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Example Data for Key-Value Lists */}
                      {field.renderType === 'keyValueList' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300">
                              Example Key-Value Pairs
                            </label>
                            <button
                              onClick={() => {
                                const currentData = field.exampleData || {};
                                const newKey = `New Key ${Object.keys(currentData).length + 1}`;
                                updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', {
                                  ...currentData,
                                  [newKey]: 'New value'
                                });
                              }}
                              className="text-xs px-2 py-1 rounded bg-fis-eggplant/10 text-fis-eggplant hover:bg-fis-eggplant/20 font-roobert-medium"
                            >
                              + Add Pair
                            </button>
                          </div>
                          <div className="space-y-2">
                            {Object.entries(field.exampleData || {}).map(([key, value], idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <input
                                  type="text"
                                  value={key}
                                  onChange={(e) => {
                                    const currentData = { ...(field.exampleData || {}) };
                                    const oldValue = currentData[key];
                                    delete currentData[key];
                                    currentData[e.target.value] = oldValue;
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', currentData);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Label"
                                />
                                <input
                                  type="text"
                                  value={String(value)}
                                  onChange={(e) => {
                                    const currentData = { ...(field.exampleData || {}) };
                                    currentData[key] = e.target.value;
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', currentData);
                                  }}
                                  className="flex-1 px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Value"
                                />
                                <button
                                  onClick={() => {
                                    const currentData = { ...(field.exampleData || {}) };
                                    delete currentData[key];
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', currentData);
                                  }}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {(!field.exampleData || Object.keys(field.exampleData).length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No key-value pairs. Click "+ Add Pair" to add some.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Example Data for Markdown/Rich Text */}
                      {field.renderType === 'richText' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Markdown
                          </label>
                          <textarea
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            rows={6}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none"
                            placeholder="## Heading&#10;&#10;Example **markdown** content..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Supports markdown syntax for rich formatting
                          </p>
                        </div>
                      )}

                      {/* Example Data for Expression */}
                      {field.renderType === 'expression' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Expression
                          </label>
                          <input
                            type="text"
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                            placeholder="{{ variable }} or {{ expression }}"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Use {'{{'} {'}}'}  syntax for dynamic expressions
                          </p>
                        </div>
                      )}

                      {/* Example Data for Code Block */}
                      {field.renderType === 'codeBlock' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Code
                          </label>
                          <textarea
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            rows={6}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono resize-none"
                            placeholder="const example = 'code';"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Code snippet example with syntax highlighting
                          </p>
                        </div>
                      )}

                      {/* Example Data for Quote */}
                      {field.renderType === 'quote' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 block">
                            Example Quote
                          </label>
                          <textarea
                            value={field.exampleData || ''}
                            onChange={(e) => {
                              updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', e.target.value);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                            placeholder="Enter an inspiring quote..."
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Blockquote text with glassmorphism styling
                          </p>
                        </div>
                      )}

                      {/* Example Data for Object */}
                      {field.renderType === 'object' && field.schema?.fields && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Example Object Data
                          </label>
                          <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            {Object.entries(field.schema.fields).map(([fieldKey, fieldDef]: [string, any]) => (
                              <div key={fieldKey}>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                  {fieldDef.label || fieldKey}
                                </label>
                                <input
                                  type={fieldDef.type === 'number' ? 'number' : 'text'}
                                  value={(field.exampleData && field.exampleData[fieldKey]) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}) };
                                    newExampleData[fieldKey] = fieldDef.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder={`Enter ${fieldDef.label || fieldKey}`}
                                />
                              </div>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Example values for object fields
                          </p>
                        </div>
                      )}

                      {/* Example Data for Key-Value Pair */}
                      {field.renderType === 'keyValue' && field.schema?.fields?.key && field.schema?.fields?.value && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Example Key-Value Pair
                          </label>
                          <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                Key
                              </label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.key) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), key: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter key..."
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                Value
                              </label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.value) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), value: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Enter value..."
                              />
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Example key-value pair data
                          </p>
                        </div>
                      )}

                      {/* Example Data for Nested Cards */}
                      {field.renderType === 'nestedCards' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300">
                              Example Cards
                            </label>
                            <button
                              onClick={() => {
                                const emptyCard: any = {};
                                if (field.schema?.itemSchema?.fields) {
                                  Object.keys(field.schema.itemSchema.fields).forEach(key => {
                                    emptyCard[key] = '';
                                  });
                                }
                                const newExamples = [...(field.exampleData || []), emptyCard];
                                updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                              }}
                              className="text-xs px-2 py-1 rounded bg-fis-eggplant/10 text-fis-eggplant hover:bg-fis-eggplant/20 font-roobert-medium"
                            >
                              + Add Card
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(field.exampleData || []).map((card: any, cardIdx: number) => {
                              // Get first two field values for preview
                              const fieldEntries = field.schema?.itemSchema?.fields ? Object.entries(field.schema.itemSchema.fields) : [];
                              const firstField = fieldEntries[0] as [string, any] | undefined;
                              const secondField = fieldEntries[1] as [string, any] | undefined;
                              const firstValue = firstField ? card[firstField[0]] : '';
                              const secondValue = secondField ? card[secondField[0]] : '';
                              const previewText = [firstValue, secondValue].filter(Boolean).join(' - ') || 'Empty Card';

                              return (
                                <div key={cardIdx} className="rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                  {/* Card Header - Always Visible */}
                                  <div className="flex items-center justify-between p-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">
                                          Card {cardIdx + 1}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {previewText}
                                        </span>
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newExamples = (field.exampleData || []).filter((_: any, i: number) => i !== cardIdx);
                                        updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                      }}
                                      className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  
                                  {/* Card Fields - Editable */}
                                  <div className="px-3 pb-3 space-y-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                                    {field.schema?.itemSchema?.fields && Object.entries(field.schema.itemSchema.fields).map(([fieldKey, fieldDef]: [string, any]) => (
                                      <div key={fieldKey}>
                                        <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                          {fieldDef.label}
                                        </label>
                                        <input
                                          type="text"
                                          value={card[fieldKey] || ''}
                                          onChange={(e) => {
                                            const newExamples = [...(field.exampleData || [])];
                                            newExamples[cardIdx] = {
                                              ...newExamples[cardIdx],
                                              [fieldKey]: e.target.value
                                            };
                                            updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                          }}
                                          className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          placeholder={fieldDef.placeholder || `Enter ${fieldDef.label.toLowerCase()}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                            {(!field.exampleData || field.exampleData.length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No example cards. Click "+ Add Card" to add some.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Example Data for Charts */}
                      {(field.renderType === 'pieChart' || field.renderType === 'barChart' || field.renderType === 'lineChart' || field.renderType === 'radialChart') && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300">
                              Chart Data Points
                            </label>
                            <button
                              onClick={() => {
                                const newDataPoint = { name: 'New', value: 0 };
                                const newExamples = [...(field.exampleData || []), newDataPoint];
                                updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                              }}
                              className="text-xs px-2 py-1 rounded bg-fis-eggplant/10 text-fis-eggplant hover:bg-fis-eggplant/20 font-roobert-medium"
                            >
                              + Add Point
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(field.exampleData || []).map((dataPoint: any, idx: number) => (
                              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="flex-1 grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                      Label
                                    </label>
                                    <input
                                      type="text"
                                      value={dataPoint.name || ''}
                                      onChange={(e) => {
                                        const newExamples = [...(field.exampleData || [])];
                                        newExamples[idx] = { ...newExamples[idx], name: e.target.value };
                                        updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                      }}
                                      className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      placeholder="Label"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">
                                      Value
                                    </label>
                                    <input
                                      type="number"
                                      value={dataPoint.value || 0}
                                      onChange={(e) => {
                                        const newExamples = [...(field.exampleData || [])];
                                        newExamples[idx] = { ...newExamples[idx], value: parseFloat(e.target.value) || 0 };
                                        updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                      }}
                                      className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                      placeholder="0"
                                    />
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    const newExamples = (field.exampleData || []).filter((_: any, i: number) => i !== idx);
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                  }}
                                  className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 self-end mb-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {(!field.exampleData || field.exampleData.length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No data points. Click "+ Add Point" to add some.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Example Data for Image */}
                      {field.renderType === 'image' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Example Image Settings
                          </label>
                          <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Image URL</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.src) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), src: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                                placeholder="https://example.com/image.jpg"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Alt Text</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.alt) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), alt: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Image description"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Caption</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.caption) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), caption: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Optional caption"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Width (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.width) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), width: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Height (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.height) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), height: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={(field.exampleData && field.exampleData.autoScale) !== false}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), autoScale: e.target.checked };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="rounded border-gray-300 dark:border-gray-600"
                              />
                              <label className="text-xs text-gray-600 dark:text-gray-400">Auto Scale</label>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Example Data for Video */}
                      {field.renderType === 'video' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Example Video Settings
                          </label>
                          <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Video URL</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.src) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), src: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                                placeholder="https://example.com/video.mp4"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Poster Image</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.poster) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), poster: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                                placeholder="Thumbnail URL"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Width (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.width) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), width: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Height (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.height) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), height: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.autoScale) !== false}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), autoScale: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Auto Scale</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.controls) !== false}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), controls: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Show Controls</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.autoplay) === true}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), autoplay: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Autoplay</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.loop) === true}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), loop: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Loop</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.muted) === true}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), muted: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Muted</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Example Data for Embedded Video */}
                      {field.renderType === 'embeddedVideo' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-3 block">
                            Example Embedded Video Settings
                          </label>
                          <div className="space-y-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Embed URL</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.embedUrl) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), embedUrl: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
                                placeholder="https://www.youtube.com/embed/..."
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Platform</label>
                              <select
                                value={(field.exampleData && field.exampleData.platform) || 'youtube'}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), platform: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              >
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="custom">Custom</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Title</label>
                              <input
                                type="text"
                                value={(field.exampleData && field.exampleData.title) || ''}
                                onChange={(e) => {
                                  const newExampleData = { ...(field.exampleData || {}), title: e.target.value };
                                  updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                }}
                                className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Video title"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Width (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.width) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), width: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">Height (px)</label>
                                <input
                                  type="number"
                                  value={(field.exampleData && field.exampleData.height) || ''}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), height: e.target.value ? parseInt(e.target.value) : undefined };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                  placeholder="Auto"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.autoScale) !== false}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), autoScale: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Auto Scale (16:9)</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={(field.exampleData && field.exampleData.allowFullscreen) !== false}
                                  onChange={(e) => {
                                    const newExampleData = { ...(field.exampleData || {}), allowFullscreen: e.target.checked };
                                    updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExampleData);
                                  }}
                                  className="rounded border-gray-300 dark:border-gray-600"
                                />
                                <label className="text-xs text-gray-600 dark:text-gray-400">Allow Fullscreen</label>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Example Data for Status Board */}
                      {field.renderType === 'statusBoard' && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-roobert-bold text-gray-700 dark:text-gray-300">
                              Example Items
                            </label>
                            <button
                              onClick={() => {
                                const emptyItem: any = {};
                                if (field.schema?.itemSchema?.fields) {
                                  Object.keys(field.schema.itemSchema.fields).forEach(key => {
                                    emptyItem[key] = '';
                                  });
                                }
                                const newExamples = [...(field.exampleData || []), emptyItem];
                                updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                              }}
                              className="text-xs px-2 py-1 rounded bg-fis-eggplant/10 text-fis-eggplant hover:bg-fis-eggplant/20 font-roobert-medium"
                            >
                              + Add Item
                            </button>
                          </div>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(field.exampleData || []).map((item: any, itemIdx: number) => (
                              <div key={itemIdx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">
                                    Item {itemIdx + 1}
                                  </span>
                                  <button
                                    onClick={() => {
                                      const newExamples = (field.exampleData || []).filter((_: any, i: number) => i !== itemIdx);
                                      updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                    }}
                                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {field.schema?.itemSchema?.fields && Object.entries(field.schema.itemSchema.fields).map(([fieldKey, fieldDef]: [string, any]) => (
                                    <div key={fieldKey}>
                                      <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                                        {fieldDef.label}
                                      </label>
                                      {fieldDef.renderAs === 'textarea' ? (
                                        <textarea
                                          value={item[fieldKey] || ''}
                                          onChange={(e) => {
                                            const newExamples = [...(field.exampleData || [])];
                                            newExamples[itemIdx] = {
                                              ...newExamples[itemIdx],
                                              [fieldKey]: e.target.value
                                            };
                                            updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                          }}
                                          rows={2}
                                          className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                                          placeholder={fieldDef.placeholder || `Enter ${fieldDef.label.toLowerCase()}`}
                                        />
                                      ) : fieldDef.renderAs === 'select' ? (
                                        <select
                                          value={item[fieldKey] || ''}
                                          onChange={(e) => {
                                            const newExamples = [...(field.exampleData || [])];
                                            newExamples[itemIdx] = {
                                              ...newExamples[itemIdx],
                                              [fieldKey]: e.target.value
                                            };
                                            updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                          }}
                                          className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                          <option value="">Select...</option>
                                          {fieldDef.options && fieldDef.options.map((opt: string) => (
                                            <option key={opt} value={opt}>{opt}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <input
                                          type="text"
                                          value={item[fieldKey] || ''}
                                          onChange={(e) => {
                                            const newExamples = [...(field.exampleData || [])];
                                            newExamples[itemIdx] = {
                                              ...newExamples[itemIdx],
                                              [fieldKey]: e.target.value
                                            };
                                            updateFieldProperty(selectedField.sectionId, selectedField.fieldId, 'exampleData', newExamples);
                                          }}
                                          className="w-full px-2 py-1.5 text-xs rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          placeholder={fieldDef.placeholder || `Enter ${fieldDef.label.toLowerCase()}`}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                            {(!field.exampleData || field.exampleData.length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No example items. Click "+ Add Item" to add some.
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setSchemaPropertiesOpen(!schemaPropertiesOpen)}
                          className="w-full flex items-center justify-between text-xs font-roobert-bold text-gray-700 dark:text-gray-300 mb-2 hover:text-fis-eggplant dark:hover:text-fis-raspberry transition-colors"
                        >
                          <span>Schema Properties</span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${schemaPropertiesOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {schemaPropertiesOpen && (
                          <pre className="text-xs font-mono p-3 rounded bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white overflow-auto max-h-60">
{JSON.stringify(field.schema, null, 2)}
                          </pre>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-500 py-8 text-sm">
                Select a field to edit its properties
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save Template Modal */}
      <AnimatePresence>
        {showSaveModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
            onClick={() => !isSaving && setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 shadow-2xl"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-raspberry flex items-center justify-center flex-shrink-0">
                  <Save className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                    Save Template
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Give your template a name and description
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={saveTemplateName}
                    onChange={(e) => setSaveTemplateName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !isSaving && saveTemplate()}
                    placeholder="e.g., Weekly Project Update"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={saveTemplateDescription}
                    onChange={(e) => setSaveTemplateDescription(e.target.value)}
                    placeholder="Add a description for this template..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-fis-raspberry outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={saveTemplate}
                    disabled={!saveTemplateName.trim()}
                    className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Validate & Save
                  </button>
                  <button
                    onClick={() => {
                      setShowSaveModal(false);
                      setSaveTemplateName('');
                      setSaveTemplateDescription('');
                    }}
                    className="px-6 py-3 rounded-lg border-2 border-gray-200 dark:border-gray-600 hover:border-fis-eggplant font-roobert-semibold text-gray-700 dark:text-gray-300 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Modal */}
      <AnimatePresence>
        {showValidationModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[300] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full border border-gray-200 dark:border-gray-700 shadow-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  validationPassed 
                    ? 'bg-gradient-to-br from-green-500 to-green-600' 
                    : 'bg-gradient-to-br from-fis-eggplant to-fis-raspberry'
                }`}>
                  {validationPassed ? (
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <Settings className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white mb-1">
                    {isValidating ? 'Validating...' : validationPassed ? 'Validation Passed!' : 'Validation Failed'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {isValidating 
                      ? 'Checking template structure...'
                      : validationPassed 
                        ? 'Saving template now...'
                        : 'Fix issues below'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4 overflow-y-auto flex-1 pr-2">
                {validationResults.map((result, index) => (
                  <motion.div
                    key={result.check}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border flex items-start gap-2 ${
                      result.passed
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      result.passed ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {result.passed ? (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-roobert-semibold text-xs mb-0.5 ${
                        result.passed 
                          ? 'text-green-900 dark:text-green-100' 
                          : 'text-red-900 dark:text-red-100'
                      }`}>
                        {result.check}
                      </div>
                      <div className={`text-xs ${
                        result.passed 
                          ? 'text-green-700 dark:text-green-300' 
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {result.message}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {!validationPassed && !isValidating && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setShowValidationModal(false);
                      setValidationResults([]);
                    }}
                    className="flex-1 px-6 py-2.5 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:shadow-lg transition-all text-sm"
                  >
                    Edit Template
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load Template Modal */}
      <AnimatePresence>
        {showLoadTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLoadTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white">
                  Load Template
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Select a template to duplicate and edit
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-3">
                  {availableTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => loadTemplate(template.id, template.name)}
                      className="w-full text-left p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-fis-raspberry dark:hover:border-fis-raspberry bg-white dark:bg-gray-800 hover:shadow-md transition-all"
                    >
                      <div className="font-roobert-semibold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {template.description || 'No description'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {template.sectionCount} sections
                      </div>
                    </button>
                  ))}
                  {availableTemplates.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No templates available</p>
                      <button
                        onClick={() => {
                          // Fetch templates
                          fetch('http://localhost:3001/api/templates')
                            .then(res => res.json())
                            .then(data => setAvailableTemplates(data.templates || []))
                            .catch(err => console.error('Failed to load templates:', err));
                        }}
                        className="mt-3 text-fis-raspberry hover:underline"
                      >
                        Refresh
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={() => setShowLoadTemplateModal(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Editor Modal */}
      {testData && (
        <EditorModalV2
          isOpen={showTestEditor}
          onClose={() => {
            setShowTestEditor(false);
            setTestData(null);
          }}
          data={testData}
          dataType="summaries"
          onSave={(updatedData) => {
            console.log('Test data updated:', updatedData);
            showNotification('success', 'Test successful! (Data not saved)');
            setShowTestEditor(false);
            setTestData(null);
          }}
          isTestMode={true}
        />
      )}

      {/* Asset Preview Modal */}
      {previewAsset && (
        <AssetPreviewModal
          isOpen={true}
          onClose={() => setPreviewAsset(null)}
          assetName={previewAsset.name}
          schema={previewAsset.schema}
          exampleData={previewAsset.exampleData}
          supportsMultiColumn={previewAsset.supportsMultiColumn}
        />
      )}

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                    Choose Section Layout
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select how content will be arranged in this section
                  </p>
                </div>
                <button
                  onClick={() => setShowLayoutPicker(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-3 mb-4">
                {/* Full Width Layout */}
                <button
                  onClick={() => createSectionWithLayout('full')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-fis-eggplant/5 dark:hover:bg-fis-eggplant/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-fis-eggplant/10">
                      <div className="w-12 h-10 border-2 border-gray-400 dark:border-gray-500 rounded bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-roobert-bold text-gray-900 dark:text-white mb-1">Full Width</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Single column layout - ideal for text, charts, or wide content</div>
                    </div>
                    <div className="text-2xl text-gray-400 dark:text-gray-600 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry font-mono">□</div>
                  </div>
                </button>

                {/* 50/50 Layout */}
                <button
                  onClick={() => createSectionWithLayout('left-50')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-fis-eggplant/5 dark:hover:bg-fis-eggplant/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-1 group-hover:bg-fis-eggplant/10">
                      <div className="w-5 h-10 border-2 border-gray-400 dark:border-gray-500 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-5 h-10 border-2 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-roobert-bold text-gray-900 dark:text-white mb-1">50 / 50 Split</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Two equal columns - perfect for side-by-side comparison</div>
                    </div>
                    <div className="text-2xl text-gray-400 dark:text-gray-600 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry font-mono">▭▭</div>
                  </div>
                </button>

                {/* 70/30 Layout */}
                <button
                  onClick={() => createSectionWithLayout('left-70')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-fis-eggplant/5 dark:hover:bg-fis-eggplant/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-1 group-hover:bg-fis-eggplant/10">
                      <div className="w-7 h-10 border-2 border-gray-400 dark:border-gray-500 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-3 h-10 border-2 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-roobert-bold text-gray-900 dark:text-white mb-1">70 / 30 Split</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Wide left, narrow right - great for main content with sidebar</div>
                    </div>
                    <div className="text-2xl text-gray-400 dark:text-gray-600 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry font-mono">▬▭</div>
                  </div>
                </button>

                {/* 30/70 Layout */}
                <button
                  onClick={() => createSectionWithLayout('left-30')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-fis-eggplant/5 dark:hover:bg-fis-eggplant/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-1 group-hover:bg-fis-eggplant/10">
                      <div className="w-3 h-10 border-2 border-gray-400 dark:border-gray-500 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-7 h-10 border-2 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-roobert-bold text-gray-900 dark:text-white mb-1">30 / 70 Split</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Narrow left, wide right - ideal for labels with large content</div>
                    </div>
                    <div className="text-2xl text-gray-400 dark:text-gray-600 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry font-mono">▭▬</div>
                  </div>
                </button>

                {/* 33/33/33 Layout */}
                <button
                  onClick={() => createSectionWithLayout('left-33')}
                  className="w-full p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:bg-fis-eggplant/5 dark:hover:bg-fis-eggplant/10 transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center gap-0.5 group-hover:bg-fis-eggplant/10">
                      <div className="w-3 h-10 border-2 border-gray-400 dark:border-gray-500 rounded bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-3 h-10 border-2 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"></div>
                      <div className="w-3 h-10 border-2 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-roobert-bold text-gray-900 dark:text-white mb-1">33 / 33 / 33 Split</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Three equal columns - perfect for metric cards or KPIs</div>
                    </div>
                    <div className="text-2xl text-gray-400 dark:text-gray-600 group-hover:text-fis-eggplant dark:group-hover:text-fis-raspberry font-mono">▭▭▭</div>
                  </div>
                </button>
              </div>

              {/* Layout Guide Button */}
              <button
                onClick={() => setShowLayoutGuide(true)}
                className="w-full py-3 px-4 border-2 border-fis-eggplant/30 dark:border-fis-raspberry/30 rounded-lg hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 transition-all flex items-center justify-center gap-2 text-fis-eggplant dark:text-fis-raspberry font-roobert-semibold"
              >
                <Grid className="w-4 h-4" />
                <span>Layout Guide</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Layout Guide Modal */}
      {showLayoutGuide && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 dark:bg-fis-raspberry/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <Grid className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                      How Layout Works
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Understanding sequential ordering and automatic row filling
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLayoutGuide(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-fis-eggplant/5 dark:bg-fis-eggplant/10 border border-fis-eggplant/20 dark:border-fis-raspberry/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                    Assets are placed <strong>sequentially</strong>, left-to-right, automatically filling rows based on your chosen layout:
                  </p>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-fis-eggplant text-white flex items-center justify-center text-xs font-roobert-bold flex-shrink-0">1</span>
                      <span className="text-gray-700 dark:text-gray-300">First asset → <strong>Left column</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-fis-eggplant text-white flex items-center justify-center text-xs font-roobert-bold flex-shrink-0">2</span>
                      <span className="text-gray-700 dark:text-gray-300">Second asset → <strong>Middle/Right column</strong> (same row)</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-fis-eggplant text-white flex items-center justify-center text-xs font-roobert-bold flex-shrink-0">3</span>
                      <span className="text-gray-700 dark:text-gray-300">Third asset → <strong>Right column</strong> (if 3-col) or <strong>new row</strong></span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-6 h-6 rounded-full bg-fis-raspberry text-white flex items-center justify-center text-xs font-roobert-bold flex-shrink-0">4</span>
                      <span className="text-gray-700 dark:text-gray-300">Row full → <strong>Start new row</strong> automatically</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-roobert-semibold text-gray-900 dark:text-white">Important Notes:</h3>
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-1 flex-shrink-0">•</span>
                      <span>The layout icon (□, ▭▭, etc.) appears in the section header to show your chosen layout</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-1 flex-shrink-0">•</span>
                      <span>Assets automatically wrap to a new row when the current row is full</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-1 flex-shrink-0">•</span>
                      <span>Some assets (like tables) don't support multi-column layouts and always take full width</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-fis-eggplant dark:text-fis-raspberry mt-1 flex-shrink-0">•</span>
                      <span>Delete the last asset in a section to reset the layout choice</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setShowLayoutGuide(false)}
                    className="w-full py-3 px-4 bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 text-white rounded-lg font-roobert-semibold transition-all"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Remove All Sections Confirmation Modal */}
      {showRemoveAllModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Remove All Sections
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to remove all sections? This will keep only the standard header.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowRemoveAllModal(false)}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoveAll}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-roobert-semibold transition-colors"
              >
                Remove All
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Unsaved Changes Confirmation Modal */}
      {showUnsavedChangesModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-2">
                    Unsaved Changes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You have unsaved changes. Are you sure you want to leave? All changes will be lost.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowUnsavedChangesModal(false)}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-roobert-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUnsavedChangesModal(false);
                  onBack();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-roobert-semibold transition-colors"
              >
                Leave Anyway
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

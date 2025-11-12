import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronRight, ChevronDown, RefreshCw } from 'lucide-react';
import { RenderFactory } from '@renderers/RenderFactory';
import { ChartColors } from '../../../src/design-system';
import type { FieldSchema } from '../../../src/types/schema';

interface EngineAssetsPreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'basic' | 'lists' | 'complex' | 'rich' | 'charts' | 'media' | 'layout';

interface RenderExample {
  id: string;
  name: string;
  category: Category;
  categoryLabel: string;
  description: string;
  useCase: string;
  schema: FieldSchema;
  sampleData: any;
}

const EXAMPLES: RenderExample[] = [
  // BASIC INPUTS
  {
    id: 'text',
    name: 'Text Input',
    category: 'basic',
    categoryLabel: 'Basic Inputs',
    description: 'Simple single-line text input',
    useCase: 'Names, titles, short descriptions',
    schema: {
      renderAs: 'text',
      label: 'Project Name',
      placeholder: 'Enter project name...',
      required: true,
      helpText: 'The display name for this project',
    },
    sampleData: 'Digital Transformation Initiative',
  },
  {
    id: 'textarea',
    name: 'Text Area',
    category: 'basic',
    categoryLabel: 'Basic Inputs',
    description: 'Multi-line text input',
    useCase: 'Long descriptions, summaries, notes',
    schema: {
      renderAs: 'textarea',
      label: 'Executive Summary',
      placeholder: 'Enter summary...',
      required: true,
      helpText: 'A comprehensive overview of the initiative',
    },
    sampleData: 'This initiative focuses on modernizing our core infrastructure through cloud adoption and AI integration.',
  },
  {
    id: 'number',
    name: 'Number Input',
    category: 'basic',
    categoryLabel: 'Basic Inputs',
    description: 'Numeric input with validation',
    useCase: 'Metrics, counts, percentages',
    schema: {
      renderAs: 'number',
      label: 'Completion Percentage',
      placeholder: '0-100',
      required: true,
      helpText: 'Project completion as a percentage',
      validation: [
        { rule: 'min', value: 0, message: 'Must be at least 0' },
        { rule: 'max', value: 100, message: 'Cannot exceed 100' },
      ],
    },
    sampleData: 75,
  },

  // LISTS
  {
    id: 'list',
    name: 'List (with labels)',
    category: 'lists',
    categoryLabel: 'Lists',
    description: 'Key-value pairs with labels',
    useCase: 'Metrics, data points with labels',
    schema: {
      renderAs: 'keyValueList',
      label: 'Key Metrics',
      helpText: 'Important performance indicators',
    },
    sampleData: {
      'Revenue Growth': '$2.5M',
      'Customer Satisfaction': '95%',
      'Team Velocity': '42 points',
    },
  },

  // COMPLEX
  {
    id: 'metricCards',
    name: 'Metric Cards',
    category: 'complex',
    categoryLabel: 'Complex',
    description: 'Grid of metric cards with auto-formatting',
    useCase: 'KPIs, performance metrics, statistics',
    schema: {
      renderAs: 'metricCards',
      label: 'Key Performance Indicators',
      fields: {
        revenue: { renderAs: 'number', label: 'Revenue Growth' },
        satisfaction: { renderAs: 'number', label: 'Customer Satisfaction' },
        growth: { renderAs: 'number', label: 'Year-over-Year Growth' },
      },
    },
    sampleData: {
      revenue: 2500000,
      satisfaction: 92,
      growth: 15,
    },
  },
  {
    id: 'nestedCards',
    name: 'Nested Cards',
    category: 'complex',
    categoryLabel: 'Complex',
    description: 'Expandable cards for arrays of objects',
    useCase: 'Departments, initiatives, team members',
    schema: {
      renderAs: 'nestedCards',
      label: 'Team Members',
      fields: {
        name: { renderAs: 'text', label: 'Name', required: true },
        role: { renderAs: 'text', label: 'Role' },
        responsibilities: { renderAs: 'list', label: 'Responsibilities' },
      },
    },
    sampleData: [
      {
        name: 'Sarah Johnson',
        role: 'Technical Lead',
        responsibilities: ['Architecture', 'Code Reviews', 'Team Mentoring'],
      },
      {
        name: 'Michael Chen',
        role: 'Product Manager',
        responsibilities: ['Roadmap Planning', 'Stakeholder Communication'],
      },
    ],
  },
  {
    id: 'objectForm',
    name: 'Object Form (Array)',
    category: 'complex',
    categoryLabel: 'Complex',
    description: 'Array of objects with structured fields',
    useCase: 'Team members, project items, structured lists',
    schema: {
      type: 'array',
      renderAs: 'array',
      itemSchema: {
        type: 'object',
        renderAs: 'objectForm',
        label: 'Team Information',
        fields: {
          team: { renderAs: 'text', label: 'Team Name', required: true },
          lead: { renderAs: 'text', label: 'Team Lead' },
          members: { renderAs: 'number', label: 'Member Count' },
        },
      },
    },
    sampleData: [
      {
        team: 'Revenue Operations',
        lead: 'Sarah Johnson',
        members: 12,
      },
      {
        team: 'Product Development',
        lead: 'Michael Chen',
        members: 8,
      },
    ],
  },

  // CHARTS
  {
    id: 'pieChart',
    name: 'Pie Chart',
    category: 'charts',
    categoryLabel: 'Charts',
    description: 'Circular chart showing proportions',
    useCase: 'Market share, budget allocation, category distribution',
    schema: {
      renderAs: 'pieChart',
      label: 'Budget Allocation',
      chartConfig: {
        dataKey: 'value',
        nameKey: 'name',
        colors: [...ChartColors.palette],
        showLegend: true,
        showTooltip: true,
        innerRadius: 0,
        outerRadius: 80,
      },
      fields: {
        name: { renderAs: 'text', label: 'Label', required: true },
        value: { renderAs: 'number', label: 'Value', required: true },
      },
    },
    sampleData: [
      { name: 'Engineering', value: 450000 },
      { name: 'Marketing', value: 250000 },
      { name: 'Sales', value: 180000 },
      { name: 'Operations', value: 120000 },
    ],
  },
  {
    id: 'barChart',
    name: 'Bar Chart',
    category: 'charts',
    categoryLabel: 'Charts',
    description: 'Vertical or horizontal bars for comparison',
    useCase: 'Revenue by quarter, team performance, feature adoption',
    schema: {
      renderAs: 'barChart',
      label: 'Quarterly Revenue',
      chartConfig: {
        xAxisKey: 'name',
        bars: [{ dataKey: 'value', fill: ChartColors.series.eggplantLight, name: 'Revenue' }],
        orientation: 'vertical',
        showGrid: true,
        showLegend: true,
        stacked: false,
      },
      fields: {
        name: { renderAs: 'text', label: 'Quarter', required: true },
        value: { renderAs: 'number', label: 'Revenue ($M)', required: true },
      },
    },
    sampleData: [
      { name: 'Q1', value: 2.5 },
      { name: 'Q2', value: 3.2 },
      { name: 'Q3', value: 3.8 },
      { name: 'Q4', value: 4.5 },
    ],
  },
  {
    id: 'lineChart',
    name: 'Line Chart',
    category: 'charts',
    categoryLabel: 'Charts',
    description: 'Line graph for trends over time',
    useCase: 'Growth trends, KPI tracking, temporal analysis',
    schema: {
      renderAs: 'lineChart',
      label: 'User Growth',
      chartConfig: {
        xAxisKey: 'name',
        lines: [{ dataKey: 'value', stroke: ChartColors.series.eggplantLight, name: 'Active Users' }],
        showGrid: true,
        showLegend: true,
        showDots: true,
        curved: true,
      },
      fields: {
        name: { renderAs: 'text', label: 'Month', required: true },
        value: { renderAs: 'number', label: 'Users', required: true },
      },
    },
    sampleData: [
      { name: 'Jan', value: 1200 },
      { name: 'Feb', value: 1800 },
      { name: 'Mar', value: 2400 },
      { name: 'Apr', value: 3100 },
      { name: 'May', value: 3800 },
      { name: 'Jun', value: 4500 },
    ],
  },
  {
    id: 'radialChart',
    name: 'Radial Chart',
    category: 'charts',
    categoryLabel: 'Charts',
    description: 'Circular progress or donut chart',
    useCase: 'Completion rates, progress tracking, goal achievement',
    schema: {
      renderAs: 'radialChart',
      label: 'Project Completion',
      chartConfig: {
        dataKey: 'value',
        maxValue: 100,
        colors: [...ChartColors.palette],
        showPercentage: true,
        thickness: 20,
      },
      fields: {
        name: { renderAs: 'text', label: 'Project', required: true },
        value: { renderAs: 'number', label: 'Progress (%)', required: true },
      },
    },
    sampleData: [
      { name: 'Infrastructure', value: 85 },
      { name: 'Frontend', value: 92 },
      { name: 'Backend', value: 78 },
    ],
  },
  
  // MEDIA
  {
    id: 'image',
    name: 'Image',
    category: 'media',
    categoryLabel: 'Media',
    description: 'Image with auto-scaling and caption support',
    useCase: 'Charts, diagrams, screenshots, visualizations',
    schema: {
      renderAs: 'image',
      label: 'Dashboard Screenshot',
      fields: {
        src: { renderAs: 'text', label: 'Image URL', required: true },
        alt: { renderAs: 'text', label: 'Alt Text' },
        autoScale: { renderAs: 'checkbox', label: 'Auto Scale', defaultValue: true },
        width: { renderAs: 'number', label: 'Width (px)' },
        height: { renderAs: 'number', label: 'Height (px)' },
        caption: { renderAs: 'text', label: 'Caption' },
      },
    },
    sampleData: {
      src: 'https://via.placeholder.com/800x400/6b46c1/ffffff?text=Executive+Summary+Dashboard',
      alt: 'Q4 Performance Dashboard',
      autoScale: true,
      caption: 'Q4 2024 Revenue Performance Dashboard',
    },
  },
  {
    id: 'video',
    name: 'Video',
    category: 'media',
    categoryLabel: 'Media',
    description: 'Video player with controls and settings',
    useCase: 'Presentations, demos, training materials',
    schema: {
      renderAs: 'video',
      label: 'Team Presentation',
      fields: {
        src: { renderAs: 'text', label: 'Video URL', required: true },
        poster: { renderAs: 'text', label: 'Poster Image' },
        autoScale: { renderAs: 'checkbox', label: 'Auto Scale', defaultValue: true },
        width: { renderAs: 'number', label: 'Width (px)' },
        height: { renderAs: 'number', label: 'Height (px)' },
        controls: { renderAs: 'checkbox', label: 'Show Controls', defaultValue: true },
        autoplay: { renderAs: 'checkbox', label: 'Autoplay', defaultValue: false },
        loop: { renderAs: 'checkbox', label: 'Loop', defaultValue: false },
        muted: { renderAs: 'checkbox', label: 'Muted', defaultValue: false },
      },
    },
    sampleData: {
      src: 'https://www.w3schools.com/html/mov_bbb.mp4',
      poster: 'https://via.placeholder.com/800x450/6b46c1/ffffff?text=Video+Preview',
      autoScale: true,
      controls: true,
      autoplay: false,
      loop: false,
      muted: false,
    },
  },
  {
    id: 'embeddedVideo',
    name: 'Embedded Video',
    category: 'media',
    categoryLabel: 'Media',
    description: 'YouTube, Vimeo, or custom iframe embed',
    useCase: 'External videos, presentations, webinars',
    schema: {
      renderAs: 'embeddedVideo',
      label: 'Quarterly Review Video',
      fields: {
        embedUrl: { renderAs: 'text', label: 'Embed URL', required: true },
        platform: { renderAs: 'select', label: 'Platform', options: ['youtube', 'vimeo', 'custom'], defaultValue: 'youtube' },
        autoScale: { renderAs: 'checkbox', label: 'Auto Scale (16:9)', defaultValue: true },
        width: { renderAs: 'number', label: 'Width (px)' },
        height: { renderAs: 'number', label: 'Height (px)' },
        allowFullscreen: { renderAs: 'checkbox', label: 'Allow Fullscreen', defaultValue: true },
        title: { renderAs: 'text', label: 'Title' },
      },
    },
    sampleData: {
      embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      platform: 'youtube',
      autoScale: true,
      allowFullscreen: true,
      title: 'Q4 Executive Presentation',
    },
  },

  // LAYOUT
  {
    id: 'hr',
    name: 'Horizontal Rule',
    category: 'layout',
    categoryLabel: 'Layout',
    description: 'Visual divider between sections',
    useCase: 'Section separators, visual breaks, content organization',
    schema: {
      renderAs: 'hr',
      label: 'Section Divider',
      hrConfig: {
        thickness: 1,
        color: '#6B1B5E', // FIS Eggplant color
        marginTop: 24,
        marginBottom: 24,
        style: 'solid',
      },
    },
    sampleData: null,
  },
  {
    id: 'statusBoard',
    name: 'Table Layout',
    category: 'layout',
    categoryLabel: 'Layout',
    description: 'Generic column layout - configurable for any grouped data',
    useCase: 'Issues tracking, project phases, status boards, categorized content, workflow stages',
    schema: {
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
    sampleData: [
      {
        title: 'Database Migration Performance',
        description: 'Legacy database queries causing 5-10 second page load times during peak hours',
        priority: 'critical',
        action: 'Implementing query optimization and adding database indexes',
        timeline: 'Nov 15, 2024',
        status: 'open'
      },
      {
        title: 'API Rate Limiting Issues',
        description: 'Third-party API calls occasionally hitting rate limits, causing service disruptions',
        priority: 'high',
        action: 'Implementing retry logic with exponential backoff and caching layer',
        timeline: 'End of Q4 2024',
        status: 'in-progress'
      },
      {
        title: 'Mobile App Crash on Startup',
        description: 'iOS app crashing for users on iOS 16.x when opening from background',
        priority: 'high',
        action: 'Testing fix across all iOS versions, deploying hotfix',
        timeline: 'Nov 20, 2024',
        status: 'in-progress'
      },
      {
        title: 'Payment Gateway Timeout',
        description: 'Users experiencing timeout errors during checkout process approximately 2% of transactions',
        priority: 'medium',
        action: 'Coordinating with payment provider to increase timeout thresholds',
        timeline: 'Dec 1, 2024',
        status: 'in-progress'
      },
      {
        title: 'Email Delivery Delays',
        description: 'Transactional emails arriving 15-30 minutes late during high-volume periods',
        priority: 'medium',
        action: 'Migrating to new email service provider with better infrastructure',
        timeline: 'Q1 2025',
        status: 'open'
      },
      {
        title: 'Authentication Token Expiry Bug',
        description: 'Users being logged out randomly despite having valid sessions',
        priority: 'high',
        action: 'Fixed token refresh mechanism and deployed to production',
        timeline: 'Completed Nov 5, 2024',
        status: 'resolved'
      },
      {
        title: 'CSV Export Memory Leak',
        description: 'Large dataset exports causing server memory issues',
        priority: 'medium',
        action: 'Implemented streaming export to handle large files efficiently',
        timeline: 'Completed Nov 8, 2024',
        status: 'resolved'
      }
    ],
  },
];

// Group examples by category
const groupedExamples = EXAMPLES.reduce((acc, example) => {
  if (!acc[example.category]) {
    acc[example.category] = {
      label: example.categoryLabel,
      items: []
    };
  }
  acc[example.category].items.push(example);
  return acc;
}, {} as Record<Category, { label: string; items: RenderExample[] }>);

export const EngineAssetsPreview: React.FC<EngineAssetsPreviewProps> = ({ isOpen, onClose }) => {
  const [selectedExample, setSelectedExample] = useState<RenderExample>(EXAMPLES[0]);
  const [expandedCategories, setExpandedCategories] = useState<Set<Category>>(new Set([])); // Collapsed by default
  const [editableData, setEditableData] = useState<string>(JSON.stringify(EXAMPLES[0].sampleData, null, 2));
  const [currentData, setCurrentData] = useState<any>(EXAMPLES[0].sampleData);
  const [jsonError, setJsonError] = useState<string>('');
  const [jsonExpanded, setJsonExpanded] = useState(false);

  const toggleCategory = (category: Category) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const selectExample = (example: RenderExample) => {
    setSelectedExample(example);
    setEditableData(JSON.stringify(example.sampleData, null, 2));
    setCurrentData(example.sampleData);
    setJsonError('');
  };

  const refreshPreview = () => {
    try {
      const parsed = JSON.parse(editableData);
      setCurrentData(parsed);
      setJsonError('');
    } catch (err) {
      setJsonError((err as Error).message);
    }
  };

  const renderInputFields = () => {
    // For array data (charts, lists)
    if (Array.isArray(currentData)) {
      return (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {currentData.map((item, index) => (
            <div key={index} style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: index < currentData.length - 1 ? '1px solid #e5e7eb' : 'none' }} className="dark:border-gray-700">
              <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280' }} className="dark:text-gray-400">
                Item {index + 1}
              </div>
              {Object.keys(item).map(key => (
                <div key={key} style={{ marginBottom: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }} className="dark:text-gray-300">
                    {key}
                  </label>
                  <input
                    type={typeof item[key] === 'number' ? 'number' : 'text'}
                    value={item[key]}
                    onChange={(e) => {
                      const newData = [...currentData];
                      newData[index] = {
                        ...newData[index],
                        [key]: typeof item[key] === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                      };
                      setCurrentData(newData);
                      setEditableData(JSON.stringify(newData, null, 2));
                    }}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                      fontSize: '0.875rem',
                      backgroundColor: 'white'
                    }}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    // For object data
    if (typeof currentData === 'object' && currentData !== null) {
      return (
        <div>
          {Object.keys(currentData).map(key => (
            <div key={key} style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }} className="dark:text-gray-300">
                {key}
              </label>
              <input
                type={typeof currentData[key] === 'number' ? 'number' : 'text'}
                value={currentData[key]}
                onChange={(e) => {
                  const newData = {
                    ...currentData,
                    [key]: typeof currentData[key] === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  };
                  setCurrentData(newData);
                  setEditableData(JSON.stringify(newData, null, 2));
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  fontSize: '0.875rem',
                  backgroundColor: 'white'
                }}
                className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
              />
            </div>
          ))}
        </div>
      );
    }

    // For primitive values
    return (
      <div>
        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', marginBottom: '0.25rem', color: '#374151' }} className="dark:text-gray-300">
          Value
        </label>
        <input
          type={typeof currentData === 'number' ? 'number' : 'text'}
          value={currentData || ''}
          onChange={(e) => {
            const newData = typeof currentData === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            setCurrentData(newData);
            setEditableData(JSON.stringify(newData, null, 2));
          }}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.375rem',
            border: '1px solid #d1d5db',
            fontSize: '0.875rem',
            backgroundColor: 'white'
          }}
          className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
        />
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 100000
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          right: '2rem',
          bottom: '2rem',
          zIndex: 100001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
          className="dark:bg-gray-900"
        >
          {/* Header */}
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} className="dark:border-gray-700">
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }} className="text-gray-900 dark:text-white font-roobert-bold">
                🎨 Engine Assets Preview
              </h2>
              <p style={{ fontSize: '0.75rem', marginTop: '0.125rem' }} className="text-gray-600 dark:text-gray-400">
                Interactive playground for testing render types
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Main Content Area */}
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            {/* Left Sidebar - Tree Navigation */}
            <div style={{ width: '280px', borderRight: '1px solid #e5e7eb', overflowY: 'auto', backgroundColor: '#f9fafb' }} className="dark:border-gray-700 dark:bg-gray-800/50">
              <div style={{ padding: '0.75rem' }}>
                {Object.entries(groupedExamples).map(([categoryId, categoryData]) => {
                  const isExpanded = expandedCategories.has(categoryId as Category);
                  return (
                    <div key={categoryId} style={{ marginBottom: '0.5rem' }}>
                      {/* Category Header */}
                      <button
                        onClick={() => toggleCategory(categoryId as Category)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '0.375rem',
                          border: 'none',
                          backgroundColor: 'transparent',
                          cursor: 'pointer',
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textAlign: 'left'
                        }}
                        className="hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-bold"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        {categoryData.label}
                      </button>

                      {/* Category Items */}
                      {isExpanded && (
                        <div style={{ marginLeft: '1.5rem', marginTop: '0.25rem' }}>
                          {categoryData.items.map(example => {
                            const isSelected = selectedExample.id === example.id;
                            return (
                              <button
                                key={example.id}
                                onClick={() => selectExample(example)}
                                style={{
                                  width: '100%',
                                  display: 'block',
                                  padding: '0.5rem',
                                  borderRadius: '0.375rem',
                                  border: 'none',
                                  backgroundColor: isSelected ? '#6B1B5E' : 'transparent',
                                  color: isSelected ? 'white' : '#374151',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                  fontWeight: '500',
                                  textAlign: 'left',
                                  marginBottom: '0.125rem'
                                }}
                                className={isSelected ? '' : 'hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-300'}
                              >
                                {example.name}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Asset Info Bar - Row 1 */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }} className="dark:border-gray-700 dark:bg-gray-900">
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }} className="dark:text-white font-roobert-bold">
                  {selectedExample.name}
                </h3>
              </div>

              {/* Main Content - Row 2 */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* Left Column - Input Fields (1/3) */}
                    <div>
                      {/* Description */}
                      <div style={{ marginBottom: '1.5rem' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#374151' }} className="dark:text-gray-300 font-roobert-semibold">
                          Description
                        </div>
                        <p style={{ fontSize: '0.8125rem', color: '#6b7280', lineHeight: '1.5' }} className="dark:text-gray-400">
                          {selectedExample.description}
                        </p>
                        <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }} className="dark:text-gray-400">
                          <span style={{ fontWeight: '600' }}>Use case:</span> {selectedExample.useCase}
                        </div>
                      </div>

                      {/* Input Fields */}
                      <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', border: '1px solid #e5e7eb', marginBottom: '1rem' }} className="dark:bg-gray-800/50 dark:border-gray-700">
                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: '#374151' }} className="dark:text-gray-300 font-roobert-semibold">
                          Edit Data
                        </div>
                        {renderInputFields()}
                      </div>

                      {/* Refresh Button */}
                      <button
                        onClick={refreshPreview}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.75rem',
                          borderRadius: '0.5rem',
                          border: 'none',
                          backgroundColor: '#6B1B5E',
                          color: 'white',
                          fontSize: '0.9375rem',
                          fontWeight: '600',
                          cursor: 'pointer'
                        }}
                        className="hover:bg-opacity-90 font-roobert-semibold"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Refresh Preview
                      </button>

                      {jsonError && (
                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#dc2626' }} className="dark:bg-red-950 dark:border-red-900">
                          <strong>Error:</strong> {jsonError}
                        </div>
                      )}
                    </div>

                    {/* Right Column - Rendered Output (2/3) */}
                    <div style={{ backgroundColor: '#ffffff', borderRadius: '0.75rem', padding: '2rem', border: '1px solid #e5e7eb', minHeight: '400px' }} className="dark:bg-gray-800 dark:border-gray-700">
                      <div style={{ width: '100%' }}>
                        <RenderFactory
                          fieldKey={selectedExample.id}
                          schema={selectedExample.schema}
                          value={currentData}
                          mode="display"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible JSON Schema Section - Row 3 */}
                  <div>
                    <button
                      onClick={() => setJsonExpanded(!jsonExpanded)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.875rem 1.25rem',
                        borderRadius: '0.5rem',
                        border: '1px solid #e5e7eb',
                        backgroundColor: '#f9fafb',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        marginBottom: jsonExpanded ? '0.75rem' : '0'
                      }}
                      className="hover:bg-gray-100 dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-roobert-semibold"
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {jsonExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                        JSON Schema & Sample Data
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }} className="dark:text-gray-400">
                        {jsonExpanded ? 'Hide' : 'Show'} technical details
                      </span>
                    </button>

                    {jsonExpanded && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        {/* Schema */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="dark:text-gray-400 font-roobert-semibold">
                            JSON Schema
                          </div>
                          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem', border: '1px solid #374151' }} className="dark:bg-black dark:border-gray-800">
                            <pre style={{ margin: 0, fontSize: '0.6875rem', color: '#e5e7eb', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {JSON.stringify(selectedExample.schema, null, 2)}
                            </pre>
                          </div>
                        </div>
                        
                        {/* Sample Data */}
                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }} className="dark:text-gray-400 font-roobert-semibold">
                            Current Data (JSON)
                          </div>
                          <div style={{ padding: '1rem', backgroundColor: '#1f2937', borderRadius: '0.5rem', border: '1px solid #374151' }} className="dark:bg-black dark:border-gray-800">
                            <pre style={{ margin: 0, fontSize: '0.6875rem', color: '#e5e7eb', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                              {JSON.stringify(currentData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default EngineAssetsPreview;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { RenderFactory } from '@renderers/RenderFactory';

interface AssetTypeReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssetType?: string; // Auto-scroll to this type when opened
}

interface AssetTypeExample {
  type: string;
  name: string;
  category: 'Basic' | 'Lists' | 'Complex' | 'Rich Content' | 'Charts' | 'Media';
  description: string;
  useCase: string;
  exampleData: any;
  schema: any;
  supportsMultiColumn?: boolean;
}

const assetExamples: AssetTypeExample[] = [
  // BASIC TYPES
  {
    type: 'text',
    name: 'Text Input',
    category: 'Basic',
    description: 'Single-line text field for short content',
    useCase: 'Names, titles, short labels, status messages',
    exampleData: 'Sample text content',
    schema: { type: 'text', renderAs: 'text', label: 'Text Input' },
    supportsMultiColumn: true
  },
  {
    type: 'textarea',
    name: 'Text Area',
    category: 'Basic',
    description: 'Multi-line text field for longer content',
    useCase: 'Descriptions, notes, paragraphs',
    exampleData: 'This is a longer text block that spans multiple lines and can contain detailed information.',
    schema: { type: 'textarea', renderAs: 'textarea', label: 'Text Area' },
    supportsMultiColumn: true
  },
  {
    type: 'number',
    name: 'Number Input',
    category: 'Basic',
    description: 'Numeric input field',
    useCase: 'Counts, quantities, scores, percentages',
    exampleData: 42,
    schema: { type: 'number', renderAs: 'number', label: 'Number Input' },
    supportsMultiColumn: true
  },
  
  // LISTS
  {
    type: 'list',
    name: 'Simple List',
    category: 'Lists',
    description: 'Bulleted list of text items',
    useCase: 'Highlights, key points, features, action items',
    exampleData: ['First item', 'Second item', 'Third item', 'Fourth item'],
    schema: { type: 'list', renderAs: 'list', label: 'Simple List' },
    supportsMultiColumn: true
  },
  {
    type: 'keyValueList',
    name: 'Key-Value List',
    category: 'Lists',
    description: 'Dynamic list of label-value pairs',
    useCase: 'Executive details, contact info, specifications, properties',
    exampleData: {
      'Role': 'Chief Executive Officer',
      'Department': 'Executive Leadership',
      'Location': 'New York, NY',
      'Reports To': 'Board of Directors'
    },
    schema: { type: 'keyValueList', renderAs: 'keyValueList', label: 'Executive Details' },
    supportsMultiColumn: true
  },
  {
    type: 'nestedCards',
    name: 'Card List (Array of Objects)',
    category: 'Lists',
    description: 'Array of structured objects displayed as cards with add/remove functionality',
    useCase: 'Team members, metrics, KPIs, project items - any array of objects with consistent fields',
    exampleData: [
      { title: 'Revenue', value: '$2.4M' },
      { title: 'Growth', value: '+35%' },
      { title: 'Customers', value: '1,250' },
      { title: 'Retention', value: '94%' }
    ],
    schema: {
      type: 'nestedCards',
      renderAs: 'nestedCards',
      label: 'Metrics',
      fields: {
        title: { type: 'string', renderAs: 'text', label: 'Title' },
        value: { type: 'string', renderAs: 'text', label: 'Value' }
      }
    },
    supportsMultiColumn: false
  },
  
  // COMPLEX TYPES
  {
    type: 'object',
    name: 'Object',
    category: 'Complex',
    description: 'Single object with custom fields',
    useCase: 'Team data, project info, structured content',
    exampleData: {
      team: 'Revenue Operations',
      lead: 'Sarah Johnson',
      members: 12
    },
    schema: {
      type: 'object',
      renderAs: 'objectForm',
      label: 'Team Information',
      fields: {
        team: { type: 'string', renderAs: 'text', label: 'Team Name' },
        lead: { type: 'string', renderAs: 'text', label: 'Team Lead' },
        members: { type: 'number', renderAs: 'number', label: 'Member Count' }
      }
    },
    supportsMultiColumn: true
  },
  {
    type: 'keyValue',
    name: 'Key-Value Pair',
    category: 'Complex',
    description: 'Single key-value pair',
    useCase: 'Status indicators, single property displays',
    exampleData: { key: 'Current Status', value: 'On Track' },
    schema: {
      type: 'keyValue',
      renderAs: 'objectForm',
      label: 'Project Status',
      fields: {
        key: { type: 'string', renderAs: 'text', label: 'Key' },
        value: { type: 'string', renderAs: 'text', label: 'Value' }
      }
    },
    supportsMultiColumn: true
  },
  {
    type: 'statusBoard',
    name: 'Status Board',
    category: 'Complex',
    description: 'Table-style layout for tracking items with status',
    useCase: 'Issues, blockers, tasks, project tracking',
    exampleData: [
      {
        title: 'System Performance Issue',
        description: 'Application response time degraded',
        priority: 'high',
        status: 'in-progress'
      }
    ],
    schema: {
      type: 'statusBoard',
      renderAs: 'statusBoard',
      label: 'Issues & Blockers'
    },
    supportsMultiColumn: true
  },
  
  // RICH CONTENT
  {
    type: 'richText',
    name: 'Rich Text / Markdown',
    category: 'Rich Content',
    description: 'Formatted text with markdown support',
    useCase: 'Summaries, detailed descriptions, formatted content',
    exampleData: '## Q4 2025 Overview\n\nWe achieved **record-breaking growth**:\n\n- Revenue up 35%\n- Customer base expanded\n- Launched 3 major features',
    schema: { type: 'richText', renderAs: 'richText', label: 'Executive Summary' },
    supportsMultiColumn: true
  },
  {
    type: 'codeBlock',
    name: 'Code Snippet',
    category: 'Rich Content',
    description: 'Code block with monospace font',
    useCase: 'Code examples, technical snippets, formulas',
    exampleData: 'const calculateGrowth = (current, previous) => {\n  return ((current - previous) / previous * 100).toFixed(2);\n};',
    schema: { type: 'codeBlock', renderAs: 'codeBlock', label: 'Code Example' },
    supportsMultiColumn: true
  },
  {
    type: 'quote',
    name: 'Quote',
    category: 'Rich Content',
    description: 'Styled blockquote or testimonial',
    useCase: 'Executive quotes, testimonials, highlights',
    exampleData: 'Our team executed flawlessly this quarter. The dedication demonstrated by everyone has positioned us for continued success.',
    schema: { type: 'quote', renderAs: 'quote', label: 'Leadership Quote' },
    supportsMultiColumn: true
  },
  {
    type: 'expression',
    name: 'Dynamic Expression',
    category: 'Rich Content',
    description: 'Template expression with variables',
    useCase: 'Calculated fields, dynamic text, formulas',
    exampleData: '{{ revenue.current }} / {{ revenue.target }} = {{ (revenue.current / revenue.target * 100).toFixed(1) }}%',
    schema: { type: 'expression', renderAs: 'text', label: 'Dynamic Expression' },
    supportsMultiColumn: true
  },
  
  // CHARTS
  {
    type: 'pieChart',
    name: 'Pie Chart',
    category: 'Charts',
    description: 'Circular chart showing proportions',
    useCase: 'Market share, distribution, percentages',
    exampleData: [
      { name: 'Enterprise', value: 45 },
      { name: 'Mid-Market', value: 30 },
      { name: 'SMB', value: 25 }
    ],
    schema: {
      type: 'pieChart',
      renderAs: 'pieChart',
      label: 'Revenue Distribution',
      chartConfig: {
        dataKey: 'value',
        nameKey: 'name',
        showLegend: true
      }
    },
    supportsMultiColumn: true
  },
  {
    type: 'barChart',
    name: 'Bar Chart',
    category: 'Charts',
    description: 'Vertical or horizontal bars',
    useCase: 'Comparisons, quarterly data, rankings',
    exampleData: [
      { name: 'Q1', value: 2400 },
      { name: 'Q2', value: 3100 },
      { name: 'Q3', value: 2800 },
      { name: 'Q4', value: 3500 }
    ],
    schema: {
      type: 'barChart',
      renderAs: 'barChart',
      label: 'Quarterly Performance'
    },
    supportsMultiColumn: true
  },
  {
    type: 'lineChart',
    name: 'Line Chart',
    category: 'Charts',
    description: 'Line graph for trends over time',
    useCase: 'Trends, growth tracking, time series',
    exampleData: [
      { name: 'Jan', value: 650 },
      { name: 'Feb', value: 720 },
      { name: 'Mar', value: 830 },
      { name: 'Apr', value: 900 }
    ],
    schema: {
      type: 'lineChart',
      renderAs: 'lineChart',
      label: 'Growth Trend'
    },
    supportsMultiColumn: true
  },
  {
    type: 'radialChart',
    name: 'Radial Chart',
    category: 'Charts',
    description: 'Circular progress or donut chart',
    useCase: 'Progress, completion rates, goals',
    exampleData: [
      { name: 'Completed', value: 72 },
      { name: 'In Progress', value: 18 },
      { name: 'Pending', value: 10 }
    ],
    schema: {
      type: 'radialChart',
      renderAs: 'radialChart',
      label: 'Task Status'
    },
    supportsMultiColumn: true
  },
  
  // MEDIA
  {
    type: 'image',
    name: 'Image',
    category: 'Media',
    description: 'Image with caption and scaling',
    useCase: 'Screenshots, photos, diagrams',
    exampleData: {
      src: '/images/placeholder.png',
      alt: 'Example image',
      caption: 'Image caption',
      autoScale: true
    },
    schema: {
      type: 'image',
      renderAs: 'image',
      label: 'Product Screenshot'
    },
    supportsMultiColumn: true
  },
  {
    type: 'video',
    name: 'Video',
    category: 'Media',
    description: 'Local video file with controls',
    useCase: 'Product demos, recordings, presentations',
    exampleData: {
      src: '/videos/demo.mp4',
      controls: true
    },
    schema: {
      type: 'video',
      renderAs: 'video',
      label: 'Product Demo'
    },
    supportsMultiColumn: true
  },
  {
    type: 'embeddedVideo',
    name: 'Embedded Video',
    category: 'Media',
    description: 'YouTube, Vimeo, or custom embedded video',
    useCase: 'Webinar recordings, external videos',
    exampleData: {
      embedUrl: 'https://www.youtube.com/embed/example',
      platform: 'youtube'
    },
    schema: {
      type: 'embeddedVideo',
      renderAs: 'embeddedVideo',
      label: 'Webinar Recording'
    },
    supportsMultiColumn: true
  }
];

export const AssetTypeReferenceModal: React.FC<AssetTypeReferenceModalProps> = ({
  isOpen,
  onClose,
  initialAssetType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string | null>(initialAssetType || null);
  const [expandedCode, setExpandedCode] = useState<Set<string>>(new Set());
  const [liveData, setLiveData] = useState<Record<string, any>>({});
  const [assetColumnLayouts, setAssetColumnLayouts] = useState<Record<string, 'single' | '2-col' | '3-col' | '70-30'>>({});

  const categories = ['All', 'Basic', 'Lists', 'Complex', 'Rich Content', 'Charts', 'Media'];

  // Initialize live data with example data
  useEffect(() => {
    const initialData: Record<string, any> = {};
    assetExamples.forEach(example => {
      initialData[example.type] = example.exampleData;
    });
    setLiveData(initialData);
  }, []);

  // Set search term to initial asset type when opened
  useEffect(() => {
    if (isOpen && initialAssetType) {
      setSearchTerm(initialAssetType);
      setActiveCategory('All');
      setSelectedType(initialAssetType);
    }
  }, [isOpen, initialAssetType]);

  const filteredExamples = assetExamples.filter(example => {
    const matchesSearch = example.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         example.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || example.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleCodeExpanded = (type: string) => {
    setExpandedCode(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const updateLiveData = (type: string, newData: any) => {
    setLiveData(prev => ({
      ...prev,
      [type]: newData
    }));
  };

  const resetLiveData = (type: string, exampleData: any) => {
    setLiveData(prev => ({
      ...prev,
      [type]: exampleData
    }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
            <div>
              <h2 className="text-2xl font-roobert-heavy text-white">Asset Type Reference</h2>
              <p className="text-sm text-white/80 font-roobert-regular mt-1">Complete guide to all 23 asset types</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search asset types..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fis-eggplant"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-lg text-sm font-roobert-medium transition-all ${
                      activeCategory === cat
                        ? 'bg-fis-eggplant text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {filteredExamples.map((example) => (
                <div
                  key={example.type}
                  id={`asset-${example.type}`}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    selectedType === example.type
                      ? 'border-fis-raspberry bg-fis-raspberry/5'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  }`}
                >
                  {/* Asset Type Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-roobert-heavy text-gray-900 dark:text-white">
                          {example.name}
                        </h3>
                        <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {example.type}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-fis-eggplant/10 text-fis-eggplant dark:text-fis-raspberry">
                          {example.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-regular mb-1">
                        {example.description}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 font-roobert-regular">
                        <span className="font-roobert-medium">Use case:</span> {example.useCase}
                      </p>
                    </div>
                  </div>

                  {/* Example Render */}
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Preview {(assetColumnLayouts[example.type] && assetColumnLayouts[example.type] !== 'single') && `(${assetColumnLayouts[example.type] === '2-col' ? '2 Columns' : assetColumnLayouts[example.type] === '3-col' ? '3 Columns' : '70/30 Split'})`}
                      </p>
                      
                      {/* Per-Asset Multi-Column Toggle */}
                      {example.supportsMultiColumn && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-roobert-regular text-gray-500 dark:text-gray-400">
                            Multi-Column:
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setAssetColumnLayouts(prev => ({ ...prev, [example.type]: 'single' }))}
                              className={`px-2 py-1 rounded text-xs font-roobert-medium transition-all ${
                                (!assetColumnLayouts[example.type] || assetColumnLayouts[example.type] === 'single')
                                  ? 'bg-fis-raspberry text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              1
                            </button>
                            <button
                              onClick={() => setAssetColumnLayouts(prev => ({ ...prev, [example.type]: '2-col' }))}
                              className={`px-2 py-1 rounded text-xs font-roobert-medium transition-all ${
                                assetColumnLayouts[example.type] === '2-col'
                                  ? 'bg-fis-raspberry text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              2
                            </button>
                            <button
                              onClick={() => setAssetColumnLayouts(prev => ({ ...prev, [example.type]: '3-col' }))}
                              className={`px-2 py-1 rounded text-xs font-roobert-medium transition-all ${
                                assetColumnLayouts[example.type] === '3-col'
                                  ? 'bg-fis-raspberry text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              3
                            </button>
                            <button
                              onClick={() => setAssetColumnLayouts(prev => ({ ...prev, [example.type]: '70-30' }))}
                              className={`px-2 py-1 rounded text-xs font-roobert-medium transition-all ${
                                assetColumnLayouts[example.type] === '70-30'
                                  ? 'bg-fis-raspberry text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              70/30
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {(!assetColumnLayouts[example.type] || assetColumnLayouts[example.type] === 'single') ? (
                      <RenderFactory
                        fieldKey={example.type}
                        schema={example.schema}
                        value={liveData[example.type] || example.exampleData}
                        onChange={() => {}}
                        mode="display"
                      />
                    ) : assetColumnLayouts[example.type] === '2-col' ? (
                      <div className="grid grid-cols-2 divide-x divide-fis-eggplant dark:divide-fis-raspberry">
                        <div className="pr-6">
                          <RenderFactory
                            fieldKey={example.type}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                        <div className="pl-6">
                          <RenderFactory
                            fieldKey={`${example.type}-2`}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                      </div>
                    ) : assetColumnLayouts[example.type] === '3-col' ? (
                      <div className="grid grid-cols-3 divide-x divide-fis-eggplant dark:divide-fis-raspberry">
                        <div className="pr-6">
                          <RenderFactory
                            fieldKey={example.type}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                        <div className="px-6">
                          <RenderFactory
                            fieldKey={`${example.type}-2`}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                        <div className="pl-6">
                          <RenderFactory
                            fieldKey={`${example.type}-3`}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-10 divide-x divide-fis-eggplant dark:divide-fis-raspberry">
                        <div className="col-span-7 pr-6">
                          <RenderFactory
                            fieldKey={example.type}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                        <div className="col-span-3 pl-6">
                          <RenderFactory
                            fieldKey={`${example.type}-2`}
                            schema={example.schema}
                            value={liveData[example.type] || example.exampleData}
                            onChange={() => {}}
                            mode="display"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* See Code Toggle */}
                  <button
                    onClick={() => toggleCodeExpanded(example.type)}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-roobert-medium text-gray-700 dark:text-gray-300"
                  >
                    See Code
                    {expandedCode.has(example.type) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  {/* Collapsible Code Section */}
                  <AnimatePresence>
                    {expandedCode.has(example.type) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {/* Schema Code Viewer */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Schema
                              </p>
                            </div>
                            <div className="flex-1 max-h-64 overflow-y-auto rounded-lg bg-gray-900 dark:bg-black p-4 border border-gray-700">
                              <pre className="text-xs font-mono text-green-400">
                                {JSON.stringify(example.schema, null, 2)}
                              </pre>
                            </div>
                          </div>

                          {/* Live Data Editor */}
                          <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Example Data
                              </p>
                              <button
                                onClick={() => resetLiveData(example.type, example.exampleData)}
                                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                title="Reset to default"
                              >
                                <RefreshCw className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                              </button>
                            </div>
                            <div className="flex-1 max-h-64 overflow-y-auto rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                              <textarea
                                value={JSON.stringify(liveData[example.type] || example.exampleData, null, 2)}
                                onChange={(e) => {
                                  try {
                                    const parsed = JSON.parse(e.target.value);
                                    updateLiveData(example.type, parsed);
                                  } catch {
                                    // Invalid JSON, don't update
                                  }
                                }}
                                className="w-full h-full p-4 text-xs font-mono bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none"
                                spellCheck={false}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {filteredExamples.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 font-roobert-regular">
                    No asset types found matching your search.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

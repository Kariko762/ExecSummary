import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Type, List, Grid, Layers, FileText, BarChart3 } from 'lucide-react';
import { RenderFactory } from '../../../src/renderers/RenderFactory';
import type { FieldSchema } from '../../../src/types/schema';

interface EngineAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = 'basic' | 'lists' | 'complex' | 'rich' | 'charts';

interface RenderExample {
  id: string;
  name: string;
  category: Category;
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
    description: 'Key-value pairs with labels',
    useCase: 'Metrics, data points with labels',
    schema: {
      renderAs: 'list',
      label: 'Key Metrics',
      helpText: 'Important performance indicators',
    },
    sampleData: {
      'Revenue Growth': '$2.5M',
      'Customer Satisfaction': '95%',
      'Team Velocity': '42 points',
    },
  },
  {
    id: 'listNoTitle',
    name: 'List (no labels)',
    category: 'lists',
    description: 'Simple bullet list without labels',
    useCase: 'Highlights, achievements, bullet points',
    schema: {
      renderAs: 'listNoTitle',
      label: 'Key Highlights',
      placeholder: 'Add highlight...',
    },
    sampleData: [
      'Completed Phase 1 ahead of schedule',
      'Achieved 95% user adoption rate',
      'Reduced operational costs by 30%',
    ],
  },

  // COMPLEX
  {
    id: 'metricCards',
    name: 'Metric Cards',
    category: 'complex',
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
    name: 'Object Form',
    category: 'complex',
    description: 'Form for nested object properties',
    useCase: 'Structured data, configurations, settings',
    schema: {
      renderAs: 'objectForm',
      label: 'Project Details',
      fields: {
        name: { renderAs: 'text', label: 'Project Name', required: true },
        budget: { renderAs: 'number', label: 'Budget (USD)' },
        description: { renderAs: 'textarea', label: 'Description' },
      },
    },
    sampleData: {
      name: 'Cloud Migration',
      budget: 500000,
      description: 'Migrate legacy systems to cloud infrastructure',
    },
  },
];

const CATEGORIES = [
  { id: 'basic' as Category, name: 'Basic Inputs', icon: Type, color: 'blue' },
  { id: 'lists' as Category, name: 'Lists', icon: List, color: 'green' },
  { id: 'complex' as Category, name: 'Complex', icon: Layers, color: 'purple' },
  { id: 'rich' as Category, name: 'Rich Content', icon: FileText, color: 'orange' },
  { id: 'charts' as Category, name: 'Charts', icon: BarChart3, color: 'pink' },
];

export const EngineAssetsModal: React.FC<EngineAssetsModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<Category>('basic');
  const [expandedSchemas, setExpandedSchemas] = useState<Set<string>>(new Set());

  const filteredExamples = EXAMPLES.filter(ex => ex.category === activeCategory);

  const toggleSchema = (id: string) => {
    const newExpanded = new Set(expandedSchemas);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSchemas(newExpanded);
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
                <Grid className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                Engine Assets
              </h2>
              <p style={{ fontSize: '0.75rem', marginTop: '0.125rem' }} className="text-gray-600 dark:text-gray-400">
                Display-only reference for all render types
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

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }} className="dark:border-gray-700">
            {CATEGORIES.map(cat => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem',
                    padding: '0.375rem 0.75rem',
                    borderRadius: '0.375rem',
                    border: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#4A1D6E' : '#f3f4f6',
                    color: isActive ? 'white' : '#374151'
                  }}
                  className={isActive ? '' : 'dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}
                >
                  <Icon style={{ width: '0.875rem', height: '0.875rem' }} />
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
            <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredExamples.map(example => (
                <div
                  key={example.id}
                  style={{ backgroundColor: '#ffffff', borderRadius: '0.5rem', border: '1px solid #e5e7eb', overflow: 'hidden' }}
                  className="dark:bg-gray-800 dark:border-gray-700"
                >
                  {/* Example Header */}
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }} className="dark:border-gray-700">
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '0.9375rem', fontWeight: 'bold', marginBottom: '0.125rem' }} className="text-gray-900 dark:text-white font-roobert-bold">
                        {example.name}
                      </h3>
                      <p style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }} className="text-gray-600 dark:text-gray-400">
                        {example.description}
                      </p>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.6875rem', padding: '0.125rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#f3f4f6' }} className="text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                        <span style={{ fontWeight: '500' }}>Use:</span>
                        <span>{example.useCase}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => toggleSchema(example.id)}
                      style={{ 
                        padding: '0.375rem 0.625rem', 
                        borderRadius: '0.375rem', 
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        fontSize: '0.6875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                      className="dark:bg-gray-700 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                    >
                      {expandedSchemas.has(example.id) ? 'Hide Schema' : 'Show Schema'}
                    </button>
                  </div>

                  {/* Live Display Example */}
                  <div style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.5rem', color: '#4A1D6E' }} className="dark:text-fis-raspberry font-roobert-bold">
                      Display Preview
                    </div>
                    <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.375rem', padding: '0.75rem', border: '1px solid #e5e7eb' }} className="dark:bg-gray-900/50 dark:border-gray-700">
                      <RenderFactory
                        fieldKey={example.id}
                        schema={example.schema}
                        value={example.sampleData}
                        mode="display"
                      />
                    </div>
                  </div>

                  {/* JSON Schema - Collapsible */}
                  {expandedSchemas.has(example.id) && (
                    <div style={{ padding: '0 1rem 0.75rem 1rem' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.025em', marginBottom: '0.5rem', color: '#6b7280' }} className="dark:text-gray-400 font-roobert-bold">
                        JSON Schema
                      </div>
                      <pre style={{ backgroundColor: '#1f2937', color: '#e5e7eb', borderRadius: '0.375rem', padding: '0.75rem', fontSize: '0.6875rem', overflowX: 'auto', margin: 0 }} className="dark:bg-black">
                        {JSON.stringify(example.schema, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default EngineAssetsModal;

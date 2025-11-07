/**
 * Schema Test Component
 * 
 * Tests that the schema definition correctly drives the rendering engine.
 * This proves the schema → RenderFactory → Renderer → UI flow works.
 */

import React, { useState } from 'react';
import { summarySchema } from '../schemas/summarySchema';
import { RenderFactory } from '../renderers/RenderFactory';

export const SchemaTest: React.FC = () => {
  // Sample data matching the schema structure
  const [testData, setTestData] = useState({
    metadata: {
      id: 'week-nov-07-2024',
      quarter: 'Nov 07',
      year: 2024,
      date: '2024-11-07',
      title: 'Test Executive Summary'
    },
    highlights: [
      'Successfully created schema-driven architecture',
      'Implemented design system for consistent styling',
      'Built 7 fully functional renderers'
    ],
    keyMetrics: {
      revenue: 2500000,
      growth: 15,
      customers: 1200,
      satisfaction: 92
    },
    activityMetrics: {
      demoStudio: {
        demosRegistered: 263,
        demosLinkedToDeals: 126,
        wonACV: 1230000,
        conversionRate: 48
      }
    }
  });

  const [mode, setMode] = useState<'display' | 'edit'>('display');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
              Schema Test
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Testing schema-driven rendering engine
            </p>
          </div>
          
          {/* Mode Toggle */}
          <button
            onClick={() => setMode(mode === 'display' ? 'edit' : 'display')}
            className="px-4 py-2 rounded-lg bg-fis-eggplant hover:bg-fis-eggplant/90 dark:bg-fis-raspberry dark:hover:bg-fis-raspberry/90 text-white font-roobert-medium transition-colors"
          >
            Switch to {mode === 'display' ? 'Edit' : 'Display'} Mode
          </button>
        </div>

        {/* Render all sections using schema */}
        <div className="space-y-6">
          {summarySchema.sections?.map((section) => {
            // Get data for this section
            const sectionData = testData[section.id as keyof typeof testData];
            
            // Skip if section is disabled or no data
            if (section.enabled === false || !sectionData) return null;

            return (
              <div
                key={section.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                {/* Section Header */}
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-roobert-semibold text-gray-900 dark:text-white">
                    {section.title}
                    {section.required && (
                      <span className="ml-2 text-xs text-red-500">*Required</span>
                    )}
                  </h2>
                  {section.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Render fields using RenderFactory */}
                <div className="space-y-4">
                  {Object.entries(section.fields || {}).map(([fieldKey, fieldSchema]) => (
                    <div key={fieldKey}>
                      <RenderFactory
                        fieldKey={fieldKey}
                        schema={fieldSchema as any}
                        value={sectionData[fieldKey as keyof typeof sectionData]}
                        onChange={(newValue) => {
                          setTestData({
                            ...testData,
                            [section.id]: {
                              ...sectionData,
                              [fieldKey]: newValue
                            }
                          });
                        }}
                        mode={mode}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* JSON Output (for debugging) */}
        <div className="mt-8 bg-gray-800 rounded-xl p-4">
          <h3 className="text-sm font-roobert-semibold text-gray-300 mb-2">
            Current Data (JSON):
          </h3>
          <pre className="text-xs text-green-400 font-mono overflow-auto max-h-96">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

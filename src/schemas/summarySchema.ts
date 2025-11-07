/**
 * Executive Summary Schema Definition
 * 
 * Defines the complete structure, render types, and validation rules
 * for executive summary content. Used by both CMS (edit mode) and
 * frontend (display mode) to generate consistent UIs.
 */

import { ContentSchema, FieldSchema } from '../types/schema';

export const summarySchema: ContentSchema = {
  id: 'executive-summary',
  title: 'Executive Summary',
  version: '1.0',
  
  sections: [
    // ==========================================
    // METADATA (Required, always visible)
    // ==========================================
    {
      id: 'metadata',
      title: 'Document Info',
      description: 'Basic information about this executive summary',
      required: true,
      enabled: true,
      locked: false,
      weight: 1,
      
      fields: {
        id: {
          label: 'Document ID',
          renderAs: 'text',
          required: true,
          placeholder: 'week-mmm-dd-yyyy',
          helpText: 'Unique identifier for this summary',
          validation: [
            { rule: 'required', message: 'Document ID is required' },
            { rule: 'pattern', value: '^[a-z0-9-]+$', message: 'Use lowercase letters, numbers, and hyphens only' }
          ]
        },
        quarter: {
          label: 'Quarter/Period',
          renderAs: 'text',
          required: true,
          placeholder: 'Oct 31',
          helpText: 'Display name for the period (e.g., "Oct 31", "Q3 2024")'
        },
        year: {
          label: 'Year',
          renderAs: 'number',
          required: true,
          placeholder: '2024',
          validation: [
            { rule: 'min', value: 2020 },
            { rule: 'max', value: 2030 }
          ]
        },
        date: {
          label: 'Report Date',
          renderAs: 'text',
          required: true,
          placeholder: 'YYYY-MM-DD',
          helpText: 'ISO format date (YYYY-MM-DD)'
        },
        title: {
          label: 'Title',
          renderAs: 'text',
          required: true,
          placeholder: 'Demo Services Group - Weekly Executive Update',
          helpText: 'Main title displayed at the top of the summary'
        }
      }
    },

    // ==========================================
    // KEY HIGHLIGHTS
    // ==========================================
    {
      id: 'highlights',
      title: 'Key Highlights',
      description: 'Major achievements and noteworthy items from this period',
      required: false,
      enabled: true,
      locked: false,
      weight: 2,
      
      fields: {
        highlights: {
          label: 'Highlights',
          renderAs: 'listNoTitle',
          helpText: 'Add key accomplishments, wins, or important updates. Use expressions like {{metric:demosRegistered}} to pull live data.',
          placeholder: 'Enter a highlight and press Enter',
          validation: [
            { rule: 'minItems', value: 1, message: 'Add at least one highlight' },
            { rule: 'maxItems', value: 10, message: 'Maximum 10 highlights recommended' }
          ]
        }
      }
    },

    // ==========================================
    // KEY METRICS (ARRAY)
    // ==========================================
    {
      id: 'keyMetrics',
      title: 'Key Metrics',
      description: 'Primary business metrics displayed as cards',
      required: false,
      enabled: true,
      locked: false,
      weight: 3,
      
      fields: {
        keyMetrics: {
          label: 'Key Metrics',
          renderAs: 'nestedCards',
          helpText: 'Add key business metrics. Each metric has a label, value, and optional type.',
          placeholder: 'Add a metric card',
          validation: [
            { rule: 'minItems', value: 1, message: 'Add at least one metric' },
            { rule: 'maxItems', value: 8, message: 'Maximum 8 metrics recommended' }
          ],
          fields: {
            label: {
              label: 'Label',
              renderAs: 'text',
              required: true,
              placeholder: 'Revenue'
            },
            value: {
              label: 'Value',
              renderAs: 'number',
              required: true,
              placeholder: '1230000'
            },
            type: {
              label: 'Type',
              renderAs: 'text',
              required: false,
              placeholder: 'currency | percentage | number',
              helpText: 'Optional: currency, percentage, or number'
            }
          }
        }
      }
    },

    // ==========================================
    // ACTIVITY METRICS (ARRAY)
    // ==========================================
    {
      id: 'activityMetrics',
      title: 'Activity Metrics',
      description: 'Detailed activity data organized by category',
      required: false,
      enabled: true,
      locked: false,
      weight: 4,
      
      fields: {
        activityMetrics: {
          label: 'Activity Metrics',
          renderAs: 'nestedCards',
          helpText: 'Add metric categories with nested metrics.',
          placeholder: 'Add a metric category',
          validation: [
            { rule: 'minItems', value: 1, message: 'Add at least one category' }
          ],
          fields: {
            category: {
              label: 'Category Name',
              renderAs: 'text',
              required: true,
              placeholder: 'Demo Studio'
            },
            metrics: {
              label: 'Metrics',
              renderAs: 'list',
              required: true,
              helpText: 'Metrics for this category',
              fields: {
                label: {
                  label: 'Metric Label',
                  renderAs: 'text',
                  required: true
                },
                value: {
                  label: 'Metric Value',
                  renderAs: 'number',
                  required: true
                }
              }
            }
          }
        }
      }
    },

    // ==========================================
    // TOP ASSETS
    // ==========================================
    {
      id: 'topAssets',
      title: 'Top Assets',
      description: 'Most frequently used demo assets',
      required: false,
      enabled: true,
      locked: false,
      weight: 5,
      
      fields: {
        topAssets: {
          label: 'Top Assets',
          renderAs: 'nestedCards',
          helpText: 'Add the most used demo assets with usage counts',
          fields: {
            name: {
              label: 'Asset Name',
              renderAs: 'text',
              required: true
            },
            count: {
              label: 'Usage Count',
              renderAs: 'number',
              required: true
            },
            category: {
              label: 'Category',
              renderAs: 'text',
              required: false,
              placeholder: 'Banking, Capital Markets, etc.'
            }
          }
        }
      }
    },

    // ==========================================
    // WEEKLY FOCUS
    // ==========================================
    {
      id: 'weeklyFocus',
      title: 'Weekly Focus',
      description: 'Key priorities and focus areas for this week',
      required: false,
      enabled: true,
      locked: false,
      weight: 6,
      
      fields: {
        weeklyFocus: {
          label: 'Focus Items',
          renderAs: 'listNoTitle',
          helpText: 'Add this week\'s key focus areas and priorities',
          placeholder: 'Enter a focus item and press Enter'
        }
      }
    },

    // ==========================================
    // DEPARTMENTS
    // ==========================================
    {
      id: 'departments',
      title: 'Department Performance',
      description: 'Performance data for each department',
      required: false,
      enabled: true,
      locked: false,
      weight: 7,
      
      fields: {
        departments: {
          label: 'Departments',
          renderAs: 'nestedCards',
          helpText: 'Add department performance data',
          fields: {
            name: {
              label: 'Department Name',
              renderAs: 'text',
              required: true
            },
            performance: {
              label: 'Performance Score',
              renderAs: 'number',
              required: true,
              helpText: 'Performance percentage (0-100)',
              validation: [
                { rule: 'min', value: 0 },
                { rule: 'max', value: 100 }
              ]
            },
            budget: {
              label: 'Budget',
              renderAs: 'number',
              required: false
            },
            headcount: {
              label: 'Headcount',
              renderAs: 'number',
              required: false
            },
            achievements: {
              label: 'Achievements',
              renderAs: 'list',
              required: false,
              helpText: 'Key achievements for this department'
            }
          }
        }
      }
    },

    // ==========================================
    // INITIATIVES
    // ==========================================
    {
      id: 'initiatives',
      title: 'Strategic Initiatives',
      description: 'Active strategic initiatives and their status',
      required: false,
      enabled: true,
      locked: false,
      weight: 8,
      
      fields: {
        initiatives: {
          label: 'Initiatives',
          renderAs: 'nestedCards',
          helpText: 'Add strategic initiative tracking data',
          fields: {
            name: {
              label: 'Initiative Name',
              renderAs: 'text',
              required: true
            },
            status: {
              label: 'Status',
              renderAs: 'text',
              required: true,
              helpText: 'on-track, at-risk, delayed, or completed'
            },
            progress: {
              label: 'Progress',
              renderAs: 'number',
              required: true,
              helpText: 'Completion percentage (0-100)',
              validation: [
                { rule: 'min', value: 0 },
                { rule: 'max', value: 100 }
              ]
            },
            owner: {
              label: 'Owner',
              renderAs: 'text',
              required: false
            },
            impact: {
              label: 'Impact',
              renderAs: 'text',
              required: false,
              helpText: 'high, medium, or low'
            }
          }
        }
      }
    },

    // ==========================================
    // ISSUES & BLOCKERS
    // ==========================================
    {
      id: 'issuesAndBlockers',
      title: 'Issues & Blockers',
      description: 'Current challenges and blocking items',
      required: false,
      enabled: true,
      locked: false,
      weight: 9,
      
      fields: {
        issuesAndBlockers: {
          label: 'Issues',
          renderAs: 'nestedCards',
          helpText: 'Document current issues and blockers',
          fields: {
            title: {
              label: 'Issue Title',
              renderAs: 'text',
              required: true
            },
            description: {
              label: 'Description',
              renderAs: 'textarea',
              required: true
            },
            severity: {
              label: 'Severity',
              renderAs: 'text',
              required: false,
              helpText: 'low, medium, high, or critical'
            },
            owner: {
              label: 'Owner',
              renderAs: 'text',
              required: false
            },
            status: {
              label: 'Status',
              renderAs: 'text',
              required: false,
              helpText: 'open, in-progress, or resolved'
            }
          }
        }
      }
    },

    // ==========================================
    // RISKS
    // ==========================================
    {
      id: 'risks',
      title: 'Risks & Mitigation',
      description: 'Identified risks and mitigation strategies',
      required: false,
      enabled: true,
      locked: false,
      weight: 10,
      
      fields: {
        risks: {
          label: 'Risks',
          renderAs: 'nestedCards',
          helpText: 'Document risks and their mitigation plans',
          fields: {
            title: {
              label: 'Risk Title',
              renderAs: 'text',
              required: true,
              placeholder: 'Brief risk name'
            },
            description: {
              label: 'Risk Description',
              renderAs: 'textarea',
              required: true,
              placeholder: 'Detailed description of the risk'
            },
            severity: {
              label: 'Severity',
              renderAs: 'text',
              required: true,
              helpText: 'low, medium, or high'
            },
            mitigation: {
              label: 'Mitigation Strategy',
              renderAs: 'textarea',
              required: true,
              placeholder: 'How are we addressing this risk?'
            },
            probability: {
              label: 'Probability',
              renderAs: 'text',
              required: false,
              helpText: 'low, medium, or high'
            }
          }
        }
      }
    },

    // ==========================================
    // OUTLOOK
    // ==========================================
    {
      id: 'outlook',
      title: 'Outlook',
      description: 'Forward-looking summary and next steps',
      required: false,
      enabled: true,
      locked: false,
      weight: 11,
      
      fields: {
        outlook: {
          label: 'Outlook',
          renderAs: 'textarea',
          helpText: 'Provide a forward-looking summary and key next steps',
          placeholder: 'Enter outlook and next steps...'
        }
      }
    }
  ]
};

/**
 * Helper function to get schema for a specific section
 */
export function getSectionSchema(sectionId: string): FieldSchema | undefined {
  const section = summarySchema.sections?.find(s => s.id === sectionId);
  return section as unknown as FieldSchema;
}

/**
 * Helper function to get all enabled sections
 */
export function getEnabledSections() {
  return summarySchema.sections?.filter(s => s.enabled !== false) || [];
}

/**
 * Helper function to get required sections
 */
export function getRequiredSections() {
  return summarySchema.sections?.filter(s => s.required === true) || [];
}

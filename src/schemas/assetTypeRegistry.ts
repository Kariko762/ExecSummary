/**
 * Asset Type Registry
 * 
 * Defines all available asset types and their rendering schemas.
 * This is NOT content-specific - it defines HOW to render each type,
 * not WHAT sections exist in a summary.
 * 
 * Architecture:
 * - Assets in Template Builder reference these types
 * - Templates save data with _<sectionId>_schema metadata
 * - EditorModalV2 reads the schema and uses RenderFactory
 */

export interface AssetTypeDefinition {
  type: string;
  label: string;
  description: string;
  category: 'basic' | 'lists' | 'complex' | 'rich' | 'charts';
  multiColumnSupported: boolean; // Can this asset be placed side-by-side with others?
  defaultSchema: any;
}

/**
 * Registry of all available asset types
 */
export const assetTypeRegistry: AssetTypeDefinition[] = [
  // ==========================================
  // BASIC TYPES
  // ==========================================
  {
    type: 'text',
    label: 'Text Field',
    description: 'Single line text input',
    category: 'basic',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'text',
      renderAs: 'text',
      required: false
    }
  },
  {
    type: 'textarea',
    label: 'Text Area',
    description: 'Multi-line text input',
    category: 'basic',
    multiColumnSupported: false,
    defaultSchema: {
      type: 'textarea',
      renderAs: 'textarea',
      required: false
    }
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric input',
    category: 'basic',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'number',
      renderAs: 'number',
      required: false
    }
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Date picker',
    category: 'basic',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'date',
      renderAs: 'date',
      required: false
    }
  },

  // ==========================================
  // LIST TYPES
  // ==========================================
  {
    type: 'list',
    label: 'Simple List',
    description: 'Array of text items',
    category: 'lists',
    multiColumnSupported: false,
    defaultSchema: {
      type: 'list',
      renderAs: 'list',
      required: false
    }
  },
  {
    type: 'listNoTitle',
    label: 'List (No Title)',
    description: 'Array of text items without section title',
    category: 'lists',
    multiColumnSupported: false,
    defaultSchema: {
      type: 'listNoTitle',
      renderAs: 'listNoTitle',
      required: false
    }
  },
  {
    type: 'nestedCards',
    label: 'Card List',
    description: 'Array of structured card objects',
    category: 'lists',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'nestedCards',
      renderAs: 'nestedCards',
      required: false,
      fields: {
        title: {
          label: 'Title',
          renderAs: 'text',
          required: false
        },
        value: {
          label: 'Value',
          renderAs: 'text',
          required: false
        }
      }
    }
  },

  // ==========================================
  // COMPLEX TYPES
  // ==========================================
  {
    type: 'object',
    label: 'Object',
    description: 'Nested object structure',
    category: 'complex',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'object',
      renderAs: 'object',
      required: false,
      fields: {}
    }
  },

  // ==========================================
  // RICH CONTENT
  // ==========================================
  {
    type: 'markdown',
    label: 'Markdown',
    description: 'Rich text with markdown support',
    category: 'rich',
    multiColumnSupported: false,
    defaultSchema: {
      type: 'markdown',
      renderAs: 'markdown',
      required: false
    }
  },
  {
    type: 'expression',
    label: 'Expression',
    description: 'Dynamic expression with template syntax',
    category: 'rich',
    multiColumnSupported: false,
    defaultSchema: {
      type: 'expression',
      renderAs: 'expression',
      required: false
    }
  },

  // ==========================================
  // CHART TYPES
  // ==========================================
  {
    type: 'pieChart',
    label: 'Pie Chart',
    description: 'Circular chart showing proportions',
    category: 'charts',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'pieChart',
      renderAs: 'pieChart',
      required: false,
      chartConfig: {
        dataKey: 'value',
        nameKey: 'name',
        colors: ['#6B1B5E', '#B21A53', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        showLegend: true,
        showTooltip: true,
        innerRadius: 0,
        outerRadius: 80
      },
      fields: {
        name: {
          label: 'Label',
          renderAs: 'text',
          required: true
        },
        value: {
          label: 'Value',
          renderAs: 'number',
          required: true
        }
      }
    }
  },
  {
    type: 'barChart',
    label: 'Bar Chart',
    description: 'Vertical or horizontal bar chart',
    category: 'charts',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'barChart',
      renderAs: 'barChart',
      required: false,
      chartConfig: {
        xAxisKey: 'name',
        yAxisKey: 'value',
        bars: [
          { dataKey: 'value', fill: '#6B1B5E', name: 'Value' }
        ],
        orientation: 'vertical',
        showGrid: true,
        showLegend: true,
        stacked: false
      },
      fields: {
        name: {
          label: 'Label',
          renderAs: 'text',
          required: true
        },
        value: {
          label: 'Value',
          renderAs: 'number',
          required: true
        }
      }
    }
  },
  {
    type: 'lineChart',
    label: 'Line Chart',
    description: 'Line graph for trends over time',
    category: 'charts',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'lineChart',
      renderAs: 'lineChart',
      required: false,
      chartConfig: {
        xAxisKey: 'name',
        lines: [
          { dataKey: 'value', stroke: '#6B1B5E', name: 'Value' }
        ],
        showGrid: true,
        showLegend: true,
        showDots: true,
        curved: true
      },
      fields: {
        name: {
          label: 'Label',
          renderAs: 'text',
          required: true
        },
        value: {
          label: 'Value',
          renderAs: 'number',
          required: true
        }
      }
    }
  },
  {
    type: 'radialChart',
    label: 'Radial Chart',
    description: 'Circular progress/donut chart',
    category: 'charts',
    multiColumnSupported: true,
    defaultSchema: {
      type: 'radialChart',
      renderAs: 'radialChart',
      required: false,
      chartConfig: {
        dataKey: 'value',
        maxValue: 100,
        colors: ['#6B1B5E', '#B21A53'],
        showPercentage: true,
        thickness: 20
      },
      fields: {
        name: {
          label: 'Label',
          renderAs: 'text',
          required: true
        },
        value: {
          label: 'Value',
          renderAs: 'number',
          required: true
        }
      }
    }
  }
];

/**
 * Get asset type definition by type name
 */
export function getAssetType(type: string): AssetTypeDefinition | undefined {
  return assetTypeRegistry.find(asset => asset.type === type);
}

/**
 * Get all asset types in a category
 */
export function getAssetTypesByCategory(category: string): AssetTypeDefinition[] {
  return assetTypeRegistry.filter(asset => asset.category === category);
}

/**
 * Build a complete field schema for a section based on its type
 */
export function buildFieldSchema(type: string, customFields?: any): any {
  const assetType = getAssetType(type);
  if (!assetType) {
    console.warn(`Unknown asset type: ${type}`);
    return { type: 'text', renderAs: 'text' };
  }

  return {
    ...assetType.defaultSchema,
    ...customFields
  };
}

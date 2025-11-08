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
  category: 'basic' | 'lists' | 'complex' | 'rich';
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
    defaultSchema: {
      type: 'expression',
      renderAs: 'expression',
      required: false
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

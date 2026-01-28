/**
 * Validation Schema for Content Types (cms-admin)
 * Mirrors main app validation logic for editor validation
 */

export interface ValidationRule {
  field: string;
  check: (data: any, content?: any, sectionKey?: string) => boolean;
  message: (data: any, content?: any, sectionKey?: string) => string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

export interface TypeValidation {
  type: string;
  rules: ValidationRule[];
}

export const validationSchemas: Record<string, TypeValidation> = {
  list: {
    type: 'list',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} items`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} list items found`
          : '✗ Array is empty',
        severity: 'success'
      },
      {
        field: 'Item Type',
        check: (data) => Array.isArray(data) && data.every(item => typeof item === 'string'),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const allStrings = data.every(item => typeof item === 'string');
          return allStrings ? '✓ All items are strings' : '⚠ Contains non-string items';
        },
        severity: 'success'
      }
    ]
  },

  listNoTitle: {
    type: 'listNoTitle',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} items`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} list items found`
          : '✗ Array is empty',
        severity: 'success'
      },
      {
        field: 'Item Type',
        check: (data) => Array.isArray(data) && data.every(item => typeof item === 'string'),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const allStrings = data.every(item => typeof item === 'string');
          return allStrings ? '✓ All items are strings' : '⚠ Contains non-string items';
        },
        severity: 'success'
      }
    ]
  },

  textarea: {
    type: 'textarea',
    rules: [
      {
        field: 'Data Type',
        check: (data) => typeof data === 'string',
        message: (data) => typeof data === 'string'
          ? `✓ String (${data.length} characters)`
          : `✗ Expected string, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => typeof data === 'string' && data.trim().length > 0,
        message: (data) => (typeof data === 'string' && data.trim().length > 0)
          ? `✓ Content present (${data.trim().length} chars)`
          : '⚠ Empty or whitespace only',
        severity: 'success'
      }
    ]
  },

  text: {
    type: 'text',
    rules: [
      {
        field: 'Data Type',
        check: (data) => typeof data === 'string',
        message: (data) => typeof data === 'string'
          ? `✓ String (${data.length} characters)`
          : `✗ Expected string, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => typeof data === 'string' && data.trim().length > 0,
        message: (data) => (typeof data === 'string' && data.trim().length > 0)
          ? `✓ Content present`
          : '⚠ Empty or whitespace only',
        severity: 'success'
      }
    ]
  },

  number: {
    type: 'number',
    rules: [
      {
        field: 'Data Type',
        check: (data) => typeof data === 'number' || !isNaN(Number(data)),
        message: (data) => (typeof data === 'number' || !isNaN(Number(data)))
          ? `✓ Valid number: ${data}`
          : `✗ Expected number, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Value',
        check: (data) => data !== null && data !== undefined,
        message: (data) => (data !== null && data !== undefined)
          ? `✓ Value: ${data}`
          : '✗ Missing value',
        severity: 'success'
      }
    ]
  },

  nestedCards: {
    type: 'nestedCards',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} cards`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} card(s) found`
          : '⚠ No cards defined',
        severity: 'success'
      },
      {
        field: 'Card Structure',
        check: (data) => Array.isArray(data) && data.every(item => typeof item === 'object' && item !== null),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const allObjects = data.every(item => typeof item === 'object' && item !== null);
          return allObjects ? '✓ All items are objects' : '✗ Contains non-object items';
        },
        severity: 'success'
      },
      {
        field: 'Fields Schema',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey!}_fields`],
        message: (_data, content, sectionKey) => {
          const fields = content![`_${sectionKey!}_fields`];
          return fields
            ? `✓ Schema defined: ${Object.keys(fields).length} fields`
            : '⚠ Missing _fields metadata';
        },
        severity: 'success'
      }
    ]
  },

  objectForm: {
    type: 'metricCards',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} metrics`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} metric(s) found`
          : '⚠ No metrics defined',
        severity: 'success'
      },
      {
        field: 'Metric Structure',
        check: (data) => Array.isArray(data) && data.every(item => 
          typeof item === 'object' && item !== null && ('label' in item || 'value' in item)
        ),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const validStructure = data.every(item => 
            typeof item === 'object' && item !== null && ('label' in item || 'value' in item)
          );
          return validStructure ? '✓ All metrics have label/value' : '⚠ Some metrics missing label/value';
        },
        severity: 'success'
      },
      {
        field: 'Fields Schema',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey!}_fields`],
        message: (_data, content, sectionKey) => {
          const fields = content![`_${sectionKey!}_fields`];
          return fields ? `✓ Schema defined: ${Object.keys(fields).length} fields` : '⚠ Missing _fields metadata';
        },
        severity: 'success'
      }
    ]
  },

  pieChart: {
    type: 'pieChart',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} data points`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} data point(s)`
          : '⚠ No data points',
        severity: 'success'
      },
      {
        field: 'Chart Data Structure',
        check: (data) => Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 'name' in item && 'value' in item
        ),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const validStructure = data.every(item => 
            typeof item === 'object' && 'name' in item && 'value' in item
          );
          return validStructure ? '✓ All items have name & value' : '⚠ Missing name/value in some items';
        },
        severity: 'success'
      }
    ]
  },

  metricCards: {
    type: 'metricCards',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} data points`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} data point(s)`
          : '⚠ No data points',
        severity: 'success'
      },
      {
        field: 'Chart Data Structure',
        check: (data) => Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 'name' in item && 'value' in item
        ),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const validStructure = data.every(item => 
            typeof item === 'object' && 'name' in item && 'value' in item
          );
          return validStructure ? '✓ All items have name & value' : '⚠ Missing name/value in some items';
        },
        severity: 'success'
      },
      {
        field: 'Chart Config',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey}_chartConfig`],
        message: (_data, content, sectionKey) => {
          const config = content![`_${sectionKey}_chartConfig`];
          return config ? '✓ Chart config defined' : '⚠ Missing _chartConfig metadata';
        },
        severity: 'success'
      }
    ]
  },

  barChart: {
    type: 'barChart',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} data points`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} data point(s)`
          : '⚠ No data points',
        severity: 'success'
      },
      {
        field: 'Chart Data Structure',
        check: (data) => Array.isArray(data) && data.every(item => typeof item === 'object'),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const allObjects = data.every(item => typeof item === 'object');
          return allObjects ? '✓ Valid chart data structure' : '⚠ Invalid data structure';
        },
        severity: 'success'
      },
      {
        field: 'Chart Config',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey}_chartConfig`],
        message: (_data, content, sectionKey) => {
          const config = content![`_${sectionKey}_chartConfig`];
          return config ? '✓ Chart config defined' : '⚠ Missing _chartConfig metadata';
        },
        severity: 'success'
      }
    ]
  },

  lineChart: {
    type: 'lineChart',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} data points`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} data point(s)`
          : '⚠ No data points',
        severity: 'success'
      },
      {
        field: 'Chart Data Structure',
        check: (data) => Array.isArray(data) && data.every(item => typeof item === 'object'),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const allObjects = data.every(item => typeof item === 'object');
          return allObjects ? '✓ Valid chart data structure' : '⚠ Invalid data structure';
        },
        severity: 'success'
      },
      {
        field: 'Chart Config',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey}_chartConfig`],
        message: (_data, content, sectionKey) => {
          const config = content![`_${sectionKey}_chartConfig`];
          return config ? '✓ Chart config defined' : '⚠ Missing _chartConfig metadata';
        },
        severity: 'success'
      }
    ]
  },

  radialChart: {
    type: 'radialChart',
    rules: [
      {
        field: 'Data Type',
        check: (data) => Array.isArray(data),
        message: (data) => Array.isArray(data)
          ? `✓ Array with ${data.length} data points`
          : `✗ Expected Array, got ${typeof data}`,
        severity: 'success'
      },
      {
        field: 'Content',
        check: (data) => Array.isArray(data) && data.length > 0,
        message: (data) => (Array.isArray(data) && data.length > 0)
          ? `✓ ${data.length} data point(s)`
          : '⚠ No data points',
        severity: 'success'
      },
      {
        field: 'Chart Data Structure',
        check: (data) => Array.isArray(data) && data.every(item => 
          typeof item === 'object' && 'name' in item && 'value' in item
        ),
        message: (data) => {
          if (!Array.isArray(data)) return '⚠ Not an array';
          const validStructure = data.every(item => 
            typeof item === 'object' && 'name' in item && 'value' in item
          );
          return validStructure ? '✓ All items have name & value' : '⚠ Missing name/value in some items';
        },
        severity: 'success'
      },
      {
        field: 'Chart Config',
        check: (_data, content, sectionKey) => !!content![`_${sectionKey}_chartConfig`],
        message: (_data, content, sectionKey) => {
          const config = content![`_${sectionKey}_chartConfig`];
          return config ? '✓ Chart config defined' : '⚠ Missing _chartConfig metadata';
        },
        severity: 'success'
      }
    ]
  }
};

export function getValidationSchema(type: string): TypeValidation | null {
  return validationSchemas[type] || null;
}

export function validateSection(
  sectionKey: string,
  sectionData: any,
  sectionType: string,
  content: any
): Array<{ field: string; message: string; severity: 'success' | 'error' | 'warning' | 'info' }> {
  const schema = getValidationSchema(sectionType);

  if (!schema) {
    return [{
      field: 'Schema',
      message: `⚠ No validation schema found for type: ${sectionType}`,
      severity: 'warning'
    }];
  }

  return schema.rules.map(rule => {
    const passed = rule.check(sectionData, content, sectionKey);
    const message = rule.message(sectionData, content, sectionKey);
    return {
      field: rule.field,
      message,
      severity: passed ? 'success' : (rule.severity === 'success' ? 'error' : rule.severity)
    };
  });
}

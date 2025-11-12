// Schema-driven renderer type definitions

export type RenderType = 
  | 'text'              // Simple text input
  | 'textarea'          // Multi-line text
  | 'number'            // Numeric input
  | 'list'              // Array with add/remove (like highlights)
  | 'listNoTitle'       // List without section header
  | 'keyValueList'      // Dynamic key-value pairs with custom labels
  | 'metricCards'       // Grid of metric cards
  | 'nestedCards'       // Array of objects as cards (departments)
  | 'object'            // Object with labeled fields (alias for objectForm)
  | 'objectForm'        // Object with labeled fields
  | 'richText'          // WYSIWYG editor
  | 'dateRange'         // Timeline/date picker
  | 'statusBadge'       // Dropdown with badge preview
  | 'progressBar'       // Number with visual bar
  | 'pieChart'          // Pie chart visualization
  | 'barChart'          // Bar chart visualization
  | 'lineChart'         // Line chart visualization
  | 'radialChart'       // Radial/donut chart
  | 'codeBlock'         // Code block with syntax highlighting
  | 'quote'             // Blockquote with glassmorphism styling
  | 'hr'                // Horizontal rule/divider
  | 'spacer'            // Empty space for layout control
  | 'expression'        // Expression with icon support
  | 'image'             // Image upload/display
  | 'video'             // Video upload/display
  | 'embeddedVideo'     // Embedded video URL
  | 'statusBoard';      // Table layout

export type ValidationRule = {
  rule: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value?: any;
  message?: string;
  validator?: (value: any) => boolean;
};

export interface ChartConfig {
  // Common chart properties
  dataKey?: string;
  nameKey?: string;
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
  showLegend?: boolean;
  showTooltip?: boolean;
  showGrid?: boolean;
  responsive?: boolean;
  
  // Pie Chart specific
  innerRadius?: number;
  outerRadius?: number;
  
  // Bar Chart specific
  bars?: Array<{
    dataKey: string;
    fill: string;
    name: string;
  }>;
  orientation?: 'vertical' | 'horizontal';
  stacked?: boolean;
  
  // Line Chart specific
  lines?: Array<{
    dataKey: string;
    stroke: string;
    name: string;
  }>;
  showDots?: boolean;
  curved?: boolean;
  
  // Radial Chart specific
  maxValue?: number;
  showPercentage?: boolean;
  thickness?: number;
}

export interface HRConfig {
  thickness?: number;       // Line thickness in pixels (default: 1)
  color?: string;          // Line color (default: #E5E7EB)
  marginTop?: number;      // Top margin in pixels (default: 24)
  marginBottom?: number;   // Bottom margin in pixels (default: 24)
  style?: 'solid' | 'dashed' | 'dotted';  // Line style (default: solid)
}

export interface FieldSchema {
  renderAs: RenderType;
  label?: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  weight?: number;
  enabled?: boolean;
  required?: boolean;
  validation?: ValidationRule[];
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  
  // For sections
  id?: string;
  title?: string;
  description?: string;
  locked?: boolean;
  
  // For nested structures (objects)
  fields?: Record<string, FieldSchema>;
  
  // For arrays
  itemSchema?: FieldSchema;
  minItems?: number;
  maxItems?: number;
  
  // For charts
  chartConfig?: ChartConfig;
  
  // For horizontal rules
  hrConfig?: HRConfig;
  
  // For conditional rendering
  showIf?: (data: any) => boolean;
  
  // For grouping fields
  group?: string;
}

export interface SectionSchema extends FieldSchema {
  id: string;
  title: string;
  description?: string;
  required?: boolean;
  enabled?: boolean;
  locked?: boolean;
  weight?: number;
  interAssetBorder?: boolean; // Show vertical borders between assets in multi-column layouts
  fields: Record<string, FieldSchema>;
}

export interface ContentSchema {
  id: string;
  title: string;
  version: string;
  sections?: SectionSchema[];
}

export interface SchemaDefinition {
  type: 'summaries' | 'executive-iq' | 'organizations' | 'performance';
  version: string;
  schema: ContentSchema;
  metadata?: {
    title?: string;
    description?: string;
    icon?: string;
  };
}

// Render mode for components
export type RenderMode = 'edit' | 'display' | 'preview';

// Props interface for renderers
export interface RendererProps {
  fieldKey: string;
  schema: FieldSchema;
  value: any;
  onChange?: (value: any) => void;
  mode: RenderMode;
  disabled?: boolean;
  error?: string;
}

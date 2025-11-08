import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Trash2, GripVertical, ChevronRight, ChevronDown, 
  Type, List, Grid, Layers, FileText, BarChart3, Settings,
  Eye, Code, Save, Download, Upload, PlayCircle, TrendingUp
} from 'lucide-react';
import type { FieldSchema } from '../../../src/types/schema';
import EditorModalV2 from './EditorModalV2';

interface TemplateBuilderProps {
  onBack: () => void;
}

interface TemplateSection {
  id: string;
  name: string;
  expanded: boolean;
  fields: TemplateField[];
  columnSpan?: number; // 1-4 columns for grid layout
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
}

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
        schema: { type: 'text', label: 'New Text Field' }
      },
      {
        id: 'textarea',
        name: 'Text Area',
        renderType: 'textarea',
        description: 'Multi-line text input',
        schema: { type: 'textarea', label: 'New Text Area', rows: 3 }
      },
      {
        id: 'number',
        name: 'Number',
        renderType: 'number',
        description: 'Numeric input',
        schema: { type: 'number', label: 'New Number' }
      },
      {
        id: 'date',
        name: 'Date Picker',
        renderType: 'date',
        description: 'Date selection',
        schema: { type: 'date', label: 'New Date' }
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
        name: 'Simple List',
        renderType: 'array',
        description: 'Basic array of items',
        schema: { type: 'array', label: 'New List', itemSchema: { type: 'text' } }
      },
      {
        id: 'nestedCards',
        name: 'Card List',
        renderType: 'nestedCards',
        description: 'Array of card objects',
        schema: { 
          type: 'nestedCards', 
          label: 'New Cards',
          itemSchema: {
            type: 'object',
            fields: {
              title: { type: 'text', label: 'Title' },
              value: { type: 'text', label: 'Value' }
            }
          }
        }
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
          label: 'New Object',
          fields: {}
        }
      },
      {
        id: 'keyValue',
        name: 'Key-Value Pair',
        renderType: 'keyValue',
        description: 'Key and value fields',
        schema: { 
          type: 'keyValue', 
          label: 'New Key-Value',
          keyLabel: 'Key',
          valueLabel: 'Value'
        }
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
        renderType: 'markdown',
        description: 'Rich markdown content',
        schema: { type: 'markdown', label: 'New Markdown' }
      },
      {
        id: 'expression',
        name: 'Expression',
        renderType: 'expression',
        description: 'Dynamic expressions',
        schema: { type: 'expression', label: 'New Expression' }
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
          type: 'pieChart', 
          label: 'New Pie Chart',
          renderAs: 'pieChart',
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
            name: { label: 'Label', renderAs: 'text', required: true },
            value: { label: 'Value', renderAs: 'number', required: true }
          }
        }
      },
      {
        id: 'barChart',
        name: 'Bar Chart',
        renderType: 'barChart',
        description: 'Vertical or horizontal bars',
        schema: { 
          type: 'barChart', 
          label: 'New Bar Chart',
          renderAs: 'barChart',
          chartConfig: {
            xAxisKey: 'name',
            bars: [{ dataKey: 'value', fill: '#6B1B5E', name: 'Value' }],
            orientation: 'vertical',
            showGrid: true,
            showLegend: true,
            stacked: false
          },
          fields: {
            name: { label: 'Label', renderAs: 'text', required: true },
            value: { label: 'Value', renderAs: 'number', required: true }
          }
        }
      },
      {
        id: 'lineChart',
        name: 'Line Chart',
        renderType: 'lineChart',
        description: 'Trend lines over time',
        schema: { 
          type: 'lineChart', 
          label: 'New Line Chart',
          renderAs: 'lineChart',
          chartConfig: {
            xAxisKey: 'name',
            lines: [{ dataKey: 'value', stroke: '#6B1B5E', name: 'Value' }],
            showGrid: true,
            showLegend: true,
            showDots: true,
            curved: true
          },
          fields: {
            name: { label: 'Label', renderAs: 'text', required: true },
            value: { label: 'Value', renderAs: 'number', required: true }
          }
        }
      },
      {
        id: 'radialChart',
        name: 'Radial Chart',
        renderType: 'radialChart',
        description: 'Circular progress/donut',
        schema: { 
          type: 'radialChart', 
          label: 'New Radial Chart',
          renderAs: 'radialChart',
          chartConfig: {
            dataKey: 'value',
            maxValue: 100,
            colors: ['#6B1B5E', '#B21A53'],
            showPercentage: true,
            thickness: 20
          },
          fields: {
            name: { label: 'Label', renderAs: 'text', required: true },
            value: { label: 'Value', renderAs: 'number', required: true }
          }
        }
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
          type: 'hr', 
          label: 'Divider',
          renderAs: 'hr',
          hrConfig: {
            thickness: 1,
            color: '#E5E7EB',
            marginTop: 24,
            marginBottom: 24,
            style: 'solid'
          }
        }
      }
    ]
  }
];

export default function TemplateBuilder({ onBack }: TemplateBuilderProps) {
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
          schema: { type: 'text', label: 'ID', placeholder: 'Auto-generated' }
        },
        {
          id: 'field-quarter',
          key: 'quarter',
          label: 'Quarter',
          renderType: 'text',
          schema: { type: 'text', label: 'Quarter', placeholder: 'e.g., Q1, Jan 15' }
        },
        {
          id: 'field-year',
          key: 'year',
          label: 'Year',
          renderType: 'number',
          schema: { type: 'number', label: 'Year' }
        },
        {
          id: 'field-date',
          key: 'date',
          label: 'Date',
          renderType: 'date',
          schema: { type: 'date', label: 'Date' }
        },
        {
          id: 'field-title',
          key: 'title',
          label: 'Title',
          renderType: 'text',
          schema: { type: 'text', label: 'Title', placeholder: 'Organization - Weekly Executive Update' }
        }
      ]
    }
  ]);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('basic');
  const [draggedAsset, setDraggedAsset] = useState<AssetItem | null>(null);
  const [draggedField, setDraggedField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<{ sectionId: string; fieldId: string } | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResults, setValidationResults] = useState<Array<{check: string; passed: boolean; message: string}>>([]);
  const [validationPassed, setValidationPassed] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState<string>('');
  const [saveTemplateDescription, setSaveTemplateDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [schemaPropertiesOpen, setSchemaPropertiesOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showLoadTemplateModal, setShowLoadTemplateModal] = useState(false);
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [showTestEditor, setShowTestEditor] = useState(false);
  const [testData, setTestData] = useState<any>(null);
  
  // Standard header default values
  const [headerDefaults, setHeaderDefaults] = useState({
    id: 'template-new',
    quarter: 'Month Day',
    year: new Date().getFullYear(),
    date: new Date().toISOString().split('T')[0],
    title: 'Your Organization Name - Weekly Executive Update'
  });

  const selectedCategory = ASSET_LIBRARY.find(cat => cat.id === selectedCategoryId);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

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
  const loadTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/templates/${templateId}`);
      const result = await response.json();
      
      if (!result.success) throw new Error('Failed to load template');
      
      const templateData = result.template;
      const newSections: TemplateSection[] = [];
      
      // Always add standard header first
      newSections.push({
        id: 'section-header',
        name: 'Standard Header',
        expanded: false,
        fields: [
          { id: 'field-id', key: 'id', label: 'ID', renderType: 'text', schema: { type: 'text', label: 'ID', placeholder: templateData.id || 'Auto-generated' } },
          { id: 'field-quarter', key: 'quarter', label: 'Quarter', renderType: 'text', schema: { type: 'text', label: 'Quarter', placeholder: templateData.quarter || 'e.g., Q1, Jan 15' } },
          { id: 'field-year', key: 'year', label: 'Year', renderType: 'number', schema: { type: 'number', label: 'Year' } },
          { id: 'field-date', key: 'date', label: 'Date', renderType: 'date', schema: { type: 'date', label: 'Date' } },
          { id: 'field-title', key: 'title', label: 'Title', renderType: 'text', schema: { type: 'text', label: 'Title', placeholder: templateData.title || 'Organization - Weekly Executive Update' } }
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
      
      // Convert template data sections back to builder format
      Object.keys(templateData).forEach(key => {
        if (key.startsWith('_') || ['id', 'quarter', 'year', 'date', 'title', 'status', 'protectionEnabled'].includes(key)) {
          return; // Skip metadata
        }
        
        const sectionType = templateData[`_${key}_type`];
        const sectionFields = templateData[`_${key}_fields`];
        const sectionColumnSpan = templateData[`_${key}_columnSpan`];
        const exampleData = templateData[key];
        
        if (sectionType) {
          const field: Field = {
            id: `field-${Date.now()}`,
            key: key,
            label: formatSectionTitle(key),
            renderType: sectionType,
            schema: {
              type: sectionType,
              label: formatSectionTitle(key),
              ...(sectionFields && { itemSchema: { type: 'object', fields: sectionFields } })
            },
            exampleData: exampleData
          };
          
          newSections.push({
            id: `section-${Date.now()}-${key}`,
            name: formatSectionTitle(key),
            expanded: true,
            fields: [field],
            columnSpan: sectionColumnSpan || 1 // Load columnSpan from metadata
          });
        }
      });
      
      setSections(newSections);
      setShowLoadTemplateModal(false);
      setNotification({ type: 'success', message: `Template loaded! You can now edit and save as a new template.` });
      
    } catch (error) {
      console.error('Failed to load template:', error);
      setNotification({ type: 'error', message: 'Failed to load template' });
    }
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .split(/(?=[A-Z])|_|-/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate test data from current template for EditorModalV2
  const handleTestInEditor = async () => {
    const templateData = await performSave(true); // Get template JSON without saving
    console.log('Generated template data for testing:', templateData);
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

  // Drop handler for section
  const handleSectionDrop = (sectionId: string) => {
    if (draggedAsset) {
      // Add new field from asset
      const newField: TemplateField = {
        id: `field-${Date.now()}`,
        key: draggedAsset.id + '_' + Date.now(),
        label: draggedAsset.schema.label || draggedAsset.name,
        renderType: draggedAsset.renderType,
        schema: { ...draggedAsset.schema }
      };

      setSections(prev => prev.map(section => 
        section.id === sectionId
          ? { ...section, fields: [...section.fields, newField] }
          : section
      ));
    } else if (draggedField) {
      // Reorder existing field
      // TODO: Implement field reordering logic
    }
    
    setDragOverSection(null);
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    setDragOverSection(sectionId);
  };

  const handleSectionDragLeave = () => {
    setDragOverSection(null);
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
    e.stopPropagation();
    
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
    const newSection: TemplateSection = {
      id: `section-${Date.now()}`,
      name: `Section ${sections.length + 1}`,
      expanded: true,
      fields: []
    };
    setSections([...sections, newSection]);
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
      setNotification({ type: 'error', message: 'Cannot remove the standard header section' });
      return;
    }
    if (window.confirm('Remove this section and all its fields?')) {
      setSections(prev => prev.filter(s => s.id !== sectionId));
    }
  };

  // Add HR divider as a section
  const addHorizontalRule = () => {
    const hrSection: TemplateSection = {
      id: `hr-${Date.now()}`,
      name: `Divider ${sections.filter(s => s.fields[0]?.renderType === 'hr').length + 1}`,
      expanded: false,
      columnSpan: 4, // Full width by default
      fields: [{
        id: `hr-field-${Date.now()}`,
        key: `divider${Date.now()}`,
        label: 'Horizontal Rule',
        renderType: 'hr',
        schema: {
          type: 'hr',
          label: 'Divider',
          renderAs: 'hr',
          hrConfig: {
            thickness: 1,
            color: '#E5E7EB',
            marginTop: 24,
            marginBottom: 24,
            style: 'solid'
          }
        } as any
      }]
    };
    setSections([...sections, hrSection]);
    setNotification({ type: 'success', message: 'Horizontal rule added' });
  };

  // Field management
  const removeField = (sectionId: string, fieldId: string) => {
    if (sectionId === 'section-header') {
      setNotification({ type: 'error', message: 'Cannot remove required header fields' });
      return;
    }
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(f => f.id !== fieldId) }
        : section
    ));
    if (selectedField?.fieldId === fieldId) {
      setSelectedField(null);
    }
  };

  const updateFieldProperty = (sectionId: string, fieldId: string, property: string, value: any) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId
                ? property === 'key' || property === 'label' || property === 'exampleData'
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
      setNotification({ type: 'error', message: 'Please add at least one field to your template' });
      return;
    }
    setShowSaveModal(true);
  };

  // Start save process with validation
  const saveTemplate = () => {
    if (!saveTemplateName.trim()) {
      setNotification({ type: 'error', message: 'Please enter a template name' });
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
          section.fields.forEach(field => {
            const fieldType = field.schema.type;
            
            // Save minimal schema metadata - just type and custom fields
            templateData[`_${sectionKey}_type`] = fieldType;
            
            // Only save custom field definitions if they exist (for nestedCards, complex types)
            if (field.schema.itemSchema?.fields) {
              templateData[`_${sectionKey}_fields`] = field.schema.itemSchema.fields;
            }
            
            if (fieldType === 'nestedCards') {
              // Use exampleData if provided, otherwise create default
              if (field.exampleData && field.exampleData.length > 0) {
                templateData[sectionKey] = field.exampleData;
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
                templateData[sectionKey] = [exampleItem];
              }
            } else if (fieldType === 'list' || fieldType === 'listNoTitle') {
              // Use exampleData if provided, otherwise create default
              if (field.exampleData && field.exampleData.length > 0) {
                templateData[sectionKey] = field.exampleData;
              } else {
                templateData[sectionKey] = [`Example ${field.schema.label || section.name} item`];
              }
            } else if (fieldType === 'number') {
              templateData[sectionKey] = 0;
            } else if (fieldType === 'date') {
              templateData[sectionKey] = new Date().toISOString().split('T')[0];
            } else if (fieldType === 'textarea') {
              templateData[sectionKey] = `Example: ${field.schema.placeholder || field.schema.label || section.name}`;
            } else {
              // Default: text field
              templateData[sectionKey] = field.schema.placeholder || '';
            }
          });
          
          // Enable the section by default
          templateData[`_enabled_${sectionKey}`] = true;
          templateData[`_completed_${sectionKey}`] = false;
          
          // Add column span if specified (defaults to 1 if not set)
          if (section.columnSpan) {
            templateData[`_${sectionKey}_columnSpan`] = section.columnSpan;
          }
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
        setNotification({ type: 'success', message: `Template "${saveTemplateName}" saved successfully!` });
        setSaveTemplateName('');
        setSaveTemplateDescription('');
        setValidationResults([]);
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      setNotification({ type: 'error', message: 'Failed to save template: ' + (error as Error).message });
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
                onClick={onBack}
                className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-roobert-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
              >
                ← Back to CMS
              </button>
              <div>
                <h1 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white flex items-center gap-3">
                  <Grid className="w-7 h-7 text-fis-raspberry" />
                  Template Builder
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop assets to build your template
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
                onClick={handleTestInEditor}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <PlayCircle className="w-4 h-4" />
                Test in Editor
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-roobert-medium transition-colors">
                <Eye className="w-4 h-4" />
                Preview
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

            {/* Category Tabs */}
            <div className="flex flex-col gap-1 mb-4">
              {ASSET_LIBRARY.map(category => {
                const Icon = category.icon;
                const isActive = category.id === selectedCategoryId;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-roobert-medium transition-all ${
                      isActive
                        ? 'bg-fis-eggplant text-white shadow-md'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Assets in Selected Category */}
            <div className="space-y-2">
              {selectedCategory?.assets.map(asset => {
                const isLayoutAsset = selectedCategoryId === 'layout';
                
                if (isLayoutAsset) {
                  // Layout assets get an "Add" button instead of drag
                  return (
                    <div
                      key={asset.id}
                      className="p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                        <button
                          onClick={addHorizontalRule}
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
                  draggable
                  onDragStart={() => handleAssetDragStart(asset)}
                  onDragEnd={handleAssetDragEnd}
                  className="p-3 rounded-lg bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-fis-eggplant dark:hover:border-fis-raspberry hover:shadow-md transition-all"
                >
                  <div className="font-roobert-semibold text-sm text-gray-900 dark:text-white mb-1">
                    {asset.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {asset.description}
                  </div>
                  <div className="text-xs text-fis-eggplant dark:text-fis-raspberry font-mono mt-1">
                    {asset.renderType}
                  </div>
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
                        className={`font-roobert-bold text-gray-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-fis-eggplant rounded px-2 py-1 ${
                          isHeaderSection ? 'cursor-not-allowed opacity-75' : ''
                        }`}
                      />
                      {isHeaderSection && (
                        <span className="px-2 py-0.5 rounded-full bg-fis-eggplant text-white text-xs font-roobert-semibold">
                          REQUIRED
                        </span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        ({section.fields.length} fields)
                      </span>
                      
                      {/* Column Span Selector */}
                      {!isHeaderSection && (
                        <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs text-gray-500 dark:text-gray-500">Width:</span>
                          <select
                            value={section.columnSpan || 1}
                            onChange={(e) => {
                              const newSpan = parseInt(e.target.value);
                              setSections(prev => prev.map(s =>
                                s.id === section.id ? { ...s, columnSpan: newSpan } : s
                              ));
                            }}
                            className="text-xs px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-fis-eggplant"
                          >
                            <option value={1}>1 col</option>
                            <option value={2}>2 cols</option>
                            <option value={3}>3 cols</option>
                            <option value={4}>4 cols (full)</option>
                          </select>
                        </div>
                      )}
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
                      className={`p-4 min-h-[120px] transition-colors ${
                        dragOverSection === section.id
                          ? 'bg-fis-eggplant/10 dark:bg-fis-raspberry/10'
                          : ''
                      }`}
                    >
                      {section.fields.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-500 py-8 text-sm">
                          Drag assets here to add fields
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {section.fields.map(field => (
                            <div
                              key={field.id}
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
                          <div className="space-y-3">
                            {(field.exampleData || []).map((card: any, cardIdx: number) => (
                              <div key={cardIdx} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300">
                                    Card {cardIdx + 1}
                                  </span>
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
                                <div className="space-y-2">
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
                            ))}
                            {(!field.exampleData || field.exampleData.length === 0) && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 italic text-center py-2">
                                No example cards. Click "+ Add Card" to add some.
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

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-[200]"
          >
            <div className={`px-6 py-4 rounded-xl shadow-2xl border-2 flex items-center gap-3 ${
              notification.type === 'success'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-900 dark:text-green-100'
                : 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-900 dark:text-red-100'
            }`}>
              {notification.type === 'success' ? (
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              <span className="font-roobert-medium">{notification.message}</span>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                      onClick={() => loadTemplate(template.id)}
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
            setNotification({ type: 'success', message: 'Test successful! (Data not saved)' });
            setShowTestEditor(false);
            setTestData(null);
          }}
        />
      )}
    </div>
  );
}

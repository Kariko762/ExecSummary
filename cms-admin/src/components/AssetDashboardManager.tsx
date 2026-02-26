import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Plus, Edit, Trash2, Search, X, Building2, 
  ChevronDown, ChevronRight, Server, Check, AlertCircle, 
  DollarSign, Users, Factory, Link, User, Database, Star
} from 'lucide-react';

interface Host {
  hostname: string;
  role: string;
  ip: string;
}

interface SignalFields {
  revenueCritical: boolean;
  customerFacing: boolean;
  productionLike: boolean;
  leveragesSharedInfra: boolean;
  hasDedicatedOwnership: boolean;
  requiresDemoData: boolean;
  execSafe: boolean;
}

interface BusinessUnitHierarchy {
  id: string;
  name: string;
  level: 'BU' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';
  fullPath: string;
  parentId: string | null;
  children?: BusinessUnitHierarchy[];
}

interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  function: string;
  assignedUnits: string[];
}

interface Asset {
  id: string;
  name: string;
  
  // LEVEL 1 & 2
  type: 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool';
  classification: string;
  
  // Core fields
  businessUnit: string;
  product?: string;
  peopleAlignment?: string[];
  status: 'Active' | 'Inactive' | 'Maintenance';
  url?: string;
  created: string;
  lastModified: string;
  
  // LEVEL 3: Conditional Fields (dynamic based on type/classification)
  conditionalFields: Record<string, any>;
  
  // SIGNAL FIELDS (always present)
  signalFields: SignalFields;
  
  // Extended Attributes (custom key-value pairs)
  extendedAttributes?: Record<string, string>;
  
  // Legacy support for infrastructure
  hosts?: Host[];
}

interface AssetDashboardManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
  onClose?: () => void;
}

// ========== TAXONOMY CONSTANTS ==========

const ASSET_TYPES: Array<'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool'> = [
  'Live Environment',
  'Demo Technology',
  'Coast Workspace',
  'Tiled Pool'
];

const CLASSIFICATIONS: Record<string, string[]> = {
  'Live Environment': [
    'Dedicated Sales Environment',
    'Leveraged Shared Environment',
    'Executive Demo Environment',
    'Partner Sandbox',
    'Development Environment',
    'QA / Staging Environment',
    'Production-Mirrored Demo Environment',
    'Training Environment',
    'Event / Roadshow Environment',
    'Performance / Load Test Environment'
  ],
  'Demo Technology': [
    'Interactive Click-Through',
    'Guided Product Tour',
    'Industry Microsite',
    'Product Microsite',
    'Campaign Microsite',
    'Product Explainer Video',
    'Persona-Based Video',
    'Feature Spotlight Video',
    'Leave-Behind Demo',
    'Opening Engagement Demo'
  ],
  'Coast Workspace': [
    'Sales Workspace',
    'Marketing Workspace',
    'Training Workspace',
    'Partner Workspace',
    'Executive Workspace'
  ],
  'Tiled Pool': [
    'Regional Pool',
    'BU-Specific Pool',
    'Global Pool'
  ]
};

// Conditional field definitions
const CONDITIONAL_FIELDS: Record<string, any> = {
  'Live Environment': {
    core: [
      { name: 'environmentName', label: 'Environment Name', type: 'text', required: true },
      { name: 'environmentCode', label: 'Environment Code', type: 'text', placeholder: 'FISDEV / PROD.LOCAL / DEMO.EU' },
      { 
        name: 'ownershipGroup', 
        label: 'Ownership Group', 
        type: 'select',
        options: ['Product', 'Revenue Operations', 'Pre-Sales', 'Engineering', 'Marketing', 'Shared Services']
      },
      { 
        name: 'primaryUseCase', 
        label: 'Primary Use Case', 
        type: 'select',
        options: ['Sales', 'Executive', 'Engineering', 'Training', 'Events', 'Partner']
      },
      { 
        name: 'tenantModel', 
        label: 'Tenant Model', 
        type: 'select',
        options: ['Single-Tenant', 'Multi-Tenant', 'Hybrid']
      },
      { 
        name: 'lifecycleModel', 
        label: 'Lifecycle Model', 
        type: 'select',
        options: ['Persistent', 'Reset Nightly', 'Reset On-Demand', 'Ephemeral (Spin-Up/Down)']
      },
      { name: 'akamaiIngress', label: 'Akamai Ingress', type: 'boolean' }
    ],
    byClassification: {
      'Dedicated Sales Environment': [
        { name: 'assignedTeam', label: 'Assigned Team', type: 'text' },
        { name: 'assignedRegion', label: 'Assigned Region', type: 'text' },
        { name: 'customerFacingEnv', label: 'Customer Facing?', type: 'boolean' },
        { name: 'containsDemoTenant', label: 'Contains Demo Tenant?', type: 'boolean' },
        { name: 'industryConfigured', label: 'Industry Configured?', type: 'boolean' }
      ],
      'Leveraged Shared Environment': [
        { 
          name: 'sharedBetweenTeams', 
          label: 'Shared Between Teams', 
          type: 'select',
          options: ['Sales + Engineering', 'Sales + Product', 'All Revenue Teams']
        },
        { 
          name: 'stabilityTier', 
          label: 'Environment Stability Tier', 
          type: 'select',
          options: ['Tier 1 (Exec Safe)', 'Tier 2 (Sales Stable)', 'Tier 3 (Best Effort)']
        },
        { 
          name: 'refreshFrequency', 
          label: 'Refresh Frequency', 
          type: 'select',
          options: ['Weekly', 'Monthly', 'Quarterly']
        }
      ]
    }
  },
  'Demo Technology': {
    core: [
      { 
        name: 'technologyPlatform', 
        label: 'Technology Platform', 
        type: 'select',
        options: ['Coast', 'Tiled', 'Synthesia', 'In-App Guided Tool', 'Custom Built']
      },
      { 
        name: 'audience', 
        label: 'Audience', 
        type: 'select',
        options: ['Prospect', 'Customer', 'Internal', 'Partner']
      },
      { 
        name: 'deliveryMode', 
        label: 'Delivery Mode', 
        type: 'select',
        options: ['Live Guided', 'Self-Guided', 'Leave-Behind', 'Embedded in Email', 'Embedded in Web']
      },
      { name: 'linkedLiveEnvironment', label: 'Linked Live Environment', type: 'text', placeholder: 'Optional' },
      { name: 'linkedDemoTenant', label: 'Linked Demo Tenant', type: 'text', placeholder: 'Optional' }
    ],
    byClassification: {
      'Interactive Click-Through': [
        { name: 'basedOnEnvironment', label: 'Based On Environment?', type: 'boolean' },
        { name: 'personaTargeted', label: 'Persona Targeted?', type: 'boolean' },
        { name: 'industryTargeted', label: 'Industry Targeted?', type: 'boolean' }
      ],
      'Product Explainer Video': [
        { name: 'lengthMinutes', label: 'Length (Minutes)', type: 'number' },
        { 
          name: 'voiceType', 
          label: 'Voice Type', 
          type: 'select',
          options: ['AI Voice', 'Human Narration', 'Silent']
        }
      ],
      'Persona-Based Video': [
        { name: 'lengthMinutes', label: 'Length (Minutes)', type: 'number' },
        { 
          name: 'voiceType', 
          label: 'Voice Type', 
          type: 'select',
          options: ['AI Voice', 'Human Narration', 'Silent']
        }
      ],
      'Feature Spotlight Video': [
        { name: 'lengthMinutes', label: 'Length (Minutes)', type: 'number' },
        { 
          name: 'voiceType', 
          label: 'Voice Type', 
          type: 'select',
          options: ['AI Voice', 'Human Narration', 'Silent']
        }
      ]
    }
  },
  'Coast Workspace': {
    core: [
      { name: 'workspaceId', label: 'Workspace ID', type: 'text', required: true },
      { name: 'workspaceUrl', label: 'Workspace URL', type: 'text', placeholder: 'https://...' },
      { 
        name: 'workspaceOwner', 
        label: 'Workspace Owner', 
        type: 'select',
        options: ['Sales', 'Marketing', 'Training', 'Partners', 'Executive']
      },
      { name: 'maxUsers', label: 'Max Users', type: 'number', placeholder: 'Leave blank for unlimited' },
      { name: 'costPerUser', label: 'Cost Per User (Annual)', type: 'text', placeholder: '$XXX per year' }
    ],
    byClassification: {}
  },
  'Tiled Pool': {
    core: [
      { name: 'poolCapacity', label: 'Pool Capacity', type: 'number', required: true, placeholder: 'Total number of licenses' },
      { name: 'costPerLicense', label: 'Cost Per License (Annual)', type: 'text', placeholder: '$XXX per year' },
      { 
        name: 'renewalDate', 
        label: 'Renewal Date', 
        type: 'text',
        placeholder: 'YYYY-MM-DD'
      },
      { name: 'contractTerm', label: 'Contract Term', type: 'text', placeholder: 'Annual/Multi-year' }
    ],
    byClassification: {}
  }
};

const STATUSES: Array<'Active' | 'Inactive' | 'Maintenance'> = ['Active', 'Inactive', 'Maintenance'];

const HOST_ROLES = ['Web Server', 'App Server', 'Database', 'Load Balancer', 'WAN IP', 'Load Balancer IP', 'Cache', 'Message Queue'];

const SIGNAL_FIELD_DEFINITIONS = [
  { key: 'revenueCritical', label: 'Revenue Critical', description: 'Critical to revenue generation', icon: DollarSign },
  { key: 'customerFacing', label: 'Customer Facing', description: 'Used in customer demos or interactions', icon: Users },
  { key: 'productionLike', label: 'Production-Like', description: 'Mirrors production environment', icon: Factory },
  { key: 'leveragesSharedInfra', label: 'Leverages Shared Infrastructure', description: 'Uses shared resources', icon: Link },
  { key: 'hasDedicatedOwnership', label: 'Has Dedicated Ownership', description: 'Has dedicated owner/team', icon: User },
  { key: 'requiresDemoData', label: 'Requires Demo Data', description: 'Needs demo data to function', icon: Database },
  { key: 'execSafe', label: 'Exec Safe', description: 'Safe for executive demos', icon: Star }
];

export default function AssetDashboardManager({ onNotification, onClose }: AssetDashboardManagerProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [businessUnits, setBusinessUnits] = useState<string[]>([]);
  const [businessUnitHierarchy, setBusinessUnitHierarchy] = useState<BusinessUnitHierarchy[]>([]);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBU, setFilterBU] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'conditional' | 'signals' | 'extended'>('details');
  const [peopleSearchTerm, setPeopleSearchTerm] = useState('');
  const [showPeopleDropdown, setShowPeopleDropdown] = useState(false);
  const [showRemoveHostConfirm, setShowRemoveHostConfirm] = useState(false);
  const [hostToRemove, setHostToRemove] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: '' as '' | 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool',
    classification: '',
    businessUnit: '',
    product: '',
    peopleAlignment: [] as string[],
    status: 'Active' as 'Active' | 'Inactive' | 'Maintenance',
    url: '',
    conditionalFields: {} as Record<string, any>,
    signalFields: {
      revenueCritical: false,
      customerFacing: false,
      productionLike: false,
      leveragesSharedInfra: false,
      hasDedicatedOwnership: false,
      requiresDemoData: false,
      execSafe: false
    } as SignalFields,
    extendedAttributes: {} as Record<string, string>,
    hosts: [] as Host[]
  });

  useEffect(() => {
    fetchAssets();
    fetchBusinessUnits();
    fetchPeople();
  }, []);

  // Close people dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.people-search-container')) {
        setShowPeopleDropdown(false);
      }
    };

    if (showPeopleDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPeopleDropdown]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/assets');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setAssets(data.data);
      } else {
        setAssets([]);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      onNotification?.('error', 'Failed to load assets');
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/business-units');
      const data = await response.json();
      if (data.success) {
        const buNames = data.units
          .filter((u: any) => u.level === 'BU')
          .map((u: any) => u.name);
        setBusinessUnits(buNames);
      }
      
      // Fetch hierarchy for product dropdown
      const hierarchyResponse = await fetch('http://localhost:3001/api/business-units?format=hierarchy');
      const hierarchyData = await hierarchyResponse.json();
      if (hierarchyData.success) {
        setBusinessUnitHierarchy(hierarchyData.units);
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
    }
  };

  const fetchPeople = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/people');
      const data = await response.json();
      if (data.success) {
        setAllPeople(data.people);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  // Helper: Get L7 products for selected BU
  const getProductsForBU = (buName: string): string[] => {
    const bu = businessUnitHierarchy.find(u => u.name === buName);
    if (!bu) return [];

    const collectL7 = (unit: BusinessUnitHierarchy): string[] => {
      let l7Products: string[] = [];
      if (unit.level === 'L7') {
        l7Products.push(unit.name);
      }
      if (unit.children) {
        unit.children.forEach(child => {
          l7Products = [...l7Products, ...collectL7(child)];
        });
      }
      return l7Products;
    };

    return collectL7(bu);
  };

  // Helper: Get people filtered by BU
  const getPeopleForBU = (buName: string): Person[] => {
    if (!buName) return allPeople;
    
    // Get the BU object from hierarchy to find its ID and all descendant IDs
    const bu = businessUnitHierarchy.find(u => u.name === buName);
    if (!bu) {
      console.warn('⚠️ BU not found in hierarchy:', buName);
      return [];
    }
    
    // Collect all unit IDs under this BU (including the BU itself)
    const buUnitIds = new Set<string>([bu.id]);
    
    const collectDescendantIds = (unit: BusinessUnitHierarchy) => {
      if (unit.children) {
        unit.children.forEach(child => {
          buUnitIds.add(child.id);
          collectDescendantIds(child);
        });
      }
    };
    
    collectDescendantIds(bu);
    
    // Filter people who have ANY assigned unit that belongs to this BU hierarchy
    return allPeople.filter(person => 
      person.assignedUnits.some(unitId => buUnitIds.has(unitId))
    );
  };

  // Helper: Add person to alignment
  const addPersonToAlignment = (personId: string) => {
    const person = allPeople.find(p => p.id === personId);
    if (!person) return;
    
    const fullName = `${person.firstName} ${person.lastName}`;
    if (!formData.peopleAlignment.includes(fullName)) {
      setFormData({
        ...formData,
        peopleAlignment: [...formData.peopleAlignment, fullName]
      });
    }
    setPeopleSearchTerm('');
  };

  // Helper: Remove person from alignment
  const removePersonFromAlignment = (name: string) => {
    setFormData({
      ...formData,
      peopleAlignment: formData.peopleAlignment.filter(p => p !== name)
    });
  };

  // Helper function to save assets to backend
  const saveAssets = async (assetsToSave: Asset[]) => {
    try {
      const response = await fetch('http://localhost:3001/api/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetsToSave)
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error saving assets:', error);
      return false;
    }
  };

  const handleCreate = async () => {
    try {
      // Business Unit is required for Live Environment and Demo Technology, optional for Coast Workspace and Tiled Pool
      const requiresBU = formData.type === 'Live Environment' || formData.type === 'Demo Technology';
      if (!formData.name || !formData.type || (requiresBU && !formData.businessUnit)) {
        onNotification?.('error', 'Please fill in all required fields');
        return;
      }

      const newAsset: Asset = {
        id: Date.now().toString(),
        ...formData,
        type: formData.type, // Type narrowed by check above
        created: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0]
      };

      const updatedAssets = [...assets, newAsset];
      const saved = await saveAssets(updatedAssets);
      
      if (saved) {
        setAssets(updatedAssets);
        onNotification?.('success', `Asset "${formData.name}" created`);
        setShowAddModal(false);
        resetForm();
      } else {
        onNotification?.('error', 'Failed to save asset to database');
      }
    } catch (error) {
      console.error('Error creating asset:', error);
      onNotification?.('error', 'Failed to create asset');
    }
  };

  const handleUpdate = async () => {
    try {
      if (!editingAsset) return;
      // Business Unit is required for Live Environment and Demo Technology, optional for Coast Workspace and Tiled Pool
      const requiresBU = formData.type === 'Live Environment' || formData.type === 'Demo Technology';
      if (!formData.name || !formData.type || (requiresBU && !formData.businessUnit)) {
        onNotification?.('error', 'Please fill in all required fields');
        return;
      }

      const updatedAssets = assets.map(a =>
        a.id === editingAsset.id
          ? { ...a, ...formData, type: formData.type as 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool', lastModified: new Date().toISOString().split('T')[0] }
          : a
      );

      const saved = await saveAssets(updatedAssets);
      
      if (saved) {
        setAssets(updatedAssets);
        onNotification?.('success', `Asset "${formData.name}" updated`);
        setShowEditModal(false);
        setEditingAsset(null);
        resetForm();
      } else {
        onNotification?.('error', 'Failed to save asset to database');
      }
    } catch (error) {
      console.error('Error updating asset:', error);
      onNotification?.('error', 'Failed to update asset');
    }
  };

  const handleDelete = (asset: Asset) => {
    setAssetToDelete(asset);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!assetToDelete) return;

    try {
      const updatedAssets = assets.filter(a => a.id !== assetToDelete.id);
      const saved = await saveAssets(updatedAssets);
      
      if (saved) {
        setAssets(updatedAssets);
        onNotification?.('success', `Deleted ${assetToDelete.name}`);
        setShowDeleteConfirm(false);
        setAssetToDelete(null);
      } else {
        onNotification?.('error', 'Failed to save changes to database');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      onNotification?.('error', 'Failed to delete asset');
    }
  };

  const openAddModal = () => {
    resetForm();
    setActiveTab('details');
    setShowAddModal(true);
  };

  const openEditModal = (asset: Asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      type: asset.type,
      classification: asset.classification,
      businessUnit: asset.businessUnit,
      product: asset.product || '',
      peopleAlignment: asset.peopleAlignment || [],
      status: asset.status,
      url: asset.url || '',
      conditionalFields: { ...asset.conditionalFields },
      signalFields: { ...asset.signalFields },
      extendedAttributes: asset.extendedAttributes ? { ...asset.extendedAttributes } : {},
      hosts: asset.hosts ? [...asset.hosts] : []
    });
    setActiveTab('details');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '' as '' | 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool',
      classification: '',
      businessUnit: '',
      product: '',
      peopleAlignment: [],
      status: 'Active',
      url: '',
      conditionalFields: {},
      signalFields: {
        revenueCritical: false,
        customerFacing: false,
        productionLike: false,
        leveragesSharedInfra: false,
        hasDedicatedOwnership: false,
        requiresDemoData: false,
        execSafe: false
      },
      extendedAttributes: {},
      hosts: []
    });
  };

  // Handle type change - reset classification and conditional fields
  const handleTypeChange = (newType: 'Live Environment' | 'Demo Technology' | 'Coast Workspace' | 'Tiled Pool' | '') => {
    setFormData({
      ...formData,
      type: newType,
      classification: '',
      conditionalFields: {}
    });
  };

  // Handle classification change - reset conditional fields
  const handleClassificationChange = (newClassification: string) => {
    setFormData({
      ...formData,
      classification: newClassification,
      conditionalFields: {}
    });
  };

  // Update conditional field value
  const updateConditionalField = (fieldName: string, value: any) => {
    setFormData({
      ...formData,
      conditionalFields: {
        ...formData.conditionalFields,
        [fieldName]: value
      }
    });
  };

  // Update signal field value
  const updateSignalField = (fieldName: keyof SignalFields, value: boolean) => {
    setFormData({
      ...formData,
      signalFields: {
        ...formData.signalFields,
        [fieldName]: value
      }
    });
  };

  // Get current conditional fields based on type and classification
  const getCurrentConditionalFields = () => {
    if (!formData.type) return [];
    
    const typeConfig = CONDITIONAL_FIELDS[formData.type];
    if (!typeConfig) return [];
    
    const coreFields = typeConfig.core || [];
    const classificationFields = formData.classification && typeConfig.byClassification?.[formData.classification] 
      ? typeConfig.byClassification[formData.classification] 
      : [];
    
    return [...coreFields, ...classificationFields];
  };

  // Render a conditional field based on its definition
  const renderConditionalField = (field: any) => {
    const value = formData.conditionalFields[field.name] ?? '';

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name}>
            <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
              {field.label} {field.required && '*'}
            </label>
            <input
              type={field.type}
              value={value}
              onChange={(e) => updateConditionalField(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
              placeholder={field.placeholder || ''}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        );
      
      case 'select':
        return (
          <div key={field.name}>
            <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
              {field.label} {field.required && '*'}
            </label>
            <select
              value={value}
              onChange={(e) => updateConditionalField(field.name, e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
            >
              <option value="">Select {field.label}</option>
              {field.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      
      case 'boolean':
        return (
          <div key={field.name} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => updateConditionalField(field.name, e.target.checked)}
              className="w-5 h-5 bg-slate-800 border border-slate-600 rounded text-purple-600 focus:ring-purple-500"
            />
            <label className="text-sm font-roobert-medium text-slate-300">
              {field.label}
            </label>
          </div>
        );
      
      default:
        return null;
    }
  };

  // Host Management Functions
  const addHost = () => {
    setFormData({
      ...formData,
      hosts: [...formData.hosts, { hostname: '', role: 'Web Server', ip: '' }]
    });
  };

  const removeHost = (index: number) => {
    setHostToRemove(index);
    setShowRemoveHostConfirm(true);
  };

  const confirmRemoveHost = () => {
    if (hostToRemove !== null) {
      setFormData({
        ...formData,
        hosts: formData.hosts.filter((_, idx) => idx !== hostToRemove)
      });
    }
    setShowRemoveHostConfirm(false);
    setHostToRemove(null);
  };

  const updateHost = (index: number, field: keyof Host, value: string) => {
    const updatedHosts = [...formData.hosts];
    updatedHosts[index] = { ...updatedHosts[index], [field]: value };
    setFormData({ ...formData, hosts: updatedHosts });
  };

  // Extended Attributes Management Functions
  const addExtendedAttribute = () => {
    const key = prompt('Enter attribute name:');
    if (key && key.trim()) {
      setFormData({
        ...formData,
        extendedAttributes: { ...formData.extendedAttributes, [key.trim()]: '' }
      });
    }
  };

  const updateExtendedAttribute = (key: string, value: string) => {
    setFormData({
      ...formData,
      extendedAttributes: { ...formData.extendedAttributes, [key]: value }
    });
  };

  const removeExtendedAttribute = (key: string) => {
    const { [key]: removed, ...rest } = formData.extendedAttributes;
    setFormData({ ...formData, extendedAttributes: rest });
  };

  const toggleExpand = (assetId: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId);
    } else {
      newExpanded.add(assetId);
    }
    setExpandedAssets(newExpanded);
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      searchTerm === '' ||
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.classification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.businessUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (asset.url && asset.url.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesBU = filterBU === '' || asset.businessUnit === filterBU;
    const matchesType = filterType === '' || asset.type === filterType;
    const matchesStatus = filterStatus === '' || asset.status === filterStatus;

    return matchesSearch && matchesBU && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'text-green-400 bg-green-400/10';
      case 'Inactive': return 'text-gray-400 bg-gray-400/10';
      case 'Maintenance': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-[95vw] h-[95vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">Asset Dashboard</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Manage infrastructure and demo environments</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Add Asset"
            >
              <Plus className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="w-full space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, type, business unit, or URL..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/40">
                <div className="text-xs text-slate-400 mb-0.5">Total Assets</div>
                <div className="text-xl font-roobert-semibold text-white">{assets.length}</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/40">
                <div className="text-xs text-slate-400 mb-0.5">Active</div>
                <div className="text-xl font-roobert-semibold text-green-400">
                  {assets.filter(a => a.status === 'Active').length}
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/40">
                <div className="text-xs text-slate-400 mb-0.5">Total Hosts</div>
                <div className="text-xl font-roobert-semibold text-cyan-400">
                  {assets.reduce((sum, a) => sum + (a.hosts?.length || 0), 0)}
                </div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-3 border border-slate-700/40">
                <div className="text-xs text-slate-400 mb-0.5">Search Results</div>
                <div className="text-xl font-roobert-semibold text-purple-400">{filteredAssets.length}</div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 border border-slate-700/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Business Unit Filter */}
                <div>
                  <select
                    value={filterBU}
                    onChange={(e) => setFilterBU(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Business Units</option>
                    {businessUnits.map(bu => (
                      <option key={bu} value={bu}>{bu}</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Types</option>
                    {ASSET_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="">All Statuses</option>
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/40 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/80">
                    <tr>
                      <th className="text-left px-3 py-3 text-slate-300 font-roobert-medium text-xs">Asset</th>
                      <th className="text-left px-2 py-3 text-slate-300 font-roobert-medium text-xs w-32">Type</th>
                      <th className="text-left px-2 py-3 text-slate-300 font-roobert-medium text-xs">Classification</th>
                      <th className="text-left px-2 py-3 text-slate-300 font-roobert-medium text-xs">BU</th>
                      <th className="text-left px-2 py-3 text-slate-300 font-roobert-medium text-xs w-20">Status</th>
                      <th className="text-center px-2 py-3 text-slate-300 font-roobert-medium text-xs w-16">Hosts</th>
                      <th className="text-left px-2 py-3 text-slate-300 font-roobert-medium text-xs w-24">Modified</th>
                      <th className="text-right px-3 py-3 text-slate-300 font-roobert-medium text-xs w-20">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {filteredAssets.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                          No assets found matching your criteria
                        </td>
                      </tr>
                    ) : (
                      filteredAssets.map((asset) => {
                        const isExpanded = expandedAssets.has(asset.id);
                        return (
                          <>
                            <tr key={asset.id} className="hover:bg-slate-700/20 transition-colors">
                              <td className="px-3 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  {asset.hosts && asset.hosts.length > 0 && (
                                    <button
                                      onClick={() => toggleExpand(asset.id)}
                                      className="p-0.5 hover:bg-slate-700 rounded flex-shrink-0"
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                      ) : (
                                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                      )}
                                    </button>
                                  )}
                                  <div className="min-w-0">
                                    <div className="text-white font-roobert-medium text-sm truncate">{asset.name}</div>
                                    <div className="text-xs text-slate-400 truncate">{asset.url}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-2 py-2.5">
                                <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                                  {asset.type === 'Live Environment' ? 'Live Env' : 'Demo Tech'}
                                </span>
                              </td>
                              <td className="px-2 py-2.5">
                                <span className="text-slate-300 text-xs">{asset.classification}</span>
                              </td>
                              <td className="px-2 py-2.5">
                                <div className="flex items-center gap-1.5">
                                  <Building2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                  <span className="text-slate-300 text-xs truncate">{asset.businessUnit}</span>
                                </div>
                              </td>
                              <td className="px-2 py-2.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-roobert-medium whitespace-nowrap ${getStatusColor(asset.status)}`}>
                                  {asset.status}
                                </span>
                              </td>
                              <td className="px-2 py-2.5 text-slate-300 text-xs text-center">{asset.hosts?.length || 0}</td>
                              <td className="px-2 py-2.5 text-slate-300 text-xs">{asset.lastModified}</td>
                              <td className="px-3 py-2.5">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => openEditModal(asset)}
                                    className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(asset)}
                                    className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Expanded Hosts Row */}
                            {isExpanded && asset.hosts && asset.hosts.length > 0 && (
                              <tr key={`${asset.id}-hosts`}>
                                <td colSpan={8} className="px-6 py-4 bg-slate-800/30">
                                  <div className="pl-8 space-y-2">
                                    <div className="text-sm font-roobert-medium text-slate-300 mb-3">Hosts:</div>
                                    {asset.hosts.map((host, idx) => (
                                      <div key={idx} className="flex items-center gap-4 text-sm bg-slate-900/50 rounded-lg p-3 border border-slate-700/40">
                                        <Server className="w-4 h-4 text-purple-400" />
                                        <span className="text-white font-mono">{host.hostname}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-cyan-400">{host.role}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-slate-300 font-mono">{host.ip}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {(showAddModal || showEditModal) && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-5xl max-h-[90vh] flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-purple-400" />
                    <h3 className="text-xl font-roobert-semibold text-white">
                      {showAddModal ? 'Add Asset' : 'Edit Asset'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={showAddModal ? handleCreate : handleUpdate}
                      className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      title="Save"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setEditingAsset(null);
                      }}
                      className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-700/40 bg-slate-800/30">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 font-roobert-medium transition-colors ${
                      activeTab === 'details'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('conditional')}
                    className={`px-6 py-3 font-roobert-medium transition-colors ${
                      activeTab === 'conditional'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Conditional Fields
                  </button>
                  <button
                    onClick={() => setActiveTab('signals')}
                    className={`px-6 py-3 font-roobert-medium transition-colors ${
                      activeTab === 'signals'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Signal Fields
                  </button>
                  <button
                    onClick={() => setActiveTab('extended')}
                    className={`px-6 py-3 font-roobert-medium transition-colors ${
                      activeTab === 'extended'
                        ? 'text-purple-400 border-b-2 border-purple-400'
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    Extended
                  </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === 'details' && (
                    <div className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                          Asset Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          placeholder="Enter asset name"
                        />
                      </div>

                      {/* Type & Classification */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Type */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            Type *
                          </label>
                          <select
                            value={formData.type}
                            onChange={(e) => handleTypeChange(e.target.value as any)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="">Select Type</option>
                            {ASSET_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* Classification - Conditional on Type */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            Classification *
                          </label>
                          <select
                            value={formData.classification}
                            onChange={(e) => handleClassificationChange(e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            disabled={!formData.type}
                          >
                            <option value="">Select Classification</option>
                            {formData.type && CLASSIFICATIONS[formData.type]?.map(classification => (
                              <option key={classification} value={classification}>{classification}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Business Unit & Product */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Business Unit */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            Business Unit {(formData.type === 'Live Environment' || formData.type === 'Demo Technology') ? '*' : '(Optional - leave blank for Global)'}
                          </label>
                          <select
                            value={formData.businessUnit}
                            onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          >
                            <option value="">{formData.type === 'Tiled Pool' || formData.type === 'Coast Workspace' ? 'Global (All BUs)' : 'Select Business Unit'}</option>
                            {businessUnits.map(bu => (
                              <option key={bu} value={bu}>{bu}</option>
                            ))}
                          </select>
                        </div>

                        {/* Product */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            Product
                          </label>
                          <select
                            value={formData.product || ''}
                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            disabled={!formData.businessUnit}
                          >
                            <option value="">Select Product (L7)</option>
                            {getProductsForBU(formData.businessUnit).map(product => (
                              <option key={product} value={product}>{product}</option>
                            ))}
                          </select>
                          {!formData.businessUnit && (
                            <p className="mt-1 text-xs text-slate-500">Select a Business Unit first</p>
                          )}
                          {formData.businessUnit && getProductsForBU(formData.businessUnit).length === 0 && (
                            <p className="mt-1 text-xs text-yellow-500">No L7 products found for this Business Unit</p>
                          )}
                        </div>
                      </div>

                      {/* People Alignment - Searchable Multi-Select */}
                      <div className="people-search-container relative">
                        <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                          People Alignment
                        </label>
                        
                        {/* Selected People Chips */}
                        {formData.peopleAlignment.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {formData.peopleAlignment.map((name) => (
                              <div 
                                key={name}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300"
                              >
                                <Users className="w-3 h-3" />
                                <span>{name}</span>
                                <button
                                  type="button"
                                  onClick={() => removePersonFromAlignment(name)}
                                  className="hover:bg-purple-500/30 rounded-full p-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Search Input */}
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={peopleSearchTerm}
                            onChange={(e) => setPeopleSearchTerm(e.target.value)}
                            onFocus={() => setShowPeopleDropdown(true)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                            placeholder="Search people to assign..."
                            disabled={!formData.businessUnit}
                          />
                        </div>

                        {/* Dropdown with Filtered People */}
                        {showPeopleDropdown && formData.businessUnit && peopleSearchTerm && (
                          <div className="absolute z-10 mt-1 w-full bg-slate-800 border border-slate-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                            {getPeopleForBU(formData.businessUnit)
                              .filter(person => {
                                const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
                                const email = person.email.toLowerCase();
                                const search = peopleSearchTerm.toLowerCase();
                                return fullName.includes(search) || email.includes(search);
                              })
                              .filter(person => !formData.peopleAlignment.includes(`${person.firstName} ${person.lastName}`))
                              .slice(0, 50) // Limit to 50 results
                              .map(person => (
                                <button
                                  key={person.id}
                                  type="button"
                                  onClick={() => {
                                    addPersonToAlignment(person.id);
                                    setShowPeopleDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-3 hover:bg-slate-700 transition-colors border-b border-slate-700/40 last:border-b-0"
                                >
                                  <div className="font-roobert-medium text-white">{person.firstName} {person.lastName}</div>
                                  <div className="text-xs text-slate-400">{person.email} • {person.role}</div>
                                </button>
                              ))}
                            {getPeopleForBU(formData.businessUnit)
                              .filter(person => {
                                const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
                                const email = person.email.toLowerCase();
                                const search = peopleSearchTerm.toLowerCase();
                                return fullName.includes(search) || email.includes(search);
                              })
                              .filter(person => !formData.peopleAlignment.includes(`${person.firstName} ${person.lastName}`))
                              .length === 0 && (
                                <div className="px-4 py-3 text-center text-slate-400 text-sm">
                                  No matching people found
                                </div>
                              )}
                          </div>
                        )}
                        
                        {!formData.businessUnit && (
                          <p className="mt-1 text-xs text-slate-500">Select a Business Unit first</p>
                        )}
                        {formData.businessUnit && (
                          <p className="mt-1 text-xs text-slate-400">
                            {getPeopleForBU(formData.businessUnit).length} people available in this BU
                          </p>
                        )}
                      </div>

                      {/* Status & URL */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* Status */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            Status *
                          </label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                          >
                            {STATUSES.map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>

                        {/* URL */}
                        <div>
                          <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                            URL
                          </label>
                          <input
                            type="text"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>

                      {/* Infrastructure */}
                      {formData.hosts.length > 0 || formData.type === 'Live Environment' ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-roobert-medium text-slate-300">
                              Infrastructure
                            </label>
                            <button
                              onClick={addHost}
                              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              + Add
                            </button>
                          </div>
                          <div className="space-y-3">
                            {formData.hosts.map((host, idx) => (
                              <div key={idx} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                                <div className="grid grid-cols-3 gap-3 mb-2">
                                  <input
                                    type="text"
                                    value={host.hostname}
                                    onChange={(e) => updateHost(idx, 'hostname', e.target.value)}
                                    placeholder="hostname"
                                    className="px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                                  />
                                  <select
                                    value={host.role}
                                    onChange={(e) => updateHost(idx, 'role', e.target.value)}
                                    className="px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                                  >
                                    {HOST_ROLES.map(role => (
                                      <option key={role} value={role}>{role}</option>
                                    ))}
                                  </select>
                                  <input
                                    type="text"
                                    value={host.ip}
                                    onChange={(e) => updateHost(idx, 'ip', e.target.value)}
                                    placeholder="IP address"
                                    className="px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                                  />
                                </div>
                                <button
                                  onClick={() => removeHost(idx)}
                                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {activeTab === 'conditional' && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <p className="text-sm text-slate-400">
                          {formData.type && formData.classification
                            ? `Conditional fields for ${formData.type} → ${formData.classification}`
                            : 'Select a Type and Classification in the Details tab to see available fields'}
                        </p>
                      </div>
                      
                      {getCurrentConditionalFields().length > 0 ? (
                        <div className="space-y-4">
                          {getCurrentConditionalFields().map(field => (
                            <div key={field.name}>{renderConditionalField(field)}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-500">
                          {formData.type && formData.classification
                            ? 'No conditional fields defined for this combination'
                            : 'Select a type and classification to see available fields'}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'signals' && (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <p className="text-sm text-slate-400">
                          Signal fields provide executive-level indicators about this asset
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {SIGNAL_FIELD_DEFINITIONS.map(signal => {
                          const Icon = signal.icon;
                          const fieldKey = signal.key as keyof SignalFields;
                          return (
                            <div key={signal.key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3 flex-1">
                                  <Icon className="w-5 h-5 text-purple-400 mt-0.5" />
                                  <div className="flex-1">
                                    <div className="font-roobert-medium text-white mb-1">{signal.label}</div>
                                    <div className="text-sm text-slate-400">{signal.description}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => updateSignalField(fieldKey, !formData.signalFields[fieldKey])}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    formData.signalFields[fieldKey]
                                      ? 'bg-purple-600'
                                      : 'bg-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      formData.signalFields[fieldKey] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'extended' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-slate-400">
                          Add custom key-value attributes to extend asset metadata
                        </p>
                        <button
                          onClick={addExtendedAttribute}
                          className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add Attribute
                        </button>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(formData.extendedAttributes).map(([key, value]) => (
                          <div key={key} className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-roobert-medium text-purple-400">{key}</span>
                              <button
                                onClick={() => removeExtendedAttribute(key)}
                                className="ml-auto text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={value}
                              onChange={(e) => updateExtendedAttribute(key, e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-white text-sm focus:outline-none focus:border-purple-500"
                              placeholder="Enter value"
                            />
                          </div>
                        ))}
                        {Object.keys(formData.extendedAttributes).length === 0 && (
                          <div className="text-center py-8 text-slate-500">
                            No extended attributes. Click "Add Attribute" to create one.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && assetToDelete && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-md"
              >
                <div className="p-6 border-b border-slate-700/40 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-lg font-roobert-semibold text-white">
                      Confirm Deletion
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300 mb-2">
                    Are you sure you want to delete <span className="font-roobert-semibold text-white">{assetToDelete.name}</span>?
                  </p>
                  <p className="text-red-400 text-sm mb-6 font-roobert-medium">
                    This action is permanent and cannot be undone.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmDelete}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-roobert-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Permanently
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setAssetToDelete(null);
                      }}
                      className="w-full px-4 py-3 border border-slate-600 hover:bg-slate-800/50 text-slate-300 rounded-lg transition-colors font-roobert-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Remove Host Confirmation Modal */}
          {showRemoveHostConfirm && hostToRemove !== null && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-md"
              >
                <div className="p-6 border-b border-slate-700/40 bg-slate-800/50">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-roobert-semibold text-white">
                      Remove Infrastructure Item
                    </h3>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-slate-300 mb-2">
                    Are you sure you want to remove this infrastructure item?
                  </p>
                  <p className="text-slate-400 text-sm mb-6">
                    This will remove the host configuration from this asset.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={confirmRemoveHost}
                      className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-roobert-semibold flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                    <button
                      onClick={() => {
                        setShowRemoveHostConfirm(false);
                        setHostToRemove(null);
                      }}
                      className="w-full px-4 py-3 border border-slate-600 hover:bg-slate-800/50 text-slate-300 rounded-lg transition-colors font-roobert-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

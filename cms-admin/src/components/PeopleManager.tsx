import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Plus, Edit, Trash2, Search, X, Mail, Briefcase, Building2, Monitor, Users, Check, Save, AlertCircle, Package, ChevronRight, ChevronDown } from 'lucide-react';

interface TechnologyAssignment {
  technology: string;
  status: 'Active' | 'Inactive' | 'Disabled';
  assignedDate: string;
  modifiedDate: string;
}

interface VendorLicense {
  vendor: string; // 'Coast' | 'Tiled' | 'Synthesia'
  status: 'Active' | 'Inactive';
  licenseStartDate: string; // YYYY-MM-DD
  lastLogin?: string;
  linkedAssetId?: string; // For Coast Workspace or Tiled Pool
}

interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  function: string;
  region: string;
  managerId: string;
  assignedUnits: string[];
  technologyAssignments?: TechnologyAssignment[];
  vendorLicenses?: VendorLicense[];
}

interface BusinessUnit {
  id: string;
  name: string;
  level: string;
  fullPath: string;
}

interface PeopleManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
  onClose?: () => void;
  inline?: boolean; // Render as inline component instead of modal
}

export default function PeopleManager({ onNotification, onClose, inline = false }: PeopleManagerProps) {
  const [people, setPeople] = useState<Person[]>([]);
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [allUnits, setAllUnits] = useState<BusinessUnit[]>([]); // All units for org filtering
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  
  // Hierarchical tree state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: '',
    function: '',
    region: '',
    managerId: '',
    assignedUnits: [] as string[],
    technologyAssignments: [] as TechnologyAssignment[]
  });

  useEffect(() => {
    fetchPeople();
    fetchUnits();
  }, []);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/people');
      const data = await response.json();
      
      if (data.success) {
        setPeople(data.people);
      }
    } catch (error) {
      console.error('Error fetching people:', error);
      onNotification?.('error', 'Failed to load people');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/business-units');
      const data = await response.json();
      
      if (data.success) {
        setAllUnits(data.units); // Store all units for hierarchical filtering
        
        // Check for mislabeled BUs (only log once on data load)
        const mislabeledBUs = data.units.filter((u: BusinessUnit) => u.level === 'BU' && u.parentId);
        if (mislabeledBUs.length > 0) {
          console.warn('⚠️ Found units labeled as BU but have parents (should be L3/L4/L5):', mislabeledBUs.map((u: BusinessUnit) => u.name));
        }
        
        // Filter to only L7 units (products) for the main list
        const l7Units = data.units.filter((u: BusinessUnit) => u.level === 'L7');
        setUnits(l7Units);
      }
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleCreate = async () => {
    console.log('💾 Creating person with data:', formData);
    console.log('📋 Committed paths:', committedPaths);
    try {
      const response = await fetch('http://localhost:3001/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('✅ Create response:', data);
      
      if (data.success) {
        onNotification?.('success', `Added ${formData.firstName} ${formData.lastName}`);
        setShowAddModal(false);
        resetForm();
        fetchPeople();
      } else {
        onNotification?.('error', data.error || 'Failed to create person');
      }
    } catch (error) {
      console.error('Error creating person:', error);
      onNotification?.('error', 'Failed to create person');
    }
  };

  const handleUpdate = async () => {
    if (!editingPerson) return;
    
    console.log('💾 Updating person with data:', formData);
    console.log('📋 Committed paths:', committedPaths);
    
    try {
      const response = await fetch(`http://localhost:3001/api/people/${editingPerson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      console.log('✅ Update response:', data);
      
      if (data.success) {
        onNotification?.('success', `Updated ${formData.firstName} ${formData.lastName}`);
        setShowEditModal(false);
        setEditingPerson(null);
        resetForm();
        fetchPeople();
      } else {
        onNotification?.('error', data.error || 'Failed to update person');
      }
    } catch (error) {
      console.error('Error updating person:', error);
      onNotification?.('error', 'Failed to update person');
    }
  };

  const handleSaveAndClose = async () => {
    setShowSaveConfirm(false);
    if (showEditModal) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleSaveAndContinue = async () => {
    setShowSaveConfirm(false);
    
    if (showEditModal && editingPerson) {
      try {
        const response = await fetch(`http://localhost:3001/api/people/${editingPerson.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          onNotification?.('success', `Updated ${formData.firstName} ${formData.lastName}`);
          fetchPeople();
          // Keep modal open, don't reset
        } else {
          onNotification?.('error', data.error || 'Failed to update person');
        }
      } catch (error) {
        console.error('Error updating person:', error);
        onNotification?.('error', 'Failed to update person');
      }
    } else {
      try {
        const response = await fetch('http://localhost:3001/api/people', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
          onNotification?.('success', `Added ${formData.firstName} ${formData.lastName}`);
          fetchPeople();
          // Reset form but keep modal open
          resetForm();
        } else {
          onNotification?.('error', data.error || 'Failed to create person');
        }
      } catch (error) {
        console.error('Error creating person:', error);
        onNotification?.('error', 'Failed to create person');
      }
    }
  };

  const handleDelete = (person: Person) => {
    setPersonToDelete(person);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!personToDelete) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/people/${personToDelete.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Deleted ${personToDelete.firstName} ${personToDelete.lastName}`);
        fetchPeople();
        setShowDeleteConfirm(false);
        setPersonToDelete(null);
      } else {
        onNotification?.('error', data.error || 'Failed to delete person');
      }
    } catch (error) {
      console.error('Error deleting person:', error);
      onNotification?.('error', 'Failed to delete person');
    }
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      email: person.email,
      firstName: person.firstName,
      lastName: person.lastName,
      role: person.role,
      function: person.function,
      region: person.region || '',
      managerId: person.managerId || '',
      assignedUnits: person.assignedUnits,
      technologyAssignments: person.technologyAssignments || []
    });
    
    // Auto-expand parent nodes of assigned units for visibility
    const nodesToExpand = new Set<string>();
    person.assignedUnits.forEach(unitId => {
      let currentId: string | undefined = unitId;
      while (currentId) {
        const unit = allUnits.find(u => u.id === currentId);
        if (!unit) break;
        if (unit.parentId) {
          nodesToExpand.add(unit.parentId);
        }
        currentId = unit.parentId;
      }
    });
    setExpandedNodes(nodesToExpand);
    
    setShowEditModal(true);
  };

  // Helper function to build path from unit to root (BU)
  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      role: '',
      function: '',
      region: '',
      managerId: '',
      assignedUnits: [],
      technologyAssignments: []
    });
    // Reset tree state
    setExpandedNodes(new Set());
  };

  // ========== SHARED HELPER FUNCTIONS ==========
  // Get all descendant IDs recursively
  const getDescendantIds = (parentId: string): string[] => {
    const children = allUnits.filter(u => u.parentId === parentId);
    const childIds = children.map(c => c.id);
    const grandchildIds = children.flatMap(c => getDescendantIds(c.id));
    return [...childIds, ...grandchildIds];
  };

  const getUnitNames = (unitIds: string[]) => {
    return unitIds
      .map(id => {
        // Check all units (not just L7)
        const unit = allUnits.find(u => u.id === id);

        return unit ? `${unit.name} (${unit.level})` : null;
      })
      .filter(Boolean)
      .join(', ') || 'None';
  };

  // Helper to get parent unit by ID
  const getParentUnit = (unitId: string): BusinessUnit | undefined => {
    return allUnits.find(u => u.id === unitId);
  };

  // Helper to get ancestor at specific level
  const getAncestorAtLevel = (unitId: string, targetLevel: string): string => {
    let current = getParentUnit(unitId);
    
    while (current) {
      if (current.level === targetLevel) {
        return current.name;
      }
      if (!current.parentId) break;
      current = getParentUnit(current.parentId);
    }
    
    return '-';
  };

  // Get unique BUs, L3s, L4s from person's assigned units
  const getPersonHierarchy = (assignedUnitIds: string[]) => {
    const bus = new Set<string>();
    const l3s = new Set<string>();
    const l4s = new Set<string>();

    assignedUnitIds.forEach(unitId => {
      const bu = getAncestorAtLevel(unitId, 'BU');
      const l3 = getAncestorAtLevel(unitId, 'L3');
      const l4 = getAncestorAtLevel(unitId, 'L4');
      
      if (bu !== '-') bus.add(bu);
      if (l3 !== '-') l3s.add(l3);
      if (l4 !== '-') l4s.add(l4);
    });

    return {
      bu: Array.from(bus).join(', ') || '-',
      l3: Array.from(l3s).join(', ') || '-',
      l4: Array.from(l4s).join(', ') || '-'
    };
  };

  // ========== HIERARCHICAL TREE HELPER FUNCTIONS ==========
  
  // Toggle expand/collapse for a node
  const toggleNode = (unitId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(unitId)) {
      newExpanded.delete(unitId);
    } else {
      newExpanded.add(unitId);
    }
    setExpandedNodes(newExpanded);
  };

  // Check if any descendant is checked
  const hasCheckedDescendants = (unitId: string): boolean => {
    const descendantIds = getDescendantIds(unitId);
    return descendantIds.some(id => formData.assignedUnits.includes(id));
  };

  // Get all ancestor IDs (parent, grandparent, etc. up to BU)
  const getAncestorIds = (unitId: string): string[] => {
    const ancestors: string[] = [];
    let currentId: string | undefined = unitId;
    
    while (currentId) {
      const unit = allUnits.find(u => u.id === currentId);
      if (!unit) break;
      
      if (unit.parentId) {
        ancestors.push(unit.parentId);
        currentId = unit.parentId;
      } else {
        break;
      }
    }
    
    return ancestors;
  };

  // Toggle checkbox for a unit
  const toggleUnitCheckbox = (unitId: string) => {
    const isCurrentlyChecked = formData.assignedUnits.includes(unitId);
    
    if (isCurrentlyChecked) {
      // Trying to uncheck - check if any descendants are checked
      if (hasCheckedDescendants(unitId)) {
        onNotification?.('error', 'Cannot uncheck parent while children are checked. Uncheck all children first.');
        return;
      }
      // Safe to uncheck
      setFormData(prev => ({
        ...prev,
        assignedUnits: prev.assignedUnits.filter(id => id !== unitId)
      }));
    } else {
      // Check the unit and all ancestors
      const ancestorIds = getAncestorIds(unitId);
      const idsToAdd = [unitId, ...ancestorIds].filter(id => !formData.assignedUnits.includes(id));
      
      setFormData(prev => ({
        ...prev,
        assignedUnits: [...prev.assignedUnits, ...idsToAdd]
      }));
      
      // Auto-expand if this node has children
      const children = getChildren(unitId);
      if (children.length > 0) {
        setExpandedNodes(prev => new Set([...prev, unitId]));
      }
    }
  };

  // Get children of a unit
  const getChildren = (parentId: string): BusinessUnit[] => {
    return allUnits.filter(u => u.parentId === parentId);
  };

  // Get root BUs (no parent)
  const getRootBUs = (): BusinessUnit[] => {
    return allUnits.filter(u => u.level === 'BU' && !u.parentId);
  };

  const filteredPeople = people.filter(person => {
    const searchLower = searchTerm.toLowerCase();
    return (
      person.firstName.toLowerCase().includes(searchLower) ||
      person.lastName.toLowerCase().includes(searchLower) ||
      person.email.toLowerCase().includes(searchLower) ||
      person.role.toLowerCase().includes(searchLower) ||
      person.function.toLowerCase().includes(searchLower)
    );
  });

  // ========== TREE NODE COMPONENT ==========
  const TreeNode = ({ unit, depth = 0 }: { unit: BusinessUnit; depth?: number }) => {
    const children = getChildren(unit.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(unit.id);
    const isChecked = formData.assignedUnits.includes(unit.id);
    const hasCheckedChildren = hasCheckedDescendants(unit.id);

    // Level color mapping
    const getLevelColor = (level: string) => {
      switch (level) {
        case 'BU': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
        case 'L3': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
        case 'L4': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
        case 'L5': return 'bg-green-500/20 text-green-400 border-green-500/30';
        case 'L6': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        case 'L7': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      }
    };

    return (
      <div className="select-none">
        {/* Node Row */}
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/30 transition-colors ${
            isChecked ? 'bg-purple-500/10 border border-purple-500/30' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => toggleNode(unit.id)}
              className="flex-shrink-0 w-5 h-5 flex items-center justify-center hover:bg-slate-600 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </button>
          ) : (
            <div className="w-5 flex-shrink-0" />
          )}

          {/* Checkbox */}
          <button
            type="button"
            onClick={() => toggleUnitCheckbox(unit.id)}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              isChecked 
                ? 'bg-purple-600 border-purple-600' 
                : 'border-slate-500 hover:border-purple-500'
            }`}
          >
            {isChecked && <Check className="w-3 h-3 text-white" />}
          </button>

          {/* Level Badge */}
          <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded font-roobert-medium border ${getLevelColor(unit.level)}`}>
            {unit.level}
          </span>

          {/* Unit Name */}
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-roobert-medium truncate ${
              isChecked ? 'text-purple-300' : 'text-white'
            }`}>
              {unit.name}
            </div>
          </div>

          {/* Indicator if has checked children */}
          {!isChecked && hasCheckedChildren && (
            <div className="flex-shrink-0 text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
              Has selections
            </div>
          )}
        </div>

        {/* Children (recursive) */}
        {hasChildren && isExpanded && (
          <div className="mt-1">
            {children.map(child => (
              <TreeNode key={child.id} unit={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Inline mode (for System Settings Organization tab)
  if (inline) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">People Directory</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage team members and technology assignments</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-roobert-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Person
          </button>
        </div>

        {/* Content Container */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, role, or function..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Total People</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{people.length}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">With Technologies</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {people.filter(p => p.technologyAssignments && p.technologyAssignments.length > 0).length}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
              <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">Search Results</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{filteredPeople.length}</div>
            </div>
          </div>

          {/* People Table */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
            {filteredPeople.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{searchTerm ? 'No people match your search.' : 'No people yet. Add your first person to get started.'}</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px]">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">BU</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">L3</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">L4</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Function</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Manager</th>
                      <th className="px-4 py-3 text-left text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Technologies</th>
                      <th className="px-4 py-3 text-right text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredPeople.map((person) => {
                      const unitsByLevel = getUnitsByLevel(person.assignedUnits);
                      const techCount = person.technologyAssignments?.length || 0;
                      
                      return (
                        <tr key={person.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-roobert-medium text-gray-900 dark:text-white">{person.firstName} {person.lastName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{person.email}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unitsByLevel.BU || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unitsByLevel.L3 || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{unitsByLevel.L4 || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{person.role || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{person.function || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{person.region || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                            {person.managerId ? (() => {
                              const manager = people.find(p => p.id === person.managerId);
                              return manager ? `${manager.firstName} ${manager.lastName}` : '-';
                            })() : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {techCount > 0 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-roobert-medium bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                {techCount} {techCount === 1 ? 'technology' : 'technologies'}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">None</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(person)}
                                className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setPersonToDelete(person);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modal mode (default)
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
            <Users className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">People Directory</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Manage team members and technology assignments</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              title="Add Person"
            >
              <Plus className="w-5 h-5" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="w-full space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, role, or function..."
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Total People</div>
                <div className="text-2xl font-bold text-white">{people.length}</div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">With Technologies</div>
                <div className="text-2xl font-bold text-white">
                  {people.filter(p => p.technologyAssignments && p.technologyAssignments.length > 0).length}
                </div>
              </div>
              <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-4">
                <div className="text-slate-400 text-sm mb-1">Search Results</div>
                <div className="text-2xl font-bold text-white">{filteredPeople.length}</div>
              </div>
            </div>

            {/* People Table */}
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl overflow-hidden">
              {filteredPeople.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>{searchTerm ? 'No people match your search.' : 'No people yet. Add your first person to get started.'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-900/50 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          BU
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          L3
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          L4
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          Function
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          Technologies
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-roobert-semibold text-slate-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/40">
                      {filteredPeople.map((person) => {
                        const hierarchy = getPersonHierarchy(person.assignedUnits);
                        return (
                          <tr key={person.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-roobert-semibold">
                                  {person.firstName[0]}{person.lastName[0]}
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-roobert-medium text-white">
                                    {person.firstName} {person.lastName}
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {person.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {hierarchy.bu}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {hierarchy.l3}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {hierarchy.l4}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {person.role}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {person.function}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {person.technologyAssignments && person.technologyAssignments.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {person.technologyAssignments.slice(0, 2).map((tech, idx) => (
                                    <span 
                                      key={idx}
                                      className={`px-2 py-1 text-xs rounded-full ${
                                        tech.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                                        tech.status === 'Inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-red-500/20 text-red-400'
                                      }`}
                                    >
                                      {tech.technology}
                                    </span>
                                  ))}
                                  {person.technologyAssignments.length > 2 && (
                                    <span className="px-2 py-1 text-xs text-slate-400">
                                      +{person.technologyAssignments.length - 2}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-500 italic">None</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => openEditModal(person)}
                                  className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(person)}
                                  className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700/40 sticky top-0 bg-slate-800/50 backdrop-blur-sm z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-roobert-semibold text-white">
                      {showEditModal ? 'Edit Person' : 'Add Person'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowSaveConfirm(true)}
                      disabled={!formData.email || !formData.firstName || !formData.lastName}
                      className="p-2 hover:bg-green-500/20 text-green-400 hover:text-green-300 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                      title={showEditModal ? 'Update Person' : 'Create Person'}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setShowAddModal(false);
                        setShowEditModal(false);
                        setEditingPerson(null);
                        resetForm();
                      }}
                      className="p-2 hover:bg-slate-700/50 text-slate-400 hover:text-white rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      placeholder="Smith"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      placeholder="john.smith@company.com"
                    />
                  </div>
                </div>

                {/* Role & Function */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      Role
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                        placeholder="Senior Analyst"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      Function
                    </label>
                    <input
                      type="text"
                      value={formData.function}
                      onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      placeholder="Risk Management"
                    />
                  </div>
                </div>

                {/* Region & Manager */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      Region
                    </label>
                    <input
                      type="text"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                      placeholder="EMEA, Americas, APAC, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-slate-300 mb-2">
                      Manager
                    </label>
                    <select
                      value={formData.managerId}
                      onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="">No Manager</option>
                      {people
                        .filter(p => p.id !== editingPerson?.id)
                        .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
                        .map(person => (
                          <option key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* ==========ORGANIZATIONAL ASSIGNMENTS ========== */}
                <div className="border-t border-slate-600 pt-6">
                  <div className="mb-4">
                    <label className="block text-sm font-roobert-semibold text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Organizational Assignments
                      </div>
                    </label>
                    <p className="text-xs text-slate-400 mb-3">
                      Select Business Units and Products by expanding and checking boxes. Check any level (BU, L3, L4, L5, L6, L7).
                    </p>
                  </div>

                  {/* Hierarchical Tree */}
                  <div className="border border-slate-600 rounded-lg p-4 max-h-96 overflow-y-auto bg-slate-800/30">
                    {getRootBUs().length === 0 ? (
                      <p className="text-sm text-slate-500">No organizational units available</p>
                    ) : (
                      <div className="space-y-1">
                        {getRootBUs().map(bu => (
                          <TreeNode key={bu.id} unit={bu} depth={0} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected Count */}
                  {formData.assignedUnits.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-roobert-medium text-purple-300">
                            {formData.assignedUnits.length} unit{formData.assignedUnits.length !== 1 ? 's' : ''} selected
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, assignedUnits: [] }))}
                          className="text-xs text-purple-400 hover:text-purple-300 underline"
                        >
                          Clear all
                        </button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-3">
                    💡 Expand nodes to see children. Cannot uncheck a parent while children are checked.
                  </p>
                </div>

                {/* Technology Assignments Section */}
                <div>
                  <label className="block text-sm font-roobert-semibold text-slate-300 mb-3">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Technology Assignments
                    </div>
                  </label>
                  <div className="space-y-2">
                    {formData.technologyAssignments.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        No technology assignments yet
                      </p>
                    ) : (
                      formData.technologyAssignments.map((tech, index) => (
                        <div 
                          key={index}
                          className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700 rounded-lg"
                        >
                          <Monitor className="w-4 h-4 text-purple-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-white">
                              {tech.technology}
                            </div>
                            <div className="text-xs text-slate-500">
                              {tech.status}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            tech.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                            tech.status === 'Inactive' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tech.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Technology assignments are managed from the Asset list. This section shows current assignments.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showSaveConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-md"
            >
              <div className="p-6 border-b border-slate-700/40 bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <Save className="w-5 h-5 text-purple-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">
                    Save Changes
                  </h3>
                </div>
              </div>

              <div className="p-6">
                <p className="text-slate-300 mb-6">
                  Would you like to save and close, or continue editing?
                </p>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleSaveAndClose}
                    className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-roobert-semibold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save and Close
                  </button>
                  <button
                    onClick={handleSaveAndContinue}
                    className="w-full px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-roobert-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save and Continue Editing
                  </button>
                  <button
                    onClick={() => setShowSaveConfirm(false)}
                    className="w-full px-4 py-3 border border-slate-600 hover:bg-slate-800/50 text-slate-300 rounded-lg transition-colors font-roobert-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showDeleteConfirm && personToDelete && (
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
                  Are you sure you want to delete <span className="font-roobert-semibold text-white">{personToDelete.firstName} {personToDelete.lastName}</span>?
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
                      setPersonToDelete(null);
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
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Edit, Trash2, ChevronRight, ChevronDown, Users, X } from 'lucide-react';

interface BusinessUnit {
  id: string;
  name: string;
  level: 'BU' | 'L3' | 'L4' | 'L5' | 'L6' | 'L7';
  parentId: string | null;
  fullPath: string;
  children?: BusinessUnit[];
}

interface BusinessUnitsManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

export default function BusinessUnitsManager({ onNotification }: BusinessUnitsManagerProps) {
  const [units, setUnits] = useState<BusinessUnit[]>([]);
  const [hierarchyUnits, setHierarchyUnits] = useState<BusinessUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<BusinessUnit | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    level: 'BU' as BusinessUnit['level'],
    parentId: null as string | null
  });

  useEffect(() => {
    fetchUnits();
  }, []);

  const fetchUnits = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/business-units');
      const data = await response.json();
      
      if (data.success) {
        setUnits(data.units);
        
        // Fetch hierarchy format
        const hierarchyResponse = await fetch('http://localhost:3001/api/business-units?format=hierarchy');
        const hierarchyData = await hierarchyResponse.json();
        if (hierarchyData.success) {
          setHierarchyUnits(hierarchyData.units);
        }
      }
    } catch (error) {
      console.error('Error fetching business units:', error);
      onNotification?.('error', 'Failed to load business units');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/business-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Created ${formData.name}`);
        setShowAddModal(false);
        resetForm();
        fetchUnits();
      } else {
        onNotification?.('error', data.error || 'Failed to create unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      onNotification?.('error', 'Failed to create unit');
    }
  };

  const handleUpdate = async () => {
    if (!editingUnit) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/business-units/${editingUnit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Updated ${formData.name}`);
        setShowEditModal(false);
        setEditingUnit(null);
        resetForm();
        fetchUnits();
      } else {
        onNotification?.('error', data.error || 'Failed to update unit');
      }
    } catch (error) {
      console.error('Error updating unit:', error);
      onNotification?.('error', 'Failed to update unit');
    }
  };

  const handleDelete = async (unit: BusinessUnit) => {
    if (!confirm(`Delete "${unit.name}"? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/business-units/${unit.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Deleted ${unit.name}`);
        fetchUnits();
      } else {
        onNotification?.('error', data.error || 'Failed to delete unit');
      }
    } catch (error) {
      console.error('Error deleting unit:', error);
      onNotification?.('error', 'Failed to delete unit');
    }
  };

  const openEditModal = (unit: BusinessUnit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name,
      level: unit.level,
      parentId: unit.parentId
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      level: 'BU',
      parentId: null
    });
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const renderUnitTree = (unit: BusinessUnit, depth: number = 0) => {
    const hasChildren = unit.children && unit.children.length > 0;
    const isExpanded = expandedIds.has(unit.id);
    
    return (
      <div key={unit.id} className="select-none">
        <div
          className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors group"
          style={{ paddingLeft: `${depth * 1.5 + 0.75}rem` }}
        >
          <div className="flex items-center gap-2 flex-1">
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(unit.id)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <Building2 className="w-4 h-4 text-gray-400" />
            
            <div className="flex-1">
              <div className="font-roobert-medium text-gray-900 dark:text-white">
                {unit.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {unit.level} • {unit.fullPath}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditModal(unit)}
              className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(unit)}
              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {unit.children!.map(child => renderUnitTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const getLevelOptions = () => {
    if (!formData.parentId) {
      // Root level - can be any level, but typically BU
      return ['BU', 'L3', 'L4', 'L5', 'L6', 'L7'];
    }
    
    const parent = units.find(u => u.id === formData.parentId);
    if (!parent) return ['BU', 'L3', 'L4', 'L5', 'L6', 'L7'];
    
    // Can only add child levels below parent
    const levelOrder = ['BU', 'L3', 'L4', 'L5', 'L6', 'L7'];
    const parentIndex = levelOrder.indexOf(parent.level);
    
    // Return levels below parent level
    if (parentIndex === -1 || parentIndex >= levelOrder.length - 1) {
      return ['L7']; // If parent is L7 or unknown, can only add L7
    }
    
    return levelOrder.slice(parentIndex + 1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Outside Container */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
            Business Units
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage organizational hierarchy (BU → L3 → L4 → L5 → L6 → L7)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-roobert-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Unit
        </button>
      </div>

      {/* Hierarchy Tree - Inside Container */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        {hierarchyUnits.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No business units yet. Add your first unit to get started.</p>
          </div>
        ) : (
          <div className="space-y-1">
            {hierarchyUnits.map(unit => renderUnitTree(unit))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">
                    {showEditModal ? 'Edit Unit' : 'Add Business Unit'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingUnit(null);
                      resetForm();
                    }}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="e.g., Capital Markets"
                  />
                </div>

                {/* Parent */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Parent Unit (Optional)
                  </label>
                  <select
                    value={formData.parentId || ''}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        parentId: e.target.value || null,
                        level: 'BU' // Reset level when parent changes
                      });
                    }}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="">None (Root Level)</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.fullPath}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Level
                  </label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as BusinessUnit['level'] })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    {getLevelOptions().map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingUnit(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showEditModal ? handleUpdate : handleCreate}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  {showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

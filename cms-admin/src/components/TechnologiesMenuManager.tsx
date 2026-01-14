import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Plus, Edit, Trash2, GripVertical, X, Link as LinkIcon, ExternalLink } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TechnologyMenuItem {
  id: string;
  name: string;
  contentId: string | null;
  order: number;
}

interface Content {
  id: string;
  title?: string;
  name?: string;
  _contentTag: string;
}

interface TechnologiesMenuManagerProps {
  onNotification?: (type: 'success' | 'error', message: string) => void;
}

export default function TechnologiesMenuManager({ onNotification }: TechnologiesMenuManagerProps) {
  const [menuItems, setMenuItems] = useState<TechnologyMenuItem[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TechnologyMenuItem | null>(null);
  const [hasUnsavedOrder, setHasUnsavedOrder] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contentId: null as string | null
  });

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchMenuItems();
    fetchVendorSummaries();
  }, []);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/technologies-menu');
      const data = await response.json();
      
      if (data.success) {
        setMenuItems(data.items);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      onNotification?.('error', 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorSummaries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/content');
      const data = await response.json();
      
      if (data.success) {
        // Filter to Vendor Summary content by _contentTag field
        const vendors = data.content.filter((c: any) => 
          c._contentTag === 'vendor-summary'
        );
        console.log(`Found ${vendors.length} vendor summaries:`, vendors.map((v: any) => v.title || v.id));
        setVendorSummaries(vendors);
      }
    } catch (error) {
      console.error('Error fetching vendor summaries:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/technologies-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Added ${formData.name}`);
        setShowAddModal(false);
        resetForm();
        fetchMenuItems();
      } else {
        onNotification?.('error', data.error || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      onNotification?.('error', 'Failed to create menu item');
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/technologies-menu/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Updated ${formData.name}`);
        setShowEditModal(false);
        setEditingItem(null);
        resetForm();
        fetchMenuItems();
      } else {
        onNotification?.('error', data.error || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      onNotification?.('error', 'Failed to update menu item');
    }
  };

  const handleDelete = async (item: TechnologyMenuItem) => {
    if (!confirm(`Delete "${item.name}"? This action cannot be undone.`)) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/technologies-menu/${item.id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', `Deleted ${item.name}`);
        fetchMenuItems();
      } else {
        onNotification?.('error', data.error || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      onNotification?.('error', 'Failed to delete menu item');
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        setHasUnsavedOrder(true);
        return newItems;
      });
    }
  };

  const saveOrder = async () => {
    try {
      const itemIds = menuItems.map(item => item.id);
      
      const response = await fetch('http://localhost:3001/api/technologies-menu/reorder/all', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemIds })
      });
      
      const data = await response.json();
      
      if (data.success) {
        onNotification?.('success', 'Menu order saved');
        setHasUnsavedOrder(false);
        fetchMenuItems();
      } else {
        onNotification?.('error', data.error || 'Failed to save order');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      onNotification?.('error', 'Failed to save order');
    }
  };

  const openEditModal = (item: TechnologyMenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      contentId: item.contentId
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contentId: null
    });
  };

  const getLinkedContentName = (contentId: string | null) => {
    if (!contentId) return 'Not linked';
    const content = vendorSummaries.find(v => v.id === contentId);
    return content ? content.name : 'Unknown';
  };

  // Sortable Item Component
  function SortableItem({ item, index }: { item: TechnologyMenuItem; index: number }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
    } = useSortable({ id: item.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 ${
          isDragging ? 'bg-blue-50 dark:bg-blue-900/20 z-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        } transition-colors`}
      >
        <div className="flex items-center gap-4 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5 text-gray-400" />
          </div>
          
          <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          
          <div className="flex-1">
            <div className="font-roobert-medium text-gray-900 dark:text-white">
              {item.name}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
              <LinkIcon className="w-3 h-3" />
              {item.contentId ? (
                <span className="text-green-600 dark:text-green-400">
                  Linked: {getLinkedContentName(item.contentId)}
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Not linked to content
                </span>
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Order: {index + 1}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {item.contentId && (
            <a
              href={`/content/${item.contentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors"
              title="View Content"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            onClick={() => openEditModal(item)}
            className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(item)}
            className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

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
            Technologies Menu
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage technology vendor menu items and link to Vendor Summary content
          </p>
        </div>
        <div className="flex items-center gap-3">
          {hasUnsavedOrder && (
            <button
              onClick={saveOrder}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-roobert-semibold"
            >
              Save Order
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-roobert-semibold"
          >
            <Plus className="w-4 h-4" />
            Add Technology
          </button>
        </div>
      </div>

      {/* Menu Items List */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {menuItems.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Cpu className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No technologies yet. Add your first technology to get started.</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={menuItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {menuItems.map((item, index) => (
                <SortableItem key={item.id} item={item} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {hasUnsavedOrder && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            You have unsaved changes to the menu order. Click "Save Order" to apply changes.
          </p>
        </div>
      )}

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
                    {showEditModal ? 'Edit Technology' : 'Add Technology'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setEditingItem(null);
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
                    Technology Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                    placeholder="e.g., Salesforce, Azure, ServiceNow"
                  />
                </div>

                {/* Link to Vendor Summary */}
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Link to Vendor Summary (Optional)
                  </label>
                  <select
                    value={formData.contentId || ''}
                    onChange={(e) => setFormData({ ...formData, contentId: e.target.value || null })}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="">None</option>
                    {vendorSummaries.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.title || vendor.name || vendor.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Link this menu item to a Vendor Summary content page
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setEditingItem(null);
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

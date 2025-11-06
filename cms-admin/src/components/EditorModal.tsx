import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronRight, Upload, Check, Plus, Pencil, Trash2, Shield, ShieldOff } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  locked: boolean;
  enabled: boolean;
  completed: boolean;
  weight: number;
  content: any;
}

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  dataType: 'summaries' | 'executive-iq' | 'organizations' | 'performance';
  onSave: (data: any, status: 'draft' | 'published') => void;
}

export default function EditorModal({ isOpen, onClose, data, dataType, onSave }: EditorModalProps) {
  const [editedData, setEditedData] = useState<any>(data);
  const [sections, setSections] = useState<Section[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [isDirty, setIsDirty] = useState(false);
  const [editingItem, setEditingItem] = useState<{ sectionId: string; index: number; value: string } | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingArrayItems, setEditingArrayItems] = useState<Set<string>>(new Set());
  const [protectionEnabled, setProtectionEnabled] = useState(true);

  // List sections that should use the add/edit/delete UI
  const listManagementSections = ['highlights', 'weeklyFocus', 'initiatives', 'risks', 'issuesAndBlockers', 'keyMetrics', 'departments', 'header'];

  // Section weights (complexity/time required, 1-10)
  const sectionWeights: { [key: string]: number } = {
    header: 2,
    highlights: 5,
    keyMetrics: 3,
    activityMetrics: 8,
    topAssets: 4,
    weeklyFocus: 5,
    departments: 9,
    initiatives: 8,
    risks: 6,
    issuesAndBlockers: 10,
    outlook: 7,
    sections: 6,
    content: 7,
    keyTakeaways: 5,
    recommendations: 6
  };

  // Calculate weighted completion percentage
  const calculateCompletion = (): number => {
    const enabledSections = sections.filter(s => s.enabled);
    if (enabledSections.length === 0) return 0;

    const totalWeight = enabledSections.reduce((sum, s) => sum + s.weight, 0);
    const completedWeight = enabledSections
      .filter(s => s.completed)
      .reduce((sum, s) => sum + s.weight, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const completionPercentage = calculateCompletion();

  useEffect(() => {
    if (data) {
      setEditedData(data);
      initializeSections(data);
      setStatus(data.status || 'draft');
      setProtectionEnabled(data.protectionEnabled !== false); // Default to true
    }
  }, [data]);

  // Scroll spy effect to update active section
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = (e: Event) => {
      const container = e.target as HTMLElement;
      
      // Find which section is currently in view
      const visibleSection = sections
        .filter(s => s.enabled)
        .find(section => {
          const element = document.getElementById(`section-${section.id}`);
          if (!element) return false;
          
          const rect = element.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          
          return rect.top <= containerRect.top + 150 && rect.bottom > containerRect.top;
        });

      if (visibleSection && visibleSection.id !== activeSection) {
        setActiveSection(visibleSection.id);
      }
    };

    const contentArea = document.querySelector('.modal-content-area');
    if (contentArea) {
      contentArea.addEventListener('scroll', handleScroll);
      return () => contentArea.removeEventListener('scroll', handleScroll);
    }
  }, [isOpen, sections, activeSection]);

  const initializeSections = (jsonData: any) => {
    const newSections: Section[] = [];
    
    // Add Header section for metadata
    const headerFields: any = {};
    const metadataKeys = ['quarter', 'year', 'date', 'title', 'displayName', 'name', 'category', 'lastUpdated'];
    
    metadataKeys.forEach(key => {
      if (jsonData[key] !== undefined) {
        headerFields[key] = jsonData[key];
      }
    });
    
    if (Object.keys(headerFields).length > 0) {
      newSections.push({
        id: 'header',
        title: 'Header',
        locked: false,
        enabled: true,
        completed: jsonData._completed_header === true,
        weight: sectionWeights['header'] || 2,
        content: headerFields
      });
    }
    
    // Create sections based on remaining top-level keys
    Object.keys(jsonData).forEach((key) => {
      if (key !== 'id' && key !== 'status' && !metadataKeys.includes(key) && !key.startsWith('_enabled_') && !key.startsWith('_completed_')) {
        const enabledKey = `_enabled_${key}`;
        const completedKey = `_completed_${key}`;
        const isEnabled = jsonData[enabledKey] !== false; // Default to true if not specified
        const isCompleted = jsonData[completedKey] === true; // Default to false if not specified
        
        newSections.push({
          id: key,
          title: formatSectionTitle(key),
          locked: isCompleted, // Auto-lock if completed
          enabled: isEnabled,
          completed: isCompleted,
          weight: sectionWeights[key] || 5,
          content: jsonData[key]
        });
      }
    });

    setSections(newSections);
    if (newSections.length > 0) {
      setActiveSection(newSections[0].id);
    }
  };

  const formatSectionTitle = (key: string): string => {
    return key
      .split(/(?=[A-Z])|_|-/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const toggleLock = (sectionId: string) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, locked: !s.locked } : s
    ));
  };

  const toggleEnabled = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const action = section.enabled ? 'disable' : 'enable';
    if (window.confirm(`Are you sure you want to ${action} this section? ${section.enabled ? 'It will be hidden from the display.' : 'It will be shown in the display.'}`)) {
      setIsDirty(true);
      
      // Update section state
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ));
      
      // Update edited data with flag
      const newData = { ...editedData };
      newData[`_enabled_${sectionId}`] = !section.enabled;
      setEditedData(newData);
    }
  };

  const toggleComplete = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const action = section.completed ? 'mark as incomplete' : 'mark as complete';
    if (window.confirm(`Are you sure you want to ${action} this section? ${!section.completed ? 'This will lock the section.' : 'This will unlock the section.'}`)) {
      setIsDirty(true);
      
      const newCompleted = !section.completed;
      
      // Update section state - auto lock/unlock based on completion
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, completed: newCompleted, locked: newCompleted } : s
      ));
      
      // Update edited data with flag
      const newData = { ...editedData };
      newData[`_completed_${sectionId}`] = newCompleted;
      setEditedData(newData);
    }
  };

  const handleFieldChange = (sectionId: string, path: string[], value: any) => {
    setIsDirty(true);
    const newData = { ...editedData };
    let current = newData;
    
    // Handle header section specially (fields are at root level)
    if (sectionId === 'header') {
      newData[path[path.length - 1]] = value;
    } else {
      // Navigate to the correct nested object
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
    }
    
    setEditedData(newData);

    // Update section content
    if (sectionId === 'header') {
      const headerFields: any = {};
      const metadataKeys = ['quarter', 'year', 'date', 'title', 'displayName', 'name', 'category', 'lastUpdated'];
      metadataKeys.forEach(key => {
        if (newData[key] !== undefined) {
          headerFields[key] = newData[key];
        }
      });
      setSections(sections.map(s => 
        s.id === 'header' ? { ...s, content: headerFields } : s
      ));
    } else {
      setSections(sections.map(s => 
        s.id === sectionId ? { ...s, content: newData[sectionId] } : s
      ));
    }
  };

  const handleAddItem = (sectionId: string) => {
    // Create template for complex object sections
    let initialValue = '';
    
    if (sectionId === 'issuesAndBlockers') {
      initialValue = JSON.stringify({
        title: '',
        description: '',
        impact: 'medium',
        action: '',
        remediation: '',
        timeline: '',
        outcome: '',
        status: 'not-started'
      }, null, 2);
    } else if (sectionId === 'risks') {
      initialValue = JSON.stringify({
        title: '',
        description: '',
        likelihood: 'medium',
        impact: 'medium',
        mitigation: '',
        owner: '',
        status: 'open'
      }, null, 2);
    } else if (sectionId === 'keyMetrics') {
      initialValue = JSON.stringify({
        label: '',
        value: '',
        unit: ''
      }, null, 2);
    } else if (sectionId === 'initiatives') {
      initialValue = JSON.stringify({
        name: '',
        status: 'not-started',
        progress: 0,
        owner: '',
        impact: 'medium'
      }, null, 2);
    } else if (sectionId === 'departments') {
      initialValue = JSON.stringify({
        name: '',
        performance: 0,
        budget: 0,
        headcount: 0,
        achievements: []
      }, null, 2);
    }
    
    setEditingItem({ sectionId, index: -1, value: initialValue });
    setIsItemModalOpen(true);
  };

  const handleEditItem = (sectionId: string, index: number, value: string) => {
    setEditingItem({ sectionId, index, value });
    setIsItemModalOpen(true);
  };

  const handleDeleteItem = (sectionId: string, index: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      const section = sections.find(s => s.id === sectionId);
      if (section && Array.isArray(section.content)) {
        const newArray = [...section.content];
        newArray.splice(index, 1);
        handleFieldChange(sectionId, [sectionId], newArray);
      }
    }
  };

  const handleSaveItem = () => {
    if (!editingItem) return;
    
    const { sectionId, index, value } = editingItem;
    const section = sections.find(s => s.id === sectionId);
    
    if (sectionId === 'header') {
      // Header section - update individual field in object
      try {
        const parsedValue = JSON.parse(value);
        const [fieldKey] = Object.keys(parsedValue);
        const fieldValue = parsedValue[fieldKey];
        
        // Update the specific field in header
        const newContent = { ...section!.content, [fieldKey]: fieldValue };
        handleFieldChange(sectionId, [sectionId], newContent);
      } catch (e) {
        alert('Invalid JSON format. Please check your input.');
        return;
      }
    } else if (sectionId === 'outlook') {
      // Outlook section - update string content directly
      handleFieldChange(sectionId, [sectionId], value);
    } else if (section && Array.isArray(section.content)) {
      const newArray = [...section.content];
      let itemToSave = value;
      
      // Try to parse as JSON for object items
      if (value.trim().startsWith('{') || value.trim().startsWith('[')) {
        try {
          itemToSave = JSON.parse(value);
        } catch (e) {
          alert('Invalid JSON format. Please check your input.');
          return;
        }
      }
      
      if (index === -1) {
        // Add new item
        newArray.push(itemToSave);
      } else {
        // Edit existing item
        newArray[index] = itemToSave;
      }
      handleFieldChange(sectionId, [sectionId], newArray);
    }
    
    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  const handleSaveDraft = () => {
    onSave({ ...editedData, status: 'draft', protectionEnabled }, 'draft');
    setStatus('draft');
    setIsDirty(false);
  };

  const handlePublish = () => {
    // Check if protection is enabled and completion is not 100%
    if (protectionEnabled && completionPercentage < 100) {
      alert(`⚠️ Cannot Publish: Protection is enabled and completion is ${completionPercentage}%.\n\nYou must complete all enabled sections (100%) before publishing, or disable protection mode.`);
      return;
    }

    if (window.confirm('Are you sure you want to publish? This will make the changes live.')) {
      onSave({ ...editedData, status: 'published', protectionEnabled }, 'published');
      setStatus('published');
      setIsDirty(false);
    }
  };

  const handlePreview = () => {
    // TODO: Implement preview functionality
    console.log('Preview data:', editedData);
  };

  const renderValue = (sectionId: string, key: string, value: any, path: string[] = []): React.ReactElement => {
    const currentPath = [...path, key];
    const section = sections.find(s => s.id === sectionId);
    const isLocked = section?.locked || false;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const uniqueKey = currentPath.filter(p => p).join('.') || `${sectionId}-${key}-obj`;
      const depth = currentPath.length;
      const hasNestedObjects = Object.values(value).some(v => typeof v === 'object' && v !== null && !Array.isArray(v));
      
      // Check if this is a leaf object with only primitive values (like the actual data fields)
      const isLeafObject = depth > 1 && !hasNestedObjects;
      
      // Check if this is a subsection header at depth 2 (like "Demo Studio" or "Key Activity Insights")
      // These should be bold regardless of whether they contain nested objects or primitives
      const isSubsectionHeader = depth === 2 || (hasNestedObjects && depth === 3);
      
      // Special handling for Activity Metrics leaf objects (editable groups)
      if (sectionId === 'activityMetrics' && isLeafObject) {
        const isEditing = editingArrayItems.has(uniqueKey);
        
        return (
          <div key={uniqueKey} className="mb-2">
            <div className="text-sm font-roobert-heavy text-gray-700 dark:text-gray-300 mb-2">
              {formatSectionTitle(key)}
            </div>
            <div className="flex items-start gap-2 group">
              <div className="flex-1 rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                <div className="grid grid-cols-1 gap-2">
                  {Object.entries(value).map(([k, v]) => (
                    <div key={`${uniqueKey}-${k}`} className="flex items-start gap-2">
                      <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[80px] capitalize">
                        {formatSectionTitle(k)}:
                      </span>
                      <input
                        type={typeof v === 'number' ? 'number' : 'text'}
                        value={String(v)}
                        disabled={isLocked || !isEditing}
                        onChange={(e) => {
                          const newValue = typeof v === 'number' ? parseFloat(e.target.value) : e.target.value;
                          handleFieldChange(sectionId, currentPath, { ...value, [k]: newValue });
                        }}
                        className={`flex-1 text-xs font-roobert-regular ${
                          isEditing
                            ? 'px-2 py-1 rounded bg-white dark:bg-gray-900 border border-fis-raspberry focus:border-fis-raspberry outline-none text-gray-900 dark:text-white'
                            : 'bg-transparent border-none outline-none text-gray-900 dark:text-white cursor-default'
                        } disabled:opacity-50`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              {!isLocked && (
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      const newEditing = new Set(editingArrayItems);
                      if (newEditing.has(uniqueKey)) {
                        newEditing.delete(uniqueKey);
                      } else {
                        newEditing.add(uniqueKey);
                      }
                      setEditingArrayItems(newEditing);
                    }}
                    className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                  </button>
                  <button
                    disabled
                    className="p-1.5 rounded transition-colors invisible"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      return (
        <div key={uniqueKey} className="mb-2">
          <div className={
            isSubsectionHeader
              ? "text-sm font-roobert-heavy text-gray-700 dark:text-gray-300 mb-2"
              : "text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry mb-1"
          }>
            {formatSectionTitle(key)}
          </div>
          <div className={
            isLeafObject
              ? "rounded-lg p-2 border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 space-y-1"
              : "space-y-2"
          }>
            {Object.entries(value).map(([k, v]) => 
              renderValue(sectionId, k, v, currentPath)
            )}
          </div>
        </div>
      );
    }

    if (Array.isArray(value)) {
      const uniqueKey = currentPath.filter(p => p).join('.') || `${sectionId}-${key}-arr`;
      
      // Special card-based rendering for topAssets
      if (sectionId === 'topAssets' && typeof value[0] === 'object') {
        return (
          <div key={uniqueKey} className="space-y-2">
            {value.map((item, index) => {
              const itemKey = `${uniqueKey}-${index}`;
              const isEditing = editingArrayItems.has(itemKey);
              
              return (
                <div key={itemKey} className="flex items-start gap-2 group">
                  <div className="flex-1 rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(item).map(([k, v]) => (
                        <div key={`${itemKey}-${k}`} className="flex items-start gap-2">
                          <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[80px] capitalize">
                            {formatSectionTitle(k)}:
                          </span>
                          <input
                            type={typeof v === 'number' ? 'number' : 'text'}
                            value={String(v)}
                            disabled={isLocked || !isEditing}
                            onChange={(e) => {
                              const newArray = [...value];
                              const newValue = typeof v === 'number' ? parseFloat(e.target.value) : e.target.value;
                              newArray[index] = { ...newArray[index], [k]: newValue };
                              handleFieldChange(sectionId, [sectionId], newArray);
                            }}
                            className={`flex-1 text-xs font-roobert-regular ${
                              isEditing
                                ? 'px-2 py-1 rounded bg-white dark:bg-gray-900 border border-fis-raspberry focus:border-fis-raspberry outline-none text-gray-900 dark:text-white'
                                : 'bg-transparent border-none outline-none text-gray-900 dark:text-white cursor-default'
                            } disabled:opacity-50`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  {!isLocked && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const newEditing = new Set(editingArrayItems);
                          if (newEditing.has(itemKey)) {
                            newEditing.delete(itemKey);
                          } else {
                            newEditing.add(itemKey);
                          }
                          setEditingArrayItems(newEditing);
                        }}
                        className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                      </button>
                      <button
                        disabled
                        className="p-1.5 rounded transition-colors invisible"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      }
      
      return (
        <div key={uniqueKey} className="ml-1.5">
          <div className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry">
            {formatSectionTitle(key)}
          </div>
          <div className="space-y-0.5">
            {value.map((item, index) => (
              <div key={`${uniqueKey}-${index}`} className="ml-4">
                {typeof item === 'object' ? (
                  Object.entries(item).map(([k, v]) => 
                    renderValue(sectionId, k, v, [...currentPath, index.toString()])
                  )
                ) : typeof item === 'string' && item.length > 100 ? (
                  <textarea
                    value={item}
                    disabled={isLocked}
                    onChange={(e) => {
                      const newArray = [...value];
                      newArray[index] = e.target.value;
                      handleFieldChange(sectionId, currentPath, newArray);
                    }}
                    rows={Math.min(Math.ceil(item.length / 80), 8)}
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={item}
                    disabled={isLocked}
                    onChange={(e) => {
                      const newArray = [...value];
                      newArray[index] = e.target.value;
                      handleFieldChange(sectionId, currentPath, newArray);
                    }}
                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }
    const uniqueKey = currentPath.filter(p => p).join('.') || `${sectionId}-${key}-field`;
    return (
      <div key={uniqueKey} className="flex items-center gap-2 mb-0.5">
        <label className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300 min-w-[150px]">
          {formatSectionTitle(key)}:
        </label>
        {typeof value === 'boolean' ? (
          <input
            type="checkbox"
            checked={value}
            disabled={isLocked}
            onChange={(e) => handleFieldChange(sectionId, currentPath, e.target.checked)}
            className="w-5 h-5 rounded border-gray-300 text-fis-eggplant focus:ring-fis-raspberry disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : typeof value === 'number' ? (
          <input
            type="number"
            value={value}
            disabled={isLocked}
            onChange={(e) => handleFieldChange(sectionId, currentPath, parseFloat(e.target.value))}
            className="flex-1 px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : typeof value === 'string' && value.length > 100 ? (
          <textarea
            value={value}
            disabled={isLocked}
            onChange={(e) => handleFieldChange(sectionId, currentPath, e.target.value)}
            rows={Math.min(Math.ceil(value.length / 80), 10)}
            className="flex-1 px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y"
          />
        ) : (
          <input
            type="text"
            value={value}
            disabled={isLocked}
            onChange={(e) => handleFieldChange(sectionId, currentPath, e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-6xl h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 glass-strong">
            <div>
              <h2 className="text-xl font-roobert-heavy text-gray-900 dark:text-white">
                {data?.displayName || data?.date || data?.title || 'Edit Content'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Editing {dataType.replace('-', ' ')}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-3 py-1 rounded-full text-xs font-roobert-medium ${
                  status === 'published' 
                    ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
                    : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                }`}>
                  {status === 'published' ? '● LIVE' : '● DRAFT'}
                </span>
                {isDirty && (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-medium bg-orange-500/20 text-orange-600">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Completion Donut Chart */}
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16">
                  {/* Background circle */}
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      className="text-gray-200 dark:text-gray-700"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="currentColor"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPercentage / 100)}`}
                      className={`transition-all duration-500 ${
                        completionPercentage === 100 
                          ? 'text-green-500' 
                          : completionPercentage >= 50 
                          ? 'text-yellow-500' 
                          : 'text-red-500'
                      }`}
                      strokeLinecap="round"
                    />
                  </svg>
                  {/* Percentage text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                      {completionPercentage}%
                    </span>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xs font-roobert-semibold text-gray-900 dark:text-white">Completion</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {sections.filter(s => s.enabled && s.completed).length}/{sections.filter(s => s.enabled).length} sections
                  </p>
                </div>
              </div>

              {/* Protection Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setProtectionEnabled(!protectionEnabled)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all ${
                    protectionEnabled
                      ? 'bg-green-500/10 border-green-500/50 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                  title={protectionEnabled ? 'Protection ON: Must reach 100% to publish' : 'Protection OFF: Can publish anytime'}
                >
                  {protectionEnabled ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <ShieldOff className="w-4 h-4" />
                  )}
                  <span className="text-xs font-roobert-semibold">
                    {protectionEnabled ? 'Protected' : 'Unprotected'}
                  </span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Live Warning Banner */}
          {status === 'published' && dataType === 'summaries' && (
            <div className="bg-red-500/10 border-b-2 border-red-500/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-roobert-bold text-lg">!</span>
                </div>
                <div>
                  <p className="text-sm font-roobert-bold text-red-600 dark:text-red-400">
                    ⚠️ WARNING: This summary is LIVE and published
                  </p>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">
                    Any changes you save will be immediately visible to all users viewing the executive dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={handleSaveDraft}
              disabled={!isDirty}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-fis-navy text-white font-roobert-medium hover:bg-fis-eggplant transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              onClick={handlePreview}
              className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/20 hover:border-fis-eggplant font-roobert-medium transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={handlePublish}
              disabled={sections.some(s => !s.locked)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              Publish
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sticky Navigation */}
            <div className="w-56 border-r border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 overflow-y-auto">
              <div className="p-3 space-y-1.5">
                {sections.map((section) => (
                  <div
                    key={section.id}
                    className={`rounded-lg transition-all ${
                      !section.enabled ? 'opacity-50' : ''
                    } ${section.completed ? 'bg-fis-green/20' : ''}`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (section.enabled) {
                            setActiveSection(section.id);
                            // Scroll to section
                            const element = document.getElementById(`section-${section.id}`);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            }
                          }
                        }}
                        disabled={!section.enabled}
                        className={`flex-1 text-left px-2.5 py-1.5 rounded-lg transition-all font-roobert-medium text-sm ${
                          section.completed
                            ? 'bg-transparent text-fis-green dark:text-fis-green'
                            : section.enabled
                              ? activeSection === section.id
                                ? 'bg-fis-navy text-white'
                                : 'hover:bg-white/50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed line-through'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="flex-1">{section.title}</span>
                          <div className="flex items-center gap-1">
                            {section.completed && (
                              <Check className="w-3 h-3 text-fis-green" />
                            )}
                            {section.locked && !section.completed && (
                              <Lock className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </button>
                      {/* Enable/Disable button - hide for Performance, Header, and Completed sections */}
                      {dataType !== 'performance' && section.id !== 'header' && !section.completed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleEnabled(section.id);
                          }}
                          className={`p-1.5 rounded-lg transition-colors ${
                            section.enabled
                              ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-600'
                          }`}
                          title={section.enabled ? 'Disable section' : 'Enable section'}
                        >
                          {section.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 scroll-smooth modal-content-area">
              <div className="space-y-2.5">
                {sections.filter(s => s.enabled).map((section) => (
                  <motion.div
                    key={section.id}
                    id={`section-${section.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-strong rounded-xl overflow-hidden border-2 border-transparent"
                  >
                    {/* Section Header */}
                    <div className={`flex items-center justify-between p-3 ${
                      section.completed
                        ? 'bg-gradient-to-r from-fis-green/10 to-fis-green/60 dark:from-fis-green/10 dark:to-fis-green/60'
                        : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700'
                    }`}>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="flex items-center gap-3 flex-1 text-left group"
                      >
                        {collapsedSections.has(section.id) ? (
                          <ChevronRight className={`w-6 h-6 ${section.completed ? 'text-fis-green' : 'text-fis-eggplant'}`} />
                        ) : (
                          <ChevronDown className={`w-6 h-6 ${section.completed ? 'text-fis-green' : 'text-fis-eggplant'}`} />
                        )}
                        <span className={`font-roobert-heavy text-base uppercase tracking-wide ${
                          section.completed ? 'text-gray-900 dark:text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          {section.title}
                        </span>
                      </button>
                      <div className="flex items-center gap-1.5">
                        {/* Add button for list management sections (except header) */}
                        {listManagementSections.includes(section.id) && section.id !== 'header' && !section.locked && (
                          <button
                            onClick={() => handleAddItem(section.id)}
                            className="p-1 hover:bg-fis-green/20 rounded transition-colors"
                            title="Add item"
                          >
                            <Plus className="w-4 h-4 text-fis-green" />
                          </button>
                        )}
                        {/* Complete/Uncomplete button */}
                        <button
                          onClick={() => toggleComplete(section.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            section.completed
                              ? 'bg-fis-green/30 text-fis-green hover:bg-fis-green/40'
                              : 'bg-fis-green/20 text-fis-green hover:bg-fis-green/30'
                          }`}
                          title={section.completed ? 'Return to Draft' : 'Mark as Complete'}
                        >
                          {section.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </button>
                        {/* Lock/Unlock button - only show if not completed */}
                        {!section.completed && (
                          <button
                            onClick={() => toggleLock(section.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              section.locked
                                ? 'bg-fis-green/20 text-fis-green hover:bg-fis-green/30'
                                : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
                            }`}
                            title={section.locked ? 'Unlock section' : 'Lock section'}
                          >
                            {section.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Section Content */}
                    {!collapsedSections.has(section.id) && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="p-3"
                      >
                        {Array.isArray(section.content) ? (
                          <div className={
                            section.id === 'topAssets'
                              ? 'space-y-2'
                              : ['risks', 'issuesAndBlockers', 'keyMetrics', 'initiatives', 'departments'].includes(section.id)
                              ? 'space-y-1'
                              : 'space-y-2'
                          }>
                            {section.content.map((item, index) => (
                              <div key={index}>
                                {typeof item === 'string' ? (
                                  listManagementSections.includes(section.id) ? (
                                    // List management UI (read-only with edit/delete buttons)
                                    <div className="flex items-start gap-2 group">
                                      <div className="flex-1 glass rounded-lg px-3 py-2 border border-white/10 text-xs font-roobert-regular text-gray-900 dark:text-white">
                                        {item}
                                      </div>
                                      {!section.locked && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => handleEditItem(section.id, index, item)}
                                            className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                                            title="Edit"
                                          >
                                            <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteItem(section.id, index)}
                                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Traditional textarea for other sections
                                    <textarea
                                      value={item}
                                      disabled={section.locked}
                                      onChange={(e) => {
                                        const newArray = [...section.content];
                                        newArray[index] = e.target.value;
                                        handleFieldChange(section.id, [section.id], newArray);
                                      }}
                                      rows={Math.max(3, Math.min(Math.ceil(item.length / 80), 10))}
                                      className="w-full px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed resize-y"
                                      placeholder={`Item ${index + 1}`}
                                    />
                                  )
                                ) : typeof item === 'object' ? (
                                  section.id === 'topAssets' ? (
                                    // Top Assets - matching Risks/Issues style
                                    <div className="flex items-start gap-2 group">
                                      <div className="flex-1 rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                                        <div className="grid grid-cols-1 gap-2">
                                          {Object.entries(item).map(([k, v]) => {
                                            const itemKey = `${section.id}-${index}`;
                                            const isEditing = editingArrayItems.has(itemKey);
                                            
                                            return (
                                              <div key={`${section.id}-${index}-${k}`} className="flex items-start gap-2">
                                                <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[80px] capitalize">
                                                  {formatSectionTitle(k)}:
                                                </span>
                                                <input
                                                  type={typeof v === 'number' ? 'number' : 'text'}
                                                  value={String(v)}
                                                  disabled={section.locked || !isEditing}
                                                  onChange={(e) => {
                                                    const newArray = [...section.content];
                                                    const newValue = typeof v === 'number' ? parseFloat(e.target.value) : e.target.value;
                                                    newArray[index] = { ...newArray[index], [k]: newValue };
                                                    handleFieldChange(section.id, [section.id], newArray);
                                                  }}
                                                  className={`flex-1 text-xs font-roobert-regular ${
                                                    isEditing
                                                      ? 'px-2 py-1 rounded bg-white dark:bg-gray-900 border border-fis-raspberry focus:border-fis-raspberry outline-none text-gray-900 dark:text-white'
                                                      : 'bg-transparent border-none outline-none text-gray-900 dark:text-white cursor-default'
                                                  } disabled:opacity-50`}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                      {!section.locked && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => {
                                              const itemKey = `${section.id}-${index}`;
                                              const newEditing = new Set(editingArrayItems);
                                              if (newEditing.has(itemKey)) {
                                                newEditing.delete(itemKey);
                                              } else {
                                                newEditing.add(itemKey);
                                              }
                                              setEditingArrayItems(newEditing);
                                            }}
                                            className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                                            title="Edit"
                                          >
                                            <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                                          </button>
                                          <button
                                            disabled
                                            className="p-1.5 rounded transition-colors invisible"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : listManagementSections.includes(section.id) ? (
                                    // List management UI for objects (each object in its own card with edit/delete)
                                    <div className="flex items-start gap-2 group">
                                      <div className="flex-1 rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                                        {section.id === 'keyMetrics' ? (
                                          // Display Key Metrics with styled label like Top Assets
                                          <div className="flex items-start gap-2">
                                            <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[100px]">
                                              {item.label}:
                                            </span>
                                            <span className="text-xs font-roobert-regular text-gray-900 dark:text-white flex-1">
                                              {item.value}{item.unit ? ' ' + item.unit : ''}
                                            </span>
                                          </div>
                                        ) : (
                                          // Standard multi-line format for other objects (Risks, Issues/Blockers, Strategic Initiatives)
                                          <div className="grid grid-cols-1 gap-2">
                                            {Object.entries(item).map(([k, v]) => (
                                              <div key={`${section.id}-${index}-${k}`} className="flex items-start gap-2">
                                                <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[120px] capitalize">
                                                  {formatSectionTitle(k)}:
                                                </span>
                                                <span className="text-xs font-roobert-regular text-gray-900 dark:text-white flex-1">
                                                  {String(v)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                      {!section.locked && (
                                        <div className="flex gap-1">
                                          <button
                                            onClick={() => handleEditItem(section.id, index, JSON.stringify(item, null, 2))}
                                            className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                                            title="Edit"
                                          >
                                            <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteItem(section.id, index)}
                                            className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                                            title="Delete"
                                          >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    // Traditional nested rendering for other sections
                                    <div className="glass rounded-lg p-1 border border-white/10">
                                      {Object.entries(item).map(([k, v]) => 
                                        renderValue(section.id, k, v, [section.id, index.toString()])
                                      )}
                                    </div>
                                  )
                                ) : typeof item === 'number' ? (
                                  <input
                                    type="number"
                                    value={item}
                                    disabled={section.locked}
                                    onChange={(e) => {
                                      const newArray = [...section.content];
                                      newArray[index] = parseFloat(e.target.value);
                                      handleFieldChange(section.id, [section.id], newArray);
                                    }}
                                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                ) : (
                                  <input
                                    type="text"
                                    value={String(item)}
                                    disabled={section.locked}
                                    onChange={(e) => {
                                      const newArray = [...section.content];
                                      newArray[index] = e.target.value;
                                      handleFieldChange(section.id, [section.id], newArray);
                                    }}
                                    className="w-full px-3 py-2 rounded-lg glass border border-white/20 focus:border-fis-raspberry outline-none transition-all text-sm text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : typeof section.content === 'object' && !Array.isArray(section.content) ? (
                          section.id === 'header' ? (
                            // Header section - display fields with purple labels and edit button
                            <div className="space-y-1">
                              {Object.entries(section.content).map(([key, value]) => (
                                <div key={`header-${key}`} className="flex items-start gap-2 group">
                                  <div className="flex-1 glass rounded-lg px-3 py-2 border border-white/10">
                                    <div className="flex items-start gap-2">
                                      <span className="text-xs font-roobert-medium text-fis-eggplant dark:text-fis-raspberry min-w-[100px] capitalize">
                                        {formatSectionTitle(key)}:
                                      </span>
                                      <span className="text-xs font-roobert-regular text-gray-900 dark:text-white flex-1">
                                        {String(value)}
                                      </span>
                                    </div>
                                  </div>
                                  {!section.locked && (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleEditItem(section.id, -1, JSON.stringify({ [key]: value }, null, 2))}
                                        className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                                      </button>
                                      <button
                                        disabled
                                        className="p-1.5 rounded transition-colors invisible"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {Object.entries(section.content).map(([key, value]) => 
                                renderValue(section.id, key, value, [section.id])
                              )}
                            </div>
                          )
                        ) : typeof section.content === 'string' ? (
                          section.id === 'outlook' ? (
                            // Outlook section - single card with edit/delete buttons (delete hidden)
                            <div className="flex items-start gap-2 group">
                              <div className="flex-1 rounded-lg p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 shadow-sm">
                                <p className="text-xs font-roobert-regular text-gray-900 dark:text-white leading-relaxed">
                                  {section.content}
                                </p>
                              </div>
                              {!section.locked && (
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => handleEditItem(section.id, 0, section.content)}
                                    className="p-1.5 hover:bg-fis-navy/20 rounded transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-4 h-4 text-fis-navy dark:text-fis-raspberry" />
                                  </button>
                                  <button
                                    disabled
                                    className="p-1.5 rounded transition-colors invisible"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {section.content}
                            </div>
                          )
                        ) : (
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {JSON.stringify(section.content, null, 2)}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Item Edit Modal */}
      <AnimatePresence>
        {isItemModalOpen && editingItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
              onClick={() => {
                setIsItemModalOpen(false);
                setEditingItem(null);
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="relative bg-gradient-to-br from-white via-purple-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/40 dark:to-pink-900/30 rounded-2xl p-5 w-full max-w-2xl shadow-2xl border-2 border-fis-eggplant/20 dark:border-fis-raspberry/30 max-h-[90vh] overflow-y-auto backdrop-blur-xl"
              style={{
                boxShadow: '0 0 60px rgba(94, 53, 177, 0.15), 0 20px 40px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Decorative gradient bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fis-eggplant via-fis-raspberry to-fis-eggplant rounded-t-2xl" />
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-roobert-heavy bg-gradient-to-r from-fis-eggplant to-fis-raspberry bg-clip-text text-transparent">
                    {editingItem.index === -1 ? 'Add Item' : 'Edit Item'}
                  </h3>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-fis-raspberry to-transparent mt-1 rounded-full" />
                </div>
                <button
                  onClick={() => {
                    setIsItemModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="p-2 hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/20 rounded-lg transition-all group"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-fis-raspberry transition-colors" />
                </button>
              </div>

              {(() => {
                // Try to parse as JSON object for structured forms
                let parsedValue;
                try {
                  parsedValue = editingItem.value.trim().startsWith('{') ? JSON.parse(editingItem.value) : null;
                } catch (e) {
                  parsedValue = null;
                }

                if (parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)) {
                  // Render structured form for objects
                  return (
                    <div className="space-y-3">
                      {Object.entries(parsedValue).map(([key, value], idx) => (
                        <motion.div 
                          key={key}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <label className="block text-xs font-roobert-semibold bg-gradient-to-r from-fis-eggplant to-fis-navy bg-clip-text text-transparent mb-1.5 capitalize flex items-center gap-2">
                            <span className="w-1 h-3 bg-gradient-to-b from-fis-raspberry to-fis-eggplant rounded-full" />
                            {formatSectionTitle(key)}
                          </label>
                          {key === 'achievements' && Array.isArray(value) ? (
                            <div className="space-y-2">
                              {value.map((achievement: string, achIdx: number) => (
                                <div key={achIdx} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={achievement}
                                    onChange={(e) => {
                                      const newAchievements = [...value];
                                      newAchievements[achIdx] = e.target.value;
                                      const updated = { ...parsedValue, [key]: newAchievements };
                                      setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                                    }}
                                    className="flex-1 px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white font-roobert-regular placeholder:text-gray-400"
                                    placeholder="Achievement..."
                                  />
                                  <button
                                    onClick={() => {
                                      const newAchievements = value.filter((_: any, i: number) => i !== achIdx);
                                      const updated = { ...parsedValue, [key]: newAchievements };
                                      setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                                    }}
                                    className="p-2 hover:bg-red-500/20 rounded transition-colors"
                                    title="Remove"
                                  >
                                    <X className="w-4 h-4 text-red-500" />
                                  </button>
                                </div>
                              ))}
                              <button
                                onClick={() => {
                                  const newAchievements = [...value, ''];
                                  const updated = { ...parsedValue, [key]: newAchievements };
                                  setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                                }}
                                className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-fis-eggplant/30 dark:border-fis-raspberry/30 hover:border-fis-raspberry dark:hover:border-fis-raspberry hover:bg-fis-raspberry/5 transition-all text-xs text-fis-eggplant dark:text-fis-raspberry font-roobert-medium flex items-center justify-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Add Achievement
                              </button>
                            </div>
                          ) : key === 'description' || key === 'outcome' || key === 'remediation' ? (
                            <textarea
                              value={String(value)}
                              onChange={(e) => {
                                const updated = { ...parsedValue, [key]: e.target.value };
                                setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                              }}
                              rows={3}
                              className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white resize-y font-roobert-regular placeholder:text-gray-400"
                            />
                          ) : key === 'performance' || key === 'budget' || key === 'headcount' || key === 'progress' ? (
                            <input
                              type="number"
                              value={String(value)}
                              onChange={(e) => {
                                const updated = { ...parsedValue, [key]: parseFloat(e.target.value) || 0 };
                                setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white font-roobert-regular placeholder:text-gray-400"
                              placeholder={key === 'performance' ? '0-100' : '0'}
                            />
                          ) : key === 'impact' ? (
                            <select
                              value={String(value)}
                              onChange={(e) => {
                                const updated = { ...parsedValue, [key]: e.target.value };
                                setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white font-roobert-regular cursor-pointer"
                            >
                              <option value="low">Low</option>
                              <option value="medium">Medium</option>
                              <option value="high">High</option>
                              <option value="critical">Critical</option>
                            </select>
                          ) : key === 'status' ? (
                            <select
                              value={String(value)}
                              onChange={(e) => {
                                const updated = { ...parsedValue, [key]: e.target.value };
                                setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white font-roobert-regular cursor-pointer"
                            >
                              <option value="not-started">Not Started</option>
                              <option value="in-progress">In Progress</option>
                              <option value="completed">Completed</option>
                              <option value="blocked">Blocked</option>
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={String(value)}
                              onChange={(e) => {
                                const updated = { ...parsedValue, [key]: e.target.value };
                                setEditingItem({ ...editingItem, value: JSON.stringify(updated, null, 2) });
                              }}
                              className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white font-roobert-regular placeholder:text-gray-400"
                            />
                          )}
                        </motion.div>
                      ))}
                    </div>
                  );
                } else {
                  // Render simple textarea for strings
                  return (
                    <textarea
                      value={editingItem.value}
                      onChange={(e) => setEditingItem({ ...editingItem, value: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 rounded-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-fis-eggplant/20 dark:border-fis-raspberry/20 focus:border-fis-raspberry dark:focus:border-fis-raspberry focus:shadow-lg focus:shadow-fis-raspberry/20 outline-none transition-all text-xs text-gray-900 dark:text-white resize-y font-roobert-regular placeholder:text-gray-400"
                      placeholder="Enter item text..."
                      autoFocus
                    />
                  );
                }
              })()}

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-fis-eggplant/30 to-transparent my-4" />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setIsItemModalOpen(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 border border-fis-eggplant/20 dark:border-fis-raspberry/20 transition-all hover:border-fis-eggplant/40"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 rounded-lg text-sm font-roobert-semibold bg-gradient-to-r from-fis-eggplant to-fis-raspberry hover:from-fis-raspberry hover:to-fis-eggplant text-white transition-all shadow-lg hover:shadow-xl hover:shadow-fis-raspberry/50 transform hover:scale-[1.02] relative overflow-hidden group"
                >
                  <span className="relative z-10">{editingItem.index === -1 ? 'Add' : 'Save'}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

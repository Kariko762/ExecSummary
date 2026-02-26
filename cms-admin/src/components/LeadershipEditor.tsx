import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Eye, EyeOff, Sparkles, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';

interface LeadershipEditorProps {
  data: any;
  onSave: (data: any) => void;
  onClose: () => void;
  isNewContent: boolean;
}

export default function LeadershipEditor({ data, onSave, onClose, isNewContent }: LeadershipEditorProps) {
  const [formData, setFormData] = useState(data);
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleSection = (sectionName: string) => {
    const enabledKey = `_enabled_${sectionName}`;
    updateField(enabledKey, !formData[enabledKey]);
  };

  const updateArrayItem = (sectionName: string, index: number, value: string) => {
    const newArray = [...(formData[sectionName] || [])];
    newArray[index] = value;
    updateField(sectionName, newArray);
  };

  const addArrayItem = (sectionName: string, defaultValue: any = '') => {
    const newArray = [...(formData[sectionName] || []), defaultValue];
    updateField(sectionName, newArray);
  };

  const removeArrayItem = (sectionName: string, index: number) => {
    const newArray = (formData[sectionName] || []).filter((_: any, i: number) => i !== index);
    updateField(sectionName, newArray);
  };

  const updateStatusBoardColumn = (columnIndex: number, itemIndex: number, value: string) => {
    const columns = [...(formData.priorityUpdates?.columns || [])];
    columns[columnIndex].items[itemIndex] = value;
    updateField('priorityUpdates', { ...formData.priorityUpdates, columns });
  };

  const addStatusBoardItem = (columnIndex: number) => {
    const columns = [...(formData.priorityUpdates?.columns || [])];
    columns[columnIndex].items.push('New item');
    updateField('priorityUpdates', { ...formData.priorityUpdates, columns });
  };

  const removeStatusBoardItem = (columnIndex: number, itemIndex: number) => {
    const columns = [...(formData.priorityUpdates?.columns || [])];
    columns[columnIndex].items = columns[columnIndex].items.filter((_: any, i: number) => i !== itemIndex);
    updateField('priorityUpdates', { ...formData.priorityUpdates, columns });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden"
      >
        {/* Header with Navy/Raspberry Gradient */}
        <div className="relative bg-gradient-to-br from-fis-navy via-blue-900 to-fis-raspberry text-white flex-shrink-0">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="editor-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="currentColor" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#editor-grid)" />
            </svg>
          </div>

          {/* Header Content */}
          <div className="relative px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-roobert-bold">
                    {formData.title || 'Weekly Leadership Summary'}
                  </h1>
                  <p className="text-white/80 text-sm font-roobert-light">
                    {formData.metadata?.weekStart && formData.metadata?.weekEnd
                      ? `Week of ${formData.metadata.weekStart} - ${formData.metadata.weekEnd}`
                      : 'AI-Generated Weekly Leadership Summary'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all flex items-center gap-2 border border-white/20"
                >
                  {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPreview ? 'Edit Mode' : 'Preview'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={onClose}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Metadata Row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-white/80 text-xs font-roobert-medium mb-1">Week Start</label>
                <input
                  type="date"
                  value={formData.metadata?.weekStart || ''}
                  onChange={(e) => updateField('metadata', { ...formData.metadata, weekStart: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-roobert-medium mb-1">Week End</label>
                <input
                  type="date"
                  value={formData.metadata?.weekEnd || ''}
                  onChange={(e) => updateField('metadata', { ...formData.metadata, weekEnd: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs font-roobert-medium mb-1">Status</label>
                <select
                  value={formData.status || 'draft'}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                >
                  <option value="draft" className="bg-gray-800">Draft</option>
                  <option value="published" className="bg-gray-800">Published</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex px-20">
          {/* Editor Panel */}
          <div className={`${showPreview ? 'w-1/2' : 'w-full'} overflow-y-auto p-6 border-r border-gray-200 dark:border-gray-700`}>
            {/* Basic Info */}
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Week Start
                    </label>
                    <input
                      type="date"
                      value={formData.metadata?.weekStart || ''}
                      onChange={(e) => updateField('metadata', { ...formData.metadata, weekStart: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                      Week End
                    </label>
                    <input
                      type="date"
                      value={formData.metadata?.weekEnd || ''}
                      onChange={(e) => updateField('metadata', { ...formData.metadata, weekEnd: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status || 'draft'}
                    onChange={(e) => updateField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
            </div>

            {/* BLUF Section */}
            <SectionEditor
              title="BLUF (Bottom Line Up Front)"
              sectionName="bluf"
              enabled={formData._enabled_bluf}
              onToggle={() => toggleSection('bluf')}
              icon={<Sparkles className="w-5 h-5" />}
            >
              <textarea
                value={formData.bluf?.replace(/<[^>]*>/g, '') || ''}
                onChange={(e) => updateField('bluf', `<h2>Bottom Line Up Front</h2><p>${e.target.value}</p>`)}
                rows={4}
                placeholder="Key takeaway for the week..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-roobert-light"
              />
            </SectionEditor>

            {/* Key Highlights */}
            <SectionEditor
              title="Key Highlights"
              sectionName="keyHighlights"
              enabled={formData._enabled_keyHighlights}
              onToggle={() => toggleSection('keyHighlights')}
              icon={<CheckCircle className="w-5 h-5" />}
            >
              <div className="space-y-2">
                {(formData.keyHighlights || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('keyHighlights', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeArrayItem('keyHighlights', index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('keyHighlights', 'New highlight')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  + Add Highlight
                </button>
              </div>
            </SectionEditor>

            {/* Weekly Metrics */}
            <SectionEditor
              title="Weekly Metrics"
              sectionName="weeklyMetrics"
              enabled={formData._enabled_weeklyMetrics}
              onToggle={() => toggleSection('weeklyMetrics')}
              icon={<TrendingUp className="w-5 h-5" />}
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Metric Name</label>
                  <input
                    type="text"
                    value={formData.weeklyMetrics?.metric || ''}
                    onChange={(e) => updateField('weeklyMetrics', { ...formData.weeklyMetrics, metric: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Value</label>
                  <input
                    type="text"
                    value={formData.weeklyMetrics?.value || ''}
                    onChange={(e) => updateField('weeklyMetrics', { ...formData.weeklyMetrics, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Change</label>
                  <input
                    type="text"
                    value={formData.weeklyMetrics?.change || ''}
                    onChange={(e) => updateField('weeklyMetrics', { ...formData.weeklyMetrics, change: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={formData.weeklyMetrics?.status || 'neutral'}
                    onChange={(e) => updateField('weeklyMetrics', { ...formData.weeklyMetrics, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="up">Up (Green)</option>
                    <option value="down">Down (Red)</option>
                    <option value="neutral">Neutral (Gray)</option>
                  </select>
                </div>
              </div>
            </SectionEditor>

            {/* Priority Updates (Status Board) */}
            <SectionEditor
              title="Priority Updates"
              sectionName="priorityUpdates"
              enabled={formData._enabled_priorityUpdates}
              onToggle={() => toggleSection('priorityUpdates')}
              icon={<AlertTriangle className="w-5 h-5" />}
            >
              <div className="grid grid-cols-3 gap-4">
                {(formData.priorityUpdates?.columns || []).map((column: any, colIndex: number) => (
                  <div key={colIndex} className="space-y-2">
                    <h4 className="font-roobert-semibold text-gray-900 dark:text-white">{column.title}</h4>
                    {column.items.map((item: string, itemIndex: number) => (
                      <div key={itemIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateStatusBoardColumn(colIndex, itemIndex, e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={() => removeStatusBoardItem(colIndex, itemIndex)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addStatusBoardItem(colIndex)}
                      className="w-full px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </SectionEditor>

            {/* Notes & Activities */}
            <SectionEditor
              title="Notes & Activities"
              sectionName="notesActivities"
              enabled={formData._enabled_notesActivities}
              onToggle={() => toggleSection('notesActivities')}
            >
              <div className="space-y-2">
                {(formData.notesActivities || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('notesActivities', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeArrayItem('notesActivities', index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('notesActivities', 'New activity')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  + Add Activity
                </button>
              </div>
            </SectionEditor>

            {/* Tasks Completed */}
            <SectionEditor
              title="Tasks Completed"
              sectionName="tasksCompleted"
              enabled={formData._enabled_tasksCompleted}
              onToggle={() => toggleSection('tasksCompleted')}
            >
              <div className="space-y-2">
                {(formData.tasksCompleted || []).map((item: any, index: number) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="checkbox"
                      checked={item.checked || false}
                      onChange={(e) => {
                        const newArray = [...formData.tasksCompleted];
                        newArray[index].checked = e.target.checked;
                        updateField('tasksCompleted', newArray);
                      }}
                      className="w-4 h-4"
                    />
                    <input
                      type="text"
                      value={item.label || ''}
                      onChange={(e) => {
                        const newArray = [...formData.tasksCompleted];
                        newArray[index].label = e.target.value;
                        updateField('tasksCompleted', newArray);
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeArrayItem('tasksCompleted', index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('tasksCompleted', { label: 'New task', checked: true })}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  + Add Task
                </button>
              </div>
            </SectionEditor>

            {/* Next Week */}
            <SectionEditor
              title="Next Week Priorities"
              sectionName="nextWeek"
              enabled={formData._enabled_nextWeek}
              onToggle={() => toggleSection('nextWeek')}
            >
              <div className="space-y-2">
                {(formData.nextWeek || []).map((item: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateArrayItem('nextWeek', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => removeArrayItem('nextWeek', index)}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addArrayItem('nextWeek', 'New priority')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  + Add Priority
                </button>
              </div>
            </SectionEditor>

            {/* Risks */}
            <SectionEditor
              title="Active Risks"
              sectionName="risks"
              enabled={formData._enabled_risks}
              onToggle={() => toggleSection('risks')}
            >
              <div className="space-y-2">
                {(formData.risks?.items || []).map((item: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg space-y-2">
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const newItems = [...(formData.risks?.items || [])];
                        newItems[index] = { ...newItems[index], title: e.target.value };
                        updateField('risks', { ...formData.risks, items: newItems });
                      }}
                      placeholder="Risk title"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <textarea
                      value={item.description || ''}
                      onChange={(e) => {
                        const newItems = [...(formData.risks?.items || [])];
                        newItems[index] = { ...newItems[index], description: e.target.value };
                        updateField('risks', { ...formData.risks, items: newItems });
                      }}
                      placeholder="Risk description"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={item.severity || 'medium'}
                        onChange={(e) => {
                          const newItems = [...(formData.risks?.items || [])];
                          newItems[index] = { ...newItems[index], severity: e.target.value };
                          updateField('risks', { ...formData.risks, items: newItems });
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                      <button
                        onClick={() => {
                          const newItems = (formData.risks?.items || []).filter((_: any, i: number) => i !== index);
                          updateField('risks', { ...formData.risks, items: newItems });
                        }}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newItems = [...(formData.risks?.items || []), { title: '', description: '', severity: 'medium' }];
                    updateField('risks', { ...formData.risks, items: newItems });
                  }}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                >
                  + Add Risk
                </button>
              </div>
            </SectionEditor>
          </div>

          {/* Preview Panel */}
          <AnimatePresence>
            {showPreview && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="w-1/2 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-800"
              >
                <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white mb-4">Preview</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                    <h1 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                      {formData.title || 'Untitled Summary'}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.metadata?.weekStart && formData.metadata?.weekEnd
                        ? `Week of ${formData.metadata.weekStart} - ${formData.metadata.weekEnd}`
                        : 'No date range set'}
                    </p>
                  </div>
                  
                  {formData._enabled_bluf && formData.bluf && (
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                      <div dangerouslySetInnerHTML={{ __html: formData.bluf }} />
                    </div>
                  )}

                  {formData._enabled_keyHighlights && formData.keyHighlights?.length > 0 && (
                    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow">
                      <h3 className="font-roobert-semibold text-gray-900 dark:text-white mb-2">Key Highlights</h3>
                      <ul className="space-y-2">
                        {formData.keyHighlights.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Add more preview sections as needed */}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Helper component for section editing
function SectionEditor({
  title,
  sectionName,
  enabled,
  onToggle,
  children,
  icon
}: {
  title: string;
  sectionName: string;
  enabled: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-lg font-roobert-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <button
          onClick={onToggle}
          className={`px-3 py-1 rounded-lg text-sm font-roobert-medium transition-all ${
            enabled
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          }`}
        >
          {enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>
      {enabled && <div>{children}</div>}
    </div>
  );
}

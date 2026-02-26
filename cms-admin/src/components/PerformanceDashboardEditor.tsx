import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, AlertCircle, Plus, Trash2, Download, Flag } from 'lucide-react';
import { domToPng } from 'modern-screenshot';

interface WeeklyData {
  week: string;
  businessUnit: string;
  demoSupportHours: number;
  demoPrepHours: number;
  demoPresentationVirtualHours: number;
  demoPresentationPhysicalHours: number;
}

interface PerformanceEditorProps {
  onClose: () => void;
  onSave?: (data: any) => void;
}

export default function PerformanceDashboardEditor({ onClose, onSave }: PerformanceEditorProps) {
  const [title, setTitle] = useState('Performance Dashboard - Q1 2026');
  const [period, setPeriod] = useState('Q1 2026');
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const businessUnits = ['Capital Markets', 'Banking International', 'Banking North America'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/performance-dashboard');
      const result = await response.json();
      if (result.success && result.data) {
        setTitle(result.data.title || 'Performance Dashboard - Q1 2026');
        setPeriod(result.data.period || 'Q1 2026');
        setWeeklyData(result.data.weeklyData || []);
        setIsPublished(result.data._published || false);
      } else {
        // Initialize with empty data
        setWeeklyData([]);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
      setWeeklyData([]);
    } finally {
      setLoading(false);
    }
  };

  const addWeek = () => {
    const newWeekNumber = weeklyData.length > 0 
      ? Math.max(...weeklyData.map(d => parseInt(d.week.split('-W')[1]))) + 1
      : 1;
    
    const newEntries: WeeklyData[] = businessUnits.map(bu => ({
      week: `2026-W${String(newWeekNumber).padStart(2, '0')}`,
      businessUnit: bu,
      demoSupportHours: 0,
      demoPrepHours: 0,
      demoPresentationVirtualHours: 0,
      demoPresentationPhysicalHours: 0,
    }));

    setWeeklyData([...weeklyData, ...newEntries]);
  };

  const removeWeek = (week: string) => {
    setWeeklyData(weeklyData.filter(d => d.week !== week));
  };

  const updateEntry = (index: number, field: keyof WeeklyData, value: string | number) => {
    const updated = [...weeklyData];
    updated[index] = { ...updated[index], [field]: value };
    setWeeklyData(updated);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        id: 'performance-dashboard-q1-2026',
        title,
        period,
        lastUpdated: new Date().toISOString().split('T')[0],
        weeklyData,
        _published: isPublished,
      };

      const response = await fetch('http://localhost:3001/api/performance-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });

      const result = await response.json();
      if (result.success) {
        if (onSave) onSave(dataToSave);
        setShowSaveConfirm(false);
        // Show success notification
        alert('Performance dashboard saved successfully!');
      } else {
        alert('Failed to save: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving:', error);
      alert('Error saving performance dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishToggle = () => {
    setIsPublished(!isPublished);
    setShowPublishModal(false);
  };

  // Group data by week for easier editing
  const weeks = Array.from(new Set(weeklyData.map(d => d.week))).sort();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-4 bg-slate-900 rounded-2xl shadow-2xl z-[101] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">Performance Dashboard Editor</h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-medium rounded-full border border-cyan-500/30">
              EDIT MODE
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Visibility Toggle */}
            <button
              onClick={() => setShowPublishModal(true)}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-all text-xs ${
                isPublished
                  ? 'bg-green-500/20 border-green-500/50 text-green-300'
                  : 'bg-white/20 border-white/10 text-white/60 hover:bg-white/30'
              }`}
              title={isPublished ? 'Published - Visible on frontend and CMS' : 'Unpublished - Only visible in CMS'}
            >
              {isPublished ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-medium">Published</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-white/30" />
                  <span className="font-medium">Draft</span>
                </>
              )}
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSaveConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span className="font-medium">Save</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Meta Information */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <h3 className="text-sm font-bold text-white mb-3">Dashboard Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Period</label>
                  <input
                    type="text"
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-cyan-500 focus:outline-none text-sm"
                    placeholder="e.g., Q1 2026"
                  />
                </div>
              </div>
            </div>

            {/* Weekly Data Table */}
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-white">Weekly Hours Data</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addWeek}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg border border-cyan-500/30 text-xs"
                >
                  <Plus className="w-3 h-3" />
                  Add Week
                </motion.button>
              </div>

              {weeks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No data yet. Click "Add Week" to start tracking hours.
                </div>
              ) : (
                <div className="space-y-4">
                  {weeks.map((week) => {
                    const weekEntries = weeklyData.filter(d => d.week === week);
                    const weekIndex = weeklyData.findIndex(d => d.week === week);

                    return (
                      <div key={week} className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-bold text-cyan-400">{week}</h4>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeWeek(week)}
                            className="p-1 hover:bg-red-500/20 rounded text-red-400"
                          >
                            <Trash2 className="w-3 h-3" />
                          </motion.button>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-600">
                                <th className="text-left py-2 px-2 text-slate-400 font-medium">Business Unit</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Support (h)</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Prep (h)</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Virtual (h)</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Physical (h)</th>
                                <th className="text-right py-2 px-2 text-slate-400 font-medium">Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {weekEntries.map((entry, idx) => {
                                const globalIndex = weeklyData.findIndex(d => d.week === week && d.businessUnit === entry.businessUnit);
                                const total = entry.demoSupportHours + entry.demoPrepHours + 
                                             entry.demoPresentationVirtualHours + entry.demoPresentationPhysicalHours;

                                return (
                                  <tr key={idx} className="border-b border-slate-600/30">
                                    <td className="py-2 px-2 text-slate-200">{entry.businessUnit}</td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={entry.demoSupportHours}
                                        onChange={(e) => updateEntry(globalIndex, 'demoSupportHours', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-right border border-slate-500 focus:border-cyan-500 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={entry.demoPrepHours}
                                        onChange={(e) => updateEntry(globalIndex, 'demoPrepHours', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-right border border-slate-500 focus:border-cyan-500 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={entry.demoPresentationVirtualHours}
                                        onChange={(e) => updateEntry(globalIndex, 'demoPresentationVirtualHours', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-right border border-slate-500 focus:border-cyan-500 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2 px-2">
                                      <input
                                        type="number"
                                        min="0"
                                        value={entry.demoPresentationPhysicalHours}
                                        onChange={(e) => updateEntry(globalIndex, 'demoPresentationPhysicalHours', parseFloat(e.target.value) || 0)}
                                        className="w-16 px-2 py-1 bg-slate-600 text-white rounded text-right border border-slate-500 focus:border-cyan-500 focus:outline-none"
                                      />
                                    </td>
                                    <td className="py-2 px-2 text-right text-white font-bold">{total}h</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Help Text */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-300">
                  <p className="font-bold mb-1">How to use this editor:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Click "Add Week" to add a new week with entries for all three business units</li>
                    <li>Enter hours for each activity type (Support, Prep, Virtual, Physical presentations)</li>
                    <li>The dashboard will automatically calculate percentages, ratios, and totals</li>
                    <li>Click "Save" to update the performance dashboard data</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Confirmation Modal */}
      <AnimatePresence>
        {showSaveConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[102]"
              onClick={() => setShowSaveConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-xl shadow-2xl z-[103] p-6 max-w-md border border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Save Performance Data?</h3>
                  <p className="text-sm text-slate-300">
                    This will update the performance dashboard with {weeks.length} week(s) of data across all business units.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSaveConfirm(false)}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Confirm Save'}
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Publish/Unpublish Confirmation Modal */}
      <AnimatePresence>
        {showPublishModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[102]"
              onClick={() => setShowPublishModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-[#1a1f2e] to-[#0a0f1a] rounded-xl shadow-2xl border border-white/20 p-6 max-w-md z-[103]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2 rounded-lg ${
                  isPublished ? 'bg-orange-500/20' : 'bg-green-500/20'
                }`}>
                  <Flag className={`w-5 h-5 ${
                    isPublished ? 'text-orange-400' : 'text-green-400'
                  }`} />
                </div>
                <div>
                  <h4 className="text-lg font-roobert-semibold text-white">
                    {isPublished ? 'Unpublish Performance Dashboard?' : 'Publish Performance Dashboard?'}
                  </h4>
                  <p className="text-sm text-white/60 mt-1">
                    {isPublished 
                      ? 'This will hide the dashboard from the frontend. Only CMS users will see it.' 
                      : 'This will make the dashboard visible on the frontend to all users.'}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePublishToggle}
                  className={`w-full px-4 py-3 text-white font-roobert-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isPublished 
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-[#4bcd3e] hover:bg-[#3db032]'
                  }`}
                >
                  <Flag className="w-4 h-4" />
                  {isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-roobert-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

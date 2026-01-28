import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database, X, Upload, Download, RefreshCw, Calendar, AlertCircle,
  FileText, Plus, Edit, Trash2, Eye, TrendingUp
} from 'lucide-react';

/**
 * DATA SOURCES MANAGER
 * 
 * Manage performance data sources:
 * - View all data sources
 * - Import CSV data
 * - Edit data manually
 * - View available views
 * - Test expression syntax
 */

interface DataSource {
  id: string;
  name: string;
  description: string;
  lastUpdated: string;
  recordCount: number;
}

interface View {
  id: string;
  name: string;
  description: string;
  source: string;
  type: string;
}

interface DataSourcesManagerProps {
  onClose: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
}

export default function DataSourcesManager({ onClose, showNotification }: DataSourcesManagerProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sources' | 'views'>('sources');
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedView, setSelectedView] = useState<string | null>(null);

  // Fetch data sources
  const fetchSources = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data-engine/sources');
      const data = await response.json();
      if (data.success) {
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
      showNotification('error', 'Failed to load data sources');
    }
  };

  // Fetch views
  const fetchViews = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/data-engine/views');
      const data = await response.json();
      if (data.success) {
        setViews(data.views);
      }
    } catch (error) {
      console.error('Failed to fetch views:', error);
      showNotification('error', 'Failed to load views');
    }
  };

  useEffect(() => {
    Promise.all([fetchSources(), fetchViews()]).finally(() => setLoading(false));
  }, []);

  const handleImport = (sourceId: string) => {
    setSelectedSource(sourceId);
    setShowImportModal(true);
  };

  const handleViewPreview = (viewId: string) => {
    setSelectedView(viewId);
    setShowViewModal(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white">
                Data Engine
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage performance data sources and views
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-6 pt-4">
          <button
            onClick={() => setActiveTab('sources')}
            className={`px-4 py-2 rounded-lg font-roobert-semibold transition-all ${
              activeTab === 'sources'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Database className="w-4 h-4 inline-block mr-2" />
            Data Sources ({sources.length})
          </button>
          <button
            onClick={() => setActiveTab('views')}
            className={`px-4 py-2 rounded-lg font-roobert-semibold transition-all ${
              activeTab === 'views'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline-block mr-2" />
            Views ({views.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : activeTab === 'sources' ? (
            <div className="space-y-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-1">
                        {source.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {source.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {source.recordCount} records
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Updated {new Date(source.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleImport(source.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-roobert-medium text-sm"
                      >
                        <Upload className="w-4 h-4" />
                        Import CSV
                      </button>
                    </div>
                  </div>

                  {/* Available Views for this source */}
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-roobert-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Available Views:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {views
                        .filter((v) => v.source === source.id)
                        .map((view) => (
                          <button
                            key={view.id}
                            onClick={() => handleViewPreview(view.id)}
                            className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-roobert-medium hover:bg-purple-100 dark:hover:bg-purple-900/40"
                          >
                            {view.id}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Info Box */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  How to Use Views in Content
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-2">
                  Use views in your content with expression syntax:
                </p>
                <code className="block bg-blue-100 dark:bg-blue-900/40 px-3 py-2 rounded text-xs font-mono text-blue-900 dark:text-blue-200">
                  This month we handled {`{{data:keyActivities.thisMonth.support}}`} support tickets
                </code>
              </div>

              {/* Views List */}
              {views.map((view) => (
                <div
                  key={view.id}
                  className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <code className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-mono font-semibold">
                          {view.id}
                        </code>
                        <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded text-xs font-roobert-medium">
                          {view.type}
                        </span>
                      </div>
                      <h3 className="text-base font-roobert-semibold text-gray-900 dark:text-white mb-1">
                        {view.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {view.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewPreview(view.id)}
                      className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg font-roobert-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSV Import Modal */}
      {showImportModal && selectedSource && (
        <CsvImportModal
          sourceId={selectedSource}
          sourceName={sources.find(s => s.id === selectedSource)?.name || ''}
          onClose={() => {
            setShowImportModal(false);
            setSelectedSource(null);
          }}
          onSuccess={() => {
            fetchSources();
            setShowImportModal(false);
            setSelectedSource(null);
            showNotification('success', 'Data imported successfully');
          }}
          showNotification={showNotification}
        />
      )}

      {/* View Preview Modal */}
      {showViewModal && selectedView && (
        <ViewPreviewModal
          viewId={selectedView}
          onClose={() => {
            setShowViewModal(false);
            setSelectedView(null);
          }}
        />
      )}
    </div>
  );
}

// CSV Import Modal Component
interface CsvImportModalProps {
  sourceId: string;
  sourceName: string;
  onClose: () => void;
  onSuccess: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

function CsvImportModal({ sourceId, sourceName, onClose, onSuccess, showNotification }: CsvImportModalProps) {
  const [csvData, setCsvData] = useState('');
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    if (!csvData.trim()) {
      showNotification('error', 'Please paste CSV data');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch(`http://localhost:3001/api/data-engine/sources/${sourceId}/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvData: csvData.trim() })
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        showNotification('error', data.error || 'Failed to import CSV');
      }
    } catch (error) {
      console.error('Failed to import CSV:', error);
      showNotification('error', 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl p-6"
      >
        <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white mb-4">
          Import CSV Data: {sourceName}
        </h3>

        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="text-sm font-roobert-semibold text-blue-900 dark:text-blue-300 mb-2">
              How to Import
            </h4>
            <ol className="text-sm text-blue-800 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>Export your data from Excel/Salesforce as CSV</li>
              <li>Copy the entire CSV content (including headers)</li>
              <li>Paste below and click Import</li>
            </ol>
          </div>

          {/* CSV Input */}
          <div>
            <label className="block text-sm font-roobert-medium text-gray-700 dark:text-gray-300 mb-2">
              CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="month,support,deals,implementations&#10;2025-01,145,23,8&#10;2025-02,167,31,12"
              rows={12}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-mono text-gray-900 dark:text-white resize-none"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-roobert-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!csvData.trim() || importing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-roobert-semibold"
          >
            {importing ? 'Importing...' : 'Import Data'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// View Preview Modal Component
interface ViewPreviewModalProps {
  viewId: string;
  onClose: () => void;
}

function ViewPreviewModal({ viewId, onClose }: ViewPreviewModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/data-engine/views/${viewId}`);
        const result = await response.json();
        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error('Failed to fetch view data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [viewId]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
            View Preview: {viewId}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {/* Expression Examples */}
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
              <h4 className="text-sm font-roobert-semibold text-purple-900 dark:text-purple-300 mb-2">
                Expression Syntax
              </h4>
              <code className="block bg-purple-100 dark:bg-purple-900/40 px-3 py-2 rounded text-xs font-mono text-purple-900 dark:text-purple-200">
                {`{{data:${viewId}}}`}
              </code>
              <p className="text-xs text-purple-800 dark:text-purple-400 mt-2">
                Use this in any text field to dynamically insert the data
              </p>
            </div>

            {/* Data Preview */}
            <div>
              <h4 className="text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current Data:
              </h4>
              <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs font-mono text-gray-900 dark:text-white overflow-auto max-h-96">
                {JSON.stringify(data?.data, null, 2)}
              </pre>
            </div>

            {/* Metadata */}
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>Records: {data?.metadata?.recordCount}</div>
              <div>Executed: {new Date(data?.metadata?.executedAt).toLocaleString()}</div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-roobert-medium"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

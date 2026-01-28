import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, FileText, Target, CheckSquare, StickyNote, Filter, Calendar, AlertCircle } from 'lucide-react';

interface ChangeControlLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChangeEvent {
  id: string;
  timestamp: string;
  eventType: string;
  entityType: string;
  entityId: string;
  user: string;
  metadata: {
    title?: string;
    status?: string;
    priority?: string;
    changes?: {
      [key: string]: {
        old: any;
        new: any;
      };
    };
    deletedData?: any;
  };
}

const API_URL = 'http://localhost:3001/api';

export default function ChangeControlLogsModal({ isOpen, onClose }: ChangeControlLogsModalProps) {
  const [events, setEvents] = useState<ChangeEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ChangeEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterEntity, setFilterEntity] = useState<string>('all');
  const [limit, setLimit] = useState(50);

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_URL}/change-control?limit=${limit}`;
      if (filterType !== 'all') {
        url += `&eventType=${filterType}`;
      }
      if (filterEntity !== 'all') {
        url += `&entityType=${filterEntity}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      const eventList = data.events || [];
      setEvents(eventList);
      setFilteredEvents(eventList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
      // Disable background scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Re-enable background scroll
      document.body.style.overflow = '';
    }
    
    return () => {
      // Cleanup: ensure scroll is re-enabled when component unmounts
      document.body.style.overflow = '';
    };
  }, [isOpen, filterType, filterEntity, limit]);

  const getEventTypeIcon = (eventType: string) => {
    if (eventType.includes('goal')) return <Target className="w-4 h-4" />;
    if (eventType.includes('initiative')) return <FileText className="w-4 h-4" />;
    if (eventType.includes('task')) return <CheckSquare className="w-4 h-4" />;
    if (eventType.includes('note')) return <StickyNote className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getEventTypeBadge = (eventType: string) => {
    if (eventType.includes('created')) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    } else if (eventType.includes('updated') || eventType.includes('changed')) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    } else if (eventType.includes('deleted')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
    }
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return `${seconds}s ago`;
  };

  const formatFullDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-start justify-center pt-8 pb-8 px-4 sm:px-6 bg-black/60 backdrop-blur-md overflow-y-auto" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[95%] h-auto max-h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-fis-eggplant/20"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-fis-eggplant to-fis-raspberry flex-shrink-0">
            <div>
              <h2 className="text-xl font-roobert-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Change Control Logs
              </h2>
              <p className="text-xs text-white/80 mt-1">
                Complete audit trail of all system changes
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={fetchLogs}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-roobert-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">Filters:</span>
              </div>

              <select
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-fis-eggplant"
              >
                <option value="all">All Entities</option>
                <option value="goal">Goals</option>
                <option value="initiative">Initiatives</option>
                <option value="task">Tasks</option>
                <option value="note">Notes</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-fis-eggplant"
              >
                <option value="all">All Events</option>
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="deleted">Deleted</option>
              </select>

              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-fis-eggplant"
              >
                <option value="50">Last 50</option>
                <option value="100">Last 100</option>
                <option value="200">Last 200</option>
                <option value="500">Last 500</option>
              </select>

              <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
                {filteredEvents.length} events
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-8 h-8 text-fis-eggplant animate-spin" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-600 dark:text-red-400 font-roobert-medium">{error}</p>
                </div>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 font-roobert-medium">No events found</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-3 py-2 text-[10px] font-roobert-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="text-left px-3 py-2 text-[10px] font-roobert-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="text-left px-3 py-2 text-[10px] font-roobert-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Entity
                    </th>
                    <th className="text-left px-3 py-2 text-[10px] font-roobert-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="text-left px-3 py-2 text-[10px] font-roobert-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Changes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredEvents.map((event, index) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02, duration: 0.2 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-3 py-2 text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-roobert-medium text-gray-900 dark:text-white">
                            {formatTimestamp(event.timestamp)}
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400" title={formatFullDate(event.timestamp)}>
                            {formatFullDate(event.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-roobert-medium ${getEventTypeBadge(event.eventType)}`}>
                          {getEventTypeIcon(event.eventType)}
                          {event.eventType.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-roobert-medium text-gray-900 dark:text-white capitalize">
                            {event.entityType}
                          </span>
                          <span className="text-[9px] text-gray-500 dark:text-gray-400 font-mono truncate max-w-[100px]">
                            {event.entityId}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        <span className="font-roobert-medium text-gray-900 dark:text-white">
                          {event.metadata.title || '-'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-[11px]">
                        {event.metadata.changes ? (
                          <div className="space-y-0.5">
                            {Object.keys(event.metadata.changes).map((field) => (
                              <div key={field} className="text-[10px]">
                                <span className="font-roobert-semibold text-fis-eggplant dark:text-fis-raspberry">
                                  {field}:
                                </span>{' '}
                                <span className="text-red-600 dark:text-red-400 line-through">
                                  {JSON.stringify(event.metadata.changes![field].old)}
                                </span>{' '}
                                →{' '}
                                <span className="text-green-600 dark:text-green-400">
                                  {JSON.stringify(event.metadata.changes![field].new)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : event.eventType.includes('deleted') ? (
                          <span className="text-[10px] text-red-600 dark:text-red-400">
                            Entity deleted
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-500 dark:text-gray-400">
                            -
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

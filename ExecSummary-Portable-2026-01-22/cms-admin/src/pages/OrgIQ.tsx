/**
 * OrgIQ - Organizational Intelligence Platform
 * 
 * Advanced analytics page for visualizing organizational data across products.
 * 
 * Architecture:
 * - core_data.json: Static org structure (rarely changes)
 * - overlay-*.json: Dynamic metric overlays with view configurations
 * 
 * Features:
 * - Data-driven views (configured via overlay visualizationConfig)
 * - Hotspot visualization for metric intensity
 * - Interactive controls (expand/collapse, search, filtering)
 * - Real-time metric overlays
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Key, 
  TicketCheck, 
  Presentation,
  Search,
  Maximize2,
  Minimize2,
  Target,
  RefreshCw,
  AlertCircle,
  ZoomIn,
  ChevronRight,
  ChevronDown,
  Home,
  Folder,
  FolderOpen,
  Star
} from 'lucide-react';
import OrgIQChartRenderer from '../components/OrgIQChartRenderer';
import OrgIQDetailPanel from '../components/OrgIQDetailPanel';

// Icon map for dynamic loading
const ICON_MAP: Record<string, any> = {
  Users,
  Key,
  TicketCheck,
  Presentation
};

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export type VisualizationMode = 'standard' | 'hotspot';

export interface OrgNode {
  id: string;
  parentId: string | null;
  name: string;
  title: string;
  department?: string;
  email?: string;
  imageUrl?: string;
  productRole?: string;
  productLevel?: string;
  teamSize?: number;
}

export interface CoreData {
  productId: string;
  productName: string;
  description: string;
  lastUpdated: string;
  organizationStructure: OrgNode[];
}

export interface HotspotRange {
  min: number;
  max: number;
  color: string;
  label: string;
}

export interface AggregateMetric {
  id: string;
  label: string;
  calculation: 'sum' | 'average' | 'count' | 'max' | 'min';
  field: string;
  format: 'number' | 'percentage' | 'person' | 'currency';
}

export interface VisualizationConfig {
  title: string;
  icon: string;
  primaryColor: string;
  hotspotEnabled: boolean;
  hotspotMetric: string;
  hotspotLabel: string;
  hotspotRanges: HotspotRange[];
  aggregateMetrics: AggregateMetric[];
}

export interface NodeMetric {
  nodeId: string;
  [key: string]: any; // Flexible metrics
}

export interface DataOverlay {
  overlayId: string;
  overlayName: string;
  description: string;
  dataType: string;
  createdDate: string;
  lastUpdated: string;
  visualizationConfig: VisualizationConfig;
  nodeMetrics: NodeMetric[];
}

// ==========================================
// MAIN COMPONENT
// ==========================================

const OrgIQ: React.FC = () => {
  const [coreData, setCoreData] = useState<CoreData | null>(null);
  const [availableOverlays, setAvailableOverlays] = useState<DataOverlay[]>([]);
  const [selectedOverlay, setSelectedOverlay] = useState<DataOverlay | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('hotspot'); // Default to hotspot enabled
  const [searchTerm, setSearchTerm] = useState('');
  const [expandLevel, setExpandLevel] = useState(999); // Default to fully expanded
  const [selectedRootId, setSelectedRootId] = useState<string>('root'); // Division/root selector
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null); // For detail panel
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [resetZoomTrigger, setResetZoomTrigger] = useState(0); // Trigger to reset zoom
  const [currentViewNodeId, setCurrentViewNodeId] = useState<string>('root'); // Track current focused node for breadcrumbs
  const [expandedNavNodes, setExpandedNavNodes] = useState<Set<string>>(new Set(['root'])); // Track expanded nodes in nav tree
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [controlsPanelCollapsed, setControlsPanelCollapsed] = useState(false);
  const [navPanelCollapsed, setNavPanelCollapsed] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('orgiq-favorites');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load core data and overlays on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load core org structure
      const coreResponse = await fetch('/orgiq-data/core_data.json');
      if (!coreResponse.ok) throw new Error('Failed to load core data');
      const coreJson = await coreResponse.json();
      setCoreData(coreJson);

      // Load all overlays
      const overlayFiles = [
        'overlay-people.json'
        // Add more overlays here as needed:
        // 'overlay-licenses.json',
        // 'overlay-revenue.json',
      ];

      const overlays = await Promise.all(
        overlayFiles.map(async (file) => {
          const response = await fetch(`/orgiq-data/${file}`);
          if (!response.ok) throw new Error(`Failed to load ${file}`);
          return response.json();
        })
      );

      console.log('✅ Loaded overlays:', overlays);
      console.log('📊 Overlay metrics count:', overlays[0]?.nodeMetrics?.length);
      console.log('🎯 Sample metrics:', overlays[0]?.nodeMetrics?.slice(0, 3));

      setAvailableOverlays(overlays);
      setSelectedOverlay(overlays[0]); // Default to first overlay
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error loading OrgIQ data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const calculateAggregates = () => {
    if (!selectedOverlay) return {};

    const results: Record<string, any> = {};
    
    selectedOverlay.visualizationConfig.aggregateMetrics.forEach((metric) => {
      const values = selectedOverlay.nodeMetrics.map(m => m[metric.field] || 0);
      
      switch (metric.calculation) {
        case 'sum':
          results[metric.id] = values.reduce((a, b) => a + b, 0);
          break;
        case 'average':
          results[metric.id] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
          break;
        case 'count':
          results[metric.id] = values.filter(v => v > 0).length;
          break;
        case 'max':
          results[metric.id] = Math.max(...values);
          break;
        case 'min':
          results[metric.id] = Math.min(...values);
          break;
      }
    });

    return results;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading OrgIQ data...</p>
        </div>
      </div>
    );
  }

  if (error || !coreData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Failed to Load Data</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const aggregates = calculateAggregates();
  const ViewIcon = selectedOverlay ? ICON_MAP[selectedOverlay.visualizationConfig.icon] || Target : Target;

  // Build breadcrumb path from root to current node
  const getBreadcrumbPath = (nodeId: string): OrgNode[] => {
    if (!coreData?.organizationStructure) return [];
    
    const path: OrgNode[] = [];
    let currentNode = coreData.organizationStructure.find(n => n.id === nodeId);
    
    while (currentNode) {
      path.unshift(currentNode);
      if (!currentNode.parentId || currentNode.parentId === 'root') break;
      currentNode = coreData.organizationStructure.find(n => n.id === currentNode!.parentId);
    }
    
    return path;
  };

  // Get children for a node
  const getChildren = (nodeId: string): OrgNode[] => {
    if (!coreData?.organizationStructure) return [];
    return coreData.organizationStructure.filter(n => n.parentId === nodeId);
  };

  // Toggle nav tree node expansion
  const toggleNavNode = (nodeId: string) => {
    setExpandedNavNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Navigate to a product
  const navigateToProduct = (nodeId: string) => {
    setCurrentViewNodeId(nodeId);
    setSelectedRootId(nodeId);
    setResetZoomTrigger(prev => prev + 1);
    setShowSearchSuggestions(false);
    setSearchTerm('');
    
    // Auto-expand path to this node
    const path = getBreadcrumbPath(nodeId);
    setExpandedNavNodes(prev => {
      const newSet = new Set(prev);
      path.forEach(node => newSet.add(node.id));
      return newSet;
    });
  };

  // Get search suggestions
  const getSearchSuggestions = (): Array<{ node: OrgNode; path: string }> => {
    if (!searchTerm || !coreData?.organizationStructure) return [];
    
    const term = searchTerm.toLowerCase();
    const suggestions = coreData.organizationStructure
      .filter(node => node.name.toLowerCase().includes(term))
      .slice(0, 10)
      .map(node => {
        const path = getBreadcrumbPath(node.id)
          .map(n => n.name)
          .join(' > ');
        return { node, path };
      });
    
    return suggestions;
  };

  // Toggle favorite
  const toggleFavorite = (nodeId: string) => {
    setFavoriteProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      localStorage.setItem('orgiq-favorites', JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  // Get favorite nodes
  const getFavoriteNodes = (): Array<{ node: OrgNode; path: string }> => {
    if (!coreData?.organizationStructure) return [];
    
    return Array.from(favoriteProducts)
      .map(id => coreData.organizationStructure.find(n => n.id === id))
      .filter(node => node !== undefined)
      .map(node => {
        const path = getBreadcrumbPath(node!.id)
          .map(n => n.name)
          .join(' > ');
        return { node: node!, path };
      });
  };

  // Recursive Tree Node Component
  const TreeNode: React.FC<{ node: OrgNode; level: number }> = ({ node, level }) => {
    const children = getChildren(node.id);
    const isExpanded = expandedNavNodes.has(node.id);
    const isCurrent = currentViewNodeId === node.id;
    const hasChildren = children.length > 0;
    const isFavorite = favoriteProducts.has(node.id);
    
    return (
      <div className="select-none">
        <div
          className={`flex items-center gap-1 py-1.5 px-2 rounded text-xs cursor-pointer transition-colors group ${
            isCurrent
              ? 'bg-fis-eggplant/20 dark:bg-fis-eggplant/30 text-fis-eggplant dark:text-fis-raspberry font-semibold border border-fis-eggplant/30 dark:border-fis-raspberry/30'
              : 'text-slate-700 dark:text-slate-300 hover:bg-fis-eggplant/5 dark:hover:bg-fis-raspberry/5 hover:border hover:border-fis-eggplant/20'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNavNode(node.id);
              }}
              className="flex-shrink-0 p-0.5 hover:bg-fis-eggplant/10 dark:hover:bg-fis-raspberry/10 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3 text-fis-eggplant dark:text-fis-raspberry" />
              ) : (
                <ChevronRight className="w-3 h-3 text-fis-eggplant dark:text-fis-raspberry" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <button
            onClick={() => navigateToProduct(node.id)}
            className="flex items-center gap-1.5 flex-1 min-w-0"
          >
            {hasChildren ? (
              isExpanded ? (
                <FolderOpen className="w-3.5 h-3.5 text-fis-eggplant dark:text-fis-raspberry flex-shrink-0" />
              ) : (
                <Folder className="w-3.5 h-3.5 text-fis-eggplant/60 dark:text-fis-raspberry/60 flex-shrink-0" />
              )
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-fis-eggplant/50 dark:bg-fis-raspberry/50 flex-shrink-0" />
            )}
            <span className="truncate font-medium">{node.name}</span>
            {node.productLevel && (
              <span className="text-[10px] font-semibold text-fis-eggplant/70 dark:text-fis-raspberry/70 bg-fis-eggplant/10 dark:bg-fis-raspberry/10 px-1.5 py-0.5 rounded ml-auto flex-shrink-0">
                {node.productLevel}
              </span>
            )}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(node.id);
            }}
            className={`flex-shrink-0 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
              isFavorite ? 'opacity-100' : ''
            }`}
          >
            <Star 
              className={`w-3 h-3 ${
                isFavorite 
                  ? 'fill-fis-eggplant text-fis-eggplant dark:fill-fis-raspberry dark:text-fis-raspberry' 
                  : 'text-slate-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry'
              }`}
            />
          </button>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-fis-eggplant/30 dark:border-fis-raspberry/30 ml-3">
            {children.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Get available root nodes (top-level divisions - exclude root itself)
  const getRootNodes = () => {
    if (!coreData?.organizationStructure) return [];
    // Only return direct children of root (divisions), not the root itself
    return coreData.organizationStructure.filter(node => 
      node.parentId === 'root'
    );
  };

  // Filter org structure based on selected root
  const getFilteredOrgStructure = () => {
    if (!coreData?.organizationStructure) return [];
    
    if (selectedRootId === 'root') {
      return coreData.organizationStructure;
    }
    
    // Get selected root and all its descendants
    const descendants = new Set<string>([selectedRootId]);
    let changed = true;
    
    while (changed) {
      changed = false;
      for (const node of coreData.organizationStructure) {
        if (node.parentId && descendants.has(node.parentId) && !descendants.has(node.id)) {
          descendants.add(node.id);
          changed = true;
        }
      }
    }
    
    // Filter and adjust parentId for new root
    return coreData.organizationStructure
      .filter(node => descendants.has(node.id))
      .map(node => ({
        ...node,
        parentId: node.id === selectedRootId ? null : node.parentId // Make selected node the root
      }));
  };

  // Rollup function: Aggregate people from children to parents
  const rollupPeopleData = (orgStructure: OrgNode[], overlayMetrics: NodeMetric[]) => {
    if (!overlayMetrics || overlayMetrics.length === 0) return overlayMetrics;

    const metricsMap = new Map(overlayMetrics.map(m => [m.nodeId, { ...m }]));
    
    // Build parent-child relationships
    const childrenMap = new Map<string, string[]>();
    orgStructure.forEach(node => {
      if (node.parentId) {
        if (!childrenMap.has(node.parentId)) {
          childrenMap.set(node.parentId, []);
        }
        childrenMap.get(node.parentId)!.push(node.id);
      }
    });

    // Recursive function to aggregate people up the tree
    const aggregateNode = (nodeId: string): NodeMetric => {
      const metric = metricsMap.get(nodeId) || { nodeId, headcount: 0, keyPeople: [] };
      const children = childrenMap.get(nodeId) || [];
      
      // Aggregate UNIQUE people from this node and all children
      const allPeople = new Map<string, any>();
      
      // Add current node's people
      if (metric.keyPeople) {
        metric.keyPeople.forEach(p => {
          allPeople.set(p.name, p);
        });
      }

      // If has children, recursively aggregate from them
      if (children.length > 0) {
        children.forEach(childId => {
          const childMetric = aggregateNode(childId);
          
          if (childMetric.keyPeople) {
            childMetric.keyPeople.forEach(p => {
              // Only add if not already in map (deduplication by name)
              if (!allPeople.has(p.name)) {
                allPeople.set(p.name, p);
              }
            });
          }
        });
      }

      // Headcount = unique people count for ALL nodes (leaf and parent)
      const uniquePeople = Array.from(allPeople.values());
      
      // Update the metric with corrected headcount
      const aggregated = {
        ...metric,
        headcount: uniquePeople.length, // Count of UNIQUE people
        keyPeople: uniquePeople,
        isRolledUp: children.length > 0 // Flag to indicate this is aggregated
      };

      metricsMap.set(nodeId, aggregated);
      return aggregated;
    };

    // Start aggregation from root nodes
    orgStructure.forEach(node => {
      if (!node.parentId) {
        aggregateNode(node.id);
      }
    });

    return Array.from(metricsMap.values());
  };

  const rootNodes = getRootNodes();
  const filteredOrgStructure = getFilteredOrgStructure();
  const rolledUpMetrics = selectedOverlay ? rollupPeopleData(filteredOrgStructure, selectedOverlay.nodeMetrics) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Target className="w-8 h-8 text-brand-primary" />
                OrgIQ
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {coreData.productName} - {coreData.description}
              </p>
            </div>
            
            {/* Overlay Switcher */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
              {availableOverlays.map((overlay) => {
                const Icon = ICON_MAP[overlay.visualizationConfig.icon] || Target;
                const isActive = selectedOverlay?.overlayId === overlay.overlayId;
                
                return (
                  <button
                    key={overlay.overlayId}
                    onClick={() => setSelectedOverlay(overlay)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{overlay.visualizationConfig.title}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {currentViewNodeId && currentViewNodeId !== 'root' && (
        <div className="border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-3">
            <div className="flex items-center gap-2 text-sm overflow-x-auto">
              <button
                onClick={() => {
                  setCurrentViewNodeId('root');
                  setSelectedRootId('root');
                  setResetZoomTrigger(prev => prev + 1);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry transition-colors whitespace-nowrap"
              >
                <Home className="w-3.5 h-3.5" />
                <span>All Products</span>
              </button>
              
              {getBreadcrumbPath(currentViewNodeId).map((node, index, array) => (
                <React.Fragment key={node.id}>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <button
                    onClick={() => {
                      setCurrentViewNodeId(node.id);
                      setSelectedRootId(node.id);
                      setResetZoomTrigger(prev => prev + 1);
                    }}
                    className={`px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors whitespace-nowrap ${
                      index === array.length - 1
                        ? 'text-fis-eggplant dark:text-fis-raspberry font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry'
                    }`}
                  >
                    {node.name}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Controls */}
          <div className="col-span-3">
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setControlsPanelCollapsed(!controlsPanelCollapsed)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Controls
                  </h3>
                  {controlsPanelCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>
              
              {!controlsPanelCollapsed && (
                <div className="p-4 pt-0 max-h-[60vh] overflow-y-auto">
              {/* Division/Root Selector */}
              {rootNodes.length > 1 && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                    Division View
                  </label>
                  <select
                    value={selectedRootId}
                    onChange={(e) => {
                      setSelectedRootId(e.target.value);
                      setExpandLevel(999); // Reset to fully expanded
                      setResetZoomTrigger(prev => prev + 1); // Trigger zoom reset
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  >
                    <option value="root">🏢 Full Company</option>
                    {rootNodes.map(node => (
                      <option key={node.id} value={node.id}>
                        📊 {node.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedRootId === 'root' 
                      ? `Showing all ${filteredOrgStructure.length} nodes`
                      : `Showing ${filteredOrgStructure.length} nodes in division`
                    }
                  </p>
                </div>
              )}
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(e.target.value.length > 0);
                  }}
                  onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
                
                {/* Autocomplete Suggestions */}
                {showSearchSuggestions && getSearchSuggestions().length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-[300px] overflow-y-auto z-50">
                    {getSearchSuggestions().map(({ node, path }) => (
                      <button
                        key={node.id}
                        onClick={() => navigateToProduct(node.id)}
                        className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors"
                      >
                        <div className="font-medium text-sm text-slate-900 dark:text-white">
                          {node.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {path}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Expand Level */}
              <div className="mb-4">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Expand to Level
                </label>
                <select
                  value={expandLevel}
                  onChange={(e) => setExpandLevel(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value={1}>Level 1</option>
                  <option value={2}>Level 2</option>
                  <option value={3}>Level 3</option>
                  <option value={999}>All Levels</option>
                </select>
              </div>

              {/* Expand/Collapse Buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button 
                  onClick={() => setExpandLevel(999)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Maximize2 className="w-3 h-3" />
                  Expand All
                </button>
                <button 
                  onClick={() => setExpandLevel(1)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Minimize2 className="w-3 h-3" />
                  Collapse All
                </button>
              </div>

              {/* Reset Zoom Button */}
              <button
                onClick={() => setResetZoomTrigger(prev => prev + 1)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-fis-gray dark:bg-fis-eggplant/20 hover:bg-fis-gray/70 dark:hover:bg-fis-eggplant/30 border border-fis-charcoal/30 dark:border-fis-eggplant rounded-lg text-sm font-medium text-fis-eggplant dark:text-fis-raspberry transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
                Reset Zoom
              </button>

              {/* Hotspot Toggle */}
              {selectedOverlay?.visualizationConfig.hotspotEnabled && (
                <button
                  onClick={() => setVisualizationMode(visualizationMode === 'standard' ? 'hotspot' : 'standard')}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    visualizationMode === 'hotspot'
                      ? 'bg-brand-secondary text-white shadow-md'
                      : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  {visualizationMode === 'hotspot' ? 'Hotspot Active' : 'Enable Hotspot'}
                </button>
              )}

              {/* Hotspot Legend */}
              {visualizationMode === 'hotspot' && selectedOverlay && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {selectedOverlay.visualizationConfig.hotspotLabel}
                  </div>
                  <div className="space-y-1">
                    {selectedOverlay.visualizationConfig.hotspotRanges.map((range, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: range.color }}
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-400">
                          {range.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              )}
            </div>

              {/* Navigation Tree */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button
                  onClick={() => setNavPanelCollapsed(!navPanelCollapsed)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Product Navigator
                  </h3>
                  {navPanelCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  )}
                </button>

                {!navPanelCollapsed && (
                  <div className="p-4 pt-0 max-h-[60vh] overflow-y-auto">
                    <div className="flex items-center justify-end mb-3">
                      <button
                        onClick={() => setExpandedNavNodes(new Set(['root']))}
                        className="text-xs text-slate-500 dark:text-slate-400 hover:text-fis-eggplant dark:hover:text-fis-raspberry"
                      >
                        Collapse All
                      </button>
                    </div>

              {/* Favorites Section */}
              {getFavoriteNodes().length > 0 && (
                <div className="mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-3.5 h-3.5 fill-fis-eggplant text-fis-eggplant dark:fill-fis-raspberry dark:text-fis-raspberry" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Favorites</span>
                  </div>
                  <div className="space-y-1">
                    {getFavoriteNodes().map(({ node, path }) => (
                      <button
                        key={node.id}
                        onClick={() => navigateToProduct(node.id)}
                        className="w-full text-left px-2 py-1.5 rounded text-xs hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                      >
                        <div className="font-medium text-slate-900 dark:text-white truncate">
                          {node.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {path}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pr-2">
                {/* Root Node */}
                <div className="mb-2">
                  <button
                    onClick={() => navigateToProduct('root')}
                    className={`w-full flex items-center gap-2 py-2 px-2 rounded text-xs transition-colors ${
                      currentViewNodeId === 'root'
                        ? 'bg-fis-eggplant/10 dark:bg-fis-eggplant/20 text-fis-eggplant dark:text-fis-raspberry font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Home className="w-3.5 h-3.5" />
                    <span>All Products</span>
                  </button>
                </div>
                
                {/* Tree Navigation */}
                <div className="border-l-2 border-fis-eggplant/30 dark:border-fis-raspberry/30 ml-2">
                  {rootNodes.map(node => (
                    <TreeNode key={node.id} node={node} level={0} />
                  ))}
                </div>
              </div>
                  </div>
                )}
            </div>
          </div>
          </div>

          {/* Main Chart Area */}
          <div className="col-span-9">
            {/* Metrics Dashboard */}
            {selectedOverlay && (
              <div className="grid grid-cols-4 gap-4 mb-6">
                {selectedOverlay.visualizationConfig.aggregateMetrics.map((metric) => {
                  const value = aggregates[metric.id];
                  const formattedValue = metric.format === 'number' 
                    ? value?.toLocaleString() 
                    : metric.format === 'currency'
                    ? `$${(value || 0).toLocaleString()}`
                    : value;

                  return (
                    <div
                      key={metric.id}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        // TODO: Enable heatmap for this metric
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            {metric.label}
                          </div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                            {formattedValue || '—'}
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-fis-eggplant/10 dark:bg-fis-eggplant/20 flex items-center justify-center">
                          <Target className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        {currentViewNodeId === 'root' ? 'All Products' : 'Current View'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ViewIcon className="w-5 h-5" />
                    {selectedOverlay?.overlayName || 'Organization View'}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedOverlay?.description || coreData.description}
                  </p>
                </div>

                {/* Metrics Summary from aggregateMetrics config */}
                {selectedOverlay && (
                  <div className="flex items-center gap-4">
                    {selectedOverlay.visualizationConfig.aggregateMetrics.map((metric) => {
                      const value = aggregates[metric.id];
                      let displayValue = value;
                      
                      if (metric.format === 'percentage') {
                        displayValue = `${value}%`;
                      } else if (metric.format === 'currency') {
                        displayValue = `$${value.toLocaleString()}`;
                      } else if (metric.format === 'number') {
                        displayValue = value.toLocaleString();
                      }

                      return (
                        <div key={metric.id} className="text-right">
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">
                            {displayValue}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {metric.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* L5+ Requirement Message */}
              {currentViewNodeId && coreData?.organizationStructure && (() => {
                const currentNode = coreData.organizationStructure.find(n => n.id === currentViewNodeId);
                const nodeLevel = currentNode?.productLevel;
                const levelNum = nodeLevel ? parseInt(nodeLevel.replace('L', '')) : 0;
                const isDetailedEnough = levelNum >= 5 || currentViewNodeId === 'root';
                
                if (!isDetailedEnough && nodeLevel) {
                  return (
                    <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            Product Level Too Broad
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                            Current selection is <strong>{nodeLevel}</strong>. Please select a product at <strong>L5 or higher</strong> to see the organization chart with team members.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Chart Container */}
              <OrgIQChartRenderer
                coreData={filteredOrgStructure}
                overlayMetrics={rolledUpMetrics}
                hotspotEnabled={visualizationMode === 'hotspot'}
                hotspotMetric={selectedOverlay?.visualizationConfig.hotspotMetric}
                hotspotRanges={selectedOverlay?.visualizationConfig.hotspotRanges}
                searchTerm={searchTerm}
                expandLevel={expandLevel}
                resetZoomTrigger={resetZoomTrigger}
                onNodeClick={(nodeId) => {
                  setSelectedNodeId(nodeId);
                  setShowDetailPanel(true);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {showDetailPanel && selectedNodeId && (
        <OrgIQDetailPanel
          nodeId={selectedNodeId}
          coreData={filteredOrgStructure}
          overlayMetrics={rolledUpMetrics}
          onClose={() => {
            setShowDetailPanel(false);
            setSelectedNodeId(null);
          }}
        />
      )}
    </div>
  );
};

export default OrgIQ;

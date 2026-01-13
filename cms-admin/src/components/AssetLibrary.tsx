/**
 * ASSET LIBRARY COMPONENT
 * 
 * Modern replacement for AssetTypeReferenceModal with:
 * - Live previews using assetRenderEngine
 * - Category filtering and search
 * - Multi-column preview toggle
 * - Interactive example data editing
 * - Collapsible code viewers
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ChevronDown, ChevronUp, RefreshCw, Grid, List, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { ASSET_LIBRARY } from '../schemas/assetDataStore';
import type { AssetDefinition } from '../schemas/assetDataStore';
import { AssetRenderEngine } from '../renderers/assetRenderEngine';
import '../renderers/assetRenderEngine.css';

interface AssetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  initialAssetType?: string; // Auto-scroll to this type when opened
  onSelect?: (assetId: string, assetConfig: AssetDefinition) => void; // Callback when asset selected
  heroOnly?: boolean; // Filter to show only Hero-compatible assets
}

type CategoryType = 'All' | 'basic' | 'lists' | 'complex' | 'rich' | 'charts' | 'executiveSummary' | 'media';

const AssetLibrary: React.FC<AssetLibraryProps> = ({ isOpen, onClose, initialAssetType, onSelect, heroOnly = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCode, setExpandedCode] = useState<Set<string>>(new Set());
  const [multiColumnPreview, setMultiColumnPreview] = useState<Map<string, boolean>>(new Map());
  const [interAssetBorder, setInterAssetBorder] = useState<Map<string, boolean>>(new Map());
  const [alignment, setAlignment] = useState<Map<string, 'left' | 'center' | 'right'>>(new Map());
  const [liveData, setLiveData] = useState<Map<string, any>>(new Map());

  // Initialize live data from example data
  useEffect(() => {
    if (isOpen) {
      const initialData = new Map();
      ASSET_LIBRARY.forEach(asset => {
        initialData.set(asset.id, asset.exampleData);
      });
      setLiveData(initialData);
    }
  }, [isOpen]);

  // Auto-scroll to initial asset type
  useEffect(() => {
    if (isOpen && initialAssetType) {
      setTimeout(() => {
        const element = document.getElementById(`asset-${initialAssetType}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [isOpen, initialAssetType]);

  // Filter assets by category, search, and Hero compatibility
  const filteredAssets = ASSET_LIBRARY.filter(asset => {
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.useCase.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHeroFilter = !heroOnly || asset.supportsHero;
    return matchesCategory && matchesSearch && matchesHeroFilter;
  });

  // Group by category
  const assetsByCategory = filteredAssets.reduce((acc, asset) => {
    if (!acc[asset.category]) {
      acc[asset.category] = [];
    }
    acc[asset.category].push(asset);
    return acc;
  }, {} as Record<string, AssetDefinition[]>);

  // Toggle code viewer
  const toggleCodeExpanded = (assetId: string) => {
    const newSet = new Set(expandedCode);
    if (newSet.has(assetId)) {
      newSet.delete(assetId);
    } else {
      newSet.add(assetId);
    }
    setExpandedCode(newSet);
  };

  // Toggle multi-column preview
  const toggleMultiColumn = (assetId: string) => {
    const newMap = new Map(multiColumnPreview);
    newMap.set(assetId, !newMap.get(assetId));
    setMultiColumnPreview(newMap);
  };

  // Toggle inter-asset border
  const toggleInterAssetBorder = (assetId: string) => {
    const newMap = new Map(interAssetBorder);
    newMap.set(assetId, !newMap.get(assetId));
    setInterAssetBorder(newMap);
  };

  // Set alignment
  const updateAlignment = (assetId: string, align: 'left' | 'center' | 'right') => {
    const newMap = new Map(alignment);
    newMap.set(assetId, align);
    setAlignment(newMap);
  };

  // Reset live data
  const resetLiveData = (assetId: string, exampleData: any) => {
    const newMap = new Map(liveData);
    newMap.set(assetId, exampleData);
    setLiveData(newMap);
  };

  // Update live data
  const updateLiveData = (assetId: string, newData: any) => {
    const newMap = new Map(liveData);
    newMap.set(assetId, newData);
    setLiveData(newMap);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-[95vw] h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-roobert-bold text-fis-navy dark:text-white">
                  Asset Library
                </h2>
                {heroOnly && (
                  <span className="px-3 py-1 rounded-full text-xs font-roobert-semibold bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white flex items-center gap-1">
                    🌟 Hero Compatible Only
                  </span>
                )}
              </div>
              <p className="text-sm font-roobert-regular text-gray-500 dark:text-gray-400 mt-1">
                {filteredAssets.length} assets {heroOnly ? 'compatible with Hero layouts' : 'available'} • Interactive previews with live editing
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* FILTERS & SEARCH */}
          <div className="px-8 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search assets by name, description, or use case..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fis-raspberry"
                />
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {(['All', 'basic', 'lists', 'complex', 'rich', 'charts', 'executiveSummary', 'media'] as CategoryType[]).map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-roobert-medium text-sm transition-colors capitalize ${
                      selectedCategory === category
                        ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                        : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ASSET GRID */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {Object.entries(assetsByCategory).map(([category, assets]) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-roobert-semibold text-fis-navy dark:text-white mb-4 flex items-center gap-2">
                  {category}
                  <span className="text-sm font-roobert-regular text-gray-500 dark:text-gray-400">
                    ({assets.length})
                  </span>
                </h3>

                <div className="space-y-6">
                  {assets.map(asset => (
                    <div
                      key={asset.id}
                      id={`asset-${asset.type}`}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      {/* Asset Header */}
                      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="text-lg font-roobert-semibold text-fis-navy dark:text-white">
                                {asset.name}
                              </h4>
                              <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-fis-eggplant dark:bg-fis-raspberry text-white">
                                {asset.type}
                              </span>
                              {asset.supportsMultiColumn && (
                                <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                                  Multi-column
                                </span>
                              )}
                              {asset.supportsHero && (
                                <span className="px-2 py-1 rounded text-xs font-roobert-medium bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                  🌟 Hero
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-roobert-regular text-gray-600 dark:text-gray-300 mt-1">
                              {asset.description}
                            </p>
                            <p className="text-xs font-roobert-regular text-gray-500 dark:text-gray-400 mt-1">
                              <span className="font-roobert-medium">Use case:</span> {asset.useCase}
                            </p>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 flex-1">
                              {/* Select Button (if onSelect provided) */}
                              {onSelect && (
                                <button
                                  onClick={() => {
                                    onSelect(asset.id, asset);
                                    onClose();
                                  }}
                                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white font-roobert-semibold hover:from-fis-eggplant/90 hover:to-fis-raspberry/90 transition-all shadow-md"
                                >
                                  Select Asset
                                </button>
                              )}
                              
                              {/* Alignment Controls */}
                              <div className="flex items-center gap-1.5">
                              <span className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400">
                                Align:
                              </span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateAlignment(asset.id, 'left')}
                                  className={`p-1.5 rounded border transition-all ${
                                    (alignment.get(asset.id) || 'left') === 'left'
                                      ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant'
                                  }`}
                                  title="Align Left"
                                >
                                  <AlignLeft className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => updateAlignment(asset.id, 'center')}
                                  className={`p-1.5 rounded border transition-all ${
                                    alignment.get(asset.id) === 'center'
                                      ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant'
                                  }`}
                                  title="Align Center"
                                >
                                  <AlignCenter className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => updateAlignment(asset.id, 'right')}
                                  className={`p-1.5 rounded border transition-all ${
                                    alignment.get(asset.id) === 'right'
                                      ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant'
                                  }`}
                                  title="Align Right"
                                >
                                  <AlignRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            </div>

                            {/* Inter-Asset Border Toggle (for multi-column) */}
                            {asset.supportsMultiColumn && multiColumnPreview.get(asset.id) && (
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400">
                                  Borders:
                                </span>
                                <button
                                  onClick={() => toggleInterAssetBorder(asset.id)}
                                  className={`px-2.5 py-1.5 rounded border text-xs font-roobert-medium transition-all ${
                                    interAssetBorder.get(asset.id)
                                      ? 'bg-fis-eggplant text-white border-fis-eggplant'
                                      : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-fis-eggplant'
                                  }`}
                                >
                                  {interAssetBorder.get(asset.id) ? 'On' : 'Off'}
                                </button>
                              </div>
                            )}

                            {/* Multi-column toggle */}
                            {asset.supportsMultiColumn && (
                              <button
                                onClick={() => toggleMultiColumn(asset.id)}
                                className={`p-2 rounded-lg transition-colors ${
                                  multiColumnPreview.get(asset.id)
                                    ? 'bg-fis-eggplant dark:bg-fis-raspberry text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                }`}
                                title={multiColumnPreview.get(asset.id) ? 'Switch to single column' : 'Switch to multi-column'}
                              >
                                {multiColumnPreview.get(asset.id) ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="px-6 py-6 bg-white dark:bg-gray-900">
                        {multiColumnPreview.get(asset.id) && asset.supportsMultiColumn ? (
                          <div className="grid grid-cols-3 gap-6">
                            <div 
                              className={interAssetBorder.get(asset.id) ? 'inter-asset-border' : ''}
                              style={{ textAlign: alignment.get(asset.id) || 'left' }}
                            >
                              <AssetRenderEngine
                                type={asset.type}
                                data={liveData.get(asset.id) || asset.exampleData}
                                mode="display"
                              />
                            </div>
                            <div 
                              className={interAssetBorder.get(asset.id) ? 'inter-asset-border' : ''}
                              style={{ textAlign: alignment.get(asset.id) || 'left' }}
                            >
                              <AssetRenderEngine
                                type={asset.type}
                                data={liveData.get(asset.id) || asset.exampleData}
                                mode="display"
                              />
                            </div>
                            <div 
                              className={interAssetBorder.get(asset.id) ? 'inter-asset-border' : ''}
                              style={{ textAlign: alignment.get(asset.id) || 'left' }}
                            >
                              <AssetRenderEngine
                                type={asset.type}
                                data={liveData.get(asset.id) || asset.exampleData}
                                mode="display"
                              />
                            </div>
                          </div>
                        ) : asset.supportsMultiColumn ? (
                          // 70/30 split for multi-column assets (shows big + small view)
                          <div className="grid grid-cols-10 gap-6 divide-x divide-gray-200 dark:divide-gray-700">
                            <div 
                              className="col-span-7 pr-6"
                              style={{ textAlign: alignment.get(asset.id) || 'left' }}
                            >
                              <AssetRenderEngine
                                type={asset.type}
                                data={liveData.get(asset.id) || asset.exampleData}
                                mode="display"
                              />
                            </div>
                            <div 
                              className="col-span-3 pl-6"
                              style={{ textAlign: alignment.get(asset.id) || 'left' }}
                            >
                              <AssetRenderEngine
                                type={asset.type}
                                data={liveData.get(asset.id) || asset.exampleData}
                                mode="display"
                              />
                            </div>
                          </div>
                        ) : (
                          // Full-width for non-multi-column assets
                          <div style={{ textAlign: alignment.get(asset.id) || 'left' }}>
                            <AssetRenderEngine
                              type={asset.type}
                              data={liveData.get(asset.id) || asset.exampleData}
                              mode="display"
                            />
                          </div>
                        )}
                      </div>

                      {/* See Code Toggle */}
                      <button
                        onClick={() => toggleCodeExpanded(asset.id)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-roobert-medium text-gray-700 dark:text-gray-300"
                      >
                        {expandedCode.has(asset.id) ? 'Hide Code' : 'See Code'}
                        {expandedCode.has(asset.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {/* Collapsible Code Section */}
                      <AnimatePresence>
                        {expandedCode.has(asset.id) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden border-t border-gray-200 dark:border-gray-700"
                          >
                            <div className="p-6 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50">
                              {/* Schema Viewer */}
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Schema
                                  </p>
                                </div>
                                <div className="flex-1 max-h-64 overflow-y-auto rounded-lg bg-gray-900 dark:bg-black p-4 border border-gray-700">
                                  <pre className="text-xs font-mono text-green-400">
                                    {JSON.stringify(asset.schema, null, 2)}
                                  </pre>
                                </div>
                              </div>

                              {/* Live Data Editor */}
                              <div className="flex flex-col">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Example Data
                                  </p>
                                  <button
                                    onClick={() => resetLiveData(asset.id, asset.exampleData)}
                                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    title="Reset to default"
                                  >
                                    <RefreshCw className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                  </button>
                                </div>
                                <div className="flex-1 max-h-64 overflow-y-auto rounded-lg bg-gray-900 dark:bg-black p-4 border border-gray-700">
                                  <textarea
                                    value={JSON.stringify(liveData.get(asset.id) || asset.exampleData, null, 2)}
                                    onChange={(e) => {
                                      try {
                                        const parsed = JSON.parse(e.target.value);
                                        updateLiveData(asset.id, parsed);
                                      } catch (err) {
                                        // Invalid JSON - don't update
                                      }
                                    }}
                                    className="w-full h-full bg-transparent text-xs font-mono text-yellow-400 outline-none resize-none"
                                  />
                                </div>
                              </div>

                              {/* Interactive Editor */}
                              <div className="col-span-2">
                                <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                  Interactive Editor
                                </p>
                                <div className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-300 dark:border-gray-600">
                                  <AssetRenderEngine
                                    type={asset.type}
                                    data={liveData.get(asset.id) || asset.exampleData}
                                    onChange={(newData) => updateLiveData(asset.id, newData)}
                                    mode="edit"
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 font-roobert-regular">
                  No assets found matching your search criteria.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssetLibrary;

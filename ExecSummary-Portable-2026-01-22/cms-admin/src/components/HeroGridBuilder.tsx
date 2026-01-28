/**
 * HERO GRID BUILDER MODAL
 * 
 * Dedicated grid builder for Hero masonry layouts
 * - 3 rows × 8 columns = 24 square cells
 * - Drag container sizes onto grid
 * - Click containers to assign assets
 * - Visual grid positioning
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Grid as GridIcon, Settings } from 'lucide-react';
import AssetLibrary from './AssetLibrary';

interface GridContainer {
  id: string;
  row: number;        // Starting row (0-2)
  col: number;        // Starting column (0-7)
  rowSpan: number;    // Height in cells (1-3)
  colSpan: number;    // Width in cells (1-8)
  assetType?: string; // Asset type assigned
  assetData?: any;    // Asset configuration
  label?: string;     // Display label
}

interface HeroGridBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (containers: GridContainer[]) => void;
  initialContainers?: GridContainer[];
}

type ContainerSize = '1x1' | '1x2' | '2x2' | '3x4';

const HeroGridBuilder: React.FC<HeroGridBuilderProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  initialContainers = []
}) => {
  const [containers, setContainers] = useState<GridContainer[]>(initialContainers);
  const [selectedSize, setSelectedSize] = useState<ContainerSize>('1x1');
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [draggedSize, setDraggedSize] = useState<ContainerSize | null>(null);
  const [hoverPreview, setHoverPreview] = useState<{ row: number; col: number } | null>(null);
  const [showAssetLibrary, setShowAssetLibrary] = useState(false);
  const [editingContainerId, setEditingContainerId] = useState<string | null>(null);

  const GRID_ROWS = 3;
  const GRID_COLS = 8;

  // Container size definitions - FIS brand colors
  const containerSizes: Record<ContainerSize, { rows: number; cols: number; label: string; color: string }> = {
    '1x1': { rows: 1, cols: 1, label: '1×1 Cube', color: 'bg-fis-eggplant' },
    '1x2': { rows: 1, cols: 2, label: '1×2 Rectangle', color: 'bg-fis-raspberry' },
    '2x2': { rows: 2, cols: 2, label: '2×2 Cube', color: 'bg-fis-eggplant' },
    '3x4': { rows: 3, cols: 4, label: '3×4 Large Panel', color: 'bg-fis-raspberry' }
  };

  // Check if cell is occupied
  const isCellOccupied = (row: number, col: number, excludeId?: string): boolean => {
    return containers.some(container => {
      if (excludeId && container.id === excludeId) return false;
      return (
        row >= container.row &&
        row < container.row + container.rowSpan &&
        col >= container.col &&
        col < container.col + container.colSpan
      );
    });
  };

  // Check if container can fit at position
  const canFit = (row: number, col: number, rowSpan: number, colSpan: number, excludeId?: string): boolean => {
    // Check bounds
    if (row + rowSpan > GRID_ROWS || col + colSpan > GRID_COLS) return false;
    
    // Check if any cell is occupied
    for (let r = row; r < row + rowSpan; r++) {
      for (let c = col; c < col + colSpan; c++) {
        if (isCellOccupied(r, c, excludeId)) return false;
      }
    }
    return true;
  };

  // Handle cell click to place container
  const handleCellClick = (row: number, col: number) => {
    const size = containerSizes[selectedSize];
    if (canFit(row, col, size.rows, size.cols)) {
      const newContainer: GridContainer = {
        id: `container-${Date.now()}`,
        row,
        col,
        rowSpan: size.rows,
        colSpan: size.cols,
        label: `Container ${containers.length + 1}`
      };
      setContainers([...containers, newContainer]);
    }
  };

  // Remove container
  const removeContainer = (id: string) => {
    setContainers(containers.filter(c => c.id !== id));
    if (selectedContainer === id) setSelectedContainer(null);
  };

  // Clear all containers
  const clearGrid = () => {
    setContainers([]);
    setSelectedContainer(null);
  };

  // Open Asset Library for container
  const handleContainerClick = (containerId: string) => {
    setEditingContainerId(containerId);
    setSelectedContainer(containerId);
    setShowAssetLibrary(true);
  };

  // Handle asset selection from library
  const handleAssetSelect = (assetId: string, assetConfig: any) => {
    console.log('Asset selected:', assetId, assetConfig);
    console.log('Editing container ID:', editingContainerId);
    
    if (!editingContainerId) {
      console.error('No editingContainerId set!');
      return;
    }
    
    setContainers(prev => {
      const updated = prev.map(container => 
        container.id === editingContainerId
          ? { 
              ...container, 
              assetType: assetConfig.type, // Use 'type' not 'renderType'
              assetData: assetConfig.exampleData,
              label: assetConfig.name // Store the friendly name
            }
          : container
      );
      console.log('Updated containers:', updated);
      return updated;
    });
    
    setShowAssetLibrary(false);
    setEditingContainerId(null);
  };

  // Save and close
  const handleSave = () => {
    onSave(containers);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-fis-eggplant to-fis-raspberry">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-roobert-bold text-white mb-1">
                🌟 Hero Grid Builder
              </h2>
              <p className="text-sm text-white/80">
                3 rows × 8 columns • Drag containers onto the grid
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-[280px_1fr] gap-6">
            {/* Left Sidebar - Container Palette */}
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3">
                  Container Sizes
                </h3>
                <div className="space-y-2">
                  {(Object.entries(containerSizes) as [ContainerSize, typeof containerSizes[ContainerSize]][]).map(([size, config]) => (
                    <div
                      key={size}
                      draggable
                      onDragStart={() => {
                        setDraggedSize(size);
                        setSelectedSize(size);
                      }}
                      onDragEnd={() => setDraggedSize(null)}
                      onClick={() => setSelectedSize(size)}
                      className={`w-full p-3 rounded-lg border-2 transition-all cursor-grab active:cursor-grabbing ${
                        selectedSize === size
                          ? 'border-fis-eggplant dark:border-fis-raspberry bg-fis-eggplant/10 dark:bg-fis-raspberry/10'
                          : draggedSize === size
                          ? 'border-fis-raspberry bg-fis-raspberry/20 opacity-50'
                          : 'border-gray-200 dark:border-gray-700 hover:border-fis-eggplant/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className={`${config.color} rounded`}
                          style={{
                            width: `${config.cols * 16}px`,
                            height: `${config.rows * 16}px`
                          }}
                        />
                        <span className="font-roobert-semibold text-sm text-gray-900 dark:text-white">
                          {config.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-3">
                  Actions
                </h3>
                <button
                  onClick={clearGrid}
                  disabled={containers.length === 0}
                  className="w-full py-2 px-3 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-roobert-semibold"
                >
                  Clear All
                </button>
              </div>

              {containers.length > 0 && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white mb-2">
                    Containers ({containers.length})
                  </h3>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {containers.map(container => (
                      <div
                        key={container.id}
                        onClick={() => setSelectedContainer(container.id)}
                        className={`p-2 rounded flex items-center justify-between cursor-pointer ${
                          selectedContainer === container.id
                            ? 'bg-purple-100 dark:bg-purple-900/20'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span className="text-xs font-roobert-medium text-gray-700 dark:text-gray-300">
                          {container.label}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeContainer(container.id);
                          }}
                          className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Center - Grid Canvas */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                    Grid Canvas
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Click cells to place selected container size
                  </p>
                </div>
              </div>

              {/* Grid Container - relative positioning for absolute overlay */}
              <div className="bg-gradient-to-br from-fis-eggplant/5 to-fis-raspberry/5 dark:from-fis-eggplant/10 dark:to-fis-raspberry/10 p-6 rounded-xl border-2 border-fis-eggplant/20 dark:border-fis-eggplant/40 relative">
                {/* Background Grid - Pure cells only, no containers */}
                <div 
                  className="grid gap-2"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
                  }}
                >
                  {/* Grid Cells - Only cells, containers rendered separately */}
                  {Array.from({ length: GRID_ROWS * GRID_COLS }).map((_, index) => {
                    const row = Math.floor(index / GRID_COLS);
                    const col = index % GRID_COLS;
                    const occupied = isCellOccupied(row, col);
                    const size = draggedSize ? containerSizes[draggedSize] : containerSizes[selectedSize];
                    const canPlace = canFit(row, col, size.rows, size.cols);
                    
                    // Check if this cell is part of hover preview
                    const isInHoverPreview = hoverPreview && draggedSize && 
                      row >= hoverPreview.row && 
                      row < hoverPreview.row + size.rows &&
                      col >= hoverPreview.col && 
                      col < hoverPreview.col + size.cols;

                    return (
                      <div
                        key={index}
                        onClick={() => !occupied && !draggedSize && handleCellClick(row, col)}
                        onMouseEnter={() => {
                          if (draggedSize) {
                            setHoverPreview({ row, col });
                          }
                        }}
                        onMouseLeave={() => {
                          if (draggedSize) {
                            setHoverPreview(null);
                          }
                        }}
                        onDragOver={(e) => {
                          if (draggedSize) {
                            e.preventDefault();
                            e.stopPropagation();
                            setHoverPreview({ row, col });
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (draggedSize && canPlace) {
                            handleCellClick(row, col);
                            setDraggedSize(null);
                            setHoverPreview(null);
                          }
                        }}
                        className={`aspect-square rounded-lg border-2 transition-all ${
                          occupied
                            ? 'bg-transparent border-transparent cursor-default'
                            : isInHoverPreview && canPlace
                            ? 'bg-fis-raspberry/40 border-fis-raspberry cursor-copy'
                            : isInHoverPreview && !canPlace
                            ? 'bg-red-200 border-red-500 cursor-not-allowed'
                            : draggedSize
                            ? 'border-dashed border-fis-eggplant/20 cursor-copy'
                            : canPlace
                            ? 'border-dashed border-fis-eggplant/30 hover:border-fis-eggplant hover:bg-fis-eggplant/10 cursor-pointer'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Containers Overlay - Absolute positioned OVER the grid */}
                <div className="absolute inset-0 p-6 pointer-events-none">
                  <div 
                    className="relative w-full h-full"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                      gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
                      gap: '8px'
                    }}
                  >
                    {containers.map(container => {
                      // Determine background color based on container size using CSS variables
                      let bgColor = '';
                      if (container.rowSpan === 3 && container.colSpan === 4) {
                        bgColor = 'var(--brand-primary)'; // 3×4 Large Panel - Purple
                      } else if (container.rowSpan === 2 && container.colSpan === 2) {
                        bgColor = 'var(--brand-secondary)'; // 2×2 Cube - Raspberry
                      } else if (container.rowSpan === 1 && container.colSpan === 2) {
                        bgColor = 'var(--brand-tertiary)'; // 1×2 Rectangle - Navy
                      } else if (container.rowSpan === 1 && container.colSpan === 1) {
                        bgColor = 'var(--accent-green)'; // 1×1 Cube - Green
                      } else {
                        bgColor = 'var(--brand-primary)'; // Fallback
                      }
                      
                      return (
                        <div
                          key={container.id}
                          onClick={() => handleContainerClick(container.id)}
                          className="rounded-lg border-2 transition-all cursor-pointer flex flex-col items-center justify-center pointer-events-auto hover:scale-105 relative"
                          style={{
                            backgroundColor: bgColor,
                            gridRow: `${container.row + 1} / span ${container.rowSpan}`,
                            gridColumn: `${container.col + 1} / span ${container.colSpan}`,
                            zIndex: selectedContainer === container.id ? 20 : 10,
                            borderColor: selectedContainer === container.id ? 'white' : 'rgba(70, 44, 73, 0.5)',
                            boxShadow: selectedContainer === container.id ? '0 20px 25px -5px rgba(0, 0, 0, 0.1)' : 'none',
                            transform: selectedContainer === container.id ? 'scale(1.02)' : 'scale(1)'
                          }}
                        >
                          {/* Checkmark Badge for Assigned Assets */}
                          {container.assetType && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
                              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        <div className="text-center text-white p-2 w-full h-full flex flex-col items-center justify-center">
                          {!container.assetType ? (
                            <>
                              <Settings className="w-6 h-6 mb-2 opacity-75" />
                              <div className="text-xs font-roobert-bold opacity-90">
                                Click to Assign
                              </div>
                              <div className="text-[10px] opacity-75 mt-1">
                                {container.rowSpan}×{container.colSpan}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="text-xs font-roobert-bold opacity-95 mb-1 px-2">
                                {container.label}
                              </div>
                              <div className="text-[10px] bg-white/20 rounded px-2 py-1 mt-1">
                                {container.rowSpan}×{container.colSpan}
                              </div>
                              <div className="text-[9px] opacity-60 mt-1">
                                ✓ Assigned • Click to change
                              </div>
                            </>
                          )}
                        </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {containers.length} container{containers.length !== 1 ? 's' : ''} placed
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-roobert-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-fis-eggplant to-fis-raspberry text-white hover:from-fis-eggplant/90 hover:to-fis-raspberry/90 font-roobert-semibold transition-all shadow-lg"
            >
              Save Grid
            </button>
          </div>
        </div>
      </motion.div>

      {/* Asset Library Modal */}
      {showAssetLibrary && (
        <AssetLibrary
          isOpen={showAssetLibrary}
          onClose={() => {
            setShowAssetLibrary(false);
            setEditingContainerId(null);
          }}
          onSelect={handleAssetSelect}
          heroOnly={true}
        />
      )}
    </div>
  );
};

export default HeroGridBuilder;

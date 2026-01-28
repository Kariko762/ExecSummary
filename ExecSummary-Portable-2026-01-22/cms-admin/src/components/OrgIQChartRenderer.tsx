/**
 * OrgIQChartRenderer - Enhanced org chart with metric overlay support
 * 
 * Extends d3-org-chart with:
 * - Hotspot visualization (color-coded nodes based on metrics)
 * - Dynamic data overlays
 * - Search highlighting
 * - Expand/collapse controls
 * - Metric tooltips
 */

import React, { useEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import type { OrgNode, NodeMetric, HotspotRange } from '../pages/OrgIQ';

interface OrgIQChartRendererProps {
  coreData: OrgNode[];
  overlayMetrics?: NodeMetric[];
  hotspotEnabled: boolean;
  hotspotMetric?: string;
  hotspotRanges?: HotspotRange[];
  searchTerm?: string;
  expandLevel?: number;
  resetZoomTrigger?: number;
  onNodeClick?: (nodeId: string) => void;
}

const OrgIQChartRenderer: React.FC<OrgIQChartRendererProps> = ({
  coreData,
  overlayMetrics = [],
  hotspotEnabled,
  hotspotMetric,
  hotspotRanges = [],
  searchTerm = '',
  expandLevel = 2,
  resetZoomTrigger = 0,
  onNodeClick
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const lastRenderDataRef = useRef<string>(''); // Track last rendered data to prevent unnecessary updates

  // Merge core data with overlay metrics
  const getMergedData = () => {
    const merged = coreData.map(node => {
      const metrics = overlayMetrics.find(m => m.nodeId === node.id);
      const result = {
        ...node,
        ...metrics
      };
      return result;
    });
    
    // Debug: Log first few merged nodes
    if (merged.length > 0) {
      console.log('🔀 Merged data sample:', merged.slice(0, 3));
      console.log('📦 Total nodes:', merged.length);
      console.log('📊 Nodes with metrics:', merged.filter(n => n.headcount).length);
      console.log('🎯 First node with headcount:', merged.find(n => n.headcount));
      console.log('🔍 Overlay metrics available:', overlayMetrics?.length || 0);
      console.log('🎨 Hotspot enabled:', hotspotEnabled);
      console.log('📏 Hotspot metric:', hotspotMetric);
    }
    
    return merged;
  };

  // Get hotspot color for a node based on metric value (Green -> Blue -> Red)
  const getHotspotColor = (value: number): string => {
    if (!hotspotEnabled || !hotspotRanges.length) {
      return '#ffffff'; // White if disabled
    }

    // Green -> Blue -> Red gradient based on value
    // 0-33% = Green, 34-66% = Blue, 67-100% = Red
    const maxRange = hotspotRanges[hotspotRanges.length - 1]?.max || 1000;
    const percentage = Math.min((value / maxRange) * 100, 100);
    
    if (percentage <= 33) {
      // Green range (0-33%)
      const intensity = Math.floor((percentage / 33) * 255);
      return `rgb(${200 - intensity}, ${255}, ${200 - intensity})`; // Light green to green
    } else if (percentage <= 66) {
      // Blue range (34-66%)
      const intensity = Math.floor(((percentage - 33) / 33) * 255);
      return `rgb(${150 - intensity}, ${200 - intensity}, ${255})`; // Green-blue to blue
    } else {
      // Red range (67-100%)
      const intensity = Math.floor(((percentage - 66) / 34) * 255);
      return `rgb(${200 + intensity}, ${150 - intensity}, ${150 - intensity})`; // Blue-red to red
    }
  };

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current || !coreData.length) return;

    const mergedData = getMergedData();
    const dataHash = JSON.stringify(mergedData.map(d => ({ id: d.id, parentId: d.parentId, headcount: d.headcount })));
    
    // Skip update if data hasn't actually changed
    if (chartInstanceRef.current && dataHash === lastRenderDataRef.current) {
      return;
    }
    
    lastRenderDataRef.current = dataHash;
    
    if (!chartInstanceRef.current) {
      const chart = new OrgChart();
      chartInstanceRef.current = chart;

      chart
        .container(chartRef.current)
        .data(mergedData)
        .nodeWidth(() => 280)
        .nodeHeight(() => 180) // Increased height to fit more data
        .childrenMargin(() => 60)
        .compactMarginBetween(() => 40)
        .compactMarginPair(() => 60)
        .neighbourMargin(() => 60)
        .siblingsMargin(() => 40)
        .initialZoom(0.5) // Set initial zoom to 50% to show more of the chart
        .scaleExtent([0.2, 3]) // Allow zoom from 20% to 300%
        .nodeContent((d: any) => {
          const metricValue = hotspotMetric && d.data[hotspotMetric] ? d.data[hotspotMetric] : 0;
          const bgColor = hotspotEnabled && hotspotMetric ? getHotspotColor(metricValue) : '#ffffff';
          const isHighlighted = searchTerm && d.data.name.toLowerCase().includes(searchTerm.toLowerCase());

          // Debug: Log first few nodes being rendered
          if (d.depth === 0 || (d.data[hotspotMetric] && Math.random() < 0.1)) {
            console.log('🎨 Rendering node:', {
              name: d.data.name,
              id: d.data.id,
              metricValue,
              hasMetric: !!d.data[hotspotMetric],
              bgColor,
              hotspotEnabled,
              hotspotMetric,
              allData: d.data
            });
          }

          return `
            <div style="
              background: ${bgColor};
              border: ${isHighlighted ? '3px solid #7c3aed' : '2px solid #e2e8f0'};
              border-radius: 12px;
              padding: 12px;
              width: 280px;
              height: 180px;
              box-shadow: ${isHighlighted ? '0 4px 12px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
              transition: all 0.3s ease;
              cursor: pointer;
              display: flex;
              flex-direction: column;
              position: relative;
            "
            onmouseover="this.style.boxShadow='0 6px 16px rgba(0,0,0,0.15)'; this.style.transform='translateY(-2px)';"
            onmouseout="this.style.boxShadow='${isHighlighted ? '0 4px 12px rgba(124, 58, 237, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'}'; this.style.transform='translateY(0)';"
            >
              ${d.data.leader && d.data.isRolledUp ? `
                <!-- Manager Badge (for rolled-up nodes with leaders) -->
                <div style="
                  position: absolute;
                  top: 8px;
                  right: 8px;
                  background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
                  color: white;
                  font-size: 8px;
                  font-weight: 700;
                  padding: 4px 8px;
                  border-radius: 12px;
                  display: flex;
                  align-items: center;
                  gap: 3px;
                  box-shadow: 0 2px 4px rgba(124, 58, 237, 0.3);
                ">
                  👤 MANAGER
                </div>
              ` : ''}
              
              <!-- Product/Division Name -->
              <div style="
                font-weight: 700;
                font-size: 13px;
                color: #1e293b;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                ${d.data.leader && d.data.isRolledUp ? 'padding-right: 90px;' : ''}
              ">
                ${d.data.name}
              </div>
              
              <div style="
                font-size: 11px;
                color: var(--fis-stone);
                margin-bottom: 8px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${d.data.productRole || d.data.department || ''}
              </div>

              ${d.data.headcount || d.data.leader ? `
                <!-- Team Data Card -->
                <div style="
                  background: rgba(255, 255, 255, 0.95);
                  border-radius: 8px;
                  padding: 8px;
                  flex: 1;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  gap: 6px;
                ">
                  ${d.data.headcount ? `
                    <div style="
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                      padding-bottom: 6px;
                      border-bottom: 1px solid #e2e8f0;
                    ">
                      <span style="font-size: 10px; color: var(--fis-stone); font-weight: 500;">👥 Team Size</span>
                      <span style="font-size: 16px; color: var(--brand-primary); font-weight: 700;">${d.data.headcount.toLocaleString()}</span>
                    </div>
                  ` : ''}
                  
                  ${d.data.leader ? `
                    <div>
                      <div style="font-size: 9px; color: var(--fis-stone); font-weight: 500; margin-bottom: 2px;">Leader</div>
                      <div style="font-size: 11px; color: var(--fis-charcoal); font-weight: 600; line-height: 1.2;">
                        ${d.data.leader}
                      </div>
                      ${d.data.leaderTitle ? `
                        <div style="font-size: 9px; color: #64748b; margin-top: 1px;">${d.data.leaderTitle}</div>
                      ` : ''}
                    </div>
                  ` : ''}
                  
                  ${d.data.keyPeople && d.data.keyPeople.length > 0 ? `
                    <div>
                      <div style="font-size: 9px; color: #64748b; font-weight: 500; margin-bottom: 2px;">
                        Team (${d.data.keyPeople.length})
                      </div>
                      <div style="font-size: 9px; color: #475569; line-height: 1.3;">
                        ${d.data.keyPeople.slice(0, 2).map(p => p.name).join(', ')}${d.data.keyPeople.length > 2 ? ` +${d.data.keyPeople.length - 2}` : ''}
                      </div>
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div style="
                  background: rgba(241, 245, 249, 0.8);
                  border-radius: 8px;
                  padding: 12px;
                  flex: 1;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 10px;
                  color: #94a3b8;
                  font-style: italic;
                ">
                  No team data
                </div>
              `}
            </div>
          `;
        })
        .onNodeClick((d: any) => {
          if (onNodeClick) {
            onNodeClick(d.data.id);
          }
        })
        .render();

      setIsInitialized(true);
    } else {
      // Update existing chart (without fit() to prevent zoom reset)
      chartInstanceRef.current
        .data(mergedData)
        .render();
    }
  }, [coreData, overlayMetrics, hotspotEnabled, hotspotMetric, hotspotRanges, searchTerm]);

  // Handle expand level changes
  useEffect(() => {
    if (!chartInstanceRef.current || !isInitialized) return;

    if (expandLevel === 999) {
      chartInstanceRef.current.expandAll();
    } else {
      chartInstanceRef.current.collapseAll();
      // Expand to specified level
      const expandToLevel = (level: number) => {
        const data = chartInstanceRef.current.data();
        data.forEach((node: any) => {
          const depth = node.depth || 0;
          if (depth < level) {
            chartInstanceRef.current.setExpanded(node.id, true);
          }
        });
      };
      setTimeout(() => expandToLevel(expandLevel), 100);
    }
  }, [expandLevel, isInitialized]);

  // Search highlighting - update on search term change
  useEffect(() => {
    if (!chartInstanceRef.current || !isInitialized || !searchTerm) return;
    
    // Re-render to update highlighting
    chartInstanceRef.current.render();
    
    // Find and center on first matching node
    const data = chartInstanceRef.current.data();
    const matchingNode = data.find((node: any) => 
      node.name && node.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (matchingNode) {
      // Center on the matching node
      chartInstanceRef.current.setCentered(matchingNode.id).render();
    }
  }, [searchTerm, isInitialized]);

  // Handle zoom reset
  useEffect(() => {
    if (!chartInstanceRef.current || !isInitialized || resetZoomTrigger === 0) return;
    
    // Reset zoom and center the chart
    chartInstanceRef.current.fit();
  }, [resetZoomTrigger, isInitialized]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-full min-h-[800px]"
      style={{ 
        background: 'var(--fis-fog)',
        borderRadius: '8px',
        position: 'relative'
      }}
    />
  );
};

export default OrgIQChartRenderer;

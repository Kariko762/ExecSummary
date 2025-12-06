import React, { useEffect, useRef, useState } from 'react';
import { OrgChart } from 'd3-org-chart';
import { RendererProps } from '../types/schema';
import { Search, ZoomIn, ZoomOut, Download, Home } from 'lucide-react';

interface OrgChartNode {
  id: string;
  parentId: string | null;
  name: string;
  title?: string;
  department?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  [key: string]: any;
}

interface OrgChartData {
  nodes: OrgChartNode[];
}

const OrgChartRenderer: React.FC<RendererProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartData, setChartData] = useState<OrgChartNode[]>([]);

  useEffect(() => {
    if (!data) return;

    // Parse data structure
    let nodes: OrgChartNode[] = [];
    if (Array.isArray(data)) {
      nodes = data;
    } else if (typeof data === 'object' && 'nodes' in data) {
      nodes = (data as OrgChartData).nodes;
    }

    setChartData(nodes);

    if (!chartRef.current || nodes.length === 0) return;

    // Initialize org chart
    const chart = new OrgChart();
    chartInstanceRef.current = chart;

    chart
      .container(chartRef.current)
      .data(nodes)
      .nodeWidth(() => 250)
      .nodeHeight(() => 150)
      .childrenMargin(() => 50)
      .compactMarginBetween(() => 35)
      .compactMarginPair(() => 30)
      .neighbourMargin(() => 50)
      .siblingsMargin(() => 50)
      .nodeContent((d: any) => {
        const node = d.data;
        return `
          <div class="org-chart-node" style="
            width: 250px;
            height: 150px;
            padding: 16px;
            background: var(--card-background, #ffffff);
            border: 1px solid var(--card-border, #e5e7eb);
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            font-family: 'Roobert', -apple-system, sans-serif;
            display: flex;
            flex-direction: column;
            gap: 8px;
          ">
            ${node.imageUrl ? `
              <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${node.imageUrl}" alt="${node.name}" style="
                  width: 48px;
                  height: 48px;
                  border-radius: 50%;
                  object-fit: cover;
                  border: 2px solid var(--brand-primary, #8b5cf6);
                " />
                <div style="flex: 1; min-width: 0;">
                  <div style="
                    font-weight: 600;
                    font-size: 14px;
                    color: var(--text-primary, #1f2937);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  ">${node.name}</div>
                  <div style="
                    font-size: 12px;
                    color: var(--text-secondary, #6b7280);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                  ">${node.title || ''}</div>
                </div>
              </div>
            ` : `
              <div style="
                font-weight: 600;
                font-size: 14px;
                color: var(--text-primary, #1f2937);
                margin-bottom: 4px;
              ">${node.name}</div>
              <div style="
                font-size: 12px;
                color: var(--text-secondary, #6b7280);
                margin-bottom: 8px;
              ">${node.title || ''}</div>
            `}
            
            ${node.department ? `
              <div style="
                font-size: 11px;
                color: var(--brand-primary, #8b5cf6);
                font-weight: 500;
                padding: 4px 8px;
                background: var(--brand-primary-light, #ede9fe);
                border-radius: 4px;
                display: inline-block;
                align-self: flex-start;
              ">${node.department}</div>
            ` : ''}
            
            ${node.email || node.phone ? `
              <div style="
                font-size: 11px;
                color: var(--text-tertiary, #9ca3af);
                margin-top: auto;
                display: flex;
                flex-direction: column;
                gap: 2px;
              ">
                ${node.email ? `<div>✉ ${node.email}</div>` : ''}
                ${node.phone ? `<div>☎ ${node.phone}</div>` : ''}
              </div>
            ` : ''}
          </div>
        `;
      })
      .onNodeClick((d: any) => {
        console.log('Node clicked:', d.data);
        // Implement node click behavior (e.g., show details modal)
      })
      .render();

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current = null;
      }
    };
  }, [data]);

  const handleSearch = () => {
    if (!chartInstanceRef.current || !searchTerm) return;

    const matchingNodes = chartData.filter(node =>
      node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (matchingNodes.length > 0) {
      chartInstanceRef.current.clearHighlighting();
      matchingNodes.forEach(node => {
        chartInstanceRef.current.setHighlighted(node.id);
      });
      chartInstanceRef.current.setCentered(matchingNodes[0].id);
    }
  };

  const handleZoomIn = () => {
    chartInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    chartInstanceRef.current?.zoomOut();
  };

  const handleFit = () => {
    chartInstanceRef.current?.fit();
  };

  const handleExportPNG = () => {
    chartInstanceRef.current?.exportImg({
      save: true,
      full: true,
      onLoad: () => console.log('PNG export complete')
    });
  };

  const handleExportSVG = () => {
    chartInstanceRef.current?.exportSvg();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    chartInstanceRef.current?.clearHighlighting();
  };

  return (
    <div className="org-chart-container" style={{ width: '100%', position: 'relative' }}>
      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          gap: '8px',
          flex: '1',
          minWidth: '250px'
        }}>
          <input
            type="text"
            placeholder="Search by name, title, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            style={{
              flex: '1',
              padding: '8px 12px',
              border: '1px solid var(--card-border, #e5e7eb)',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'Roobert, sans-serif',
              background: 'var(--card-background, #ffffff)',
              color: 'var(--text-primary, #1f2937)'
            }}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: '8px 16px',
              background: 'var(--brand-primary, #8b5cf6)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <Search size={16} />
            Search
          </button>
          {searchTerm && (
            <button
              onClick={handleClearSearch}
              style={{
                padding: '8px 16px',
                background: 'var(--card-background, #ffffff)',
                color: 'var(--text-secondary, #6b7280)',
                border: '1px solid var(--card-border, #e5e7eb)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Zoom Controls */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'var(--card-background, #ffffff)',
          border: '1px solid var(--card-border, #e5e7eb)',
          borderRadius: '6px',
          padding: '4px'
        }}>
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary, #6b7280)'
            }}
          >
            <ZoomIn size={18} />
          </button>
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary, #6b7280)'
            }}
          >
            <ZoomOut size={18} />
          </button>
          <button
            onClick={handleFit}
            title="Fit to Screen"
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              color: 'var(--text-secondary, #6b7280)'
            }}
          >
            <Home size={18} />
          </button>
        </div>

        {/* Export Controls */}
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={handleExportPNG}
            style={{
              padding: '8px 12px',
              background: 'var(--card-background, #ffffff)',
              color: 'var(--text-secondary, #6b7280)',
              border: '1px solid var(--card-border, #e5e7eb)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <Download size={16} />
            PNG
          </button>
          <button
            onClick={handleExportSVG}
            style={{
              padding: '8px 12px',
              background: 'var(--card-background, #ffffff)',
              color: 'var(--text-secondary, #6b7280)',
              border: '1px solid var(--card-border, #e5e7eb)',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px'
            }}
          >
            <Download size={16} />
            SVG
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div 
        ref={chartRef}
        style={{
          width: '100%',
          minHeight: '600px',
          background: 'var(--card-background, #ffffff)',
          border: '1px solid var(--card-border, #e5e7eb)',
          borderRadius: '8px',
          overflow: 'hidden'
        }}
      />
    </div>
  );
};

export { OrgChartRenderer };
export default OrgChartRenderer;

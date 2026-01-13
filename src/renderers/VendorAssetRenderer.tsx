import React from 'react';
import type { RendererProps } from '../types/schema';
import { renderWithExpressions } from '../utils/expressionParser';

interface VendorAssetData {
  problemsSolved: string;
  coreFunctions: string[];
  extendedFunctions: string[];
  bigWins: Array<{
    metric: string;
    title: string;
    description: string;
  }>;
}

export const VendorAssetRenderer: React.FC<RendererProps> = ({ data }) => {
  const vendorData = data as VendorAssetData;
  const problemsSolved = vendorData?.problemsSolved || '';
  const coreFunctions = vendorData?.coreFunctions || [];
  const extendedFunctions = vendorData?.extendedFunctions || [];
  const bigWins = vendorData?.bigWins || [];

  return (
    <div className="vendor-asset-display">
      {/* Top Row: Problems (60%) + Capabilities (40%) */}
      <div className="vendor-top-row">
        {/* Problems Being Solved - The Narrative */}
        <div className="vendor-problems-card">
          <h3 className="vendor-section-label">Strategic Purpose</h3>
          <div className="vendor-problems-content">
            {renderWithExpressions(problemsSolved)}
          </div>
        </div>

        {/* Core vs Extended - The Capability Split */}
        <div className="vendor-capabilities-card">
          <div className="vendor-capabilities-grid">
            <div className="vendor-core-column">
              <h4 className="vendor-capability-title core">Core Functions</h4>
              <ul className="vendor-function-list">
                {coreFunctions.map((func: string, index: number) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
            <div className="vendor-extended-column">
              <h4 className="vendor-capability-title extended">Extended Value</h4>
              <ul className="vendor-function-list extended">
                {extendedFunctions.map((func: string, index: number) => (
                  <li key={index}>{func}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Success Gallery - The Proof */}
      <div className="vendor-success-gallery">
        {bigWins.map((win: any, index: number) => (
          <div key={index} className="vendor-win-card">
            <div className="vendor-win-metric">{win.metric}</div>
            <div className="vendor-win-title">{win.title}</div>
            <p className="vendor-win-description">{win.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

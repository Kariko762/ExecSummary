import React from 'react';
import type { RendererProps } from '../types/schema';
import { renderWithExpressions } from '../utils/expressionParser';

interface VendorDetailsData {
  // Vendor Identity
  vendorName: string;
  vendorTagline: string;
  logoUrl?: string;
  engagementStart: string;
  contractRenewal: string;
  contractValue: string;
  
  // Primary Contact
  primaryContact: {
    name: string;
    role: string;
    email?: string;
    phone?: string;
  };
  
  // Strategic Narrative
  problemStatement: string;
  solutionDelivered: string;
  coreFunctions: string[];
  
  // SMART Goals
  smartGoals: {
    specific: string;
    measurable: string;
    achievable: string;
    relevant: string;
    timeBound: string;
    currentStatus: 'on-track' | 'at-risk' | 'ahead' | 'blocked';
  };
  
  // Quick Stats
  quickStats: {
    activeWorkspaces: number;
    annualSpend: string;
    pilotsInFlight: number;
    userCount?: number;
  };
  
  // Big Wins
  bigWins: Array<{
    metric: string;
    title: string;
    description: string;
    icon?: string;
  }>;
}

export const VendorDetailsRenderer: React.FC<RendererProps> = ({ data }) => {
  const vendor = data as VendorDetailsData;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return '#3bcd3e';
      case 'ahead': return '#10b981';
      case 'at-risk': return '#f59e0b';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-track': return '✓';
      case 'ahead': return '⚡';
      case 'at-risk': return '⚠';
      case 'blocked': return '⛔';
      default: return '●';
    }
  };

  return (
    <div className="vendor-details-section">
      {/* Vendor Identity Banner */}
      <div className="vendor-identity-banner">
        <div className="vendor-banner-left">
          {vendor.logoUrl && (
            <div className="vendor-logo">
              <img src={vendor.logoUrl} alt={vendor.vendorName} />
            </div>
          )}
          <div className="vendor-title-block">
            <h2 className="vendor-company-name">{vendor.vendorName}</h2>
            <p className="vendor-tagline">{vendor.vendorTagline}</p>
          </div>
        </div>
        <div className="vendor-banner-right">
          <div className="vendor-meta-item">
            <span className="meta-label">Active Since</span>
            <span className="meta-value">{vendor.engagementStart}</span>
          </div>
          <div className="vendor-meta-item">
            <span className="meta-label">Contract Renewal</span>
            <span className="meta-value">{vendor.contractRenewal}</span>
          </div>
          <div className="vendor-meta-item">
            <span className="meta-label">Primary Contact</span>
            <span className="meta-value">{vendor.primaryContact.name}</span>
            <span className="meta-sub">{vendor.primaryContact.role}</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Strategic Value + SMART Goals + Quick Stats */}
      <div className="vendor-details-grid">
        {/* Strategic Value Card */}
        <div className="vendor-strategic-card">
          <div className="card-section">
            <h3 className="section-title">
              <span className="title-icon">🎯</span>
              Problem Statement
            </h3>
            <div className="strategic-content">
              {renderWithExpressions(vendor.problemStatement)}
            </div>
          </div>

          <div className="card-divider"></div>

          <div className="card-section">
            <h3 className="section-title">
              <span className="title-icon">✨</span>
              Solution Delivered
            </h3>
            <div className="strategic-content">
              {renderWithExpressions(vendor.solutionDelivered)}
            </div>
          </div>

          <div className="card-divider"></div>

          <div className="card-section">
            <h3 className="section-title">
              <span className="title-icon">⚙️</span>
              Core Capabilities
            </h3>
            <ul className="core-functions-list">
              {vendor.coreFunctions.map((func, index) => (
                <li key={index}>
                  <span className="function-icon">✓</span>
                  {func}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* SMART Goals Card */}
        <div className="vendor-smart-card">
          <div className="smart-header">
            <h3 className="smart-title">Engagement Goals</h3>
            <div 
              className="smart-status-badge"
              style={{ 
                backgroundColor: getStatusColor(vendor.smartGoals.currentStatus),
                color: 'white'
              }}
            >
              {getStatusIcon(vendor.smartGoals.currentStatus)} {vendor.smartGoals.currentStatus.replace('-', ' ').toUpperCase()}
            </div>
          </div>

          <div className="smart-goals-list">
            <div className="smart-goal-item">
              <div className="goal-label">S • Specific</div>
              <div className="goal-value">{vendor.smartGoals.specific}</div>
            </div>
            <div className="smart-goal-item">
              <div className="goal-label">M • Measurable</div>
              <div className="goal-value">{vendor.smartGoals.measurable}</div>
            </div>
            <div className="smart-goal-item">
              <div className="goal-label">A • Achievable</div>
              <div className="goal-value">{vendor.smartGoals.achievable}</div>
            </div>
            <div className="smart-goal-item">
              <div className="goal-label">R • Relevant</div>
              <div className="goal-value">{vendor.smartGoals.relevant}</div>
            </div>
            <div className="smart-goal-item">
              <div className="goal-label">T • Time-Bound</div>
              <div className="goal-value">{vendor.smartGoals.timeBound}</div>
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="vendor-stats-card">
          <h3 className="stats-title">Quick Stats</h3>
          
          <div className="stat-item">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-value">{vendor.quickStats.activeWorkspaces}</div>
              <div className="stat-label">Active Workspaces</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">{vendor.quickStats.annualSpend}</div>
              <div className="stat-label">Annual Spend</div>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{vendor.quickStats.pilotsInFlight}</div>
              <div className="stat-label">Pilots In Flight</div>
            </div>
          </div>

          {vendor.quickStats.userCount && (
            <div className="stat-item">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <div className="stat-value">{vendor.quickStats.userCount}</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Big Wins Section */}
      <div className="vendor-impact-section">
        <h3 className="impact-title">
          <span className="title-gradient">Proven Impact</span>
        </h3>
        <div className="vendor-wins-grid">
          {vendor.bigWins.map((win, index) => (
            <div key={index} className="vendor-win-card-v2">
              {win.icon && (
                <div className="win-icon-badge">{win.icon}</div>
              )}
              <div className="win-metric-large">{win.metric}</div>
              <div className="win-title-bold">{win.title}</div>
              <p className="win-description-text">{win.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

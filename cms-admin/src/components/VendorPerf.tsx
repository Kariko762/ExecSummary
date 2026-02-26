import React from 'react';
import { Download, X, TrendingUp, DollarSign, Users, Package, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface VendorPerfProps {
  data?: any;
  vendor?: string;
  onClose: () => void;
  onEdit?: () => void;
}

export default function VendorPerf({ data, vendor, onClose, onEdit }: VendorPerfProps) {
  if (!data) return null;

  const { revenueSupported, contractingSpend, licenseConsumption, currentAssets } = data;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-700/40">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/40 bg-slate-800/50">
          <div>
            <h2 className="text-2xl font-roobert-heavy text-white">
              {data.meta?.vendor || vendor} Performance
            </h2>
            <p className="text-sm text-slate-400 font-roobert-medium">
              {data.meta?.quarter} {data.meta?.year}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {onEdit && (
              <button 
                onClick={onEdit}
                className="px-3 py-2 bg-[#4bcd3e]/10 hover:bg-[#4bcd3e]/20 text-[#4bcd3e] rounded-lg transition-colors flex items-center gap-2 font-roobert-semibold text-sm border border-[#4bcd3e]/20"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-900">
          
          {/* Hero Metrics */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-sm font-roobert-medium text-slate-300">Revenue Supported</span>
              </div>
              <div className="text-3xl font-roobert-bold text-white">
                {revenueSupported?.total || '$0'}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-sm font-roobert-medium text-slate-300">Annual Spend</span>
              </div>
              <div className="text-3xl font-roobert-bold text-white">
                {contractingSpend?.currentSpend || '$0'}
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-sm font-roobert-medium text-slate-300">License Utilization</span>
              </div>
              <div className="text-3xl font-roobert-bold text-white">
                {licenseConsumption?.utilizationRate || 0}%
              </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/40 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Package className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-sm font-roobert-medium text-slate-300">Total Assets</span>
              </div>
              <div className="text-3xl font-roobert-bold text-white">
                {currentAssets?.total || 0}
              </div>
            </div>
          </div>

          {/* Shared License Pool Consumption */}
          {licenseConsumption?.businessUnits && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/40 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">
                Shared License Pool Consumption
              </h3>
              
              {/* Total Pool Summary */}
              <div className="mb-6 flex items-center justify-between">
                <span className="text-sm font-roobert-medium text-slate-300">
                  Total Pool Size
                </span>
                <span className="text-lg font-roobert-bold text-white">
                  {licenseConsumption.businessUnits.reduce((sum: number, bu: any) => sum + bu.consumed, 0)} / {licenseConsumption.businessUnits.reduce((sum: number, bu: any) => sum + bu.allocated, 0)} licenses
                </span>
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="mb-6">
                <div className="h-8 bg-slate-700/50 rounded-lg overflow-hidden flex">
                  {licenseConsumption.businessUnits.map((bu: any, idx: number) => {
                    const totalLicenses = licenseConsumption.businessUnits.reduce((sum: number, b: any) => sum + b.allocated, 0);
                    const widthPercent = (bu.allocated / totalLicenses) * 100;
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                    
                    return (
                      <div
                        key={idx}
                        className={`${colors[idx % colors.length]} flex items-center justify-center text-xs font-roobert-medium text-white`}
                        style={{ width: `${widthPercent}%` }}
                        title={`${bu.name}: ${bu.consumed}/${bu.allocated}`}
                      >
                        {widthPercent > 8 && `${bu.consumed}`}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Business Unit Legend */}
              <div className="flex items-center gap-6 flex-wrap">
                {licenseConsumption.businessUnits.map((bu: any, idx: number) => {
                  const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500'];
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${colors[idx % colors.length]}`}></div>
                      <span className="text-sm font-roobert-medium text-slate-300">
                        {bu.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Assets and Demos Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Created Assets by Business Unit */}
            {currentAssets?.byBusinessUnit && (
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/40 p-4 backdrop-blur-sm">
                <h3 className="text-sm font-roobert-semibold text-white mb-2">
                  Created Assets by Business Unit
                </h3>
                <div className="space-y-2">
                  {currentAssets.byBusinessUnit.map((bu: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-700/30 rounded p-2 border border-slate-600/30">
                      <div className="text-xs font-roobert-semibold text-white min-w-[120px]">
                        {bu.name}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <div className="text-sm font-roobert-bold text-green-400">{bu.published}</div>
                          <div className="text-xs text-slate-400">Pub</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-sm font-roobert-bold text-yellow-400">{bu.draft}</div>
                          <div className="text-xs text-slate-400">Draft</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="text-sm font-roobert-bold text-slate-400">{bu.archived}</div>
                          <div className="text-xs text-slate-400">Arch</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Demos Performed by Business Unit */}
            {currentAssets?.demosPerformed && (
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/40 p-4 backdrop-blur-sm">
                <h3 className="text-sm font-roobert-semibold text-white mb-2">
                  Demos Performed by Business Unit
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={currentAssets.demosPerformed}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={0}
                      dataKey="count"
                      label={({ count, percent }) => `${count} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
                      stroke="none"
                    >
                      {currentAssets.demosPerformed.map((entry: any, index: number) => {
                        const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Contracting & Spend Summary */}
          {contractingSpend?.contracts && (
            <div className="bg-slate-800/30 rounded-xl border border-slate-700/40 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-roobert-semibold text-white mb-4">
                Active Contracts
              </h3>
              <div className="space-y-3">
                {contractingSpend.contracts.map((contract: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-600/30">
                    <div className="space-y-1">
                      <div className="text-sm font-roobert-semibold text-white">
                        {contract.type}
                      </div>
                      <div className="text-xs text-slate-400 font-roobert-medium">
                        {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.renewalDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-roobert-bold text-gray-900 dark:text-white">
                        {contract.value}
                      </div>
                      <div className={`text-xs font-roobert-medium ${
                        contract.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-white/50'
                      }`}>
                        {contract.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Package, Server, CheckCircle, AlertTriangle } from 'lucide-react';

interface License {
  vendor: string;
  cost: string;
  renewal: string;
  status: 'active' | 'review' | 'expiring';
}

interface Asset {
  category: string;
  count: number;
  utilization: string;
  cost: string;
}

interface VendorStatsWidgetProps {
  licenses: License[];
  assets: Asset[];
  color: string;
}

const colorMap: Record<string, string> = {
  blue: 'border-blue-500/30',
  cyan: 'border-cyan-500/30',
  purple: 'border-purple-500/30',
  green: 'border-green-500/30',
  orange: 'border-orange-500/30'
};

const statusConfig = {
  active: { icon: CheckCircle, color: 'text-green-400', label: 'Active' },
  review: { icon: AlertTriangle, color: 'text-yellow-400', label: 'Under Review' },
  expiring: { icon: AlertTriangle, color: 'text-red-400', label: 'Expiring Soon' }
};

export const VendorStatsWidget: React.FC<VendorStatsWidgetProps> = ({
  licenses,
  assets,
  color
}) => {
  const borderColor = colorMap[color] || colorMap.blue;

  return (
    <div className={`border ${borderColor} rounded-xl bg-gray-800/30 backdrop-blur-sm overflow-hidden h-full`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700/50">
        <h3 className="text-lg font-semibold text-white">Vendor & Assets</h3>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Licenses Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-blue-400" />
            <h4 className="text-sm font-semibold text-white">Software Licenses</h4>
          </div>
          <div className="space-y-2">
            {licenses.slice(0, 3).map((license, idx) => {
              const statusInfo = statusConfig[license.status] || statusConfig.active;
              const StatusIcon = statusInfo.icon;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="text-sm font-medium text-white leading-tight flex-1">
                      {license.vendor}
                    </h5>
                    <StatusIcon size={14} className={statusInfo.color} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{license.cost}/yr</span>
                    <span className="text-gray-500">
                      Renews {new Date(license.renewal).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {licenses.length > 3 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{licenses.length - 3} more licenses
            </p>
          )}
        </div>

        {/* Assets Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Server size={16} className="text-purple-400" />
            <h4 className="text-sm font-semibold text-white">Infrastructure Assets</h4>
          </div>
          <div className="space-y-2">
            {assets.slice(0, 3).map((asset, idx) => {
              const utilization = parseInt(asset.utilization);
              const isHighUtilization = utilization >= 85;
              
              return (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-white">{asset.category}</h5>
                    <span className="text-xs text-gray-400">{asset.count} units</span>
                  </div>
                  
                  {/* Utilization Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Utilization</span>
                      <span className={isHighUtilization ? 'text-yellow-400' : 'text-gray-400'}>
                        {asset.utilization}
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full ${
                          isHighUtilization
                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500'
                        }`}
                        style={{ width: asset.utilization }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 text-right">{asset.cost}/mo</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          {assets.length > 3 && (
            <p className="text-xs text-gray-500 mt-2 text-center">
              +{assets.length - 3} more asset categories
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

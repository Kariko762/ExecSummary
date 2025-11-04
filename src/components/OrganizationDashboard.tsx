import { useState } from 'react';
import { motion } from 'framer-motion';
import { organizations } from '../data/organizations-loader';
import { OrganizationTile } from './OrganizationTile';
import { OrganizationModal } from './OrganizationModal';
import { Organization } from '../types';
import { Building2 } from 'lucide-react';

export function OrganizationDashboard() {
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  return (
    <div id="organizations" className="space-y-6">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Building2 className="w-8 h-8 text-fis-raspberry" />
          <h2 className="text-4xl font-roobert-heavy text-gray-900 dark:text-white">
            Organization Overview
          </h2>
        </div>
        <p className="text-lg font-roobert-light text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Real-time status across all lines of business
        </p>
      </motion.div>

      {/* Organization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {organizations.map((org, index) => (
          <OrganizationTile
            key={org.id}
            organization={org}
            onClick={() => setSelectedOrg(org)}
            index={index}
          />
        ))}
      </div>

      {/* Organization Modal */}
      <OrganizationModal 
        organization={selectedOrg}
        onClose={() => setSelectedOrg(null)}
      />
    </div>
  );
}

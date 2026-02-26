import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Users, FolderKanban } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BusinessUnitCardProps {
  id: string;
  name: string;
  shortName: string;
  color: string;
  stats: {
    revenue: string;
    growth: string;
    activeProjects: number;
    teamSize: number;
  };
}

const colorMap: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  blue: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-blue-400',
    hover: 'hover:border-slate-600 hover:bg-slate-800/70'
  },
  cyan: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-cyan-400',
    hover: 'hover:border-slate-600 hover:bg-slate-800/70'
  },
  purple: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-purple-400',
    hover: 'hover:border-slate-600 hover:bg-slate-800/70'
  },
  green: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-green-400',
    hover: 'hover:border-slate-600 hover:bg-slate-800/70'
  },
  orange: {
    bg: 'bg-slate-800/50',
    border: 'border-slate-700/50',
    text: 'text-orange-400',
    hover: 'hover:border-slate-600 hover:bg-slate-800/70'
  }
};

export const BusinessUnitCard: React.FC<BusinessUnitCardProps> = ({
  id,
  name,
  shortName,
  color,
  stats
}) => {
  const colors = colorMap[color] || colorMap.blue;

  return (
    <Link to={`/executive-home/${id}`}>
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        className={`
          relative overflow-hidden rounded-xl border ${colors.border} bg-[#1a1f2e] ${colors.hover}
          p-6 transition-all duration-300 cursor-pointer
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">
              {shortName}
            </h3>
            <p className="text-sm text-slate-400">{name}</p>
          </div>
          <motion.div
            whileHover={{ x: 4 }}
            className={`${colors.text}`}
          >
            <ArrowRight size={24} />
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Revenue */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <TrendingUp size={18} className={colors.text} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Revenue</p>
              <p className="text-lg font-semibold text-white">{stats.revenue}</p>
            </div>
          </div>

          {/* Growth */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <TrendingUp size={18} className={colors.text} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Growth</p>
              <p className={`text-lg font-semibold ${colors.text}`}>{stats.growth}</p>
            </div>
          </div>

          {/* Active Projects */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <FolderKanban size={18} className={colors.text} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Projects</p>
              <p className="text-lg font-semibold text-white">{stats.activeProjects}</p>
            </div>
          </div>

          {/* Team Size */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/50">
              <Users size={18} className={colors.text} />
            </div>
            <div>
              <p className="text-xs text-slate-400">Team Size</p>
              <p className="text-lg font-semibold text-white">{stats.teamSize}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

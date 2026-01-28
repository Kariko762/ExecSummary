import { TrendingUp, ChevronRight, AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface CardStyleGalleryProps {
  onClose: () => void;
}

export default function CardStyleGallery({ onClose }: CardStyleGalleryProps) {
  const [selectedStyle, setSelectedStyle] = useState<number | null>(null);

  // Sample data for cards
  const timelineData = {
    id: '1',
    quarter: 'Q4 2024',
    year: 'Week 49',
    title: 'Weekly Summary',
    keyMetrics: { revenue: '+12%', growth: '+8%' }
  };

  const orgData = {
    id: 'org-1',
    name: 'Corporate Banking',
    description: 'Enterprise banking solutions',
    projects: 8,
    openTickets: 12,
    blockers: 2,
    riskLevel: 'medium' as const,
    lastUpdate: '12/05/2024'
  };

  const initiativeData = {
    id: 'init-1',
    name: 'Digital Transformation',
    description: 'Modernizing legacy systems and processes',
    projects: 12,
    openTickets: 24,
    blockers: 3,
    riskLevel: 'high' as const,
    lastUpdate: 'Dec 4'
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white dark:bg-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-b from-fis-navy to-fis-eggplant text-white py-5 shadow-2xl border-b border-fis-eggplant/30">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-roobert-bold">Card Style Gallery</h1>
            <p className="text-xs text-white/80 mt-0.5">Choose your preferred design style</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors border border-white/20 hover:border-white/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="space-y-16">
          
          {/* Style 1: Soft Gradient Mesh */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 1: Soft Gradient Mesh
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Organic blob shapes with blur effect - Modern glass-morphism aesthetic
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl p-5 transition-all hover:shadow-2xl cursor-pointer relative overflow-hidden h-[200px] flex flex-col"
                   style={{
                     background: 'linear-gradient(135deg, rgba(178, 26, 83, 0.15) 0%, rgba(178, 26, 83, 0.05) 100%)',
                     backdropFilter: 'blur(10px)'
                   }}>
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-fis-raspberry/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-fis-raspberry/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                      Weekly Summary
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{timelineData.quarter}</h3>
                      <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">{timelineData.year}</p>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl p-6 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(96, 165, 250, 0.05) 100%)',
                     backdropFilter: 'blur(10px)'
                   }}>
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                      1 At Risk
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-roobert-heavy text-gray-900">{orgData.name}</h3>
                    <p className="text-xs text-gray-600 font-roobert-light">Updated {orgData.lastUpdate}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Projects</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.projects}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Tickets</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.openTickets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 mb-1">Blockers</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.blockers}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl p-6 hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
                   style={{
                     background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(167, 139, 250, 0.05) 100%)',
                     backdropFilter: 'blur(10px)'
                   }}>
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900">{initiativeData.name}</h3>
                      <p className="text-sm text-gray-600 font-roobert-light">{initiativeData.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-2 text-gray-900" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg p-3 bg-white/40 backdrop-blur-sm">
                      <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.projects}</div>
                      <div className="text-xs text-gray-600 font-roobert-light mt-1">Projects</div>
                    </div>
                    <div className="rounded-lg p-3 bg-white/40 backdrop-blur-sm">
                      <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.openTickets}</div>
                      <div className="text-xs text-gray-600 font-roobert-light mt-1">Tickets</div>
                    </div>
                    <div className="rounded-lg p-3 bg-white/40 backdrop-blur-sm">
                      <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.blockers}</div>
                      <div className="text-xs text-gray-600 font-roobert-light mt-1">Blockers</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                    <AlertCircle className="w-3 h-3" />
                    At Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Style 2: Accent Border Glow */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 2: Accent Border Glow
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clean design with colored border and glow effect - Professional and content-focused
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl p-5 transition-all cursor-pointer relative h-[200px] flex flex-col bg-white dark:bg-gray-800 border-2 border-fis-raspberry shadow-lg hover:shadow-fis-raspberry/50 hover:shadow-2xl"
                   style={{ boxShadow: '0 0 20px rgba(178, 26, 83, 0.2)' }}>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                    Weekly Summary
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{timelineData.quarter}</h3>
                    <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">{timelineData.year}</p>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative bg-white dark:bg-gray-800 border-2 border-blue-500 shadow-lg hover:shadow-blue-500/50 hover:shadow-2xl"
                   style={{ boxShadow: '0 0 20px rgba(96, 165, 250, 0.2)' }}>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                    1 At Risk
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">Updated {orgData.lastUpdate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projects</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.projects}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tickets</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.openTickets}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Blockers</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.blockers}</div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative bg-white dark:bg-gray-800 border-2 border-purple-500 shadow-lg hover:shadow-purple-500/50 hover:shadow-2xl"
                   style={{ boxShadow: '0 0 20px rgba(167, 139, 250, 0.2)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900 dark:text-white">{initiativeData.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">{initiativeData.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.projects}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Projects</div>
                  </div>
                  <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.openTickets}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Tickets</div>
                  </div>
                  <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.blockers}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Blockers</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                  <AlertCircle className="w-3 h-3" />
                  At Risk
                </span>
              </div>
            </div>
          </div>

          {/* Style 3: Status-Driven Radial Gradient */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 3: Status-Driven Radial Gradient
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Background intensity based on status - Functional visual indicator
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl p-5 transition-all cursor-pointer relative h-[200px] flex flex-col overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'radial-gradient(circle at top right, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 50%, transparent 100%), white'
                   }}>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                    Weekly Summary
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900">{timelineData.quarter}</h3>
                    <p className="text-sm font-roobert-medium text-gray-500">{timelineData.year}</p>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'radial-gradient(circle at top right, rgba(234, 179, 8, 0.25) 0%, rgba(234, 179, 8, 0.1) 40%, transparent 100%), white'
                   }}>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                    1 At Risk
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900">{orgData.name}</h3>
                  <p className="text-xs text-gray-600 font-roobert-light">Updated {orgData.lastUpdate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Projects</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.projects}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Tickets</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.openTickets}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Blockers</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.blockers}</div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'radial-gradient(circle at top right, rgba(239, 68, 68, 0.25) 0%, rgba(239, 68, 68, 0.1) 40%, transparent 100%), white'
                   }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900">{initiativeData.name}</h3>
                    <p className="text-sm text-gray-600 font-roobert-light">{initiativeData.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-900" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.projects}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Projects</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.openTickets}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Tickets</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.blockers}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Blockers</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                  <AlertCircle className="w-3 h-3" />
                  At Risk
                </span>
              </div>
            </div>
          </div>

          {/* Style 4: Left Accent Bar */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 4: Left Accent Bar
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Thick colored bar on left edge - Clean and structured
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl transition-all cursor-pointer relative h-[200px] flex overflow-hidden shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800">
                <div className="w-2 bg-fis-raspberry flex-shrink-0"></div>
                <div className="p-5 flex-1">
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                      Weekly Summary
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{timelineData.quarter}</h3>
                      <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">{timelineData.year}</p>
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 flex">
                <div className="w-2 bg-blue-500 flex-shrink-0"></div>
                <div className="p-6 flex-1">
                  <div className="absolute top-4 right-4">
                    <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                      1 At Risk
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.name}</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">Updated {orgData.lastUpdate}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projects</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.projects}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tickets</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.openTickets}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Blockers</div>
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.blockers}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl bg-white dark:bg-gray-800 flex">
                <div className="w-2 bg-purple-500 flex-shrink-0"></div>
                <div className="p-6 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900 dark:text-white">{initiativeData.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">{initiativeData.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 ml-2 text-gray-900 dark:text-white" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.projects}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Projects</div>
                    </div>
                    <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.openTickets}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Tickets</div>
                    </div>
                    <div className="rounded-lg p-3 bg-purple-50 dark:bg-purple-900/20">
                      <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.blockers}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Blockers</div>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                    <AlertCircle className="w-3 h-3" />
                    At Risk
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Style 5: Diagonal Split Gradient */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 5: Diagonal Split Gradient
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Two-tone diagonal gradient - Bold and dynamic
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl p-5 transition-all cursor-pointer relative h-[200px] flex flex-col overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'linear-gradient(135deg, rgba(178, 26, 83, 0.1) 0%, rgba(178, 26, 83, 0.2) 50%, rgba(178, 26, 83, 0.05) 100%)'
                   }}>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                    Weekly Summary
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900">{timelineData.quarter}</h3>
                    <p className="text-sm font-roobert-medium text-gray-500">{timelineData.year}</p>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(96, 165, 250, 0.25) 50%, rgba(96, 165, 250, 0.05) 100%)'
                   }}>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                    1 At Risk
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900">{orgData.name}</h3>
                  <p className="text-xs text-gray-600 font-roobert-light">Updated {orgData.lastUpdate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Projects</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.projects}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Tickets</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.openTickets}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 mb-1">Blockers</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900">{orgData.blockers}</div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative overflow-hidden shadow-lg hover:shadow-2xl"
                   style={{
                     background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(167, 139, 250, 0.25) 50%, rgba(167, 139, 250, 0.05) 100%)'
                   }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900">{initiativeData.name}</h3>
                    <p className="text-sm text-gray-600 font-roobert-light">{initiativeData.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-900" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.projects}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Projects</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.openTickets}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Tickets</div>
                  </div>
                  <div className="rounded-lg p-3 bg-white/60 backdrop-blur-sm">
                    <div className="text-2xl font-roobert-heavy text-gray-900">{initiativeData.blockers}</div>
                    <div className="text-xs text-gray-600 font-roobert-light mt-1">Blockers</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                  <AlertCircle className="w-3 h-3" />
                  At Risk
                </span>
              </div>
            </div>
          </div>

          {/* Style 6: Minimal Shadow Elevation */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-roobert-bold text-gray-900 dark:text-white mb-2">
                Style 6: Minimal Shadow Elevation
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Clean white/dark cards with layered shadows - Minimalist and modern
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Timeline Card */}
              <div className="rounded-xl p-5 transition-all cursor-pointer relative h-[200px] flex flex-col bg-white dark:bg-gray-800 hover:shadow-2xl"
                   style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(178, 26, 83, 0.1)' }}>
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-roobert-semibold bg-fis-raspberry/20 text-fis-raspberry">
                    Weekly Summary
                  </span>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{timelineData.quarter}</h3>
                    <p className="text-sm font-roobert-medium text-gray-500 dark:text-gray-400">{timelineData.year}</p>
                  </div>
                  <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-green-500/20">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-roobert-semibold text-green-600">+12%</span>
                  </div>
                </div>
              </div>

              {/* Organization Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative bg-white dark:bg-gray-800 hover:shadow-2xl"
                   style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(96, 165, 250, 0.1)' }}>
                <div className="absolute top-4 right-4">
                  <div className="px-3 py-1.5 rounded-full text-xs font-roobert-semibold bg-yellow-500/90 text-white">
                    1 At Risk
                  </div>
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light">Updated {orgData.lastUpdate}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Projects</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.projects}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Tickets</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.openTickets}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Blockers</div>
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{orgData.blockers}</div>
                  </div>
                </div>
              </div>

              {/* Initiative Card */}
              <div className="rounded-xl p-6 transition-all cursor-pointer relative bg-white dark:bg-gray-800 hover:shadow-2xl"
                   style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(167, 139, 250, 0.1)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-roobert-semibold mb-1 text-gray-900 dark:text-white">{initiativeData.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-roobert-light">{initiativeData.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 ml-2 text-gray-900 dark:text-white" />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.projects}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Projects</div>
                  </div>
                  <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.openTickets}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Tickets</div>
                  </div>
                  <div className="rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
                    <div className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">{initiativeData.blockers}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-roobert-light mt-1">Blockers</div>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-roobert-medium bg-red-500/90 text-white">
                  <AlertCircle className="w-3 h-3" />
                  At Risk
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

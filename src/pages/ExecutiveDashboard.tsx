import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import LeadershipView from './dark-theme/LeadershipView';
import LeadershipBUView from './dark-theme/LeadershipBUView';
import VendorView from './dark-theme/VendorView';
import TasksNotesTable from './dark-theme/TasksNotesTable';
import InitiativesTimeline from './dark-theme/InitiativesTimeline';
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Mail, 
  Bell,
  Calendar,
  TrendingUp,
  Target,
  FileText,
  Settings,
  Users,
  BarChart3,
  Clock,
  Maximize2,
  CheckSquare,
  Trophy
} from 'lucide-react';

// Types
interface SummaryCard {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  type: 'Leadership' | 'Vendor' | 'Budget' | 'Articles';
  author?: string;
  contentSource?: string; // Track API endpoint source (leadership, leadership-bu, etc)
}

interface Article {
  id: string;
  title: string;
  type: 'Strategy' | 'Reference' | 'Research';
}

interface Deliverable {
  id: string;
  title: string;
  assignedTo: string;
  dueDate: string;
  daysUntil: number;
}

const ExecutiveDashboard: React.FC = () => {
  // State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeNavTab, setActiveNavTab] = useState('Overview');
  const [activeSummaryTab, setActiveSummaryTab] = useState<'Leadership' | 'Vendor' | 'Budget' | 'Articles'>('Leadership');
  const [activeArticleTab, setActiveArticleTab] = useState('Key Activity Data');
  const [activePerformanceTab, setActivePerformanceTab] = useState('Key Activity Data');
  const [summaryScrollIndex, setSummaryScrollIndex] = useState(0);
  const [leadershipSummaries, setLeadershipSummaries] = useState<SummaryCard[]>([]);
  const [vendorSummaries, setVendorSummaries] = useState<SummaryCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeadershipId, setSelectedLeadershipId] = useState<string | null>(null);
  const [selectedLeadershipData, setSelectedLeadershipData] = useState<any>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [selectedVendorData, setSelectedVendorData] = useState<any>(null);

  // Load Leadership Summaries from API (both leadership and leadership-bu)
  useEffect(() => {
    const loadLeadershipSummaries = async () => {
      try {
        // Fetch both leadership and leadership-bu summaries in parallel
        const [leadershipResponse, leadershipBUResponse] = await Promise.all([
          fetch('http://localhost:3001/api/content/list/leadership'),
          fetch('http://localhost:3001/api/content/list/leadership-bu')
        ]);
        
        const leadershipData = await leadershipResponse.json();
        const leadershipBUData = await leadershipBUResponse.json();
        
        // Combine both arrays with source tracking
        const leadershipContent = (leadershipData.success && Array.isArray(leadershipData.content) ? leadershipData.content : []).map((item: any) => ({ ...item, _source: 'leadership' }));
        const leadershipBUContent = (leadershipBUData.success && Array.isArray(leadershipBUData.content) ? leadershipBUData.content : []).map((item: any) => ({ ...item, _source: 'leadership-bu' }));
        
        const allContent = [...leadershipContent, ...leadershipBUContent];
        
        // Map and sort combined results
        const summaries: SummaryCard[] = allContent
          .filter((item: any) => item._published) // Only show published
          .map((item: any) => ({
            id: item.meta?.id || item.id || `leadership-${Date.now()}`,
            title: item.meta?.title || item.title || 'Leadership Summary',
            subtitle: item.meta?.subtitle || 'Leadership Update',
            category: 'Leadership',
            date: `Posted ${new Date(item.meta?.lastModified || item.meta?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
            type: 'Leadership' as const,
            author: item.meta?.author || 'Executive Team',
            sortDate: new Date(item.meta?.lastModified || item.meta?.createdAt || Date.now()).getTime(),
            contentSource: item._source // Track which endpoint this came from
          }))
          .sort((a: any, b: any) => b.sortDate - a.sortDate); // Sort newest first
        
        setLeadershipSummaries(summaries);
      } catch (error) {
        console.error('Error loading leadership summaries:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLeadershipSummaries();
  }, []);

  // Load Vendor Summaries from API
  useEffect(() => {
    const loadVendorSummaries = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/content?tag=vendor-summary');
        const data = await response.json();
        
        if (data.success && Array.isArray(data.content)) {
          const summaries: SummaryCard[] = data.content
            .filter((item: any) => item._published) // Only show published
            .map((item: any) => ({
              id: item.meta?.id || item._id || `vendor-${Date.now()}`,
              title: item.meta?.title || item.title || 'Vendor Summary',
              subtitle: item.storytellingIndex?.subtitle || item.meta?.subtitle || 'Vendor Update',
              category: 'Vendor',
              date: `Posted ${new Date(item.meta?.createdAt || item.meta?.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
              type: 'Vendor' as const,
              author: item.meta?.author || 'Vendor Relations',
              sortDate: new Date(item.meta?.createdAt || item.meta?.updatedAt || Date.now()).getTime()
            }))
            .sort((a: any, b: any) => b.sortDate - a.sortDate); // Sort newest first
          setVendorSummaries(summaries);
        }
      } catch (error) {
        console.error('Error loading vendor summaries:', error);
      }
    };
    
    loadVendorSummaries();
  }, []);

  // Sample Data (keeping Budget, Articles as placeholders for now)
  const summaryData: Record<string, SummaryCard[]> = {
    Leadership: leadershipSummaries,
    Vendor: vendorSummaries,
    Budget: [
      { id: '11', title: 'Q1 Board Risk Assessment', subtitle: 'Budget Report', category: 'Budget', date: 'Posted Mar 1, 2024', type: 'Budget' },
      { id: '12', title: 'Cost Optimization Initiatives', subtitle: 'Financial Review', category: 'Budget', date: 'Posted Feb 28, 2024', type: 'Budget' },
      { id: '13', title: 'Investment Portfolio Update', subtitle: 'Quarterly Brief', category: 'Budget', date: 'Posted Feb 25, 2024', type: 'Budget' },
    ],
    Articles: [
      { id: '8', title: 'Data Integration Technical Bottleneck', subtitle: 'Tech Report', category: 'Articles', date: 'Posted Apr 8, 2024', type: 'Articles' },
      { id: '9', title: 'Infrastructure Upgrade Plan', subtitle: 'Technical Brief', category: 'Articles', date: 'Posted Apr 5, 2024', type: 'Articles' },
      { id: '10', title: 'Security Audit Results', subtitle: 'Monthly Report', category: 'Articles', date: 'Posted Apr 3, 2024', type: 'Articles' },
    ],
  };

  const articles: Article[] = [
    { id: '1', title: 'Forecasting Models Comparison', type: 'Strategy' },
    { id: '2', title: 'Driving Pipeline with Demo Strategy', type: 'Reference' },
    { id: '3', title: 'Top GTM Tools and Platforms', type: 'Reference' },
    { id: '4', title: 'Market Analysis Q2 2024', type: 'Research' },
    { id: '5', title: 'Competitor Landscape Review', type: 'Strategy' },
  ];

  const deliverables: Deliverable[] = [
    { id: '1', title: 'Agency Partner Evaluation', assignedTo: 'Claire Avelation', dueDate: 'May 6, 2024', daysUntil: 5 },
    { id: '2', title: 'Demo Pilot Readiness Review', assignedTo: 'Revie X', dueDate: 'May 8, 2024', daysUntil: 7 },
    { id: '3', title: 'Coast MSA Renewal Approval', assignedTo: 'Nick Z', dueDate: 'May 9, 2024', daysUntil: 8 },
    { id: '4', title: 'Q2 Budget Reconciliation', assignedTo: 'Finance Team', dueDate: 'May 12, 2024', daysUntil: 11 },
    { id: '5', title: 'Technology Roadmap Update', assignedTo: 'Tech Lead', dueDate: 'May 15, 2024', daysUntil: 14 },
  ];

  const activityData = [
    { name: 'Demo Preparation', hours: 84, change: '+18%', color: 'bg-[#5EEAD4]' },
    { name: 'Demo Support', hours: 114, change: '', color: 'bg-[#60A5FA]' },
    { name: 'Demo Presentation', hours: 152, change: '↓5%', color: 'bg-[#A78BFA]' },
  ];

  const currentSummaries = summaryData[activeSummaryTab];
  const visibleSummaries = currentSummaries.slice(summaryScrollIndex, summaryScrollIndex + 4);

  const scrollSummaries = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      setSummaryScrollIndex(Math.max(0, summaryScrollIndex - 1));
    } else {
      setSummaryScrollIndex(Math.min(currentSummaries.length - 3, summaryScrollIndex + 1));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1f2e] via-[#1e2533] to-[#24293a] relative overflow-x-hidden">
      
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Main Container */}
      <div className="relative z-10 w-full px-8 py-6" style={{ zoom: `${zoomLevel}%` }}>
        
        {/* ROW 1 - Global Navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-slate-800/30 border border-slate-700/40 shadow-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-between px-6 py-3">
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-white" />
              <span className="font-roobert-semibold text-white text-lg">Executive Summary Platform</span>
            </div>
          </div>
        </motion.div>

        {/* GRID LAYOUT - Rows 2, 3, 4 */}
        <div className="grid grid-cols-12 gap-5">
          
          {/* PARENT CONTAINER */}
          <div className="col-span-12 bg-white/[0.02] border border-white/[0.08] shadow-xl p-5">
            <div className="grid grid-cols-12 gap-5">
              
              {/* CHILD 1 - Executive Summaries (70%) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="col-span-9 bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm"
              >
                {/* TITLE */}
                <div className="px-4 py-2.5 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/40 to-slate-700/30 relative">
                  <h2 className="text-base font-roobert-semibold text-white">Executive Summaries</h2>
                </div>
                
                {/* CONTENT */}
                <div>
                  {/* ROW 1: Tabs + Navigation */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      {/* Tabs */}
                      <div className="flex items-center gap-0">
                        {(['Leadership', 'Vendor', 'Budget', 'Articles'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveSummaryTab(tab);
                              setSummaryScrollIndex(0);
                            }}
                            className={`px-3 py-1.5 text-xs font-roobert-medium transition-all duration-200 border-r border-white/[0.08] last:border-r-0 ${
                              activeSummaryTab === tab
                                ? 'text-[#4bcd3e]'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            {tab}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Navigation Arrows */}
                    <div className="flex items-center gap-0 border border-white/[0.08]">
                      <button 
                        onClick={() => scrollSummaries('left')}
                        disabled={summaryScrollIndex === 0}
                        className="w-8 h-8 bg-white/5 hover:bg-white/10 border-r border-white/[0.08] flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4 text-white" />
                      </button>
                      <button 
                        onClick={() => scrollSummaries('right')}
                        disabled={summaryScrollIndex >= currentSummaries.length - 4}
                        className="w-8 h-8 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {/* ROW 2: Summary Content Tiles */}
                  <div className="flex">
                    {visibleSummaries.map((summary, index) => (
                      <motion.div
                        key={summary.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={async () => {
                          console.log('Tile clicked!', summary.id, activeSummaryTab);
                          if (activeSummaryTab === 'Leadership') {
                            try {
                              // Use the correct endpoint based on content source
                              const endpoint = summary.contentSource || 'leadership';
                              const url = `http://localhost:3001/api/content/${endpoint}/${summary.id}`;
                              console.log('Fetching:', url);
                              const response = await fetch(url);
                              const result = await response.json();
                              console.log('API Response:', result);
                              const data = result.content || result;
                              if (data && (data._contentTag === 'leadership-summary' || data._contentTag === 'leadership-bu-summary')) {
                                setSelectedLeadershipData(data);
                                setSelectedLeadershipId(summary.id);
                                console.log('State set!');
                              }
                            } catch (error) {
                              console.error('Error loading leadership summary:', error);
                            }
                          } else if (activeSummaryTab === 'Vendor') {
                            try {
                              console.log('Fetching vendor:', `http://localhost:3001/api/content/${summary.id}`);
                              const response = await fetch(`http://localhost:3001/api/content/${summary.id}`);
                              const result = await response.json();
                              console.log('Vendor API Response:', result);
                              const data = result.content || result;
                              if (data && data._contentTag === 'vendor-summary') {
                                setSelectedVendorData(data);
                                setSelectedVendorId(summary.id);
                                console.log('Vendor state set!');
                              }
                            } catch (error) {
                              console.error('Error loading vendor summary:', error);
                            }
                          }
                        }}
                        className={`${
                          index === 0 ? 'flex-[1.3]' : 'flex-1'
                        } bg-gradient-to-br from-[#2a3f5f]/40 to-[#1e2f4f]/40 border-r border-white/[0.08] last:border-r-0 p-4 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer group min-h-[180px] flex flex-col`}
                      >
                        {/* Icon + Title on same line */}
                        <div className="flex items-start gap-2 mb-3">
                          <div className="w-6 h-6 bg-white/5 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-3 h-3 text-white font-bold" />
                          </div>
                          <h3 className="text-white font-roobert-medium text-sm flex-1 group-hover:text-[#4bcd3e] transition-colors leading-tight">
                            {summary.title}
                          </h3>
                        </div>
                        
                        {/* Author */}
                        <p className="text-white/40 text-[10px] font-roobert-light mb-2">
                          Author: {summary.author || 'Executive Team'}
                        </p>
                        
                        {/* Brief Takeaway */}
                        <p className="text-white/60 text-[10px] font-roobert-light mb-3 flex-1 line-clamp-3">
                          {summary.subtitle}
                        </p>
                        
                        {/* Date at bottom */}
                        <div className="text-[9px] text-white/30 mt-auto">
                          {summary.date.split(' ').slice(1).join(' ')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
            </div>

          </motion.div>

          {/* CHILD 2 - Quick Links (30%) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="col-span-3 bg-slate-800/30 border border-slate-700/40 rounded-xl overflow-hidden backdrop-blur-sm"
          >
            {/* TITLE */}
            <div className="px-4 py-2.5 border-b border-slate-700/40 bg-gradient-to-r from-slate-800/40 to-slate-700/30 relative">
              <h2 className="text-base font-roobert-semibold text-white">Quick Links</h2>
            </div>
            
            {/* CONTENT */}
            <div className="p-4">
              {/* Quick Links Grid */}
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-3">
                {[
                  { 
                    id: '1', 
                    title: 'Tasks & Notes', 
                    icon: CheckSquare,
                    gradient: 'from-cyan-500/20 to-blue-500/20',
                    iconColor: 'text-cyan-400',
                    onClick: () => setShowTasksModal(true) 
                  },
                  { 
                    id: '2', 
                    title: 'Gantt', 
                    icon: Calendar,
                    gradient: 'from-purple-500/20 to-pink-500/20',
                    iconColor: 'text-purple-400',
                    onClick: () => setShowTimelineModal(true) 
                  },
                  { 
                    id: '3', 
                    title: 'Initiatives', 
                    icon: Target,
                    gradient: 'from-green-500/20 to-teal-500/20',
                    iconColor: 'text-green-400',
                    path: '/#/initiatives' 
                  },
                  { 
                    id: '4', 
                    title: '2026 Goals', 
                    icon: Trophy,
                    gradient: 'from-orange-500/20 to-red-500/20',
                    iconColor: 'text-orange-400',
                    path: '/#/goals' 
                  }
                ].map((link) => {
                  const Icon = link.icon;
                  const isButton = !!link.onClick;
                  
                  const cardContent = (
                    <>
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${link.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-5 h-5 ${link.iconColor}`} />
                        </div>
                        <span className="text-sm text-white/90 font-roobert-medium truncate">
                          {link.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors flex-shrink-0" />
                    </>
                  );
                  
                  return isButton ? (
                    <button
                      key={link.id}
                      onClick={link.onClick}
                      className="group relative flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      {cardContent}
                    </button>
                  ) : (
                    <a
                      key={link.id}
                      href={link.path}
                      className="group relative flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 hover:shadow-lg hover:shadow-cyan-500/10 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                    >
                      {cardContent}
                    </a>
                  );
                })}
                </div>
            </div>
          </motion.div>

            </div>
          </div>

          {/* ROW 3 LEFT - Performance Overview (col-span-9) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="col-span-9 bg-slate-800/30 border border-slate-700/40 rounded-xl shadow-lg p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-roobert-semibold text-white">Performance Overview</h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6">
              {['Key Activity Data', 'Vendor Tasks', 'Support'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePerformanceTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-roobert-medium transition-all ${
                    activePerformanceTab === tab
                      ? 'bg-white/10 text-white border-b-2 border-fis-eggplant'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-12 gap-6">
              {/* Left: Metrics */}
              <div className="col-span-5">
                <div className="mb-6">
                  <div className="text-5xl font-roobert-semibold text-white mb-1">376h</div>
                  <div className="text-sm text-white/50 font-roobert-light">GTM Hours in last 30 days</div>
                </div>

                <div className="space-y-4">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80 font-roobert-light">{activity.hours}</span>
                        <span className="text-sm text-white font-roobert-medium">{activity.name}</span>
                      </div>
                      {activity.change && (
                        <span className={`text-xs font-roobert-medium ${
                          activity.change.includes('+') ? 'text-green-400' : 'text-white/50'
                        }`}>
                          {activity.change}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Chart */}
              <div className="col-span-7">
                <div className="space-y-3">
                  {activityData.map((activity, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/60 font-roobert-light">{activity.name}</span>
                        <span className="text-white/80 font-roobert-medium">{activity.hours}h</span>
                      </div>
                      <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div 
                          className={`h-full ${activity.color} opacity-70 rounded-lg transition-all duration-500`}
                          style={{ width: `${(activity.hours / 152) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 flex items-center gap-4 justify-center">
                  {activityData.map((activity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                      <span className="text-[10px] text-white/50">{activity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Insight */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <p className="text-xs text-white/50 font-roobert-light italic">
                📊 Trending: Demo prep hours up 18% WoW, largely due to Coast API onboarding.
              </p>
            </div>
          </motion.div>

          {/* ROW 3+4 RIGHT - Upcoming Deliverables (col-span-3, row-span-2) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="col-span-3 row-span-2 bg-slate-800/30 border border-slate-700/40 rounded-xl shadow-lg p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-roobert-semibold text-white">Upcoming Deliverables</h2>
              <button className="text-xs text-fis-raspberry hover:text-fis-raspberry/80 font-roobert-medium">
                View All
              </button>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 mb-3 pb-2 border-b border-white/5">
              <div className="col-span-5 text-[10px] text-white/40 uppercase tracking-wide font-roobert-medium">Title</div>
              <div className="col-span-4 text-[10px] text-white/40 uppercase tracking-wide font-roobert-medium">Due Date</div>
            </div>

            {/* Deliverables List */}
            <div className="space-y-1 max-h-[600px] overflow-y-auto custom-scrollbar">
              {deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="grid grid-cols-12 gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer group transition-all"
                >
                  <div className="col-span-5">
                    <div className="text-xs text-white/80 font-roobert-light line-clamp-2 group-hover:text-white transition-colors">
                      {deliverable.title}
                    </div>
                    <div className="text-[10px] text-white/40 mt-0.5">{deliverable.assignedTo}</div>
                  </div>
                  <div className="col-span-4 flex items-start justify-between">
                    <span className={`text-xs font-roobert-medium ${
                      deliverable.daysUntil <= 7 ? 'text-amber-400' : 'text-white/60'
                    }`}>
                      {deliverable.dueDate}
                    </span>
                    <ChevronRight className="w-3 h-3 text-white/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* ROW 4 LEFT - Additional Content (col-span-9) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="col-span-9 bg-white/[0.04] border border-white/[0.06] rounded-2xl shadow-lg p-6 hover:border-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-roobert-semibold text-white">Additional Content</h2>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {[
                { icon: Target, label: 'Initiatives', color: 'from-purple-500/20 to-purple-600/10' },
                { icon: TrendingUp, label: 'Goals', color: 'from-blue-500/20 to-blue-600/10' },
                { icon: FileText, label: 'Tasks', color: 'from-teal-500/20 to-teal-600/10' },
                { icon: Settings, label: 'Technologies', color: 'from-amber-500/20 to-amber-600/10' },
                { icon: BarChart3, label: 'Performance', color: 'from-rose-500/20 to-rose-600/10' },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`bg-gradient-to-br ${item.color} border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all duration-300 group`}
                >
                  <item.icon className="w-8 h-8 text-white/70 mb-3 group-hover:text-white transition-colors" />
                  <div className="text-sm font-roobert-medium text-white">{item.label}</div>
                  <div className="text-xs text-white/40 mt-1">View All</div>
                </motion.button>
              ))}
            </div>

            <div className="mt-6 text-right">
              <button className="text-sm text-white/60 hover:text-fis-raspberry font-roobert-medium transition-colors">
                View All Content →
              </button>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Leadership View Modal */}
      {selectedLeadershipId && selectedLeadershipData && (
        selectedLeadershipData._contentTag === 'leadership-bu-summary' ? (
          <LeadershipBUView
            data={selectedLeadershipData}
            onClose={() => {
              setSelectedLeadershipId(null);
              setSelectedLeadershipData(null);
            }}
          />
        ) : (
          <LeadershipView
            data={selectedLeadershipData}
            onClose={() => {
              setSelectedLeadershipId(null);
              setSelectedLeadershipData(null);
            }}
          />
        )
      )}

      {/* Vendor View Modal */}
      {selectedVendorId && selectedVendorData && (
        <VendorView
          data={selectedVendorData}
          onClose={() => {
            setSelectedVendorId(null);
            setSelectedVendorData(null);
          }}
        />
      )}

      {/* Tasks & Notes Modal */}
      {showTasksModal && (
        <TasksNotesTable
          isOpen={showTasksModal}
          onClose={() => setShowTasksModal(false)}
        />
      )}

      {/* Initiatives Timeline Modal */}
      {showTimelineModal && (
        <InitiativesTimeline
          onClose={() => setShowTimelineModal(false)}
        />
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default ExecutiveDashboard;

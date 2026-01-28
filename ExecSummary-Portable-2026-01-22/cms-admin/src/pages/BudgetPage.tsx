import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, X, Maximize2, Minimize2, Download, Loader2, AlertCircle } from 'lucide-react';
import { domToPng } from 'modern-screenshot';
import { ForecastBreakdown } from '../renderers/assetRenderForecast';
import { BudgetBreakdown } from '../renderers/assetRenderBudget';

interface TabType {
  id: 'forecast' | 'actual';
  label: string;
  icon: typeof DollarSign;
}

const tabs: TabType[] = [
  { id: 'actual', label: 'Actual', icon: DollarSign },
  { id: 'forecast', label: 'Forecast', icon: DollarSign },
];

interface BudgetPageProps {
  isOpen: boolean;
  onClose: () => void;
  showNotification: (type: 'success' | 'error', message: string) => void;
}

export default function BudgetPage({ isOpen, onClose, showNotification }: BudgetPageProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'actual'>('actual');
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);
  const [modalWidth, setModalWidth] = useState<75 | 95 | 100>(75);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBudgetData();
    }
  }, [isOpen]);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      
      // Fetch the specific budget-management.json file for Actual tab
      const budgetResponse = await fetch('http://localhost:3001/api/content/budget-management');
      const budgetResult = await budgetResponse.json();
      
      console.log('Budget Management API Response:', budgetResult);
      
      if (budgetResult && budgetResult.budgetSummary) {
        console.log('Found budget data:', budgetResult.budgetSummary);
        setBudgetData(budgetResult.budgetSummary);
      } else {
        console.log('budgetSummary not found in response');
        showNotification('error', 'Budget data not found in file');
      }

      // Fetch forecast-management.json for Forecast tab
      const forecastResponse = await fetch('http://localhost:3001/api/content/forecast-management');
      const forecastResult = await forecastResponse.json();
      
      console.log('Forecast Management API Response:', forecastResult);
      
      // Look for forecast data in sections
      if (forecastResult && forecastResult.sections) {
        const forecastSection = forecastResult.sections.find(
          (section: any) => section.type === 'forecast' || section.renderType === 'forecast'
        );
        if (forecastSection?.data) {
          console.log('Found forecast data:', forecastSection.data);
          setForecastData(forecastSection.data);
        }
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      showNotification('error', 'Failed to load budget data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportImage = async () => {
    if (!contentRef.current) return;
    
    setIsExporting(true);
    try {
      const dataUrl = await domToPng(contentRef.current, {
        quality: 1,
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `budget-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      showNotification('success', 'Budget exported as image');
    } catch (error) {
      console.error('Export failed:', error);
      showNotification('error', 'Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  const renderContent = () => {
    const data = activeTab === 'forecast' ? forecastData : budgetData;
    
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 dark:text-gray-400">Loading budget data...</div>
        </div>
      );
    }

    if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <AlertCircle className="w-16 h-16 text-gray-400" />
          <div className="text-gray-500 dark:text-gray-400">No {activeTab} data available</div>
        </div>
      );
    }

    // Render using the appropriate asset renderer
    if (activeTab === 'forecast') {
      return <ForecastBreakdown data={data} />;
    } else {
      return <BudgetBreakdown data={data} />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative ${modalWidth === 75 ? 'w-[75vw]' : modalWidth === 95 ? 'w-[95vw]' : 'w-full'} h-[calc(100vh-2rem)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div className="relative overflow-hidden rounded-t-2xl">
            <div className="relative bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 text-white">
              {/* Animated Background Pattern - Money Icons */}
              <div className="absolute inset-0 opacity-10">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="money-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                      {/* Dollar signs */}
                      <text x="10" y="30" fontSize="24" fill="currentColor" opacity="0.3">$</text>
                      <text x="50" y="70" fontSize="20" fill="currentColor" opacity="0.2">£</text>
                      {/* Coins */}
                      <circle cx="65" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
                      <text x="61" y="19" fontSize="10" fill="currentColor" opacity="0.3">€</text>
                      {/* Small dots */}
                      <circle cx="30" cy="60" r="2" fill="currentColor" opacity="0.2" />
                      <circle cx="75" cy="45" r="1.5" fill="currentColor" opacity="0.2" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#money-pattern)" />
                </svg>
              </div>

              {/* Header Content */}
              <div className="relative px-4 2xl:px-6 py-4 2xl:py-8">
                <div className="flex items-center justify-between mb-2 2xl:mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-2 2xl:gap-3"
                  >
                    <div className="p-1.5 2xl:p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                      <DollarSign className="w-5 h-5 2xl:w-6 2xl:h-6" />
                    </div>
                    <div>
                      <h1 className="text-xl 2xl:text-2xl md:2xl:text-3xl font-roobert-bold mb-0 2xl:mb-0.5">
                        Budget Management
                      </h1>
                      <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                        Manage forecast and actual budget data
                      </p>
                    </div>
                  </motion.div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleExportImage}
                      className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                      title="Export as Image"
                    >
                      {isExporting ? (
                        <Loader2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (modalWidth === 75) setModalWidth(95);
                        else if (modalWidth === 95) setModalWidth(100);
                        else setModalWidth(75);
                      }}
                      className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                      title={modalWidth === 100 ? 'Default Width (75%)' : modalWidth === 75 ? 'Wider View (95%)' : 'Full Width (100%)'}
                    >
                      {modalWidth === 100 ? <Minimize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />}
                    </button>
                    <button
                      onClick={onClose}
                      className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                      title="Close"
                    >
                      <X className="w-4 h-4 2xl:w-5 2xl:h-5 text-white" />
                    </button>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex gap-3"
                >
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          isActive
                            ? 'bg-white/20 backdrop-blur-sm border border-white/30 text-white shadow-md'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="font-roobert-medium text-sm">{tab.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div ref={contentRef} className="flex-1 overflow-y-auto p-6">
            {renderContent()}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

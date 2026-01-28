import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, X, Maximize2, Minimize2, Download, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

export default function BudgetPage() {
  const navigate = useNavigate();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'forecast' | 'actual'>('actual');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [modalWidth, setModalWidth] = useState<75 | 95>(75);
  const [isExporting, setIsExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [forecastData, setForecastData] = useState<any>(null);
  const [budgetData, setBudgetData] = useState<any>(null);

  useEffect(() => {
    fetchBudgetData();
  }, []);

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
      console.error('Failed to fetch budget data:', error);
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
    } catch (error) {
      console.error('Failed to export image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleMaximizeToggle = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
      setModalWidth(75);
    } else if (modalWidth === 75) {
      setModalWidth(95);
    } else {
      setIsFullscreen(true);
    }
  };

  const handleClose = () => {
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        {/* Modal Container */}
        <div
          ref={contentRef}
          className={`bg-white dark:bg-gray-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isFullscreen 
              ? 'w-full h-full rounded-none' 
              : modalWidth === 95
                ? 'w-[95vw] h-[90vh] rounded-2xl'
                : 'w-[75vw] h-[90vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className={`relative overflow-hidden ${
            isFullscreen ? '' : 'rounded-t-2xl'
          }`}>
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
                        Financial Overview
                      </h1>
                      <p className="text-white/80 text-xs 2xl:text-sm font-roobert-light hidden 2xl:block">
                        Budget forecasts and actual performance
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
                      onClick={handleMaximizeToggle}
                      className="p-1.5 2xl:p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                      title={isFullscreen ? 'Exit Fullscreen (75%)' : modalWidth === 75 ? 'Wider View (95%)' : 'Fullscreen'}
                    >
                      {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" /> : <Maximize2 className="w-3.5 h-3.5 2xl:w-4 2xl:h-4 text-white" />}
                    </button>
                    <button
                      onClick={handleClose}
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

          {/* Content - Scrollable Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <div className="relative px-6 py-8">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  {/* Forecast Tab */}
                  {activeTab === 'forecast' && (
                    <div className="space-y-6">
                      {forecastData ? (
                        <ForecastBreakdown 
                          data={forecastData} 
                          mode="display"
                        />
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 dark:text-gray-400">
                            No forecast data available
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actual Tab */}
                  {activeTab === 'actual' && (
                    <div className="space-y-6">
                      {budgetData ? (
                        <BudgetBreakdown data={budgetData} />
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 dark:text-gray-400">
                            No budget data available
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

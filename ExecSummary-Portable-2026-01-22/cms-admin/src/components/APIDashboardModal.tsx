import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, Loader2, RefreshCw, Database, FileText, Lightbulb, Building2, TrendingUp, FolderOpen, Server } from 'lucide-react';

interface APIDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APITest {
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  status: 'pending' | 'testing' | 'success' | 'error';
  responseTime?: number;
  error?: string;
  data?: any;
  section: 'files' | 'api';
}

const API_URL = 'http://localhost:3001/api';

export default function APIDashboardModal({ isOpen, onClose }: APIDashboardModalProps) {
  const [tests, setTests] = useState<APITest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const testRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const runTests = async () => {
    setIsRunning(true);
    
    const testEndpoints: APITest[] = [
      // File System Tests
      { name: 'Summaries Files', endpoint: '/summaries', method: 'GET', status: 'pending', section: 'files' },
      { name: 'Executive IQ Files', endpoint: '/executive-iq', method: 'GET', status: 'pending', section: 'files' },
      { name: 'Organizations Files', endpoint: '/organizations', method: 'GET', status: 'pending', section: 'files' },
      { name: 'Performance Files', endpoint: '/performance', method: 'GET', status: 'pending', section: 'files' },
      
      // API Health Tests
      { name: 'Backend Health Check', endpoint: '/health', method: 'GET', status: 'pending', section: 'api' },
      
      // API Endpoint Tests
      { name: 'GET Summaries', endpoint: '/summaries', method: 'GET', status: 'pending', section: 'api' },
      { name: 'GET Executive IQ', endpoint: '/executive-iq', method: 'GET', status: 'pending', section: 'api' },
      { name: 'GET Organizations', endpoint: '/organizations', method: 'GET', status: 'pending', section: 'api' },
      { name: 'GET Performance', endpoint: '/performance', method: 'GET', status: 'pending', section: 'api' },
    ];
    
    setTests(testEndpoints);
    
    for (let i = 0; i < testEndpoints.length; i++) {
      testEndpoints[i].status = 'testing';
      setTests([...testEndpoints]);
      
      // Scroll to active test
      const testKey = `${testEndpoints[i].section}-${i}`;
      if (testRefs.current[testKey] && scrollContainerRef.current) {
        testRefs.current[testKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      const startTime = Date.now();
      
      try {
        const response = await fetch(`${API_URL}${testEndpoints[i].endpoint}`);
        const responseTime = Date.now() - startTime;
        
        if (response.ok) {
          const data = await response.json();
          testEndpoints[i].status = 'success';
          testEndpoints[i].responseTime = responseTime;
          testEndpoints[i].data = data;
        } else {
          testEndpoints[i].status = 'error';
          testEndpoints[i].error = `HTTP ${response.status}: ${response.statusText}`;
          testEndpoints[i].responseTime = responseTime;
        }
      } catch (error) {
        testEndpoints[i].status = 'error';
        testEndpoints[i].error = error instanceof Error ? error.message : 'Unknown error';
        testEndpoints[i].responseTime = Date.now() - startTime;
      }
      
      setTests([...testEndpoints]);
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    setIsRunning(false);
  };

  useEffect(() => {
    if (isOpen && tests.length === 0) {
      runTests();
    }
  }, [isOpen]);

  const renderTestCard = (test: APITest) => (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {test.status === 'testing' ? (
          <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
        ) : test.status === 'success' ? (
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        ) : test.status === 'error' ? (
          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        ) : (
          <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex-1 min-w-0">
            <h3 className={`font-roobert-semibold text-base ${
              test.status === 'testing'
                ? 'text-blue-900 dark:text-blue-300'
                : test.status === 'success'
                ? 'text-green-900 dark:text-green-300'
                : test.status === 'error'
                ? 'text-red-900 dark:text-red-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {test.name}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
              {test.method} {test.endpoint}
            </p>
          </div>
          
          {test.responseTime && (
            <div className="text-right flex-shrink-0 ml-2">
              <span className={`text-xs font-roobert-medium ${
                test.responseTime < 100 ? 'text-green-600' :
                test.responseTime < 500 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {test.responseTime}ms
              </span>
            </div>
          )}
        </div>

        {/* Error Message */}
        {test.error && (
          <div className="mt-2 p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <p className="text-xs text-red-700 dark:text-red-400 font-mono">
              {test.error}
            </p>
          </div>
        )}

        {/* Success Data Summary */}
        {test.status === 'success' && test.data && (
          <div className="mt-2 space-y-1">
            {Array.isArray(test.data) ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Response:</span>
                <span className="font-roobert-semibold text-green-700 dark:text-green-400">
                  {test.data.length} items retrieved
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className="font-roobert-semibold text-green-700 dark:text-green-400">
                  {test.data.status || test.data.message || 'OK'}
                </span>
              </div>
            )}
            
            {/* Show sample data */}
            <details className="mt-2">
              <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                View response data
              </summary>
              <pre className="mt-2 text-xs bg-gray-900 dark:bg-black text-green-400 p-3 rounded-lg overflow-x-auto max-h-40 overflow-y-auto">
                {JSON.stringify(test.data, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>

      {/* Endpoint Icon */}
      <div className="flex-shrink-0">
        {test.endpoint.includes('summaries') && <FileText className="w-5 h-5 text-gray-400" />}
        {test.endpoint.includes('executive-iq') && <Lightbulb className="w-5 h-5 text-gray-400" />}
        {test.endpoint.includes('organizations') && <Building2 className="w-5 h-5 text-gray-400" />}
        {test.endpoint.includes('performance') && <TrendingUp className="w-5 h-5 text-gray-400" />}
        {test.endpoint.includes('health') && <Database className="w-5 h-5 text-gray-400" />}
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl max-h-[85vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border-2 border-fis-eggplant/20 my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-fis-eggplant to-fis-raspberry flex-shrink-0">
            <div>
              <h2 className="text-xl font-roobert-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5" />
                API Dashboard
              </h2>
              <p className="text-xs text-white/80 mt-1">
                Backend health checks and endpoint testing
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={runTests}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-roobert-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                Re-test
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 min-h-0">
            {/* File System Health Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-fis-eggplant/20">
                <FolderOpen className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                  File System Health
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Can we access and retrieve data files?
                </span>
              </div>
              
              <div className="space-y-3">
                {tests.filter(t => t.section === 'files').map((test, index) => (
                  <motion.div
                    key={`files-${index}`}
                    ref={el => { testRefs.current[`files-${index}`] = el; }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`rounded-lg p-3 border-2 transition-all ${
                      test.status === 'testing'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                        : test.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                        : test.status === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {renderTestCard(test)}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* API Endpoints Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-fis-eggplant/20">
                <Server className="w-5 h-5 text-fis-eggplant dark:text-fis-raspberry" />
                <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white">
                  API Endpoints
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Is the backend portal responding correctly?
                </span>
              </div>
              
              <div className="space-y-3">
                {tests.filter(t => t.section === 'api').map((test, index) => (
                  <motion.div
                    key={`api-${index}`}
                    ref={el => { testRefs.current[`api-${index}`] = el; }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (tests.filter(t => t.section === 'files').length + index) * 0.05 }}
                    className={`rounded-lg p-3 border-2 transition-all ${
                      test.status === 'testing'
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600'
                        : test.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                        : test.status === 'error'
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    {renderTestCard(test)}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {!isRunning && tests.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700"
              >
                <h4 className="text-base font-roobert-bold text-gray-900 dark:text-white mb-3">
                  Test Summary
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-roobert-bold text-green-600 mb-0.5">
                      {tests.filter(t => t.status === 'success').length}
                    </div>
                    <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                      Passed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-roobert-bold text-red-600 mb-0.5">
                      {tests.filter(t => t.status === 'error').length}
                    </div>
                    <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                      Failed
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-roobert-bold text-gray-600 mb-0.5">
                      {tests.filter(t => t.status === 'success').length > 0 
                        ? Math.round(tests.filter(t => t.responseTime).reduce((sum, t) => sum + (t.responseTime || 0), 0) / tests.filter(t => t.responseTime).length)
                        : 0}ms
                    </div>
                    <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                      Avg Response
                    </div>
                  </div>
                </div>

                {tests.every(t => t.status === 'success') && (
                  <div className="mt-3 p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <p className="text-xs text-green-800 dark:text-green-300 font-roobert-medium text-center">
                      ✅ All tests passed successfully!
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

import { motion } from 'framer-motion';
import { ExecutiveSummary } from '../types';
import { X, TrendingUp, Users, DollarSign, ThumbsUp, Calendar, Target, AlertTriangle, CheckCircle2, Clock, Download, Eye, Code, Shield, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { WeeklyFocus } from './WeeklyFocus';
import { IssuesBlockers } from './IssuesBlockers';
import { useState, useEffect, useRef } from 'react';
import { renderWithExpressions } from '../utils/expressionParser';
import html2canvas from 'html2canvas';

interface SummaryDetailProps {
  summary: ExecutiveSummary;
  onClose: () => void;
}

interface ValidationCheck {
  section: string;
  status: 'pending' | 'checking' | 'passed' | 'warning' | 'error';
  message: string;
  details?: string[];
}

export const SummaryDetail: React.FC<SummaryDetailProps> = ({ summary, onClose }) => {
  const [activeSection, setActiveSection] = useState('metrics');
  const [showNav, setShowNav] = useState(false);
  const [isHeaderCompact, setIsHeaderCompact] = useState(false);
  const isDraft = summary.status === 'draft';
  const [activePreviewTab, setActivePreviewTab] = useState<'visual' | 'json' | 'validation'>('visual');
  const [isValidating, setIsValidating] = useState(false);
  const [validationChecks, setValidationChecks] = useState<ValidationCheck[]>([]);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1);
  const [expandedChecks, setExpandedChecks] = useState<Set<number>>(new Set());
  const validationContainerRef = useRef<HTMLDivElement>(null);
  const checkRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Function to get JSON snippet for a specific section
  const getJsonSnippet = (section: string) => {
    let snippet: any = {};
    
    switch (section) {
      case 'Header':
        snippet = { 
          id: summary.id, 
          quarter: summary.quarter, 
          year: summary.year,
          date: summary.date,
          title: summary.title
        };
        break;
      case 'Highlights':
        snippet = { highlights: summary.highlights };
        break;
      case 'Key Metrics':
        snippet = { keyMetrics: summary.keyMetrics };
        break;
      case 'Activity Metrics':
        snippet = { activityMetrics: summary.activityMetrics };
        break;
      case 'Top Assets':
        snippet = { topAssets: summary.topAssets };
        break;
      case 'Weekly Focus':
        snippet = { weeklyFocus: summary.weeklyFocus };
        break;
      case 'Departments':
        snippet = { 
          departments: summary.departments?.slice(0, 1).map(d => ({
            name: d.name,
            performance: d.performance,
            budget: d.budget,
            headcount: d.headcount,
            achievements: d.achievements
          }))
        };
        if (summary.departments && summary.departments.length > 1) {
          snippet.departments.push({ note: `...${summary.departments.length - 1} more` });
        }
        break;
      case 'Initiatives':
        snippet = { 
          initiatives: summary.initiatives?.slice(0, 1).map(i => ({
            name: i.name,
            status: i.status,
            progress: i.progress,
            owner: i.owner,
            impact: i.impact
          }))
        };
        if (summary.initiatives && summary.initiatives.length > 1) {
          snippet.initiatives.push({ note: `...${summary.initiatives.length - 1} more` });
        }
        break;
      case 'Risks':
        snippet = { risks: summary.risks };
        break;
      case 'Issues & Blockers':
        snippet = { 
          issuesAndBlockers: summary.issuesAndBlockers?.slice(0, 1).map(i => ({
            title: i.title,
            description: i.description,
            impact: i.impact,
            status: i.status
          }))
        };
        if (summary.issuesAndBlockers && summary.issuesAndBlockers.length > 1) {
          snippet.issuesAndBlockers.push({ note: `...${summary.issuesAndBlockers.length - 1} more` });
        }
        break;
      case 'Outlook':
        snippet = { outlook: summary.outlook };
        break;
      case 'Overall Structure':
        snippet = {
          sections: {
            header: '✓',
            highlights: '✓',
            keyMetrics: '✓',
            activityMetrics: summary.activityMetrics ? '✓' : '✗',
            topAssets: summary.topAssets ? '✓' : '✗',
            weeklyFocus: summary.weeklyFocus ? '✓' : '✗',
            departments: summary.departments ? '✓' : '✗',
            initiatives: summary.initiatives ? '✓' : '✗',
            risks: summary.risks ? '✓' : '✗',
            issuesAndBlockers: summary.issuesAndBlockers ? '✓' : '✗',
            outlook: summary.outlook ? '✓' : '✗'
          }
        };
        break;
      case 'Completeness':
        snippet = {
          highlights: summary.highlights ? '✓' : '✗',
          keyMetrics: summary.keyMetrics ? '✓' : '✗',
          departments: summary.departments?.length || 0,
          initiatives: summary.initiatives?.length || 0,
          risks: summary.risks?.length || 0,
          outlook: summary.outlook ? '✓' : '✗'
        };
        break;
      default:
        snippet = summary;
    }
    
    return (
      <pre className="text-xs font-mono bg-gray-900 dark:bg-black text-green-400 p-3 rounded-lg overflow-x-auto max-w-full whitespace-pre-wrap break-words">
        {JSON.stringify(snippet, null, 2)}
      </pre>
    );
  };

  // Validation function
  const runValidation = async () => {
    setIsValidating(true);
    setActivePreviewTab('validation');
    setCurrentCheckIndex(-1);
    
    // Helper function to check if a section is enabled
    const isSectionEnabled = (sectionKey: string): boolean => {
      const enabledKey = `_enabled_${sectionKey}` as keyof typeof summary;
      // If flag doesn't exist, assume enabled (backwards compatibility)
      return summary[enabledKey] === undefined || summary[enabledKey] === true;
    };
    
    const checks: ValidationCheck[] = [
      { section: 'Header', status: 'pending', message: 'Validating header fields' },
      { section: 'Highlights', status: 'pending', message: 'Validating highlights section' },
      { section: 'Key Metrics', status: 'pending', message: 'Validating key metrics' },
      { section: 'Activity Metrics', status: 'pending', message: 'Validating activity metrics' },
      { section: 'Top Assets', status: 'pending', message: 'Validating top assets' },
      { section: 'Weekly Focus', status: 'pending', message: 'Validating weekly focus' },
      { section: 'Departments', status: 'pending', message: 'Validating departments' },
      { section: 'Initiatives', status: 'pending', message: 'Validating initiatives' },
      { section: 'Risks', status: 'pending', message: 'Validating risks' },
      { section: 'Issues & Blockers', status: 'pending', message: 'Validating issues and blockers' },
      { section: 'Outlook', status: 'pending', message: 'Validating outlook' },
      { section: 'Overall Structure', status: 'pending', message: 'Final structure validation' },
    ];
    
    setValidationChecks(checks);
    
    // Animate through each check
    for (let i = 0; i < checks.length; i++) {
      setCurrentCheckIndex(i);
      checks[i].status = 'checking';
      setValidationChecks([...checks]);
      
      // Scroll to active check
      if (checkRefs.current[i] && validationContainerRef.current) {
        checkRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      
      // Perform actual validation
      let result: 'passed' | 'warning' | 'error' = 'passed';
      let details: string[] = [];
      
      switch (checks[i].section) {
        case 'Header':
          // Validate header fields (id, quarter, year, date, title)
          if (!summary.id) { 
            result = 'error'; 
            details.push('✗ Missing id field'); 
          } else {
            details.push('✓ ID field present: ' + summary.id);
            // Check ID format
            if (!/^week-[a-z]{3}-\d{2}-\d{4}/.test(summary.id)) {
              result = 'warning';
              details.push('⚠ ID format does not match pattern week-mmm-dd-yyyy');
            } else {
              details.push('✓ ID format valid');
            }
          }
          
          if (!summary.quarter) { 
            result = 'error'; 
            details.push('✗ Missing quarter field'); 
          } else {
            details.push('✓ Quarter field present: ' + summary.quarter);
          }
          
          if (!summary.year || typeof summary.year !== 'number') { 
            result = 'error'; 
            details.push('✗ Missing or invalid year field'); 
          } else {
            details.push('✓ Year field present: ' + summary.year);
          }
          
          if (!summary.date) { 
            result = 'error'; 
            details.push('✗ Missing date field'); 
          } else {
            details.push('✓ Date field present: ' + summary.date);
            // Validate date format YYYY-MM-DD
            if (!/^\d{4}-\d{2}-\d{2}$/.test(summary.date)) {
              result = 'warning';
              details.push('⚠ Date format should be YYYY-MM-DD');
            } else {
              details.push('✓ Date format valid');
            }
          }
          
          if (!summary.title) { 
            result = 'warning'; 
            details.push('⚠ Missing title field'); 
          } else {
            details.push('✓ Title field present');
          }
          break;
          
        case 'Highlights':
          // Check if section is enabled
          if (!isSectionEnabled('highlights')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate highlights as a list (no count requirement)
          if (!summary.highlights) {
            result = 'error';
            details.push('✗ Highlights field missing');
          } else if (!Array.isArray(summary.highlights)) {
            result = 'error';
            details.push('✗ Highlights must be an array');
          } else if (summary.highlights.length === 0) {
            result = 'warning';
            details.push('⚠ Highlights array is empty');
          } else {
            details.push(`✓ Highlights is array`);
            details.push(`✓ Contains ${summary.highlights.length} items`);
            
            // Check each highlight is a non-empty string
            let emptyCount = 0;
            summary.highlights.forEach((h, idx) => {
              if (typeof h !== 'string') {
                result = 'error';
                details.push(`✗ Highlight ${idx + 1} is not a string`);
              } else if (h.trim().length === 0) {
                emptyCount++;
              }
            });
            
            if (emptyCount > 0) {
              result = 'warning';
              details.push(`⚠ ${emptyCount} empty highlights found`);
            } else {
              details.push('✓ All highlights are non-empty strings');
            }
          }
          break;
          
        case 'Key Metrics':
          // Check if section is enabled
          if (!isSectionEnabled('keyMetrics')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          if (!summary.keyMetrics) {
            result = 'error';
            details.push('✗ Missing key metrics');
          } else {
            let metricErrors = 0;
            
            // Check revenue
            if (typeof summary.keyMetrics.revenue === 'number') {
              details.push('✓ Revenue metric present and valid');
            } else if (summary.keyMetrics.revenue === undefined) {
              metricErrors++;
              details.push('✗ Revenue metric missing');
            } else {
              metricErrors++;
              details.push('✗ Revenue metric has wrong type (found ' + typeof summary.keyMetrics.revenue + ')');
            }
            
            // Check growth
            if (typeof summary.keyMetrics.growth === 'number') {
              details.push('✓ Growth metric present and valid');
            } else if (summary.keyMetrics.growth === undefined) {
              metricErrors++;
              details.push('✗ Growth metric missing');
            } else {
              metricErrors++;
              details.push('✗ Growth metric has wrong type (found ' + typeof summary.keyMetrics.growth + ')');
            }
            
            // Check customers
            if (typeof summary.keyMetrics.customers === 'number') {
              details.push('✓ Customers metric present and valid');
            } else if (summary.keyMetrics.customers === undefined) {
              metricErrors++;
              details.push('✗ Customers metric missing');
            } else {
              metricErrors++;
              details.push('✗ Customers metric has wrong type (found ' + typeof summary.keyMetrics.customers + ')');
            }
            
            // Check satisfaction
            if (typeof summary.keyMetrics.satisfaction === 'number') {
              details.push('✓ Satisfaction metric present and valid');
            } else if (summary.keyMetrics.satisfaction === undefined) {
              metricErrors++;
              details.push('✗ Satisfaction metric missing');
            } else {
              metricErrors++;
              details.push('✗ Satisfaction metric has wrong type (found ' + typeof summary.keyMetrics.satisfaction + ')');
            }
            
            if (metricErrors > 0) {
              result = 'error';
            }
          }
          break;
          
        case 'Activity Metrics':
          // Check if section is enabled
          if (!isSectionEnabled('activityMetrics')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate activity metrics structure and data types
          if (!summary.activityMetrics) {
            result = 'warning';
            details.push('⚠ Activity metrics section missing');
          } else {
            details.push('✓ Activity metrics section present');
            
            // Check demoStudio if present
            if (summary.activityMetrics.demoStudio) {
              const ds = summary.activityMetrics.demoStudio;
              if (typeof ds.demosRegistered === 'number') {
                details.push('✓ demosRegistered is number');
              } else {
                result = 'error';
                details.push('✗ demosRegistered must be number');
              }
              
              if (typeof ds.wonACV === 'number') {
                details.push('✓ wonACV is number');
              } else {
                result = 'error';
                details.push('✗ wonACV must be number');
              }
              
              if (typeof ds.conversionRate === 'number') {
                details.push('✓ conversionRate is number');
              } else {
                result = 'error';
                details.push('✗ conversionRate must be number');
              }
            }
            
            // Check keyActivityInsights if present
            if (summary.activityMetrics.keyActivityInsights) {
              details.push('✓ keyActivityInsights section present');
            }
          }
          break;
          
        case 'Top Assets':
          // Check if section is enabled
          if (!isSectionEnabled('topAssets')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate top assets array
          if (!summary.topAssets) {
            result = 'warning';
            details.push('⚠ Top assets section missing');
          } else if (!Array.isArray(summary.topAssets)) {
            result = 'error';
            details.push('✗ Top assets must be an array');
          } else if (summary.topAssets.length === 0) {
            result = 'warning';
            details.push('⚠ Top assets array is empty');
          } else {
            details.push(`✓ Top assets is array`);
            details.push(`✓ Contains ${summary.topAssets.length} items`);
            
            // Validate structure of each asset
            let structureErrors = 0;
            summary.topAssets.forEach((asset, idx) => {
              if (!asset.name || typeof asset.name !== 'string') {
                structureErrors++;
              }
              if (asset.count === undefined || typeof asset.count !== 'number') {
                structureErrors++;
              }
            });
            
            if (structureErrors > 0) {
              result = 'error';
              details.push(`✗ ${structureErrors} structure errors found`);
            } else {
              details.push('✓ All assets have valid structure');
            }
          }
          break;
          
        case 'Weekly Focus':
          // Check if section is enabled
          if (!isSectionEnabled('weeklyFocus')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate weekly focus as a list
          if (!summary.weeklyFocus) {
            result = 'warning';
            details.push('⚠ Weekly focus section missing');
          } else if (!Array.isArray(summary.weeklyFocus)) {
            result = 'error';
            details.push('✗ Weekly focus must be an array');
          } else if (summary.weeklyFocus.length === 0) {
            result = 'warning';
            details.push('⚠ Weekly focus array is empty');
          } else {
            details.push(`✓ Weekly focus is array`);
            details.push(`✓ Contains ${summary.weeklyFocus.length} items`);
            
            // Check each item is a non-empty string
            let emptyCount = 0;
            summary.weeklyFocus.forEach((item, idx) => {
              if (typeof item !== 'string' || item.trim().length === 0) {
                emptyCount++;
              }
            });
            
            if (emptyCount > 0) {
              result = 'warning';
              details.push(`⚠ ${emptyCount} invalid focus items`);
            } else {
              details.push('✓ All focus items are valid strings');
            }
          }
          break;
          
        case 'Departments':
          // Check if section is enabled
          if (!isSectionEnabled('departments')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate departments array with structure checks
          if (!summary.departments) {
            result = 'warning';
            details.push('⚠ Departments section missing');
          } else if (!Array.isArray(summary.departments)) {
            result = 'error';
            details.push('✗ Departments must be an array');
          } else if (summary.departments.length === 0) {
            result = 'warning';
            details.push('⚠ Departments array is empty');
          } else {
            details.push(`✓ Departments is array`);
            details.push(`✓ Contains ${summary.departments.length} items`);
            
            // Validate each department structure
            let structureErrors = 0;
            let rangeErrors = 0;
            summary.departments.forEach((dept, idx) => {
              if (!dept.name || typeof dept.name !== 'string') {
                structureErrors++;
              }
              if (dept.performance === undefined || typeof dept.performance !== 'number') {
                structureErrors++;
              } else if (dept.performance < 0 || dept.performance > 100) {
                rangeErrors++;
              }
            });
            
            if (structureErrors > 0) {
              result = 'error';
              details.push(`✗ ${structureErrors} structure errors found`);
            } else {
              details.push('✓ All departments have valid structure');
            }
            
            if (rangeErrors > 0) {
              result = 'warning';
              details.push(`⚠ ${rangeErrors} performance values out of range (0-100)`);
            } else {
              details.push('✓ All performance values in valid range');
            }
          }
          break;
          
        case 'Initiatives':
          // Check if section is enabled
          if (!isSectionEnabled('initiatives')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate initiatives array
          if (!summary.initiatives) {
            result = 'warning';
            details.push('⚠ Initiatives section missing');
          } else if (!Array.isArray(summary.initiatives)) {
            result = 'error';
            details.push('✗ Initiatives must be an array');
          } else if (summary.initiatives.length === 0) {
            result = 'warning';
            details.push('⚠ Initiatives array is empty');
          } else {
            details.push(`✓ Initiatives is array`);
            details.push(`✓ Contains ${summary.initiatives.length} items`);
            
            // Validate each initiative structure
            let structureErrors = 0;
            let rangeErrors = 0;
            let statusErrors = 0;
            const validStatuses = ['on-track', 'at-risk', 'blocked', 'completed'];
            
            summary.initiatives.forEach((init, idx) => {
              if (!init.name || typeof init.name !== 'string') {
                structureErrors++;
              }
              if (init.progress === undefined || typeof init.progress !== 'number') {
                structureErrors++;
              } else if (init.progress < 0 || init.progress > 100) {
                rangeErrors++;
              }
              if (init.status && !validStatuses.includes(init.status)) {
                statusErrors++;
              }
            });
            
            if (structureErrors > 0) {
              result = 'error';
              details.push(`✗ ${structureErrors} structure errors found`);
            } else {
              details.push('✓ All initiatives have valid structure');
            }
            
            if (rangeErrors > 0) {
              result = 'warning';
              details.push(`⚠ ${rangeErrors} progress values out of range (0-100)`);
            } else {
              details.push('✓ All progress values in valid range');
            }
            
            if (statusErrors > 0) {
              result = 'warning';
              details.push(`⚠ ${statusErrors} invalid status values`);
            }
          }
          break;
          
        case 'Risks':
          // Check if section is enabled
          if (!isSectionEnabled('risks')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate risks array
          if (!summary.risks) {
            result = 'warning';
            details.push('⚠ Risks section missing');
          } else if (!Array.isArray(summary.risks)) {
            result = 'error';
            details.push('✗ Risks must be an array');
          } else if (summary.risks.length === 0) {
            result = 'warning';
            details.push('⚠ Risks array is empty (no risks identified)');
          } else {
            details.push(`✓ Risks is array`);
            details.push(`✓ Contains ${summary.risks.length} items`);
            
            // Validate each risk structure
            let structureErrors = 0;
            summary.risks.forEach((risk, idx) => {
              if (!risk.description || typeof risk.description !== 'string') {
                structureErrors++;
              }
              if (!risk.severity || typeof risk.severity !== 'string') {
                structureErrors++;
              }
            });
            
            if (structureErrors > 0) {
              result = 'error';
              details.push(`✗ ${structureErrors} structure errors found`);
            } else {
              details.push('✓ All risks have valid structure');
            }
          }
          break;
          
        case 'Issues & Blockers':
          // Check if section is enabled
          if (!isSectionEnabled('issuesAndBlockers')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate issues and blockers array
          if (!summary.issuesAndBlockers) {
            result = 'warning';
            details.push('⚠ Issues & blockers section missing');
          } else if (!Array.isArray(summary.issuesAndBlockers)) {
            result = 'error';
            details.push('✗ Issues & blockers must be an array');
          } else if (summary.issuesAndBlockers.length === 0) {
            details.push('✓ No issues or blockers (good!)');
          } else {
            details.push(`✓ Issues & blockers is array`);
            details.push(`✓ Contains ${summary.issuesAndBlockers.length} items`);
            
            // Validate each issue structure
            let structureErrors = 0;
            summary.issuesAndBlockers.forEach((issue, idx) => {
              if (!issue.title || typeof issue.title !== 'string') {
                structureErrors++;
              }
              if (!issue.description || typeof issue.description !== 'string') {
                structureErrors++;
              }
            });
            
            if (structureErrors > 0) {
              result = 'error';
              details.push(`✗ ${structureErrors} structure errors found`);
            } else {
              details.push('✓ All issues have valid structure');
            }
          }
          break;
          
        case 'Outlook':
          // Check if section is enabled
          if (!isSectionEnabled('outlook')) {
            result = 'passed';
            details.push('ℹ Section is disabled in CMS');
            details.push('✓ Skipping validation for disabled section');
            break;
          }
          
          // Validate outlook field
          if (!summary.outlook) {
            result = 'warning';
            details.push('⚠ Outlook section missing');
          } else if (typeof summary.outlook !== 'string') {
            result = 'error';
            details.push('✗ Outlook must be a string');
          } else if (summary.outlook.trim().length === 0) {
            result = 'warning';
            details.push('⚠ Outlook is empty');
          } else {
            details.push('✓ Outlook field present');
            details.push(`✓ Contains ${summary.outlook.length} characters`);
            if (summary.outlook.length < 50) {
              result = 'warning';
              details.push('⚠ Outlook seems very brief');
            } else {
              details.push('✓ Adequate outlook length');
            }
          }
          break;
          
        case 'Overall Structure':
          // Final validation - check JSON structure
          try {
            JSON.stringify(summary);
            details.push('✓ Valid JSON structure');
          } catch (e) {
            result = 'error';
            details.push('✗ Invalid JSON structure');
          }
          
          // Count present sections
          const sections = [
            { name: 'Header', present: !!(summary.id && summary.quarter && summary.year && summary.title) },
            { name: 'Highlights', present: !!summary.highlights },
            { name: 'Key Metrics', present: !!summary.keyMetrics },
            { name: 'Activity Metrics', present: !!summary.activityMetrics },
            { name: 'Top Assets', present: !!summary.topAssets },
            { name: 'Weekly Focus', present: !!summary.weeklyFocus },
            { name: 'Departments', present: !!summary.departments },
            { name: 'Initiatives', present: !!summary.initiatives },
            { name: 'Risks', present: !!summary.risks },
            { name: 'Issues & Blockers', present: !!summary.issuesAndBlockers },
            { name: 'Outlook', present: !!summary.outlook }
          ];
          
          const presentCount = sections.filter(s => s.present).length;
          const missingCount = sections.filter(s => !s.present).length;
          
          details.push(`✓ ${presentCount} of ${sections.length} sections present`);
          
          if (missingCount > 0) {
            result = 'warning';
            const missingSections = sections.filter(s => !s.present).map(s => s.name);
            details.push(`⚠ Missing sections: ${missingSections.join(', ')}`);
          } else {
            details.push('✓ All expected sections present');
          }
          break;
          
        default:
          details.push('✓ Check passed');
      }
      
      checks[i].status = result;
      checks[i].details = details;
      checks[i].message = result === 'passed' 
        ? `${checks[i].section} validation passed`
        : result === 'warning'
        ? `${checks[i].section} has warnings`
        : `${checks[i].section} has errors`;
      
      setValidationChecks([...checks]);
    }
    
    setIsValidating(false);
  };

  // Auto-run validation when switching to validation tab
  useEffect(() => {
    if (activePreviewTab === 'validation' && validationChecks.length === 0) {
      runValidation();
    }
  }, [activePreviewTab]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target.classList.contains('summary-content')) {
        const scrollTop = target.scrollTop;
        
        // Shrink header after 50px scroll
        setIsHeaderCompact(scrollTop > 50);
        
        // Show nav after 100px scroll (after header shrinks)
        setShowNav(scrollTop > 100);
        
        // Update active section based on scroll position
        const sections = ['metrics', 'performance', 'focus', 'issues', 'risks'];
        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.top <= 300) {
              setActiveSection(section);
              break;
            }
          }
        }
      }
    };

    const contentDiv = document.querySelector('.summary-content');
    contentDiv?.addEventListener('scroll', handleScroll);
    return () => contentDiv?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const contentDiv = document.querySelector('.summary-content');
    const element = document.getElementById(sectionId);
    
    if (contentDiv && element) {
      const elementTop = element.offsetTop - 180; // Account for header + nav
      const maxScroll = contentDiv.scrollHeight - contentDiv.clientHeight;
      
      // If we can't scroll far enough to put the element at the top (high resolution/tall viewport),
      // scroll to the bottom to show the element
      if (elementTop > maxScroll) {
        contentDiv.scrollTo({ top: contentDiv.scrollHeight, behavior: 'smooth' });
      } else {
        // Normal scroll to anchor position
        contentDiv.scrollTo({ top: elementTop, behavior: 'smooth' });
      }
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      case 'on-track':
        return 'text-[#3bcd3e] dark:text-[#3bcd3e] bg-[#3bcd3e]/20';
      case 'at-risk':
        return 'text-fis-raspberry dark:text-fis-raspberry bg-fis-raspberry/20';
      case 'delayed':
        return 'text-fis-eggplant dark:text-fis-eggplant bg-fis-eggplant/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'on-track':
        return <TrendingUp className="w-4 h-4" />;
      case 'at-risk':
        return <AlertTriangle className="w-4 h-4" />;
      case 'delayed':
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-500/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-500/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-500/20';
    }
  };

  const departmentChartData = summary.departments?.map((dept) => ({
    name: dept.name,
    performance: dept.performance,
    fill: dept.performance >= 90 ? '#10B981' : dept.performance >= 80 ? '#3B82F6' : '#F59E0B',
  })) || [];

  const handleExportImage = async () => {
    const contentDiv = document.querySelector('.summary-content') as HTMLElement;
    const modalContainer = document.querySelector('.summary-modal-container') as HTMLElement;
    
    if (!contentDiv || !modalContainer) return;

    try {
      // Temporarily expand the container to full height
      const originalMaxHeight = modalContainer.style.maxHeight;
      const originalOverflow = contentDiv.style.overflow;
      
      modalContainer.style.maxHeight = 'none';
      contentDiv.style.overflow = 'visible';
      contentDiv.style.maxHeight = 'none';

      // Wait for layout to settle
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the full content
      const canvas = await html2canvas(modalContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowHeight: contentDiv.scrollHeight,
      });

      // Restore original styles
      modalContainer.style.maxHeight = originalMaxHeight;
      contentDiv.style.overflow = originalOverflow;
      contentDiv.style.maxHeight = '';

      // Convert to image and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const fileName = `executive-summary-${summary.quarter.replace(/\s+/g, '-').toLowerCase()}-${summary.year}.png`;
          link.download = fileName;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Failed to export image. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="min-h-screen py-8 px-4"
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col summary-modal-container">
          {/* Draft Preview Control Bar - Only shown in draft mode */}
          {isDraft && (
            <div className="no-print flex-shrink-0 sticky top-0 z-20 bg-gradient-to-r from-fis-eggplant to-fis-raspberry shadow-2xl">
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="text-sm font-roobert-bold text-white">Preview Mode - DRAFT</h3>
                    <p className="text-xs text-white/80">{summary.title}</p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePreviewTab('visual')}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'visual'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all`}
                  >
                    <Eye className="w-4 h-4" />
                    Visual
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('json')}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'json'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all`}
                  >
                    <Code className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={runValidation}
                    disabled={isValidating}
                    className={`px-4 py-2 rounded-lg ${
                      activePreviewTab === 'validation'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    } text-sm font-roobert-medium flex items-center gap-2 transition-all disabled:opacity-50`}
                  >
                    {isValidating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Shield className="w-4 h-4" />
                    )}
                    Validate
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors ml-2"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Show Validation view if in draft mode and validation tab is active */}
          {isDraft && activePreviewTab === 'validation' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-gray-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-fis-navy dark:to-fis-eggplant">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-2">
                    JSON Validation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isValidating ? 'Running comprehensive validation checks...' : 'Validation complete'}
                  </p>
                </div>

                <div className="space-y-3" ref={validationContainerRef}>
                  {validationChecks.map((check, index) => {
                    const isActive = index === currentCheckIndex;
                    const isExpanded = expandedChecks.has(index);
                    const hasDetails = check.details && check.details.length > 0;
                    
                    return (
                      <motion.div
                        key={check.section}
                        ref={(el) => { checkRefs.current[index] = el; }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`rounded-xl p-4 border-2 transition-all ${
                          check.status === 'checking' || isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400 dark:border-blue-600 shadow-lg scale-105'
                            : check.status === 'passed'
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
                            : check.status === 'warning'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-400 dark:border-yellow-600'
                            : check.status === 'error'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
                            : 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Status Icon */}
                          <div className="flex-shrink-0 mt-1">
                            {check.status === 'checking' ? (
                              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                            ) : check.status === 'passed' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            ) : check.status === 'warning' ? (
                              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            ) : check.status === 'error' ? (
                              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-gray-400" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className={`font-roobert-semibold ${
                                check.status === 'checking'
                                  ? 'text-blue-900 dark:text-blue-300'
                                  : check.status === 'passed'
                                  ? 'text-green-900 dark:text-green-300'
                                  : check.status === 'warning'
                                  ? 'text-yellow-900 dark:text-yellow-300'
                                  : check.status === 'error'
                                  ? 'text-red-900 dark:text-red-300'
                                  : 'text-gray-600 dark:text-gray-400'
                              }`}>
                                {check.section}
                              </h4>
                              {check.status === 'passed' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-roobert-medium">
                                  PASSED
                                </span>
                              )}
                              {check.status === 'warning' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-roobert-medium">
                                  WARNING
                                </span>
                              )}
                              {check.status === 'error' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-700 dark:text-red-400 font-roobert-medium">
                                  ERROR
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${
                              check.status === 'checking'
                                ? 'text-blue-700 dark:text-blue-400'
                                : check.status === 'passed'
                                ? 'text-green-700 dark:text-green-400'
                                : check.status === 'warning'
                                ? 'text-yellow-700 dark:text-yellow-400'
                                : check.status === 'error'
                                ? 'text-red-700 dark:text-red-400'
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {check.message}
                            </p>
                            
                            {/* Details with Show More/Less */}
                            {hasDetails && check.status !== 'pending' && check.status !== 'checking' && (
                              <div className="mt-3">
                                <button
                                  onClick={() => {
                                    const newExpanded = new Set(expandedChecks);
                                    if (isExpanded) {
                                      newExpanded.delete(index);
                                    } else {
                                      newExpanded.add(index);
                                    }
                                    setExpandedChecks(newExpanded);
                                  }}
                                  className="flex items-center gap-1 text-xs font-roobert-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="w-4 h-4" />
                                      Show Less
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="w-4 h-4" />
                                      Show More ({check.details?.length} details)
                                    </>
                                  )}
                                </button>
                                
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-2 p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700"
                                  >
                                    <div className="flex gap-4">
                                      {/* Left: Test Results (30% width) */}
                                      <div className="w-[30%] flex-shrink-0 space-y-1 border-r border-gray-300 dark:border-gray-600 pr-4">
                                        <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                          Test Results
                                        </div>
                                        {check.details?.map((detail, idx) => {
                                          const isPassed = detail.startsWith('✓');
                                          const isError = detail.startsWith('✗');
                                          const isWarning = detail.startsWith('⚠');
                                          const isInfo = detail.startsWith('ℹ');
                                          
                                          return (
                                            <div key={idx} className={`text-xs flex items-start gap-1 ${
                                              isPassed ? 'text-green-600 dark:text-green-400' :
                                              isError ? 'text-red-600 dark:text-red-400' :
                                              isWarning ? 'text-yellow-600 dark:text-yellow-400' :
                                              isInfo ? 'text-blue-600 dark:text-blue-400' :
                                              'text-gray-600 dark:text-gray-400'
                                            }`}>
                                              <span className="font-mono flex-shrink-0">{detail.charAt(0)}</span>
                                              <span className="flex-1 break-words">{detail.substring(2)}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                      
                                      {/* Right: JSON Section (70% width) */}
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                          JSON Section Being Validated
                                        </div>
                                        <div className="w-full overflow-hidden">
                                          {getJsonSnippet(check.section)}
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Summary */}
                {!isValidating && validationChecks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-6 p-6 rounded-xl bg-white dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700"
                  >
                    <h4 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-4">
                      Validation Summary
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className={`text-3xl font-roobert-bold mb-1 ${
                          validationChecks.filter(c => c.status === 'error').length === 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {validationChecks.filter(c => c.status === 'error').length}
                        </div>
                        <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                          Errors
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-roobert-bold text-yellow-600 mb-1">
                          {validationChecks.filter(c => c.status === 'warning').length}
                        </div>
                        <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                          Warnings
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-roobert-bold text-green-600 mb-1">
                          {validationChecks.filter(c => c.status === 'passed').length}
                        </div>
                        <div className="text-xs font-roobert-medium text-gray-600 dark:text-gray-400">
                          Passed
                        </div>
                      </div>
                    </div>

                    {validationChecks.filter(c => c.status === 'error').length === 0 && (
                      <div className="mt-6 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <p className="text-sm text-green-800 dark:text-green-300 font-roobert-medium text-center">
                          ✅ All critical checks passed! This summary is ready for review.
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          ) : isDraft && activePreviewTab === 'json' ? (
            <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-roobert-bold text-white">JSON Structure</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
                    }}
                    className="px-3 py-1.5 rounded-lg bg-fis-eggplant/20 hover:bg-fis-eggplant/30 text-fis-raspberry text-xs font-roobert-medium transition-all"
                  >
                    Copy JSON
                  </button>
                </div>
                <pre className="text-xs font-mono bg-black text-green-400 p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(summary, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <>
          {/* Header */}
          <motion.div 
            className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 relative rounded-t-3xl z-10 border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
            animate={{
              paddingTop: isHeaderCompact ? '1rem' : '2rem',
              paddingBottom: isHeaderCompact ? '1rem' : '2rem',
              paddingLeft: '2rem',
              paddingRight: '2rem'
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {!isDraft && (
              <button
                onClick={handleExportImage}
                className="absolute top-4 right-16 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                title="Export as Image"
              >
                <Download className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </button>
            )}

            <div className="flex items-center space-x-4">
              <motion.div 
                className="rounded-2xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center"
                animate={{
                  width: isHeaderCompact ? '3rem' : '4rem',
                  height: isHeaderCompact ? '3rem' : '4rem'
                }}
              >
                <Calendar className={isHeaderCompact ? "w-6 h-6 text-white" : "w-8 h-8 text-white"} />
              </motion.div>
              <div className="flex-1">
                <motion.h1 
                  className="font-roobert-heavy text-gray-900 dark:text-white"
                  animate={{
                    fontSize: isHeaderCompact ? '1.5rem' : '2.25rem',
                    marginBottom: isHeaderCompact ? '0' : '0.5rem'
                  }}
                >
                  {summary.quarter} {summary.year}
                </motion.h1>
                {!isHeaderCompact && (
                  <motion.p 
                    initial={{ opacity: 1 }}
                    animate={{ opacity: isHeaderCompact ? 0 : 1 }}
                    className="text-gray-600 dark:text-gray-400 font-roobert-light"
                  >
                    {new Date(summary.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </motion.p>
                )}
              </div>
            </div>

            {!isHeaderCompact && (
              <motion.h2 
                initial={{ opacity: 1, height: 'auto' }}
                animate={{ 
                  opacity: isHeaderCompact ? 0 : 1,
                  height: isHeaderCompact ? 0 : 'auto',
                  marginTop: isHeaderCompact ? 0 : '1.5rem'
                }}
                className="text-2xl font-roobert-medium text-gray-700 dark:text-gray-300 overflow-hidden"
              >
                {summary.title}
              </motion.h2>
            )}
          </motion.div>

          {/* Sticky Navigation */}
          {showNav && (
            <motion.nav
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-shrink-0 sticky top-0 bg-white dark:bg-gray-900 border-b-2 border-gray-300 dark:border-gray-700 z-10 px-8 py-3 no-print"
            >
              <div className="flex items-center gap-2 overflow-x-auto">
                {[
                  { id: 'metrics', label: 'Metrics & Highlights' },
                  { id: 'performance', label: 'Performance & Initiatives' },
                  { id: 'focus', label: 'This Week\'s Focus' },
                  { id: 'issues', label: 'Issues & Blockers' },
                  { id: 'risks', label: 'Risks & Mitigation' },
                ].map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollToSection(section.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-roobert-medium whitespace-nowrap transition-all ${
                      activeSection === section.id
                        ? 'bg-fis-eggplant text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </motion.nav>
          )}

          <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-white dark:bg-gray-900 summary-content">
            {/* Key Metrics */}
            <section id="metrics">
              <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Revenue
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatCurrency(summary.keyMetrics.revenue)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-navy/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-fis-navy" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Customers
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {formatNumber(summary.keyMetrics.customers)}
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-green/20 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-fis-green" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    Growth
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    +{summary.keyMetrics.growth}%
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-fis-eggplant/20 flex items-center justify-center">
                      <ThumbsUp className="w-5 h-5 text-fis-eggplant" />
                    </div>
                  </div>
                  <p className="text-sm font-roobert-light text-gray-500 dark:text-gray-400 mb-1">
                    NPS Score
                  </p>
                  <p className="text-2xl font-roobert-heavy text-gray-900 dark:text-white">
                    {summary.keyMetrics.satisfaction}
                  </p>
                </div>
              </div>
            </section>

            {/* Highlights */}
            {summary._enabled_highlights !== false && summary.highlights && summary.highlights.length > 0 && (
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Key Highlights
                </h3>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6 space-y-3">
                  {summary.highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start space-x-3"
                    >
                      <div className="w-6 h-6 rounded-full bg-fis-raspberry flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-roobert-heavy">
                          {index + 1}
                        </span>
                      </div>
                      <div className="text-base font-roobert-light text-gray-700 dark:text-gray-300 flex-1">
                        {renderWithExpressions(highlight)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Departments & Initiatives Grid */}
            {((summary._enabled_departments !== false && summary.departments && summary.departments.length > 0) || 
              (summary._enabled_initiatives !== false && summary.initiatives && summary.initiatives.length > 0)) && (
              <div id="performance" className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Department Performance */}
                {summary._enabled_departments !== false && summary.departments && summary.departments.length > 0 && (
                  <section>
                    <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                      Department Performance
                    </h3>
                    <div className="bg-white dark:bg-gray-800/50 rounded-xl p-6">
                      <ResponsiveContainer width="100%" height={250}>
                        <RadialBarChart
                          cx="50%"
                          cy="50%"
                          innerRadius="20%"
                          outerRadius="90%"
                          data={departmentChartData}
                          startAngle={90}
                          endAngle={-270}
                        >
                          <RadialBar
                            background
                            dataKey="performance"
                            cornerRadius={10}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>

                      <div className="space-y-3 mt-6">
                        {summary.departments.map((dept) => (
                          <div key={dept.name} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                dept.performance >= 90
                                  ? '#10B981'
                                  : dept.performance >= 80
                                  ? '#3B82F6'
                                  : '#F59E0B',
                            }}
                          />
                          <span className="text-sm font-roobert-medium text-gray-700 dark:text-gray-300">
                            {dept.name}
                          </span>
                        </div>
                        <span className="text-sm font-roobert-heavy text-gray-900 dark:text-white">
                          {dept.performance}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Strategic Initiatives */}
            {summary._enabled_initiatives !== false && summary.initiatives && summary.initiatives.length > 0 && (
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Strategic Initiatives
                </h3>
                <div className="space-y-3">
                  {summary.initiatives.map((initiative) => {
                    const getProgressBarColor = (status: string) => {
                      switch (status) {
                        case 'on-track':
                          return 'bg-[#3bcd3e]';
                        case 'at-risk':
                          return 'bg-fis-raspberry';
                        case 'delayed':
                          return 'bg-fis-eggplant';
                        default:
                          return 'bg-gradient-to-r from-fis-eggplant to-fis-navy';
                      }
                    };
                    
                    return (
                      <div key={initiative.name} className="bg-white dark:bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white mb-1">
                              {initiative.name}
                            </h4>
                            <p className="text-xs font-roobert-light text-gray-500 dark:text-gray-400">
                              {initiative.owner}
                            </p>
                          </div>
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-roobert-medium ${getStatusColor(initiative.status)}`}>
                            {getStatusIcon(initiative.status)}
                            <span className="capitalize">{initiative.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                        <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${initiative.progress}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className={`absolute top-0 left-0 h-full rounded-full ${getProgressBarColor(initiative.status)}`}
                          />
                        </div>
                        <p className="text-xs font-roobert-medium text-gray-500 dark:text-gray-400 mt-2">
                          {initiative.progress}% complete
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
            </div>
            )}

            {/* Weekly Focus - Show if available */}
            {summary._enabled_weeklyFocus !== false && summary.weeklyFocus && summary.weeklyFocus.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                </div>
                <section id="focus">
                  <WeeklyFocus focusItems={summary.weeklyFocus} />
                </section>
              </>
            )}

            {/* Issues & Blockers - Show if available */}
            {summary._enabled_issuesAndBlockers !== false && summary.issuesAndBlockers && summary.issuesAndBlockers.length > 0 && (
              <>
                <div className="flex justify-center">
                  <div className="w-3/5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
                </div>
                <section id="issues">
                  <IssuesBlockers issues={summary.issuesAndBlockers} />
                </section>
              </>
            )}

            {/* Risks & Mitigation */}
            {summary._enabled_risks !== false && summary.risks && summary.risks.length > 0 && (
              <section id="risks">
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Risks & Mitigation
                </h3>
                <div className="space-y-4">
                  {summary.risks.map((risk, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-5">
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg ${getSeverityColor(risk.severity)}`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-base font-roobert-medium text-gray-900 dark:text-white">
                            {risk.description}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-roobert-medium ${getSeverityColor(risk.severity)}`}>
                            {risk.severity} severity
                          </span>
                        </div>
                        <p className="text-sm font-roobert-light text-gray-600 dark:text-gray-400">
                          <span className="font-roobert-medium">Mitigation: </span>
                          {risk.mitigation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            )}

            {/* Outlook */}
            {summary._enabled_outlook !== false && summary.outlook && (
              <section>
                <h3 className="text-2xl font-roobert-heavy text-gray-900 dark:text-white mb-6">
                  Outlook
                </h3>
                <div className="bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 shadow-md rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fis-eggplant to-fis-navy flex items-center justify-center flex-shrink-0">
                      <Target className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-base font-roobert-light text-gray-700 dark:text-gray-300 leading-relaxed">
                      {summary.outlook}
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

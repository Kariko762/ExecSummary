/**
 * AI WEEKLY SUMMARY MODAL
 * 
 * Multi-step wizard to generate executive summaries from timeline notes:
 * 1. Select week
 * 2. Select relevant notes (checklist)
 * 3. Choose summary type (CPSAR/BLUF/SBAR/Pyramid)
 * 4. Generate & copy AI prompt
 * 5. Paste AI JSON response
 * 6. Clone Weekly Update template & inject data
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Calendar, CheckCircle, Copy,
  Sparkles, FileText, AlertCircle, Loader
} from 'lucide-react';

interface TimelineNote {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'environment-health' | 'data-operations' | 'platform-integration' | 'high-value-deals' | 'poc-trial-support' | 'sales-enablement' | 'expansion-ops' | 'process-automation' | 'capacity-planning' | 'documentation' | 'revenue-at-risk' | 'critical-blocker' | 'strategic-milestone' | 'product-intelligence' | 'key-highlight' | 'goal-progression' | 'big-win' | 'deal-support' | 'new-project' | 'general';
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface WeekRange {
  label: string;
  startDate: string;
  endDate: string;
  noteCount: number;
}

interface AiWeeklySummaryModalProps {
  onClose: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  notes: TimelineNote[];
}

type SummaryType = 'cpsar' | 'bluf' | 'sbar' | 'pyramid';
type Step = 'week-select' | 'note-select' | 'type-select' | 'ai-prompt' | 'json-input' | 'creating';

const SUMMARY_TYPES = [
  {
    id: 'cpsar' as SummaryType,
    name: 'CPSAR',
    description: 'Context, Problem, Solution, Action, Results',
    icon: '📋',
    best: 'Problem-solving scenarios'
  },
  {
    id: 'bluf' as SummaryType,
    name: 'BLUF',
    description: 'Bottom Line Up Front',
    icon: '🎯',
    best: 'Quick decisions needed'
  },
  {
    id: 'sbar' as SummaryType,
    name: 'SBAR',
    description: 'Situation, Background, Assessment, Recommendation',
    icon: '🏥',
    best: 'Operational updates'
  },
  {
    id: 'pyramid' as SummaryType,
    name: 'Pyramid',
    description: 'Main Argument → Key Points → Details',
    icon: '📊',
    best: 'Strategic presentations'
  }
];

const CATEGORY_CONFIG = {
  // New operational categories
  'environment-health': { label: 'Environment Health', color: 'text-blue-600', bg: 'bg-blue-50' },
  'data-operations': { label: 'Data Operations', color: 'text-purple-600', bg: 'bg-purple-50' },
  'platform-integration': { label: 'Platform Integration', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'high-value-deals': { label: 'High-Value Deals', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'poc-trial-support': { label: 'POC/Trial Support', color: 'text-teal-600', bg: 'bg-teal-50' },
  'sales-enablement': { label: 'Sales Enablement', color: 'text-green-600', bg: 'bg-green-50' },
  'expansion-ops': { label: 'Expansion Ops', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'process-automation': { label: 'Process Automation', color: 'text-cyan-600', bg: 'bg-cyan-50' },
  'capacity-planning': { label: 'Capacity Planning', color: 'text-slate-600', bg: 'bg-slate-50' },
  'documentation': { label: 'Documentation', color: 'text-gray-600', bg: 'bg-gray-50' },
  'revenue-at-risk': { label: 'Revenue at Risk', color: 'text-red-600', bg: 'bg-red-50' },
  'critical-blocker': { label: 'Critical Blocker', color: 'text-orange-600', bg: 'bg-orange-50' },
  'strategic-milestone': { label: 'Strategic Milestone', color: 'text-purple-600', bg: 'bg-purple-50' },
  'product-intelligence': { label: 'Product Intelligence', color: 'text-violet-600', bg: 'bg-violet-50' },
  // Old categories for backward compatibility
  'key-highlight': { label: 'Key Highlight', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'goal-progression': { label: 'Goal Progression', color: 'text-blue-600', bg: 'bg-blue-50' },
  'big-win': { label: 'Big Win', color: 'text-green-600', bg: 'bg-green-50' },
  'deal-support': { label: 'Deal Support', color: 'text-purple-600', bg: 'bg-purple-50' },
  'new-project': { label: 'New Project', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  'general': { label: 'General', color: 'text-gray-600', bg: 'bg-gray-50' }
};

export default function AiWeeklySummaryModal({
  onClose,
  showNotification,
  notes
}: AiWeeklySummaryModalProps) {
  const [step, setStep] = useState<Step>('week-select');
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [summaryType, setSummaryType] = useState<SummaryType | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Load AI template configuration from settings
  const [aiTemplates, setAiTemplates] = useState<any>({});
  const [availableSummaryTypes, setAvailableSummaryTypes] = useState<typeof SUMMARY_TYPES>([]);

  useEffect(() => {
    const settings = localStorage.getItem('system-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      const templates = parsed.aiTemplates || {};
      setAiTemplates(templates);
      
      // Filter summary types to only show configured ones
      const available = SUMMARY_TYPES.filter(type => templates[type.id]);
      setAvailableSummaryTypes(available);
    }
  }, []);

  // Generate week ranges from notes
  const getWeekRanges = (): WeekRange[] => {
    const weekMap = new Map<string, TimelineNote[]>();
    
    notes.forEach(note => {
      const date = new Date(note.date);
      const dayOfWeek = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const weekKey = monday.toISOString().split('T')[0];
      
      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, []);
      }
      weekMap.get(weekKey)!.push(note);
    });

    const weeks: WeekRange[] = [];
    weekMap.forEach((weekNotes, weekKey) => {
      const monday = new Date(weekKey);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      weeks.push({
        label: `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0],
        noteCount: weekNotes.length
      });
    });

    return weeks.sort((a, b) => b.startDate.localeCompare(a.startDate));
  };

  // Get notes for selected week
  const getWeekNotes = (): TimelineNote[] => {
    if (!selectedWeek) return [];
    return notes.filter(note => 
      note.date >= selectedWeek.startDate && note.date <= selectedWeek.endDate
    ).sort((a, b) => b.date.localeCompare(a.date));
  };

  // Initialize selected notes when week changes
  useEffect(() => {
    if (selectedWeek && step === 'note-select') {
      const weekNotes = getWeekNotes();
      setSelectedNoteIds(new Set(weekNotes.map(n => n.id)));
    }
  }, [selectedWeek, step]);

  // Generate AI prompt
  const generateAiPrompt = (): string => {
    const selectedNotes = getWeekNotes().filter(n => selectedNoteIds.has(n.id));
    
    const notesText = selectedNotes.map((note, idx) => {
      return `${idx + 1}. [${new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}] ${CATEGORY_CONFIG[note.category].label}: ${note.title}
   ${note.content}`;
    }).join('\n\n');

    const typeInstructions = {
      cpsar: {
        name: 'CPSAR (Context, Problem, Solution, Action, Results)',
        format: `{
  "context": "Brief context setting (2-3 sentences)",
  "problem": "The core problem or challenge (2-3 sentences)",
  "solution": "How we're addressing it (2-3 sentences)",
  "recommendation": "Specific actions needed (2-3 sentences)",
  "asks": [
    {"type": "budget|decision|resource|approval|escalation", "item": "Specific ask", "urgency": "high|medium|low", "owner": "Name", "deadline": "Date"}
  ]
}`
      },
      bluf: {
        name: 'BLUF (Bottom Line Up Front)',
        format: `{
  "bottomLine": "THE answer/decision needed (1-2 sentences)",
  "background": "Context that led to this (2-3 sentences)",
  "assessment": "Analysis of situation (2-3 sentences)",
  "recommendation": "Specific actions (2-3 sentences)",
  "asks": [
    {"type": "budget|decision|resource|approval|escalation", "item": "Specific ask", "urgency": "high|medium|low", "owner": "Name", "deadline": "Date"}
  ]
}`
      },
      sbar: {
        name: 'SBAR (Situation, Background, Assessment, Recommendation)',
        format: `{
  "situation": "What's happening now (2-3 sentences)",
  "background": "Context and history (2-3 sentences)",
  "assessment": "Your analysis (2-3 sentences)",
  "recommendation": "What should be done (2-3 sentences)",
  "asks": [
    {"type": "budget|decision|resource|approval|escalation", "item": "Specific ask", "urgency": "high|medium|low", "owner": "Name", "deadline": "Date"}
  ]
}`
      },
      pyramid: {
        name: 'Pyramid Principle',
        format: `{
  "mainArgument": "The main conclusion (1-2 sentences)",
  "keyPoints": ["Key reason 1", "Key reason 2", "Key reason 3"],
  "supportingDetails": "Evidence and details (3-4 sentences)",
  "nextSteps": "Specific actions and timeline (2-3 sentences)",
  "asks": [
    {"type": "budget|decision|resource|approval|escalation", "item": "Specific ask", "urgency": "high|medium|low", "owner": "Name", "deadline": "Date"}
  ]
}`
      }
    };

    const typeInfo = typeInstructions[summaryType!];

    return `You are an executive communication expert. I need you to analyze ${selectedNotes.length} notes from ${selectedWeek?.label} and create a concise ${typeInfo.name} executive summary.

**NOTES FROM THIS WEEK:**

${notesText}

**YOUR TASK:**
1. Analyze the notes above and identify the key themes, accomplishments, challenges, and action items
2. Create a concise executive summary using the ${typeInfo.name} framework
3. Be specific - include concrete numbers, dates, and names where available
4. Keep each section brief (2-3 sentences max)
5. Focus on what executives need to know and decide

**CRITICAL - OUTPUT FORMAT:**
Return ONLY valid JSON in this exact structure (no markdown, no code blocks, just raw JSON):

${typeInfo.format}

IMPORTANT:
- Return ONLY the JSON object, no explanations before or after
- Ensure all text is concise and executive-appropriate
- type must be one of: budget, decision, resource, approval, escalation
- urgency must be one of: low, medium, high`;
  };

  // Parse AI response
  const parseAiResponse = (response: string): any => {
    try {
      let jsonStr = response.trim();
      
      // Remove markdown code blocks
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(jsonStr);
      
      // Basic validation
      if (typeof parsed !== 'object' || parsed === null) {
        throw new Error('Response must be a JSON object');
      }
      
      // Validate asks array
      if (parsed.asks && Array.isArray(parsed.asks)) {
        parsed.asks.forEach((ask: any, idx: number) => {
          if (!ask.type || !ask.item) {
            throw new Error(`Ask ${idx + 1} must have 'type' and 'item' fields`);
          }
        });
      }
      
      return parsed;
    } catch (error: any) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please ensure the AI response is valid JSON.');
      }
      throw error;
    }
  };

  // Handle AI response input
  const handleAiResponseChange = (value: string) => {
    setAiResponse(value);
    setParseError(null);
    setParsedData(null);
    
    if (value.trim()) {
      try {
        const parsed = parseAiResponse(value);
        setParsedData(parsed);
      } catch (error: any) {
        setParseError(error.message);
      }
    }
  };

  // Copy prompt to clipboard
  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(aiPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Create weekly summary
  const handleCreateSummary = async () => {
    if (!parsedData || !selectedWeek || !summaryType) return;
    
    // Get template ID from settings
    const templateId = aiTemplates[summaryType];
    if (!templateId) {
      showNotification('error', 'Template not configured for this summary type');
      return;
    }
    
    setCreating(true);
    setStep('creating');
    
    try {
      // Call backend to clone and update
      const response = await fetch('http://localhost:3001/api/weekly-summary/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weekLabel: selectedWeek.label,
          summaryType,
          summaryData: parsedData,
          noteIds: Array.from(selectedNoteIds),
          templateId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification('success', 'Weekly summary created successfully!');
        onClose();
        // TODO: Navigate to new content
      } else {
        throw new Error(data.error || 'Failed to create summary');
      }
    } catch (error: any) {
      console.error('Failed to create summary:', error);
      showNotification('error', error.message || 'Failed to create weekly summary');
      setStep('json-input');
    } finally {
      setCreating(false);
    }
  };

  // Navigation handlers
  const handleNext = () => {
    if (step === 'week-select' && selectedWeek) {
      setStep('note-select');
    } else if (step === 'note-select' && selectedNoteIds.size > 0) {
      setStep('type-select');
    } else if (step === 'type-select' && summaryType) {
      const prompt = generateAiPrompt();
      setAiPrompt(prompt);
      setStep('ai-prompt');
    } else if (step === 'ai-prompt') {
      setStep('json-input');
    } else if (step === 'json-input' && parsedData) {
      handleCreateSummary();
    }
  };

  const handleBack = () => {
    if (step === 'note-select') setStep('week-select');
    else if (step === 'type-select') setStep('note-select');
    else if (step === 'ai-prompt') setStep('type-select');
    else if (step === 'json-input') setStep('ai-prompt');
  };

  const weeks = getWeekRanges();
  const weekNotes = getWeekNotes();
  const selectedCount = selectedNoteIds.size;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-roobert-bold text-gray-900 dark:text-white">
                  AI Weekly Summary
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step === 'week-select' && 'Step 1: Select a week'}
                  {step === 'note-select' && 'Step 2: Select relevant notes'}
                  {step === 'type-select' && 'Step 3: Choose summary type'}
                  {step === 'ai-prompt' && 'Step 4: Copy AI prompt'}
                  {step === 'json-input' && 'Step 5: Paste AI response'}
                  {step === 'creating' && 'Creating your summary...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Week Selection */}
            {step === 'week-select' && (
              <motion.div
                key="week-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {weeks.map((week) => (
                  <button
                    key={week.startDate}
                    onClick={() => setSelectedWeek(week)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedWeek?.startDate === week.startDate
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <div>
                          <div className="font-roobert-bold text-gray-900 dark:text-white">
                            {week.label}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {week.noteCount} {week.noteCount === 1 ? 'note' : 'notes'}
                          </div>
                        </div>
                      </div>
                      {selectedWeek?.startDate === week.startDate && (
                        <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      )}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {/* Step 2: Note Selection */}
            {step === 'note-select' && (
              <motion.div
                key="note-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Select notes to include in your summary ({selectedCount} selected)
                  </p>
                  <button
                    onClick={() => {
                      if (selectedCount === weekNotes.length) {
                        setSelectedNoteIds(new Set());
                      } else {
                        setSelectedNoteIds(new Set(weekNotes.map(n => n.id)));
                      }
                    }}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    {selectedCount === weekNotes.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {weekNotes.map((note) => {
                  const isSelected = selectedNoteIds.has(note.id);
                  return (
                    <button
                      key={note.id}
                      onClick={() => {
                        const newSet = new Set(selectedNoteIds);
                        if (isSelected) {
                          newSet.delete(note.id);
                        } else {
                          newSet.add(note.id);
                        }
                        setSelectedNoteIds(newSet);
                      }}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-roobert-bold text-gray-900 dark:text-white">
                              {note.title}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${CATEGORY_CONFIG[note.category].bg} ${CATEGORY_CONFIG[note.category].color}`}>
                              {CATEGORY_CONFIG[note.category].label}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {note.content}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(note.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {/* Step 3: Summary Type Selection */}
            {step === 'type-select' && (
              <motion.div
                key="type-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-3"
              >
                {availableSummaryTypes.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">
                      No AI Templates Configured
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Please configure Weekly Update templates in System Settings first.
                    </p>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Close and Configure Settings
                    </button>
                  </div>
                ) : (
                  availableSummaryTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSummaryType(type.id)}
                      className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                        summaryType === type.id
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl">{type.icon}</span>
                          <div>
                            <div className="font-roobert-bold text-lg text-gray-900 dark:text-white mb-1">
                              {type.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {type.description}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">
                              Best for: {type.best}
                            </div>
                          </div>
                        </div>
                        {summaryType === type.id && (
                          <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    </button>
                  ))
                )}
              </motion.div>
            )}

            {/* Step 4: AI Prompt */}
            {step === 'ai-prompt' && (
              <motion.div
                key="ai-prompt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-roobert-bold text-blue-900 dark:text-blue-100 mb-1">
                        Instructions:
                      </h3>
                      <ol className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                        <li>Copy the prompt below</li>
                        <li>Paste into ChatGPT, Claude, or your AI assistant</li>
                        <li>Click "Next" when you have the AI's JSON response</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto max-h-[50vh]">
                    <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                      {aiPrompt}
                    </pre>
                  </div>
                  <button
                    onClick={handleCopyPrompt}
                    className="absolute top-3 right-3 px-3 py-1.5 bg-white hover:bg-gray-100 rounded-lg shadow-lg flex items-center gap-2 transition-all"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-roobert-medium text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-700" />
                        <span className="text-sm font-roobert-medium text-gray-700">Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 5: JSON Input */}
            {step === 'json-input' && (
              <motion.div
                key="json-input"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-roobert-bold text-gray-900 dark:text-white">
                    Paste AI Response
                  </h3>
                  {parsedData && (
                    <span className="text-sm text-green-600 dark:text-green-400 font-roobert-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Valid JSON detected
                    </span>
                  )}
                </div>

                <textarea
                  value={aiResponse}
                  onChange={(e) => handleAiResponseChange(e.target.value)}
                  placeholder="Paste the AI's JSON response here..."
                  className="w-full h-64 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />

                {parseError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded-r-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-roobert-bold text-red-900 dark:text-red-100 mb-1">
                          Parse Error
                        </p>
                        <p className="text-sm text-red-800 dark:text-red-200">{parseError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {parsedData && (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <h4 className="text-sm font-roobert-bold text-purple-900 dark:text-purple-100 mb-2">
                      Preview:
                    </h4>
                    <pre className="text-xs text-purple-700 dark:text-purple-300 whitespace-pre-wrap font-mono">
                      {JSON.stringify(parsedData, null, 2)}
                    </pre>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 6: Creating */}
            {step === 'creating' && (
              <motion.div
                key="creating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12"
              >
                <Loader className="w-16 h-16 text-purple-600 dark:text-purple-400 animate-spin mb-4" />
                <p className="text-lg font-roobert-bold text-gray-900 dark:text-white mb-2">
                  Creating your weekly summary...
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cloning template and injecting your data
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step !== 'creating' && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between">
            <button
              onClick={step === 'week-select' ? onClose : handleBack}
              className="px-4 py-2 text-sm font-roobert-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
            >
              {step === 'week-select' ? (
                <>Cancel</>
              ) : (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </>
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={
                (step === 'week-select' && !selectedWeek) ||
                (step === 'note-select' && selectedCount === 0) ||
                (step === 'type-select' && !summaryType) ||
                (step === 'json-input' && !parsedData)
              }
              className="px-5 py-2 text-sm font-roobert-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {step === 'json-input' ? 'Create Summary' : 'Next'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

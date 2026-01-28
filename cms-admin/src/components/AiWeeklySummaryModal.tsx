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
  Sparkles, FileText, AlertCircle, Loader, ListTodo
} from 'lucide-react';

interface TimelineNote {
  id: string;
  title: string;
  content: string;
  category: 'environment-health' | 'data-operations' | 'platform-integration' | 'high-value-deals' | 'poc-trial-support' | 'sales-enablement' | 'expansion-ops' | 'process-automation' | 'capacity-planning' | 'documentation' | 'revenue-at-risk' | 'critical-blocker' | 'strategic-milestone' | 'product-intelligence' | 'key-highlight' | 'goal-progression' | 'big-win' | 'deal-support' | 'new-project' | 'general';
  tags: string[] | string;
  sectionIds: string[] | string;
  linkedTo: any;
  author: string;
  createdAt: string;
  updatedAt: string;
}

interface WeekRange {
  label: string;
  startDate: string;
  endDate: string;
  noteCount: number;
  taskCount: number;
}

interface Task {
  id: string;
  title: string;
  owner: string;
  businessUnit: string;
  product: string;
  startDate: string;
  targetDate: string;
  percentage: number;
  status: 'On Track' | 'At Risk' | 'Blocked' | 'Complete';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  milestones: string;
  linkType?: 'goal' | 'initiative' | 'general';
}

interface AiWeeklySummaryModalProps {
  onClose: () => void;
  showNotification: (type: 'success' | 'error' | 'info', message: string) => void;
  notes: TimelineNote[];
  tasks: Task[];
}

type SummaryType = 'cpsar' | 'bluf' | 'sbar' | 'pyramid';
type Step = 'week-select' | 'content-select' | 'type-select' | 'ai-prompt' | 'json-input' | 'creating';

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
  notes,
  tasks
}: AiWeeklySummaryModalProps) {
  const [step, setStep] = useState<Step>('week-select');
  const [selectedWeek, setSelectedWeek] = useState<WeekRange | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [summaryType, setSummaryType] = useState<SummaryType | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // HARDCODED: Always use all summary types with Leadership Summary template
  const availableSummaryTypes = SUMMARY_TYPES;

  // Generate week ranges from notes
  const getWeekRanges = (): WeekRange[] => {
    const weekMap = new Map<string, TimelineNote[]>();
    
    // Safety check: ensure notes is an array
    if (!Array.isArray(notes)) return [];
    
    notes.forEach(note => {
      const date = new Date(note.createdAt || note.updatedAt);
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
      
      // Count tasks that overlap with this week
      const weekStartStr = monday.toISOString().split('T')[0];
      const weekEndStr = sunday.toISOString().split('T')[0];
      const taskCount = Array.isArray(tasks) ? tasks.filter(task => {
        const taskStart = task.startDate;
        const taskEnd = task.endDate;
        return taskStart <= weekEndStr && taskEnd >= weekStartStr;
      }).length : 0;
      
      weeks.push({
        label: `Week of ${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        startDate: monday.toISOString().split('T')[0],
        endDate: sunday.toISOString().split('T')[0],
        noteCount: weekNotes.length,
        taskCount
      });
    });

    return weeks.sort((a, b) => b.startDate.localeCompare(a.startDate));
  };

  // Get notes for selected week
  const getWeekNotes = (): TimelineNote[] => {
    if (!selectedWeek || !Array.isArray(notes)) return [];
    return notes.filter(note => {
      const noteDate = (note.createdAt || note.updatedAt).split('T')[0];
      return noteDate >= selectedWeek.startDate && noteDate <= selectedWeek.endDate;
    }
    ).sort((a, b) => (b.createdAt || b.updatedAt).localeCompare(a.createdAt || a.updatedAt));
  };

  // Get tasks for selected week (active during the week)
  const getWeekTasks = (): Task[] => {
    if (!selectedWeek || !Array.isArray(tasks)) return [];
    return tasks.filter(task => {
      const taskStart = task.startDate;
      const taskEnd = task.targetDate;
      // Include if task overlaps with selected week
      return taskStart <= selectedWeek.endDate && taskEnd >= selectedWeek.startDate;
    }).sort((a, b) => {
      // Sort by priority then status
      const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // Initialize selected notes and tasks when week changes
  useEffect(() => {
    if (selectedWeek && step === 'content-select') {
      const weekNotes = getWeekNotes();
      const weekTasks = getWeekTasks();
      setSelectedNoteIds(new Set(weekNotes.map(n => n.id)));
      setSelectedTaskIds(new Set(weekTasks.map(t => t.id)));
    }
  }, [selectedWeek, step]);

  // Generate AI prompt
  const generateAiPrompt = (): string => {
    const selectedNotes = getWeekNotes().filter(n => selectedNoteIds.has(n.id));
    const selectedTasks = getWeekTasks().filter(t => selectedTaskIds.has(t.id));
    
    // Enhanced notes text with category and tags for AI context
    const notesText = selectedNotes.map((note, idx) => {
      const tagsDisplay = note.tags && note.tags.length > 0 ? ` | Tags: ${note.tags.join(', ')}` : '';
      return `${idx + 1}. [${new Date(note.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}] ${CATEGORY_CONFIG[note.category].label}${tagsDisplay}
   Title: ${note.title}
   ${note.content}`;
    }).join('\n\n');

    // Enhanced tasks text with detailed status
    const tasksText = selectedTasks.map((task, idx) => {
      const typeLabel = task.linkType === 'goal' ? 'Goal' : task.linkType === 'initiative' ? 'Initiative' : 'Task';
      const statusEmoji = task.status === 'Complete' ? '✅' : task.status === 'On Track' ? '🟢' : task.status === 'At Risk' ? '🟡' : '🔴';
      return `${idx + 1}. ${statusEmoji} [${task.status}] ${typeLabel}: ${task.title}
   Owner: ${task.owner} | Progress: ${task.percentage}% | Priority: ${task.priority}
   ${task.description}
   ${task.milestones ? `Milestones: ${task.milestones}` : ''}`;
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
  "metadata": {
    "weekStart": "YYYY-MM-DD",
    "weekEnd": "YYYY-MM-DD",
    "generatedBy": "AI Assistant",
    "title": "Weekly Leadership Summary"
  },
  "bluf": {
    "bottomLine": ["Key point 1 (bullet)", "Key point 2 (bullet)", "Key point 3 (bullet)"],
    "background": "Context that led to this week's situation (2-3 sentences as paragraph)",
    "assessment": "Analysis of current situation (2-3 sentences as paragraph)",
    "recommendations": ["Recommendation 1 (bullet)", "Recommendation 2 (bullet)", "Recommendation 3 (bullet)"],
    "asks": [
      {"item": "Specific ask", "urgency": "High|Medium|Low", "owner": "Team/Person"},
      {"item": "Another ask", "urgency": "High|Medium|Low", "owner": "Team/Person"}
    ]
  },
  "prioritization": [
    {
      "title": "Demo/Project that needs prioritization",
      "description": "Why this needs attention (1-2 sentences)",
      "impact": "Business impact (e.g., High - impacts revenue pipeline)",
      "status": "In Progress|Blocked|Not Started",
      "priority": "High|Medium|Low",
      "linkedGoal": "Goal name from system",
      "linkedInitiative": "Initiative name from system",
      "milestones": ["Milestone 1", "Milestone 2"],
      "deliverables": ["Deliverable 1", "Deliverable 2"],
      "owner": "Owner Name",
      "dueDate": "YYYY-MM-DD"
    }
  ],
  "risks": [
    {
      "title": "Risk title",
      "description": "What the risk is (1-2 sentences)",
      "severity": "High|Medium|Low",
      "probability": "High|Medium|Low",
      "impact": "Business impact description",
      "owner": "Owner Name",
      "mitigation": "What's being done about it",
      "category": "Revenue|Technical|Resource|Timeline"
    }
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

    return `You are an executive communication expert. I need you to analyze this week's activity (${selectedWeek?.label}) and create a concise ${typeInfo.name} executive summary.

**NOTES FROM THIS WEEK (${selectedNotes.length} items):**

${notesText}

**TASKS & INITIATIVES IN PROGRESS (${selectedTasks.length} items):**

${tasksText}

**YOUR TASK:**
1. Analyze all the data above (notes and tasks/initiatives)
2. **Use NOTE CATEGORIES and TAGS to intelligently route content:**
   - Notes tagged "Key Highlight" or "Big Win" → highlights array
   - Notes tagged "Critical Blocker" or "Revenue at Risk" → risks array with high severity
   - Notes with category "Goal Progression" or "Strategic Milestone" → activities or highlights
   - Notes with category "Deal Support" or "High-Value Deals" → priorityUpdates or activities
   - Notes with category "Documentation" → generally lower priority activities
3. **Extract METRICS from tasks:**
   - Count tasks by status: Complete, On Track, At Risk, Blocked
   - Calculate completion percentage and progress trends
   - Identify key metric changes from task progress
4. **Categorize TASKS into priority updates:**
   - Tasks with status "Complete" (100%) → completedWork array
   - Tasks with status "On Track" or "In Progress" → priorityUpdates.inProgress
   - Tasks with status "Blocked" or "At Risk" → priorityUpdates.blocked
5. **Extract NEXT WEEK priorities:**
   - Look for "NEXT STEP" or "Next Week" mentions in notes
   - Identify tasks starting next week or with upcoming deadlines
   - Surface high-priority incomplete items
6. **Identify RISKS:**
   - Notes with "RISK" explicitly mentioned
   - Notes tagged "Critical Blocker" or "Revenue at Risk"
   - Tasks that are "Blocked" or "At Risk" with <50% progress
   - Authentication issues, vendor dependencies, resource gaps
7. Be specific - include concrete numbers, dates, names, and task progress percentages
8. Keep each section brief but comprehensive
9. Focus on what executives need to know and decide
10. Highlight week-over-week progress where applicable

**CRITICAL - OUTPUT FORMAT:**
Return ONLY valid JSON in this exact structure (no markdown, no code blocks, just raw JSON):

${typeInfo.format}

IMPORTANT:
- Return ONLY the JSON object, no explanations before or after
- Ensure all text is concise and executive-appropriate
- Use note categories/tags to intelligently route content to the right section
- Populate ALL fields in the JSON structure
- type must be one of: budget, decision, resource, approval, escalation
- urgency must be one of: low, medium, high
- severity must be one of: low, medium, high, critical`;
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
    
    // HARDCODED: Use demo-weekly-bluf template for weekly summaries
    const templateId = 'demo-weekly-bluf';
    
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
          taskIds: Array.from(selectedTaskIds),
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
      setStep('content-select');
    } else if (step === 'content-select' && (selectedNoteIds.size > 0 || selectedTaskIds.size > 0)) {
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
    if (step === 'content-select') setStep('week-select');
    else if (step === 'type-select') setStep('content-select');
    else if (step === 'ai-prompt') setStep('type-select');
    else if (step === 'json-input') setStep('ai-prompt');
  };

  const weeks = getWeekRanges();
  const weekNotes = getWeekNotes();
  const selectedCount = selectedNoteIds.size + selectedTaskIds.size;

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
                  {step === 'content-select' && 'Step 2: Select notes & tasks'}
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
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3">
                            <span>{week.noteCount} {week.noteCount === 1 ? 'note' : 'notes'}</span>
                            <span>•</span>
                            <span>{week.taskCount} {week.taskCount === 1 ? 'task' : 'tasks'}</span>
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

            {/* Step 2: Content Selection (Notes + Tasks) */}
            {step === 'content-select' && (
              <motion.div
                key="content-select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Selection Summary */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedNoteIds.size} {selectedNoteIds.size === 1 ? 'note' : 'notes'}, {selectedTaskIds.size} {selectedTaskIds.size === 1 ? 'task' : 'tasks'} selected
                  </p>
                </div>

                {/* Notes Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Notes ({weekNotes.length})
                    </h3>
                    <button
                      onClick={() => {
                        if (selectedNoteIds.size === weekNotes.length) {
                          setSelectedNoteIds(new Set());
                        } else {
                          setSelectedNoteIds(new Set(weekNotes.map(n => n.id)));
                        }
                      }}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {selectedNoteIds.size === weekNotes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {weekNotes.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                      No notes found for this week
                    </div>
                  ) : (
                    weekNotes.map((note) => {
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
                    })
                  )}
                </div>

                {/* Tasks Section */}
                <div className="space-y-3 mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-roobert-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ListTodo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Tasks & Initiatives ({getWeekTasks().length})
                    </h3>
                    <button
                      onClick={() => {
                        const weekTasks = getWeekTasks();
                        if (selectedTaskIds.size === weekTasks.length) {
                          setSelectedTaskIds(new Set());
                        } else {
                          setSelectedTaskIds(new Set(weekTasks.map(t => t.id)));
                        }
                      }}
                      className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      {selectedTaskIds.size === getWeekTasks().length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>

                  {getWeekTasks().length === 0 ? (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                      No tasks found for this week
                    </div>
                  ) : (
                    getWeekTasks().map((task) => {
                      const isSelected = selectedTaskIds.has(task.id);
                      const statusColors = {
                        'not-started': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                        'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
                        'completed': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
                        'blocked': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      };
                      const priorityColors = {
                        'High': 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
                        'Medium': 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300',
                        'Low': 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                      };
                      const linkTypeLabels = {
                        'goal': 'Goal',
                        'initiative': 'Initiative',
                        'general': 'Task'
                      };
                      
                      return (
                        <button
                          key={task.id}
                          onClick={() => {
                            const newSet = new Set(selectedTaskIds);
                            if (isSelected) {
                              newSet.delete(task.id);
                            } else {
                              newSet.add(task.id);
                            }
                            setSelectedTaskIds(newSet);
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
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className="font-roobert-bold text-gray-900 dark:text-white">
                                  {task.title}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[task.status]}`}>
                                  {task.status}
                                </span>
                                {task.linkType && (
                                  <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                    {linkTypeLabels[task.linkType]}
                                  </span>
                                )}
                                {task.priority && (
                                  <span className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                              {task.description && (
                                <div className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                  {task.description}
                                </div>
                              )}
                              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                                {task.owner && (
                                  <span>Owner: {task.owner}</span>
                                )}
                                <span className="flex items-center gap-1">
                                  Progress: {task.percentage}%
                                  <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-purple-600 dark:bg-purple-400 rounded-full"
                                      style={{ width: `${task.percentage}%` }}
                                    />
                                  </div>
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
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
                (step === 'content-select' && selectedCount === 0) ||
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

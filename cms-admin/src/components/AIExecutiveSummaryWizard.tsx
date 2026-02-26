import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, FileText, Calendar, CheckSquare, StickyNote, Copy, FileJson } from 'lucide-react';

interface AIExecutiveSummaryWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSummary: (summaryData: any) => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface LeadershipSummary {
  id: string;
  title: string;
  date: string;
  quarter: string;
  year: number;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: string;
  priority: string;
}

interface Note {
  id: string;
  title: string;
  date: string;
  content: string;
}

export default function AIExecutiveSummaryWizard({ isOpen, onClose, onCreateSummary, showNotification }: AIExecutiveSummaryWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [baseSummaryLoading, setBaseSummaryLoading] = useState(false);

  // Step 1: Previous Leadership Summaries
  const [leadershipSummaries, setLeadershipSummaries] = useState<LeadershipSummary[]>([]);
  const [selectedBaseSummaryId, setSelectedBaseSummaryId] = useState('');
  const [baseSummaryData, setBaseSummaryData] = useState<any>(null);

  // Step 2: Tasks
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  // Step 3: Notes
  const [weekStart, setWeekStart] = useState('');
  const [weekEnd, setWeekEnd] = useState('');
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);

  // Step 4: Generate & Paste
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const totalSteps = 5;

  useEffect(() => {
    if (isOpen && currentStep === 1) {
      loadLeadershipSummaries();
    }
  }, [isOpen, currentStep]);

  useEffect(() => {
    if (currentStep === 2) {
      loadTasks();
    }
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 3 && weekStart && weekEnd) {
      loadNotes();
    }
  }, [currentStep, weekStart, weekEnd]);

  useEffect(() => {
    if (currentStep === 3 && (!weekStart || !weekEnd)) {
      const lastWeek = getLastWeekRange();
      setWeekStart(lastWeek.startDate);
      setWeekEnd(lastWeek.endDate);
    }
  }, [currentStep, weekStart, weekEnd]);

  const loadLeadershipSummaries = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/content?tag=leadership-summary');
      if (!response.ok) throw new Error('Failed to fetch content');
      
      const data = await response.json();
      
      const summaries = (data.content || [])
        .filter((item: any) => item._published === true || item.meta?.status === 'published')
        .map((item: any) => ({
          id: item.meta?.id || item.id,
          title: item.meta?.title || item.title || 'Untitled Summary',
          date: item.meta?.date || item.date || '',
          quarter: item.meta?.quarter || item.quarter || '',
          year: item.meta?.year || item.year || new Date().getFullYear()
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setLeadershipSummaries(summaries);
    } catch (error) {
      console.error('Failed to load leadership summaries:', error);
      showNotification?.('error', 'Failed to load previous summaries');
    } finally {
      setLoading(false);
    }
  };

  const loadBaseSummaryData = async (summaryId: string) => {
    setBaseSummaryLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/content/${summaryId}`);
      if (!response.ok) throw new Error('Failed to fetch summary data');
      
      const result = await response.json();
      setBaseSummaryData(result.content || result);
    } catch (error) {
      console.error('Failed to load base summary data:', error);
      showNotification?.('error', 'Failed to load summary data');
    } finally {
      setBaseSummaryLoading(false);
    }
  };

  const getLastWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const thisWeekMonday = new Date(today);
    thisWeekMonday.setDate(today.getDate() - daysSinceMonday);
    thisWeekMonday.setHours(0, 0, 0, 0);

    const lastWeekMonday = new Date(thisWeekMonday);
    lastWeekMonday.setDate(thisWeekMonday.getDate() - 7);
    const lastWeekSunday = new Date(lastWeekMonday);
    lastWeekSunday.setDate(lastWeekMonday.getDate() + 6);

    return {
      startDate: lastWeekMonday.toISOString().split('T')[0],
      endDate: lastWeekSunday.toISOString().split('T')[0]
    };
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      
      const tasks = (data.tasks || data || []).map((task: any) => ({
        id: task.id || task._id,
        title: task.title || task.name || 'Untitled Task',
        dueDate: task.targetDate || task.dueDate || task.deadline || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium'
      }));

      setAllTasks(tasks);
      // Auto-select all tasks by default
      setSelectedTaskIds(tasks.map((t: Task) => t.id));
    } catch (error) {
      console.error('Failed to load tasks:', error);
      showNotification?.('info', 'No tasks found or failed to load');
      setAllTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/timeline-notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      
      // Filter notes by date range
      const notes = (data.notes || data || [])
        .filter((note: any) => {
          const noteDate = new Date(note.date || note.createdAt || note.updatedAt);
          const start = new Date(weekStart);
          const end = new Date(weekEnd);
          return noteDate >= start && noteDate <= end;
        })
        .map((note: any) => ({
          id: note.id || note._id,
          title: note.title || 'Untitled Note',
          date: note.date || note.createdAt || note.updatedAt || '',
          content: note.content || note.body || note.summary || ''
        }))
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setAllNotes(notes);
      setSelectedNoteIds(notes.map((note: Note) => note.id));
    } catch (error) {
      console.error('Failed to load notes:', error);
      showNotification?.('info', 'No notes found or failed to load');
      setAllNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBaseSummaryChange = (summaryId: string) => {
    setSelectedBaseSummaryId(summaryId);
    if (summaryId) {
      loadBaseSummaryData(summaryId);
    }
  };

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const generateAIPrompt = () => {
    const selectedTasks = allTasks.filter(t => selectedTaskIds.includes(t.id));
    const selectedNotes = allNotes.filter(n => selectedNoteIds.includes(n.id));
    const formatWeeklyTitle = (start: string, end: string) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
        return `Weekly Leadership Summary - ${start} to ${end}`;
      }

      const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
      const startDay = startDate.toLocaleDateString('en-US', { day: '2-digit' });
      const endDay = endDate.toLocaleDateString('en-US', { day: '2-digit' });
      const startYear = startDate.getFullYear();
      const endYear = endDate.getFullYear();

      if (startYear === endYear) {
        if (startMonth === endMonth) {
          return `Weekly Leadership Summary - ${startMonth} ${startDay}-${endDay}, ${startYear}`;
        }
        return `Weekly Leadership Summary - ${startMonth} ${startDay}-${endMonth} ${endDay}, ${startYear}`;
      }

      return `Weekly Leadership Summary - ${startMonth} ${startDay}, ${startYear}-${endMonth} ${endDay}, ${endYear}`;
    };
    const formattedTitle = formatWeeklyTitle(weekStart, weekEnd);

    const prompt = `You are an executive communications specialist creating a Leadership Summary for the week of ${weekStart} to ${weekEnd}.

**PREVIOUS SUMMARY CONTEXT**
${baseSummaryData ? JSON.stringify(baseSummaryData, null, 2) : 'No previous summary selected'}

**CURRENT TASKS & DEADLINES**
${selectedTasks.length > 0 ? selectedTasks.map(task => 
  `- ${task.title} (Due: ${task.dueDate}, Status: ${task.status}, Priority: ${task.priority})`
).join('\n') : 'No tasks selected'}

**WEEK'S NOTES (${weekStart} to ${weekEnd})**
${selectedNotes.length > 0 ? selectedNotes.map(note =>
  `[${note.date}] ${note.title}\n${note.content}`
).join('\n\n') : 'No notes selected'}

**OUTPUT REQUIREMENTS**
Generate a Leadership Summary JSON object with this structure:
{
  "id": "leadership-summary-YYYY-MM-DD",
  "title": "${formattedTitle}",
  "date": "${new Date().toISOString().split('T')[0]}",
  "quarter": "${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}",
  "year": ${new Date().getFullYear()},
  "status": "draft",
  "_contentTag": "leadership-summary",
  "_published": false,

  "metadata": {
    "weekStart": "${weekStart}",
    "weekEnd": "${weekEnd}",
    "title": "${formattedTitle}",
    "description": "Executive leadership summary"
  },

  "bluf": {
    "bottomLine": ["Key outcome 1", "Key outcome 2", "Key outcome 3"],
    "background": "Context and key backdrop for the week",
    "assessment": "Assessment of progress and current posture",
    "recommendation": "Recommended next steps and focus",
    "asks": [
      {"type": "approval", "item": "Decision needed", "urgency": "high", "owner": "Exec Team", "deadline": "${weekEnd}"}
    ]
  },

  "priorities": [
    {
      "id": 1,
      "title": "Priority 1",
      "description": "Details",
      "status": "On Track",
      "impact": "High",
      "borderColor": "border-green-500",
      "statusColor": "text-green-400",
      "impactColor": "text-orange-400",
      "owner": "Owner",
      "dueDate": "${weekEnd}",
      "details": {
        "impact": "High",
        "likelihood": "Medium",
        "actionItems": ["Action 1", "Action 2"]
      }
    }
  ],

  "risks": [
    {
      "type": "medium-impact",
      "title": "Risk title",
      "description": "Risk description",
      "severity": "Medium",
      "probability": "Medium",
      "impact": "Medium",
      "status": "Open",
      "mitigation": "Mitigation plan",
      "owner": "Owner"
    }
  ]
}

**INSTRUCTIONS**
1. Synthesize the notes into clear, executive-level insights
2. Identify key themes and patterns from the week's activities
3. Highlight important progress, blockers, and upcoming priorities
4. Use specific data and dates where available
5. Maintain professional, concise language suitable for executive audience
6. Use bullet points, not long sentences
7. Select the top 5-8 distinct topics for the week
8. Set bluf.bottomLine to 5-8 bullet points (one per topic)
9. Keep background, assessment, and recommendation as short bullet lists using newline separators
10. Format the output as valid JSON matching the structure above

Generate the complete JSON object now:`;

    setGeneratedPrompt(prompt);
    setCurrentStep(4);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showNotification?.('success', 'Prompt copied! Paste into ChatGPT or Claude');
  };

  const handleCreateSummary = () => {
    try {
      const summaryData = JSON.parse(jsonInput);
      onCreateSummary(summaryData);
      showNotification?.('success', 'Summary created successfully!');
      onClose();
    } catch (error) {
      showNotification?.('error', 'Invalid JSON. Please check the format.');
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !selectedBaseSummaryId) {
      showNotification?.('error', 'Please select a base summary');
      return;
    }
    if (currentStep === 3 && !weekStart) {
      showNotification?.('error', 'Please select a week start date');
      return;
    }
    if (currentStep === 3 && !weekEnd) {
      showNotification?.('error', 'Please select a week end date');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl shadow-2xl border border-slate-700/40 w-full max-w-4xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/40 bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-roobert-semibold text-white">AI Executive Summary Builder</h2>
              <p className="text-sm text-slate-400 font-roobert-light">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-all text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full bg-slate-800/30 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Base Summary */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">Select Base Summary</h3>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">
                  Choose a previous Leadership Summary to use as context for the new summary.
                </p>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-slate-400">Loading summaries...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {leadershipSummaries.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        No published leadership summaries found
                      </div>
                    ) : (
                      <>
                        {baseSummaryLoading && (
                          <div className="text-xs text-slate-400 px-2">
                            Loading summary context...
                          </div>
                        )}
                        {leadershipSummaries.map(summary => (
                          <label
                            key={summary.id}
                            className={`flex items-center gap-3 p-4 rounded-lg border transition-all cursor-pointer ${
                              selectedBaseSummaryId === summary.id
                                ? 'bg-purple-500/10 border-purple-500/50'
                                : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60'
                            }`}
                          >
                            <input
                              type="radio"
                              name="baseSummary"
                              value={summary.id}
                              checked={selectedBaseSummaryId === summary.id}
                              onChange={(e) => handleBaseSummaryChange(e.target.value)}
                              className="w-4 h-4 text-purple-500"
                            />
                            <div className="flex-1">
                              <div className="font-roobert-medium text-white">{summary.title}</div>
                              <div className="text-xs text-slate-400">
                                {summary.quarter} {summary.year} • {summary.date}
                              </div>
                            </div>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Select Tasks */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <CheckSquare className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">Select Tasks to Include</h3>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">
                  Choose tasks that should be referenced in the executive summary.
                </p>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-3" />
                    <p className="text-slate-400">Loading tasks...</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allTasks.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        No tasks found
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-slate-400">
                            {selectedTaskIds.length} of {allTasks.length} tasks selected
                          </span>
                          <button
                            onClick={() => setSelectedTaskIds(
                              selectedTaskIds.length === allTasks.length 
                                ? [] 
                                : allTasks.map(t => t.id)
                            )}
                            className="text-xs text-purple-400 hover:text-purple-300"
                          >
                            {selectedTaskIds.length === allTasks.length ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        {allTasks.map(task => (
                          <label
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              selectedTaskIds.includes(task.id)
                                ? 'bg-green-500/10 border-green-500/50'
                                : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.includes(task.id)}
                              onChange={() => toggleTaskSelection(task.id)}
                              className="w-4 h-4 text-green-500"
                            />
                            <div className="flex-1">
                              <div className="font-roobert-medium text-white">{task.title}</div>
                              <div className="text-xs text-slate-400">
                                Due: {task.dueDate || 'No due date'} • {task.status} • {task.priority}
                              </div>
                            </div>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Select Notes */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <StickyNote className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">Select Week & Notes</h3>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">
                  Define the week range and select notes to include in the summary.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Week Start Date</label>
                    <input
                      type="date"
                      value={weekStart}
                      onChange={(e) => setWeekStart(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Week End Date</label>
                    <input
                      type="date"
                      value={weekEnd}
                      onChange={(e) => setWeekEnd(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600/40 rounded px-3 py-2 text-white text-sm focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                {weekStart && weekEnd && (
                  <>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-slate-400">Loading notes...</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {allNotes.length === 0 ? (
                          <div className="text-center py-8 text-slate-400">
                            No notes found for this week
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-slate-400">
                                {selectedNoteIds.length} of {allNotes.length} notes selected
                              </span>
                              <button
                                onClick={() => setSelectedNoteIds(
                                  selectedNoteIds.length === allNotes.length 
                                    ? [] 
                                    : allNotes.map(n => n.id)
                                )}
                                className="text-xs text-purple-400 hover:text-purple-300"
                              >
                                {selectedNoteIds.length === allNotes.length ? 'Deselect All' : 'Select All'}
                              </button>
                            </div>
                            {allNotes.map(note => (
                              <label
                                key={note.id}
                                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                  selectedNoteIds.includes(note.id)
                                    ? 'bg-yellow-500/10 border-yellow-500/50'
                                    : 'bg-slate-800/30 border-slate-700/40 hover:border-slate-600/60'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedNoteIds.includes(note.id)}
                                  onChange={() => toggleNoteSelection(note.id)}
                                  className="w-4 h-4 text-yellow-500"
                                />
                                <div className="flex-1">
                                  <div className="font-roobert-medium text-white">{note.title}</div>
                                  <div className="text-xs text-slate-400">{note.date}</div>
                                  {note.content && (
                                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {note.content}
                                    </div>
                                  )}
                                </div>
                              </label>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Step 4: AI Prompt */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">Copy AI Prompt</h3>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">
                  Copy this prompt and paste it into ChatGPT or Claude. Then paste the generated JSON in the next step.
                </p>

                <div className="bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>

                <button
                  onClick={copyPromptToClipboard}
                  className="w-full py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-roobert-medium"
                >
                  <Copy className="w-4 h-4" />
                  Copy Prompt to Clipboard
                </button>
              </motion.div>
            )}

            {/* Step 5: Paste JSON */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <FileJson className="w-6 h-6 text-green-400" />
                  <h3 className="text-lg font-roobert-semibold text-white">Paste Generated JSON</h3>
                </div>
                
                <p className="text-sm text-slate-400 mb-4">
                  Paste the JSON output from ChatGPT/Claude here.
                </p>

                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder='{ "id": "leadership-summary-...", ... }'
                  className="w-full h-96 bg-slate-800/30 border border-slate-700/40 rounded-lg p-4 text-slate-300 text-sm font-mono focus:border-purple-500 outline-none resize-none"
                />

                <button
                  onClick={handleCreateSummary}
                  disabled={!jsonInput.trim()}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-roobert-medium"
                >
                  <CheckSquare className="w-4 h-4" />
                  Create Executive Summary
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700/40 bg-slate-800/50">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg flex items-center gap-2 transition-all font-roobert-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          {currentStep < 4 && (
            <button
              onClick={currentStep === 3 ? generateAIPrompt : nextStep}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all font-roobert-medium"
            >
              {currentStep === 3 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Prompt
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

          {currentStep === 4 && (
            <button
              onClick={nextStep}
              className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg flex items-center gap-2 transition-all font-roobert-medium"
            >
              Next: Paste JSON
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

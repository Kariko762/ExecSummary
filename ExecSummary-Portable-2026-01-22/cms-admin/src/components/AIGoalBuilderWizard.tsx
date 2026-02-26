
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Target, TrendingUp, CheckCircle, Copy, FileJson } from 'lucide-react';

interface AIGoalBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGoal: (goalData: any) => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface WizardData {
  // Step 1: Goal Discovery
  goalName: string;
  businessChallenge: string;
  desiredOutcome: string;
  timeline: string;
  
  // Step 2: Context
  currentState: string;
  targetState: string;
  keyStakeholders: string;
  successLooksLike: string;
  
  // Step 3: Metrics
  leadingIndicators: string;
  laggingIndicators: string;
  dataAvailability: string;
  
  // Step 4: Resources
  teamResources: string;
  budgetConstraints: string;
  toolsAvailable: string;
  dependencies: string;
}

export default function AIGoalBuilderWizard({ isOpen, onClose, onCreateGoal, showNotification }: AIGoalBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    goalName: '',
    businessChallenge: '',
    desiredOutcome: '',
    timeline: '',
    currentState: '',
    targetState: '',
    keyStakeholders: '',
    successLooksLike: '',
    leadingIndicators: '',
    laggingIndicators: '',
    dataAvailability: '',
    teamResources: '',
    budgetConstraints: '',
    toolsAvailable: '',
    dependencies: ''
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const totalSteps = 4;

  const updateField = (field: keyof WizardData, value: string) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIPrompt = () => {
    const prompt = `You are a SMART goal strategist for a Chief Revenue Officer. Based on the following inputs, generate a comprehensive SMART goal JSON object.

**GOAL OVERVIEW**
Name: ${wizardData.goalName}
Business Challenge: ${wizardData.businessChallenge}
Desired Outcome: ${wizardData.desiredOutcome}
Timeline: ${wizardData.timeline}

**CURRENT VS TARGET STATE**
Current State: ${wizardData.currentState}
Target State: ${wizardData.targetState}
Success Looks Like: ${wizardData.successLooksLike}

**KEY STAKEHOLDERS**
${wizardData.keyStakeholders}

**METRICS & INDICATORS**
Leading Indicators (Operational): ${wizardData.leadingIndicators}
Lagging Indicators (Outcome): ${wizardData.laggingIndicators}
Data Availability: ${wizardData.dataAvailability}

**RESOURCES & CONSTRAINTS**
Team Resources: ${wizardData.teamResources}
Budget Constraints: ${wizardData.budgetConstraints}
Tools Available: ${wizardData.toolsAvailable}
Dependencies: ${wizardData.dependencies}

**OUTPUT REQUIREMENTS**
Generate a JSON object with this exact structure:
{
  "name": "Goal title (concise, actionable)",
  "shortName": "Abbreviated version (2-3 words)",
  "category": "sales-operations | revenue-growth | customer-success | process-optimization",
  "owner": "Role title (e.g., VP Sales Operations)",
  "status": "not-started",
  "priority": "high | medium | low",
  "targetDate": "YYYY-MM-DD",
  "color": "#8B5CF6",
  "icon": "🎯",
  "progress": 0,
  "linkedAssets": 0,
  "smartGoal": {
    "statement": "One comprehensive sentence capturing the SMART goal",
    "specific": {
      "objectives": ["Objective 1", "Objective 2", "Objective 3"]
    },
    "measurable": {
      "metrics": ["Metric 1", "Metric 2"]
    },
    "achievable": {
      "resources": "Summary of available resources",
      "ownership": "Owner and team structure"
    },
    "relevant": {
      "croAlignment": ["Sales Productivity", "Sales Cycle Delays", "Deal Conversion", "Customer Sat", "Pipeline Risk", "Forecast Confidence"],
      "rationale": ["Brief explanation of strategic alignment 1", "Brief explanation 2", "Brief explanation 3"]
    },
    "timeBound": {
      "timeline": [
        {
          "phase": "Phase name",
          "deliverable": "Deliverable description",
          "dueDate": "YYYY-MM-DD",
          "status": "not-started"
        }
      ]
    }
  },
  "indicators": {
    "leading": [
      {
        "name": "Indicator name",
        "baseline": "Current value",
        "target": "Target value",
        "current": "Current value",
        "unit": "% | count | hours"
      }
    ],
    "lagging": [
      {
        "name": "Indicator name",
        "baseline": "Current value",
        "target": "Target value",
        "current": "Current value",
        "unit": "% | $ | count"
      }
    ]
  }
}

**IMPORTANT NOTES:**
- **croAlignment**: Select from these exact values only: "Sales Productivity", "Sales Cycle Delays", "Deal Conversion", "Customer Sat", "Pipeline Risk", "Forecast Confidence"
- **rationale**: Provide 2-4 brief sentences explaining WHY this goal matters strategically (not repeating the checkbox names, but explaining the business impact)

Ensure the goal is:
- **Specific**: Clear objectives with measurable outcomes
- **Measurable**: Quantifiable metrics (leading + lagging)
- **Achievable**: Realistic given resources/constraints
- **Relevant**: Aligned with CRO/RevOps priorities (use exact checkbox names + separate rationale)
- **Time-bound**: Clear phases with deadlines

Return ONLY the JSON object, no additional text.`;

    setGeneratedPrompt(prompt);
    setCurrentStep(3);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showNotification?.('success', 'AI prompt copied to clipboard');
  };

  const handleJsonSubmit = () => {
    try {
      const parsedGoal = JSON.parse(jsonInput);
      
      // Validate required fields
      if (!parsedGoal.name || !parsedGoal.smartGoal || !parsedGoal.indicators) {
        showNotification?.('error', 'Invalid goal structure - missing required fields');
        return;
      }

      // Add metadata
      const goalWithMetadata = {
        ...parsedGoal,
        id: '',
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      onCreateGoal(goalWithMetadata);
      showNotification?.('success', 'AI-generated goal created successfully!');
      resetWizard();
      onClose();
    } catch (error) {
      showNotification?.('error', 'Invalid JSON format - please check and try again');
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({
      goalName: '',
      businessChallenge: '',
      desiredOutcome: '',
      timeline: '',
      currentState: '',
      targetState: '',
      keyStakeholders: '',
      successLooksLike: '',
      leadingIndicators: '',
      laggingIndicators: '',
      dataAvailability: '',
      teamResources: '',
      budgetConstraints: '',
      toolsAvailable: '',
      dependencies: ''
    });
    setGeneratedPrompt('');
    setJsonInput('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="text-sm font-roobert-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Goal Discovery
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Let's define what you want to achieve and why it matters.
              </p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Goal Name *
              </label>
              <input
                type="text"
                value={wizardData.goalName}
                onChange={(e) => updateField('goalName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Improve Demo-to-Opportunity Conversion Rate"
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                What business challenge are you solving? *
              </label>
              <textarea
                value={wizardData.businessChallenge}
                onChange={(e) => updateField('businessChallenge', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                placeholder="Describe the pain point, inefficiency, or opportunity..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                What's the desired outcome? *
              </label>
              <textarea
                value={wizardData.desiredOutcome}
                onChange={(e) => updateField('desiredOutcome', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                placeholder="What success looks like when this goal is achieved..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Timeline *
              </label>
              <input
                type="text"
                value={wizardData.timeline}
                onChange={(e) => updateField('timeline', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., Q2 2026, Next 90 days, By June 30"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border-l-4 border-blue-500">
              <h4 className="text-sm font-roobert-bold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Context & Metrics
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Define current state, target state, and how you'll measure progress.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current State *
                </label>
                <textarea
                  value={wizardData.currentState}
                  onChange={(e) => updateField('currentState', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none text-sm"
                  placeholder="Where are you today?"
                />
              </div>

              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Target State *
                </label>
                <textarea
                  value={wizardData.targetState}
                  onChange={(e) => updateField('targetState', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none text-sm"
                  placeholder="Where do you want to be?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Success Looks Like *
              </label>
              <textarea
                value={wizardData.successLooksLike}
                onChange={(e) => updateField('successLooksLike', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none"
                placeholder="Describe the specific, observable outcomes..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Leading Indicators (What you can control) *
              </label>
              <textarea
                value={wizardData.leadingIndicators}
                onChange={(e) => updateField('leadingIndicators', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none"
                placeholder="e.g., # demos delivered, demo quality score, follow-up speed..."
              />
              <p className="text-xs text-gray-500 mt-1">Activities that predict results</p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Lagging Indicators (Results you measure) *
              </label>
              <textarea
                value={wizardData.laggingIndicators}
                onChange={(e) => updateField('laggingIndicators', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none h-20 resize-none"
                placeholder="e.g., conversion rate, win rate, revenue impact..."
              />
              <p className="text-xs text-gray-500 mt-1">Outcomes that prove success</p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Key Stakeholders
              </label>
              <input
                type="text"
                value={wizardData.keyStakeholders}
                onChange={(e) => updateField('keyStakeholders', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="e.g., VP Sales, Sales Enablement, RevOps"
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Data Availability
              </label>
              <input
                type="text"
                value={wizardData.dataAvailability}
                onChange={(e) => updateField('dataAvailability', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Where is the data? CRM, spreadsheets, manual tracking?"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="text-sm font-roobert-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Prompt Generated
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Copy this prompt and paste it into ChatGPT, Claude, or your preferred AI assistant.
              </p>
            </div>

            <div className="relative">
              <div className="absolute top-3 right-3 z-10">
                <button
                  onClick={copyPromptToClipboard}
                  className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-roobert-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Prompt
                </button>
              </div>
              <textarea
                value={generatedPrompt}
                readOnly
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs h-96 resize-none"
              />
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
              <h5 className="text-xs font-roobert-bold text-gray-900 dark:text-white mb-2">Next Steps:</h5>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Click "Copy Prompt" above</li>
                <li>Paste into ChatGPT/Claude</li>
                <li>Copy the JSON response</li>
                <li>Click "Next" and paste the JSON in Step 4</li>
              </ol>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="text-sm font-roobert-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <FileJson className="w-4 h-4" />
                Paste AI Response
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Paste the complete JSON object from your AI assistant.
              </p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                AI-Generated JSON *
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 outline-none font-mono text-xs h-96 resize-none"
                placeholder='Paste the JSON here, e.g.:
{
  "name": "Improve Demo Efficiency",
  "shortName": "Demo Ops",
  ...
}'
              />
            </div>

            <button
              onClick={handleJsonSubmit}
              disabled={!jsonInput.trim()}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-roobert-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Create AI-Generated Goal
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-roobert-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  AI Goal Builder Wizard
                </h3>
                <p className="text-white/80 text-xs mt-0.5">
                  Step {currentStep} of {totalSteps}: {
                    currentStep === 1 ? 'Goal Discovery' :
                    currentStep === 2 ? 'Context & Metrics' :
                    currentStep === 3 ? 'AI Prompt' :
                    'Create Goal'
                  }
                </p>
              </div>
              <button
                onClick={() => { resetWizard(); onClose(); }}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map(step => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                      : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {renderStep()}
          </div>

          {/* Footer Navigation */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : null}
              disabled={currentStep === 1}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-roobert-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < 3 && (
              <button
                onClick={() => {
                  if (currentStep === 2) {
                    generateAIPrompt();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                {currentStep === 2 ? 'Generate AI Prompt' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 3 && (
              <button
                onClick={() => setCurrentStep(4)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                Next: Paste JSON
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

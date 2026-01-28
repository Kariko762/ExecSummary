import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Rocket, TrendingUp, CheckCircle, Copy, FileJson, DollarSign, Users } from 'lucide-react';

interface AIInitiativeBuilderWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateInitiative: (initiativeData: any) => void;
  showNotification?: (type: 'success' | 'error' | 'info', message: string) => void;
}

interface WizardData {
  // Step 1: Initiative Discovery
  initiativeName: string;
  businessProblem: string;
  strategicOpportunity: string;
  desiredImpact: string;
  timeline: string;
  
  // Step 2: Scope & Resources
  keyObjectives: string;
  targetMetrics: string;
  requiredResources: string;
  teamSize: string;
  estimatedBudget: string;
  
  // Step 3: Business Case
  currentState: string;
  targetState: string;
  proposedSolution: string;
  expectedROI: string;
  paybackPeriod: string;
  
  // Step 4: Risks & Stakeholders
  topRisks: string;
  keyStakeholders: string;
  dependencies: string;
  successCriteria: string;
}

export default function AIInitiativeBuilderWizard({ isOpen, onClose, onCreateInitiative, showNotification }: AIInitiativeBuilderWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>({
    initiativeName: '',
    businessProblem: '',
    strategicOpportunity: '',
    desiredImpact: '',
    timeline: '',
    keyObjectives: '',
    targetMetrics: '',
    requiredResources: '',
    teamSize: '',
    estimatedBudget: '',
    currentState: '',
    targetState: '',
    proposedSolution: '',
    expectedROI: '',
    paybackPeriod: '',
    topRisks: '',
    keyStakeholders: '',
    dependencies: '',
    successCriteria: ''
  });
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [jsonInput, setJsonInput] = useState('');

  const totalSteps = 5;

  const updateField = (field: keyof WizardData, value: string) => {
    setWizardData(prev => ({ ...prev, [field]: value }));
  };

  const generateAIPrompt = () => {
    const prompt = `You are a strategic initiative planning assistant for a Chief Revenue Officer. Based on the following inputs, generate a comprehensive initiative JSON object.

**INITIATIVE OVERVIEW**
Name: ${wizardData.initiativeName}
Business Problem: ${wizardData.businessProblem}
Strategic Opportunity: ${wizardData.strategicOpportunity}
Desired Impact: ${wizardData.desiredImpact}
Timeline: ${wizardData.timeline}

**SCOPE & RESOURCES**
Key Objectives: ${wizardData.keyObjectives}
Target Metrics: ${wizardData.targetMetrics}
Required Resources: ${wizardData.requiredResources}
Team Size: ${wizardData.teamSize}
Estimated Budget: ${wizardData.estimatedBudget}

**BUSINESS CASE**
Current State: ${wizardData.currentState}
Target State: ${wizardData.targetState}
Proposed Solution: ${wizardData.proposedSolution}
Expected ROI: ${wizardData.expectedROI}
Payback Period: ${wizardData.paybackPeriod}

**RISKS & STAKEHOLDERS**
Top Risks: ${wizardData.topRisks}
Key Stakeholders: ${wizardData.keyStakeholders}
Dependencies: ${wizardData.dependencies}
Success Criteria: ${wizardData.successCriteria}

**OUTPUT REQUIREMENTS**
Generate a JSON object with this exact structure:
{
  "name": "Initiative title (clear, action-oriented)",
  "shortName": "Abbreviated version (2-3 words)",
  "category": "revenue | customer | cost | innovation",
  "owner": "Role title (e.g., VP Revenue Operations)",
  "sponsor": "Executive sponsor role (e.g., CRO)",
  "status": "planning",
  "priority": "low | medium | high | critical",
  "progress": 0,
  "projectStage": "discovery | planning | mvp | pilot | scaling | complete",
  "linkedGoals": [],
  "smartGoal": {
    "statement": "One comprehensive sentence capturing the initiative's SMART goal",
    "specific": {
      "objectives": ["Clear objective 1", "Clear objective 2", "Clear objective 3"]
    },
    "measurable": {
      "metrics": ["Metric 1 with target", "Metric 2 with target"]
    },
    "achievable": {
      "resources": "Summary of available resources and tools",
      "teamSize": "Team composition (e.g., 2 FTE + 3 part-time contributors)"
    },
    "relevant": {
      "croAlignment": ["Sales Productivity", "Deal Conversion", "Customer Sat"],
      "strategicThemes": ["Theme 1", "Theme 2"]
    },
    "timeBound": {
      "timeline": [
        {
          "phase": "Discovery",
          "deliverable": "Key deliverable for this phase",
          "dueDate": "YYYY-MM-DD",
          "status": "not-started"
        },
        {
          "phase": "Planning",
          "deliverable": "Key deliverable for this phase",
          "dueDate": "YYYY-MM-DD",
          "status": "not-started"
        },
        {
          "phase": "Execution",
          "deliverable": "Key deliverable for this phase",
          "dueDate": "YYYY-MM-DD",
          "status": "not-started"
        }
      ]
    }
  },
  "businessCase": {
    "problem": "Clear problem statement",
    "opportunity": "Strategic opportunity description",
    "solution": "Proposed solution approach",
    "roi": "Expected ROI (e.g., 250% over 18 months)",
    "paybackPeriod": "Time to break even (e.g., 12 months)"
  },
  "budget": {
    "total": 0,
    "spent": 0
  },
  "topRisks": [
    {
      "risk": "Risk description",
      "level": "low | medium | high | critical",
      "mitigation": "Mitigation strategy"
    }
  ],
  "stakeholders": [
    {
      "name": "Stakeholder name or role",
      "role": "Their role in the initiative",
      "supportLevel": "champion | supporter | neutral | skeptic | blocker"
    }
  ],
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "color": "#EC4899",
  "icon": "🚀"
}

**IMPORTANT NOTES:**
- **category**: Choose based on primary impact: "revenue" (grow revenue), "customer" (improve customer experience), "cost" (reduce costs), "innovation" (new capabilities)
- **projectStage**: Start with "discovery" or "planning" based on readiness
- **croAlignment**: Select from: "Sales Productivity", "Sales Cycle Delays", "Deal Conversion", "Customer Sat", "Pipeline Risk", "Forecast Confidence"
- **topRisks**: Identify 2-4 key risks with realistic mitigation strategies
- **stakeholders**: Include 3-5 key stakeholders with their support level
- **timeline**: Create 3-5 phases with clear deliverables and realistic dates
- **budget**: Set total to estimated budget amount (in dollars, no decimals)

Ensure the initiative is:
- **Specific**: Clear objectives with measurable outcomes
- **Measurable**: Quantifiable metrics for success
- **Achievable**: Realistic given resources and constraints
- **Relevant**: Aligned with CRO/RevOps strategic priorities
- **Time-bound**: Clear phases with deadlines

Return ONLY the JSON object, no additional text.`;

    setGeneratedPrompt(prompt);
    setCurrentStep(4);
  };

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
    showNotification?.('success', 'AI prompt copied to clipboard');
  };

  const handleJsonSubmit = () => {
    try {
      const parsedInitiative = JSON.parse(jsonInput);
      
      // Validate required fields
      if (!parsedInitiative.name || !parsedInitiative.smartGoal || !parsedInitiative.businessCase) {
        showNotification?.('error', 'Invalid initiative structure - missing required fields');
        return;
      }

      // Add metadata
      const initiativeWithMetadata = {
        ...parsedInitiative,
        id: '',
        createdDate: new Date().toISOString().split('T')[0],
        lastUpdated: new Date().toISOString().split('T')[0]
      };

      onCreateInitiative(initiativeWithMetadata);
      showNotification?.('success', 'AI-generated initiative created successfully!');
      resetWizard();
      onClose();
    } catch (error) {
      showNotification?.('error', 'Invalid JSON format - please check and try again');
    }
  };

  const resetWizard = () => {
    setCurrentStep(1);
    setWizardData({
      initiativeName: '',
      businessProblem: '',
      strategicOpportunity: '',
      desiredImpact: '',
      timeline: '',
      keyObjectives: '',
      targetMetrics: '',
      requiredResources: '',
      teamSize: '',
      estimatedBudget: '',
      currentState: '',
      targetState: '',
      proposedSolution: '',
      expectedROI: '',
      paybackPeriod: '',
      topRisks: '',
      keyStakeholders: '',
      dependencies: '',
      successCriteria: ''
    });
    setGeneratedPrompt('');
    setJsonInput('');
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border-l-4 border-pink-500">
              <h4 className="text-sm font-roobert-bold text-pink-900 dark:text-pink-300 mb-2 flex items-center gap-2">
                <Rocket className="w-4 h-4" />
                Initiative Discovery
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Define the strategic initiative and its business context.
              </p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Initiative Name *
              </label>
              <input
                type="text"
                value={wizardData.initiativeName}
                onChange={(e) => updateField('initiativeName', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="e.g., Sales Enablement Platform Rollout"
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                What business problem are you solving? *
              </label>
              <textarea
                value={wizardData.businessProblem}
                onChange={(e) => updateField('businessProblem', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none h-24 resize-none"
                placeholder="Describe the current business challenge or pain point..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                What's the strategic opportunity? *
              </label>
              <textarea
                value={wizardData.strategicOpportunity}
                onChange={(e) => updateField('strategicOpportunity', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none h-24 resize-none"
                placeholder="What strategic value does this create for the organization..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                What's the desired impact? *
              </label>
              <textarea
                value={wizardData.desiredImpact}
                onChange={(e) => updateField('desiredImpact', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none h-20 resize-none"
                placeholder="Expected business outcomes and benefits..."
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
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-pink-500 outline-none"
                placeholder="e.g., Q1-Q3 2026, 6 months, By July 2026"
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
                Scope & Resources
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Define what you'll accomplish and what you need to succeed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Key Objectives *
              </label>
              <textarea
                value={wizardData.keyObjectives}
                onChange={(e) => updateField('keyObjectives', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="List the primary objectives (3-5 clear, actionable goals)..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target Metrics *
              </label>
              <textarea
                value={wizardData.targetMetrics}
                onChange={(e) => updateField('targetMetrics', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="How will success be measured? (KPIs, targets, benchmarks)..."
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Required Resources *
              </label>
              <textarea
                value={wizardData.requiredResources}
                onChange={(e) => updateField('requiredResources', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none"
                placeholder="Tools, technology, consultants, training, etc..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Team Size *
                </label>
                <input
                  type="text"
                  value={wizardData.teamSize}
                  onChange={(e) => updateField('teamSize', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., 3 FTE + 2 contractors"
                />
              </div>

              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Budget *
                </label>
                <input
                  type="text"
                  value={wizardData.estimatedBudget}
                  onChange={(e) => updateField('estimatedBudget', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., $250,000"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500">
              <h4 className="text-sm font-roobert-bold text-green-900 dark:text-green-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Business Case
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Build the financial and strategic justification.
              </p>
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Current State *
              </label>
              <textarea
                value={wizardData.currentState}
                onChange={(e) => updateField('currentState', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
                placeholder="Where are we today? What's not working?"
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Target State *
              </label>
              <textarea
                value={wizardData.targetState}
                onChange={(e) => updateField('targetState', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none h-20 resize-none"
                placeholder="Where do we want to be? What does success look like?"
              />
            </div>

            <div>
              <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                Proposed Solution *
              </label>
              <textarea
                value={wizardData.proposedSolution}
                onChange={(e) => updateField('proposedSolution', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none h-24 resize-none"
                placeholder="How will we get from current to target state?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Expected ROI *
                </label>
                <input
                  type="text"
                  value={wizardData.expectedROI}
                  onChange={(e) => updateField('expectedROI', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g., 250% over 18 months"
                />
              </div>

              <div>
                <label className="block text-sm font-roobert-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Payback Period *
                </label>
                <input
                  type="text"
                  value={wizardData.paybackPeriod}
                  onChange={(e) => updateField('paybackPeriod', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
                  placeholder="e.g., 12 months"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border-l-4 border-purple-500">
              <h4 className="text-sm font-roobert-bold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Prompt Generated
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Copy this prompt and paste it into ChatGPT, Claude, or your preferred AI assistant.
              </p>
            </div>

            <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 relative">
              <button
                onClick={copyPromptToClipboard}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-700 text-white text-xs font-roobert-medium transition-all flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Prompt
              </button>
              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-auto max-h-96 pr-24">
{generatedPrompt}
              </pre>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border-l-4 border-yellow-500">
              <h4 className="text-sm font-roobert-bold text-yellow-900 dark:text-yellow-300 mb-2">
                Next Steps
              </h4>
              <ol className="text-xs text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                <li>Copy the prompt above using the button</li>
                <li>Open ChatGPT, Claude, or your preferred AI tool</li>
                <li>Paste the prompt and wait for the JSON response</li>
                <li>Copy the entire JSON object the AI returns</li>
                <li>Click "Next: Paste JSON" below to continue</li>
              </ol>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border-l-4 border-indigo-500">
              <h4 className="text-sm font-roobert-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-2">
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
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs h-96 resize-none"
                placeholder='Paste the JSON here, e.g.:
{
  "name": "Sales Enablement Platform",
  "shortName": "Sales Enablement",
  ...
}'
              />
            </div>

            <button
              onClick={handleJsonSubmit}
              disabled={!jsonInput.trim()}
              className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-roobert-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Create AI-Generated Initiative
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
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-600 to-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-roobert-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  AI Initiative Builder Wizard
                </h3>
                <p className="text-white/80 text-xs mt-0.5">
                  Step {currentStep} of {totalSteps}: {
                    currentStep === 1 ? 'Initiative Discovery' :
                    currentStep === 2 ? 'Scope & Resources' :
                    currentStep === 3 ? 'Business Case' :
                    currentStep === 4 ? 'AI Prompt' :
                    'Create Initiative'
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
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600'
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

            {currentStep < 4 && (
              <button
                onClick={() => {
                  if (currentStep === 3) {
                    generateAIPrompt();
                  } else {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center gap-2"
              >
                {currentStep === 3 ? 'Generate AI Prompt' : 'Next'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={() => setCurrentStep(5)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 text-white font-roobert-semibold hover:shadow-lg transition-all flex items-center gap-2"
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

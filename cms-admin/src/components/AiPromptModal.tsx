import React, { useState } from 'react';
import { X, Copy, CheckCircle, Sparkles, Lightbulb, ArrowRight, AlertCircle } from 'lucide-react';

interface AiPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptType: string;
  userData: any;
  componentName: string;
  onApplyData?: (parsedData: any) => void;
}

const AiPromptModal: React.FC<AiPromptModalProps> = ({ 
  isOpen, 
  onClose, 
  promptType,
  userData,
  componentName,
  onApplyData
}) => {
  const [copied, setCopied] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedPreview, setParsedPreview] = useState<any>(null);

  if (!isOpen) return null;

  const generatePrompt = () => {
    switch (promptType) {
      case 'executiveSynthesis':
        return generateExecutiveSynthesisPrompt(userData);
      default:
        return 'No prompt template available for this component type.';
    }
  };

  const generateExecutiveSynthesisPrompt = (data: any) => {
    const hasContext = data?.context?.trim();
    const hasProblem = data?.problem?.trim();
    const hasSolution = data?.solution?.trim();
    const hasRecommendation = data?.recommendation?.trim();
    const hasAsks = data?.asks && data.asks.length > 0;

    return `You are an executive communication expert. I need help structuring an Executive Synthesis following the CPSAR framework (Context, Problem, Solution, Action, Results).

**MY CURRENT DATA:**

${hasContext ? `**Context:**
${data.context}
` : '**Context:** [Not provided yet]'}

${hasProblem ? `**Problem:**
${data.problem}
` : '**Problem:** [Not provided yet]'}

${hasSolution ? `**Solution:**
${data.solution}
` : '**Solution:** [Not provided yet]'}

${hasRecommendation ? `**Recommendation:**
${data.recommendation}
` : '**Recommendation:** [Not provided yet]'}

${hasAsks ? `**Current Asks:**
${data.asks.map((ask: any, idx: number) => 
  `${idx + 1}. [${ask.type?.toUpperCase()}] ${ask.item} (Urgency: ${ask.urgency || 'medium'})${ask.owner ? ` - Owner: ${ask.owner}` : ''}${ask.deadline ? ` - Deadline: ${ask.deadline}` : ''}`
).join('\n')}
` : '**Asks:** [Not provided yet]'}

**TASK:**
Please help me refine this executive synthesis to be:
1. **Concise** - Each section should be 2-3 sentences maximum
2. **Action-oriented** - Focus on what needs to happen, not just what happened
3. **Executive-level** - Appropriate for C-suite audience (no jargon, strategic focus)
4. **Specific** - Include concrete numbers, dates, and owners where possible

**CRITICAL - OUTPUT FORMAT:**
You MUST return your response as valid JSON in this EXACT structure (no markdown, no code blocks, just raw JSON):

{
  "context": "Your refined context text here",
  "problem": "Your refined problem text here",
  "solution": "Your refined solution text here",
  "recommendation": "Your refined recommendation text here",
  "asks": [
    {
      "type": "budget",
      "item": "Specific ask description",
      "urgency": "high",
      "owner": "Person Name",
      "deadline": "Date"
    }
  ]
}

IMPORTANT: 
- type must be one of: budget, decision, resource, approval, escalation
- urgency must be one of: low, medium, high
- Return ONLY the JSON object, no explanations before or after`;
  };

  const parseAiResponse = (response: string): any => {
    try {
      // Try to extract JSON if wrapped in markdown code blocks
      let jsonStr = response.trim();
      
      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      
      // Parse JSON
      const parsed = JSON.parse(jsonStr);
      
      // Validate structure for executiveSynthesis
      if (promptType === 'executiveSynthesis') {
        if (!parsed.context && !parsed.problem && !parsed.solution && !parsed.recommendation && !parsed.asks) {
          throw new Error('Response must contain at least one field: context, problem, solution, recommendation, or asks');
        }
        
        // Validate asks array if present
        if (parsed.asks && Array.isArray(parsed.asks)) {
          parsed.asks.forEach((ask: any, idx: number) => {
            if (!ask.type || !ask.item) {
              throw new Error(`Ask ${idx + 1} must have 'type' and 'item' fields`);
            }
            if (!['budget', 'decision', 'resource', 'approval', 'escalation'].includes(ask.type)) {
              throw new Error(`Ask ${idx + 1} has invalid type. Must be: budget, decision, resource, approval, or escalation`);
            }
            if (ask.urgency && !['low', 'medium', 'high'].includes(ask.urgency)) {
              throw new Error(`Ask ${idx + 1} has invalid urgency. Must be: low, medium, or high`);
            }
          });
        }
      }
      
      return parsed;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON format. Please ensure the AI response is valid JSON.');
      }
      throw error;
    }
  };

  const handleAiResponseChange = (value: string) => {
    setAiResponse(value);
    setParseError(null);
    setParsedPreview(null);
    
    if (value.trim()) {
      try {
        const parsed = parseAiResponse(value);
        setParsedPreview(parsed);
      } catch (error: any) {
        setParseError(error.message);
      }
    }
  };

  const handleApplyChanges = () => {
    if (parsedPreview && onApplyData) {
      onApplyData(parsedPreview);
      onClose();
    }
  };

  const handleCopy = async () => {
    const prompt = generatePrompt();
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const prompt = generatePrompt();
  const hasData = prompt.includes('**MY CURRENT DATA:**');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-roobert-bold text-gray-900">AI Prompt Generator</h2>
              <p className="text-sm text-gray-600 font-roobert-regular">{componentName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-roobert-bold text-blue-900 mb-1">How to use this prompt:</h3>
                <ol className="text-sm text-blue-800 font-roobert-regular space-y-1 list-decimal list-inside">
                  <li>Copy the prompt below using the button</li>
                  <li>Paste it into ChatGPT, Claude, or your preferred AI assistant</li>
                  <li>Review the AI's refined version</li>
                  <li>Copy back the improved text into your form fields</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Examples Section */}
          <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
            <h3 className="text-sm font-roobert-bold text-purple-900 mb-2">Example Use Cases:</h3>
            <ul className="text-sm text-purple-800 font-roobert-regular space-y-1.5">
              <li>• <strong>Refine rough notes</strong> - Turn bullet points into polished executive communication</li>
              <li>• <strong>Check tone</strong> - Ensure language is appropriate for C-suite audience</li>
              <li>• <strong>Improve asks</strong> - Make requests more specific and actionable</li>
              <li>• <strong>Reduce length</strong> - Condense verbose explanations to key points</li>
              <li>• <strong>Add specificity</strong> - AI can suggest where to add numbers, dates, or owners</li>
            </ul>
          </div>

          {/* Prompt Code Block */}
          <div className="relative">
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-sm text-gray-100 font-mono whitespace-pre-wrap leading-relaxed">
                {prompt}
              </pre>
            </div>
            
            {/* Copy Button */}
            <button
              onClick={handleCopy}
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
                  <span className="text-sm font-roobert-medium text-gray-700">Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Data Status */}
          {hasData && (
            <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
              <p className="text-sm text-green-800 font-roobert-medium">
                ✓ Your current data has been included in the prompt above
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>

          {/* AI Response Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-roobert-bold text-gray-900">Step 2: Paste AI Response</h3>
              {parsedPreview && (
                <span className="text-sm text-green-600 font-roobert-medium flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Valid JSON detected
                </span>
              )}
            </div>
            
            <textarea
              value={aiResponse}
              onChange={(e) => handleAiResponseChange(e.target.value)}
              placeholder="Paste the AI's JSON response here..."
              className="w-full h-64 px-4 py-3 border-2 border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />

            {/* Parse Error */}
            {parseError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-roobert-bold text-red-900 mb-1">Parse Error</p>
                    <p className="text-sm text-red-800 font-roobert-regular">{parseError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview */}
            {parsedPreview && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="text-sm font-roobert-bold text-purple-900 mb-2">Preview Changes:</h4>
                <div className="space-y-2 text-sm">
                  {parsedPreview.context && (
                    <div>
                      <span className="font-roobert-bold text-purple-800">Context:</span>
                      <p className="text-purple-700 font-roobert-regular mt-1">{parsedPreview.context}</p>
                    </div>
                  )}
                  {parsedPreview.problem && (
                    <div>
                      <span className="font-roobert-bold text-purple-800">Problem:</span>
                      <p className="text-purple-700 font-roobert-regular mt-1">{parsedPreview.problem}</p>
                    </div>
                  )}
                  {parsedPreview.solution && (
                    <div>
                      <span className="font-roobert-bold text-purple-800">Solution:</span>
                      <p className="text-purple-700 font-roobert-regular mt-1">{parsedPreview.solution}</p>
                    </div>
                  )}
                  {parsedPreview.recommendation && (
                    <div>
                      <span className="font-roobert-bold text-purple-800">Recommendation:</span>
                      <p className="text-purple-700 font-roobert-regular mt-1">{parsedPreview.recommendation}</p>
                    </div>
                  )}
                  {parsedPreview.asks && parsedPreview.asks.length > 0 && (
                    <div>
                      <span className="font-roobert-bold text-purple-800">Asks ({parsedPreview.asks.length}):</span>
                      <ul className="text-purple-700 font-roobert-regular mt-1 space-y-1">
                        {parsedPreview.asks.map((ask: any, idx: number) => (
                          <li key={idx}>• [{ask.type}] {ask.item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-roobert-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-sm font-roobert-medium text-purple-700 bg-purple-100 hover:bg-purple-200 rounded-lg transition-all"
            >
              {copied ? 'Copied!' : 'Copy Prompt'}
            </button>
            
            {parsedPreview && onApplyData && (
              <button
                onClick={handleApplyChanges}
                className="px-5 py-2 text-sm font-roobert-bold text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Apply Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiPromptModal;

# Next Features Plan - December 13, 2025

## 1. AI Modal Wizard (Multi-Step Flow)

### Current Issue:
Single-page modal is overwhelming - too much information and actions on one screen.

### Proposed Solution: 3-Step Wizard

**Step 1: Setup & Preview**
- Instructions on how the AI system works
- Preview of YOUR current data that will be sent
- Data completeness check (which fields are filled)
- "Next" button to proceed

**Step 2: Generate Prompt**
- Display the formatted prompt in code block
- Copy button with visual feedback
- Usage examples and tips
- External AI tool suggestions (ChatGPT, Claude, Gemini)
- "Back" and "Next" buttons

**Step 3: Apply Response**
- Large textarea for pasting AI response
- Real-time JSON validation
- Preview panel showing parsed changes
- "Back" button and "Apply Changes" button
- Success/error states

### UI Elements:
- Progress indicator (1 of 3, 2 of 3, 3 of 3)
- Breadcrumb trail or step dots
- Smooth transitions between pages
- Persistent header with component name
- Context preserved across steps

---

## 2. Executive Synthesis Format Switcher

### Current Issue:
Only supports CPSAR framework. Organizations use different communication methodologies.

### Proposed Solution: Multi-Format Support

**Supported Formats:**

1. **CPSAR** (Current - Default)
   - Context
   - Problem
   - Solution
   - Action/Recommendation
   - Results/Asks

2. **BLUF** (Bottom Line Up Front - Military Style)
   - Bottom Line (1-2 sentences - THE answer)
   - Background (What led to this)
   - Assessment (Analysis of situation)
   - Recommendation (What to do)
   - Asks (Resources/decisions needed)

3. **SBAR** (Healthcare/Operations Standard)
   - Situation (What's happening now)
   - Background (Context and history)
   - Assessment (What I think the problem is)
   - Recommendation (What I think should be done)

4. **Pyramid Principle** (McKinsey/Consulting)
   - Main Argument (The answer)
   - Key Supporting Points (3 major reasons)
   - Supporting Details (Evidence)
   - Next Steps (Recommendations)

### Implementation Details:

**Schema Changes:**
```typescript
interface ExecutiveSynthesisData {
  format: 'cpsar' | 'bluf' | 'sbar' | 'pyramid';
  
  // CPSAR fields
  context?: string;
  problem?: string;
  solution?: string;
  recommendation?: string;
  asks?: Ask[];
  
  // BLUF fields
  bottomLine?: string;
  background?: string;
  assessment?: string;
  
  // SBAR fields
  situation?: string;
  
  // Pyramid fields
  mainArgument?: string;
  keyPoints?: string[];
  supportingDetails?: string;
  nextSteps?: string;
}
```

**UI Components:**
- Format switcher dropdown in edit mode (top-right, next to AI button)
- Dynamic form fields based on selected format
- Format-specific icons and colors
- Format name displayed in header badge

**AI Prompt Templates:**
- Each format has unique prompt template
- Format-specific validation rules
- JSON structure adapts to format
- Examples tailored to each methodology

**Display Mode:**
- Format name badge/indicator
- Format-specific styling and icons
- Conditional rendering based on format
- Maintains design system consistency

### Migration Strategy:
- Existing data defaults to 'cpsar' format
- Format field optional (backward compatible)
- No breaking changes to existing templates

---

## Implementation Order:

1. **First:** Commit current AI Modal v1 to git
2. **Then:** Implement AI Modal Wizard (Step 1, 2, 3)
3. **Finally:** Add Executive Synthesis format switcher

---

## Git Commit Message (Current State):

```
feat: Add AI-assisted content refinement system

- Created AiPromptModal component with JSON parsing
- Integrated AI Assist button into ExecutiveSynthesisRenderer
- Two-way workflow: Copy prompt → Paste response → Auto-apply
- Real-time validation with preview panel
- Reduced Executive Synthesis display spacing for better density
- Smart JSON extraction (handles markdown code blocks)
- Field validation for types and urgency values

Features:
- Generate prompts with user's current data included
- Parse AI responses and validate structure
- Preview changes before applying
- One-click merge into form fields
- Error handling with helpful messages

Ready for: Multi-step wizard and format switcher
```

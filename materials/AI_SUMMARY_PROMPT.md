# Executive Summary Generation Prompt

## Instructions
Use this prompt with the materials documents to generate a structured executive summary in BLUF format with priorities, risks, and milestones.

---

## PROMPT TO COPY/PASTE

```
You are an executive communications assistant helping to synthesize leadership updates from multiple data sources. Your task is to analyze the provided documents and generate a structured executive summary following the BLUF (Bottom Line Up Front) format.

INPUT DOCUMENTS:
- summary.md (Weekly Leadership Summary JSON data)
- workstreams-detail.md (Detailed workstream breakdown)
- weekly-report-jan26-feb1.md (Weekly report format)
- summary_actual.md (Previous leadership email)

OUTPUT REQUIREMENTS:

Generate a comprehensive executive summary with the following sections:

---

## 1. BLUF (Bottom Line Up Front)

### Bottom Line (2-3 sentences)
Concise statement of the most critical information executives need to know immediately. Focus on strategic deals, key milestones, and critical blockers.

### Background (3-4 bullet points)
Context needed to understand the bottom line. Include:
- Strategic initiatives and their current status
- Key stakeholder involvement
- Timeline/deadline context

### Assessment (Structured by category)
**Strategic Progress:**
- [List achievements and forward momentum]

**Cross-Team Collaboration:**
- [List successful partnerships and alignments]

**Critical Risks:**
- [List immediate threats or blockers]

### Recommendations (Action-oriented bullets)
- [Specific next steps to maintain momentum]
- [Escalation paths for blockers]
- [Priority initiatives to advance]

---

## 2. PRIORITIES (Top 3-5)

For each priority, provide:

### Priority [N]: [Title]
**Status:** [In Progress | Blocked | Completed | Not Started]
**Impact:** [HIGH IMPACT | MEDIUM IMPACT | LOW IMPACT]
**Likelihood:** [High | Medium | Low] (probability of success/completion)

**Description:**
[1-2 sentences explaining what this priority is and why it matters]

**Impact:**
[Specific business impact if successful]

**Action Items:**
- [Concrete next steps]
- [Owners and deadlines where applicable]

---

## 3. RISKS

For each risk, provide:

### [Severity Level] Risk: [Title]
**Severity:** [Critical | High | Medium | Low]
**Probability:** [High Probability | Medium Probability | Low Probability]
**Status:** [Open | Mitigating | Closed]
**Owner:** [Person/Team responsible]

**Description:**
[1-2 sentences explaining the risk and potential impact]

**Mitigation:**
[Current or planned mitigation strategy]

---

## 4. MILESTONES & DEADLINES

Extract and list all deadlines, due dates, and key milestones mentioned in the documents:

**Immediate (This Week):**
- [Item] - [Date] - [Owner]

**Short-term (Next 2 Weeks):**
- [Item] - [Date] - [Owner]

**Medium-term (This Month):**
- [Item] - [Date] - [Owner]

---

## 5. EXECUTIVE ASKS (if applicable)

For each ask requiring executive decision/approval:

### [Urgency]: [Type] - [Item]
**Owner:** [Who needs to act]
**Deadline:** [When]
**Context:** [Why this is needed]

Urgency levels: High | Medium | Low
Types: Approval | Decision | Resource | Escalation

---

ANALYSIS GUIDELINES:

1. **Prioritize by Impact:** Focus on items affecting revenue, strategic deals, or critical operations
2. **Be Specific:** Include dollar amounts, dates, and named stakeholders
3. **Show Connections:** Link related items across workstreams (e.g., Coast MSA impacts multiple initiatives)
4. **Highlight Blockers:** Clearly identify what's preventing progress and who can unblock
5. **Extract Metrics:** Pull out any quantifiable data (deal size, completion %, number of items)
6. **Maintain Executive Voice:** Professional, concise, action-oriented language
7. **Deduplicate:** If the same item appears in multiple sources, consolidate into one entry
8. **Timeline Awareness:** Note if deadlines are approaching or past due

---

FORMATTING RULES:

- Use markdown formatting for structure
- Bold key terms and severity/status labels
- Use bullet points for lists
- Keep paragraphs to 2-3 sentences maximum
- Include owner/deadline on every action item
- Use present tense for current status, future tense for next steps

---

OUTPUT FORMAT:

Provide the complete summary in markdown format, ready to paste into an email or presentation. Start with the BLUF section, followed by Priorities, Risks, Milestones, and Executive Asks.
```

---

## HOW TO USE THIS PROMPT

1. **Copy the prompt above** (everything in the code block)
2. **Attach/paste the four materials documents:**
   - summary.md
   - workstreams-detail.md
   - weekly-report-jan26-feb1.md
   - summary_actual.md
3. **Submit to your AI engine** (ChatGPT, Claude, Copilot, etc.)
4. **Review the output** and customize as needed
5. **Use the generated summary** for leadership communications

---

## CUSTOMIZATION OPTIONS

You can modify the prompt to:
- **Focus on specific workstreams:** Add "Focus primarily on Coast MSA and Demo Operations"
- **Adjust detail level:** Add "Keep each section to 5 bullets maximum" or "Provide expanded detail"
- **Change audience:** Add "Tailor language for CFO audience" or "Technical detail for Engineering leads"
- **Add sections:** Include "Team Wins" or "Resource Requests"
- **Time period:** Specify "Cover only last 7 days" or "Include next 30-day outlook"

---

## EXPECTED OUTPUT QUALITY

The AI should generate:
- ✅ Clear, executive-level language
- ✅ Specific dates, names, and amounts
- ✅ Actionable recommendations
- ✅ Properly categorized risks and priorities
- ✅ Complete milestone timeline
- ✅ Ready-to-send format

If output is too verbose, add to prompt: "Limit each section to maximum 5 key points"
If output is too vague, add to prompt: "Include all specific dates, names, and dollar amounts from source documents"

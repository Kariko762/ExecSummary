import React from 'react';

const PAQ_COLORS = {
  magenta: '#CB009F',
  navy: '#0F1822',
  white: '#FFFFFF',
  lightGray: '#F5F5F5'
};

type PipelineSection = {
  title: string;
  subtitle: string;
  whatItIs: string;
  howItWorks: string;
  whyItCompounds: string;
  businessProblem: string[];
  beforeAfter: { before: string[]; after: string[] };
  internalExample: string[];
  ownershipModel: string[];
  maturityPath: string[];
  inputs: string[];
  outputs: string[];
  talkingPoints: string[];
  guardrails: string[];
};

const pipelines: PipelineSection[] = [
  {
    title: 'Medical Education Factory',
    subtitle: 'Evidence -> Learning Platform',
    whatItIs:
      'Converts clinical evidence into modular learning content that can be assembled and updated quickly. Focuses on repeatability and compliance across multiple channels, with learning assets structured for reuse in digital education platforms.',
    howItWorks:
      'Starts with clinical data and curated evidence. That evidence is structured into learning objectives, then mapped into modules, assessments, and SCORM-ready packages. The output is a learning library that stays current as evidence evolves.',
    whyItCompounds:
      'Once a structured knowledge base and module template exist, each new evidence update flows through the same pipeline. You do not rebuild content from scratch. You update the core truth set and regenerate all dependent modules.',
    businessProblem: [
      'Repeated course rebuilds when evidence changes',
      'Inconsistent learning quality across regions or brands',
      'High LMS update costs and slow release cycles'
    ],
    beforeAfter: {
      before: [
        'Manual rebuilds of slide decks and PDFs',
        'Static content that drifts from evidence',
        'Slow updates and duplicated effort'
      ],
      after: [
        'Modules regenerate from a single truth set',
        'Consistent quality across channels',
        'Updates propagate quickly and safely'
      ]
    },
    internalExample: [
      'A new study lands and 12 learning modules update in one cycle',
      'A label change updates every course and assessment automatically'
    ],
    ownershipModel: [
      'Truth set owner: Medical education lead',
      'Regeneration approval: MLR + education ops',
      'Change governance: Evidence steering group'
    ],
    maturityPath: [
      'Phase 1: Manual structuring with AI assist',
      'Phase 2: Semi-automated module regeneration',
      'Phase 3: Fully orchestrated LMS updates'
    ],
    inputs: [
      'Clinical study data and abstracts',
      'Medical education objectives and target audiences',
      'Existing training materials or course outlines'
    ],
    outputs: [
      'Structured learning modules',
      'SCORM packages and LMS-ready assets',
      'Instructor guides and learner assessments'
    ],
    talkingPoints: [
      'We are not building a one-off course. We are building a repeatable education factory.',
      'Each new study updates all downstream modules automatically.'
    ],
    guardrails: [
      'Ensure MLR review for all external-facing modules',
      'Track versioning and evidence provenance'
    ]
  },
  {
    title: 'Omnichannel Campaign Engine',
    subtitle: 'Strategy -> Persona -> Channel',
    whatItIs:
      'Turns one core narrative into many compliant, channel-specific assets. It standardizes the story first, then adapts it to multiple audiences and formats without losing alignment.',
    howItWorks:
      'A core narrative is created from approved strategy and evidence. It is translated into persona-specific messaging, adapted to each channel, checked for compliance, and published as coordinated assets across digital and field channels.',
    whyItCompounds:
      'A single approved narrative becomes a source of truth for dozens of assets. When the narrative changes, the system re-derives all versions, preserving brand and compliance consistency.',
    businessProblem: [
      'Content duplication across channels and teams',
      'Inconsistent messaging and compliance risk',
      'Slow updates when strategy shifts'
    ],
    beforeAfter: {
      before: [
        'Each channel rewrites the narrative separately',
        'Manual compliance checks for every asset',
        'Lag between strategy and execution'
      ],
      after: [
        'One narrative powers many channel outputs',
        'Compliance baked into generation and review',
        'Fast propagation of messaging updates'
      ]
    },
    internalExample: [
      'One narrative change propagates to 40 assets across channels',
      'Persona translation updates field decks and email in one pass'
    ],
    ownershipModel: [
      'Truth set owner: Brand strategy lead',
      'Regeneration approval: Marketing ops + MLR',
      'Change governance: Brand council'
    ],
    maturityPath: [
      'Phase 1: AI-assisted narrative structuring',
      'Phase 2: Persona and channel templates',
      'Phase 3: Fully orchestrated omnichannel release'
    ],
    inputs: [
      'Brand strategy and positioning',
      'Persona insights and segmentation',
      'Channel requirements and constraints'
    ],
    outputs: [
      'Persona-specific messaging',
      'Channel-ready assets (email, web, social, sales enablement)',
      'Compliance-approved variations'
    ],
    talkingPoints: [
      'One truth, many expressions.',
      'We keep brand consistency while scaling output.'
    ],
    guardrails: [
      'Compliance check before distribution',
      'Central ownership of the narrative source file'
    ]
  },
  {
    title: 'Evidence-to-Access Pipeline',
    subtitle: 'HEOR -> Market Access Assets',
    whatItIs:
      'Converts clinical and economic outcomes into market access narratives and payer-ready artifacts. Ensures that HEOR evidence becomes consistent, defensible access materials.',
    howItWorks:
      'HEOR outputs and clinical outcomes are structured into a value narrative. That narrative is translated into payer-facing materials, stakeholder-specific framing, and update loops for new evidence.',
    whyItCompounds:
      'As new evidence is generated, the same structured narrative updates multiple access artifacts at once. Payer materials stay aligned without repeated re-authoring.',
    businessProblem: [
      'Value narratives drift across regions and markets',
      'Payer materials require frequent rewrites',
      'Slow response to new evidence or competitor moves'
    ],
    beforeAfter: {
      before: [
        'HEOR insights manually translated into decks',
        'Inconsistent payer narratives',
        'Long cycles to update dossiers'
      ],
      after: [
        'Structured value narrative drives all access assets',
        'Aligned messaging across stakeholders',
        'Rapid updates when evidence changes'
      ]
    },
    internalExample: [
      'A new endpoint shifts and all payer materials update in one cycle',
      'A single economic model update refreshes regional access packs'
    ],
    ownershipModel: [
      'Truth set owner: HEOR lead',
      'Regeneration approval: Market access lead + compliance',
      'Change governance: Value evidence board'
    ],
    maturityPath: [
      'Phase 1: AI-assisted evidence structuring',
      'Phase 2: Narrative templates and update loops',
      'Phase 3: Automated dossier regeneration'
    ],
    inputs: [
      'HEOR data and value evidence',
      'Clinical outcomes and endpoints',
      'Payer insights and access requirements'
    ],
    outputs: [
      'Value narratives and payer dossiers',
      'Stakeholder-specific access materials',
      'Update-ready evidence packages'
    ],
    talkingPoints: [
      'We convert evidence into access artifacts, not just slides.',
      'New data updates everything downstream.'
    ],
    guardrails: [
      'Maintain evidence traceability and source citations',
      'Align value claims with approved economic models'
    ]
  },
  {
    title: 'MLR and Governance Automation',
    subtitle: 'Scale with Safety',
    whatItIs:
      'Embeds compliance into the workflow itself. Turns policy documents into machine-readable rules that power automated preflight checks, reviewer packs, and audit trails.',
    howItWorks:
      'Policies and regulatory constraints are extracted into structured rules. Content goes through automated preflight checks, reviewer-ready packs are generated, approvals are routed, and audit logs are produced post-publication.',
    whyItCompounds:
      'Once policies are codified, they are reused across all content. This reduces review cycles and minimizes rework while increasing compliance confidence.',
    businessProblem: [
      'MLR cycles slow down time to market',
      'Inconsistent interpretation of policies',
      'Limited auditability and traceability'
    ],
    beforeAfter: {
      before: [
        'Manual review and repeated rework',
        'Policy interpretation varies by reviewer',
        'Sparse audit trails'
      ],
      after: [
        'Rule-based preflight checks reduce rework',
        'Consistent policy application',
        'Clear approval and audit logs'
      ]
    },
    internalExample: [
      'A new claim is checked against rules before review',
      'Reviewer packs auto-include evidence links and logs'
    ],
    ownershipModel: [
      'Truth set owner: Compliance lead',
      'Regeneration approval: MLR chair',
      'Change governance: Regulatory policy board'
    ],
    maturityPath: [
      'Phase 1: Rule extraction and tagging',
      'Phase 2: Automated preflight checks',
      'Phase 3: Orchestrated approval workflows'
    ],
    inputs: [
      'MLR policies and regulatory guidance',
      'Approved claims and references',
      'Content drafts and assets'
    ],
    outputs: [
      'Preflight compliance results',
      'Reviewer packs with evidence references',
      'Approval routing and audit logs'
    ],
    talkingPoints: [
      'Compliance becomes a system, not a bottleneck.',
      'We shift from manual review to rule-driven consistency.'
    ],
    guardrails: [
      'Regularly update rule sets with policy changes',
      'Maintain human oversight for high-risk content'
    ]
  },
  {
    title: 'SME Knowledge Capture Engine',
    subtitle: 'Tribal Knowledge -> Scalable IP',
    whatItIs:
      'Transforms subject-matter expertise into structured, reusable knowledge assets. Prevents loss of institutional knowledge and enables consistent content creation across teams.',
    howItWorks:
      'SME interviews and artifacts are captured, structured into knowledge models, and used to generate content and delivery assets. Drift detection monitors when knowledge needs updating.',
    whyItCompounds:
      'Each captured insight becomes reusable IP. The more expertise you encode, the faster you can generate new content without repeated SME time.',
    businessProblem: [
      'Critical knowledge lives in people, not systems',
      'Repeated SME time for similar requests',
      'Inconsistent guidance across teams'
    ],
    beforeAfter: {
      before: [
        'SMEs answer the same questions repeatedly',
        'Knowledge inconsistently applied',
        'Loss of expertise when staff change'
      ],
      after: [
        'Knowledge captured once and reused',
        'Consistent guidance across teams',
        'Institutional memory preserved'
      ]
    },
    internalExample: [
      'One SME interview powers FAQs, briefs, and training',
      'Knowledge updates cascade to all dependent materials'
    ],
    ownershipModel: [
      'Truth set owner: Knowledge lead',
      'Regeneration approval: SME owner',
      'Change governance: Content stewardship group'
    ],
    maturityPath: [
      'Phase 1: Interview capture and tagging',
      'Phase 2: Structured knowledge models',
      'Phase 3: Copilot-ready knowledge services'
    ],
    inputs: [
      'SME interviews and recordings',
      'Existing guidelines and internal documentation',
      'Key use cases and target audiences'
    ],
    outputs: [
      'Structured knowledge models',
      'Reusable content libraries',
      'Copilot-ready guidance and FAQs'
    ],
    talkingPoints: [
      'We turn expertise into institutional memory.',
      'SME time is preserved and amplified.'
    ],
    guardrails: [
      'Confirm SME approval for encoded knowledge',
      'Track ownership and update cadence'
    ]
  },
  {
    title: 'Digital Learning Platform Builder',
    subtitle: 'Story -> Course -> Experience',
    whatItIs:
      'Builds learning experiences from story and evidence, turning them into structured courses with measurable outcomes. Supports full lifecycle design, from needs analysis to optimization.',
    howItWorks:
      'Learning needs are defined, journeys are designed, content is produced, and performance data is used to improve the experience. Each step produces artifacts that improve the next iteration.',
    whyItCompounds:
      'Course elements, assessments, and templates are reused across programs. Insights from learners improve future modules without re-designing from scratch.',
    businessProblem: [
      'Learning programs take too long to build',
      'Limited reuse of instructional assets',
      'Slow iteration based on learner feedback'
    ],
    beforeAfter: {
      before: [
        'Course design starts from zero each time',
        'Low reuse of templates and assessments',
        'Slow feedback cycles'
      ],
      after: [
        'Reusable course patterns and assets',
        'Continuous improvement from data',
        'Faster build and update cycles'
      ]
    },
    internalExample: [
      'One course template creates three regional variants quickly',
      'Learner analytics update future modules in weeks, not months'
    ],
    ownershipModel: [
      'Truth set owner: Learning design lead',
      'Regeneration approval: Education ops',
      'Change governance: Learning governance council'
    ],
    maturityPath: [
      'Phase 1: Standardized course templates',
      'Phase 2: Semi-automated content production',
      'Phase 3: Full lifecycle optimization loop'
    ],
    inputs: [
      'Learning objectives and audience profiles',
      'Evidence-based content and SME input',
      'Platform requirements and analytics goals'
    ],
    outputs: [
      'Course journeys and lesson plans',
      'Interactive learning modules and assessments',
      'Optimization insights and performance dashboards'
    ],
    talkingPoints: [
      'We operate a learning factory, not a one-off course build.',
      'Each iteration improves the next.'
    ],
    guardrails: [
      'Ensure accessibility and compliance standards',
      'Maintain version control for learning assets'
    ]
  }
];

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: PAQ_COLORS.navy,
  marginBottom: '8px'
};

const h1Style: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: PAQ_COLORS.navy,
  margin: '8px 0 6px'
};

const h2Style: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 700,
  color: PAQ_COLORS.navy,
  margin: '22px 0 10px',
  backgroundColor: `${PAQ_COLORS.magenta}14`,
  borderLeft: `4px solid ${PAQ_COLORS.magenta}`,
  padding: '8px 12px',
  borderRadius: '6px'
};

const h3Style: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: PAQ_COLORS.magenta,
  margin: '12px 0 6px'
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.6',
  color: `${PAQ_COLORS.navy}CC`,
  marginBottom: '8px'
};

const listStyle: React.CSSProperties = {
  fontSize: '12px',
  lineHeight: '1.5',
  color: `${PAQ_COLORS.navy}CC`,
  margin: '6px 0 10px 18px'
};

const sectionPanelStyle: React.CSSProperties = {
  backgroundColor: PAQ_COLORS.lightGray,
  border: '1px solid #E5E7EB',
  borderRadius: '8px',
  padding: '10px',
  marginBottom: '10px'
};

export default function PrecisionAQMultiStepSupportingDocument() {
  return (
    <div style={{ backgroundColor: PAQ_COLORS.white, minHeight: '100vh' }}>
      <style>
        {`
          @media print {
            @page {
              size: A4;
              margin: 14mm;
            }

            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '32px 24px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
          <img
            src="/vendor-logos/precision-aq-logo-full-color.svg"
            alt="Precision AQ"
            style={{ height: '36px' }}
          />
          <div style={{ fontSize: '12px', color: `${PAQ_COLORS.navy}99` }}>Supporting Document</div>
        </div>

        <h1 style={h1Style}>Precision AQ AI Multi-Step Pipelines - Supporting Document</h1>
        <p style={paragraphStyle}>
          This document expands the brief labels from the AI Use Cases PDF into clear explanations
          and talking points. It is written for cross-functional teams who need to understand,
          explain, and defend the value of these pipelines.
        </p>

        <h2 style={h2Style}>Purpose</h2>
        <p style={paragraphStyle}>
          Provide a deeper explanation of each pipeline so leaders and teams can speak to how it
          works, what it produces, and why it matters.
        </p>

        <h2 style={h2Style}>Executive Framing</h2>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Problem framing</div>
          <ul style={listStyle}>
            <li>Single-step AI fails to scale because it creates rework, inconsistency, and governance risk.</li>
            <li>Content teams are bottlenecked by MLR cycles, version drift, and duplicated effort.</li>
            <li>Manual re-translation of the same evidence into different formats drives cost and delay.</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Business outcomes</div>
          <ul style={listStyle}>
            <li>Speed to market through repeatable pipelines and faster updates.</li>
            <li>Regulatory confidence through evidence traceability and review gates.</li>
            <li>Lower cost of rework by reusing artifacts across channels.</li>
            <li>Knowledge retention via structured truth sets and ownership models.</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Positioning for execs</div>
          <p style={paragraphStyle}>
            We are not buying tools. We are redesigning operating models so evidence and expertise
            produce repeatable outputs with governance built in.
          </p>
        </div>

        <h2 style={h2Style}>How to Use This Document</h2>
        <ul style={listStyle}>
          <li>Read the Overview once to understand the core logic of multi-step pipelines.</li>
          <li>Use each pipeline section as a script for live conversations and Q and A.</li>
          <li>Reference Inputs, Outputs, and Guardrails to tailor to your audience.</li>
        </ul>

        <h2 style={h2Style}>Overview: What "Multi-Step Pipelines" Mean</h2>
        <p style={paragraphStyle}>
          A multi-step pipeline is a connected workflow where each step produces an artifact that
          makes the next step faster, safer, and higher quality. The compounding effect is the
          value. Instead of one-off AI outputs, pipelines create reusable assets (truth sets,
          structured knowledge, templates, or rules) that power many downstream deliverables.
        </p>
        <p style={paragraphStyle}>
          Single-step AI accelerates a task. Multi-step pipelines change the operating model by
          turning expertise and evidence into durable, governed, and scalable systems.
        </p>

        <h2 style={h2Style}>Artifacts: What They Are and Why They Matter</h2>
        <p style={paragraphStyle}>
          Artifacts are the reusable building blocks that carry value from one step to the next.
          They make pipelines defensible because they are structured and hard to replicate.
        </p>
        <ul style={listStyle}>
          <li>Examples: truth sets, structured narratives, modular learning blocks, compliance rule sets.</li>
          <li>Flow: Evidence -&gt; Truth Set -&gt; Modules -&gt; Channels.</li>
          <li>Defensibility: artifacts become institutional IP, not just prompts.</li>
        </ul>

        <h2 style={h2Style}>Key Evidence Point</h2>
        <p style={paragraphStyle}>
          65 percent of organizations now use generative AI regularly. This signals that
          competitive advantage is no longer about access to AI. It is about how well your
          organization designs repeatable, governed workflows that turn AI into consistent
          business outputs.
        </p>

        {pipelines.map((pipeline) => (
          <div
            key={pipeline.title}
            style={{
              marginTop: '18px',
              padding: '14px',
              backgroundColor: PAQ_COLORS.lightGray,
              borderRadius: '10px',
              border: '1px solid #E5E7EB'
            }}
          >
            <div
              style={{
                backgroundColor: `${PAQ_COLORS.magenta}12`,
                borderLeft: `4px solid ${PAQ_COLORS.magenta}`,
                padding: '8px 10px',
                borderRadius: '6px',
                marginBottom: '10px'
              }}
            >
              <div style={sectionTitleStyle}>{pipeline.title}</div>
              <div style={{ fontSize: '12px', color: `${PAQ_COLORS.navy}99` }}>{pipeline.subtitle}</div>
            </div>

            <h3 style={h3Style}>What it is</h3>
            <p style={paragraphStyle}>{pipeline.whatItIs}</p>

            <h3 style={h3Style}>How it works</h3>
            <p style={paragraphStyle}>{pipeline.howItWorks}</p>

            <h3 style={h3Style}>Why it compounds</h3>
            <p style={paragraphStyle}>{pipeline.whyItCompounds}</p>

            <h3 style={h3Style}>Business problem it solves</h3>
            <ul style={listStyle}>
              {pipeline.businessProblem.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Before vs after operating model</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Before</div>
                <ul style={listStyle}>
                  {pipeline.beforeAfter.before.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>After</div>
                <ul style={listStyle}>
                  {pipeline.beforeAfter.after.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h3 style={h3Style}>Internal example</h3>
            <ul style={listStyle}>
              {pipeline.internalExample.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Ownership model</h3>
            <ul style={listStyle}>
              {pipeline.ownershipModel.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Maturity path</h3>
            <ul style={listStyle}>
              {pipeline.maturityPath.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Inputs</h3>
            <ul style={listStyle}>
              {pipeline.inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Outputs</h3>
            <ul style={listStyle}>
              {pipeline.outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Talking points</h3>
            <ul style={listStyle}>
              {pipeline.talkingPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <h3 style={h3Style}>Guardrails</h3>
            <ul style={listStyle}>
              {pipeline.guardrails.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <h2 style={h2Style}>Governance and Risk Deep Dive</h2>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Risk areas</div>
          <ul style={listStyle}>
            <li>Hallucination risk in generated content</li>
            <li>Compliance drift over time</li>
            <li>SME misalignment and inconsistent interpretation</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Controls</div>
          <ul style={listStyle}>
            <li>Evidence traceability and citation linking</li>
            <li>Human-in-the-loop review gates</li>
            <li>Version control for truth sets and artifacts</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>What auditors care about</div>
          <ul style={listStyle}>
            <li>Provenance of claims and evidence</li>
            <li>Review logs and approval trails</li>
            <li>Clear ownership and change governance</li>
          </ul>
        </div>

        <h2 style={h2Style}>How to Start (Implementation Guidance)</h2>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>What a good first pipeline looks like</div>
          <ul style={listStyle}>
            <li>High-volume content with frequent updates</li>
            <li>Multi-channel or regulated distribution</li>
            <li>Clear owner for the truth source</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>90-day starter plan</div>
          <ul style={listStyle}>
            <li>Pick one pipeline and define the artifacts</li>
            <li>Assign a truth set owner and reviewer</li>
            <li>Run a pilot regeneration loop</li>
            <li>Measure time-to-update and rework reduction</li>
          </ul>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>Common failure modes</div>
          <ul style={listStyle}>
            <li>Starting with tools instead of workflows</li>
            <li>No ownership of truth sets</li>
            <li>Treating this as automation, not operating model change</li>
          </ul>
        </div>

        <h2 style={h2Style}>Leadership Q and A (Objection Handling)</h2>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: Why not just use AI to draft content quickly?
          </div>
          <p style={paragraphStyle}>
            A: Drafting is useful, but it does not scale. Pipelines create reusable artifacts so
            every output improves the next.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: Where is the real ROI?
          </div>
          <p style={paragraphStyle}>
            A: ROI comes from repeatable assets, reduced rework, faster updates, and fewer
            compliance cycles across every release.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: Is this just content automation with extra steps?
          </div>
          <p style={paragraphStyle}>
            A: No. The extra steps create artifacts that make every future output faster, safer,
            and more consistent. That is the operating model change.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: Why not just use Copilot or ChatGPT for this?
          </div>
          <p style={paragraphStyle}>
            A: Those tools are great for drafts. Pipelines manage evidence, compliance, and reuse
            across channels. That requires governance and structured assets.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: What happens when evidence changes weekly?
          </div>
          <p style={paragraphStyle}>
            A: You update the truth set once, then regenerate all dependent assets. That is the
            compounding value of pipelines.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: How do we prevent AI sprawl and shadow workflows?
          </div>
          <p style={paragraphStyle}>
            A: Assign ownership, define approved pipelines, and enforce governance gates. Central
            truth sets reduce chaos.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: What skills do teams actually need to run this?
          </div>
          <p style={paragraphStyle}>
            A: Workflow design, evidence stewardship, and governance skills. The tools are
            secondary to operating discipline.
          </p>
        </div>
        <div style={sectionPanelStyle}>
          <div style={{ fontWeight: 700, color: PAQ_COLORS.navy, fontSize: '12px', marginBottom: '4px' }}>
            Q: Is this safe for regulated content?
          </div>
          <p style={paragraphStyle}>
            A: Yes, when governance is built into the workflow with evidence traceability and
            review gates.
          </p>
        </div>

        <h2 style={h2Style}>Notes on Costs and Time (Context)</h2>
        <p style={paragraphStyle}>
          The AI-accelerated approach compresses work into hours, not days, by reusing structured
          assets and automating repetitive steps. Traditional workflows require multiple
          specialists re-authoring content for each channel and update. The largest savings come
          from eliminating repeated manual translation of the same evidence into multiple formats.
        </p>

        <h2 style={h2Style}>ROI Narrative: Why the Savings Exist</h2>
        <ul style={listStyle}>
          <li>Artifact reuse eliminates re-translation work across channels.</li>
          <li>Fewer MLR cycles due to structured evidence and preflight checks.</li>
          <li>Faster updates reduce opportunity cost and compliance risk.</li>
        </ul>
        <p style={paragraphStyle}>
          Early pilots may underreport ROI because teams are investing in structuring truth sets.
          The payoff increases with each reuse cycle.
        </p>

        <h2 style={h2Style}>Glossary</h2>
        <ul style={listStyle}>
          <li>Truth set: the structured source of evidence and approved claims.</li>
          <li>Artifact: reusable output that feeds downstream steps.</li>
          <li>Regeneration loop: automated update of dependent assets when evidence changes.</li>
          <li>Pipeline orchestration: coordination of steps, owners, and governance gates.</li>
        </ul>

        <h2 style={h2Style}>Anti-Patterns to Avoid</h2>
        <ul style={listStyle}>
          <li>Prompt chaos: ungoverned, inconsistent outputs across teams.</li>
          <li>Tool-first transformation: buying AI without workflow redesign.</li>
          <li>Orphaned artifacts: no owner for truth sets or templates.</li>
        </ul>

        <h2 style={h2Style}>Org Design Implications</h2>
        <ul style={listStyle}>
          <li>AI workflow owner: accountable for pipeline performance and updates.</li>
          <li>Truth steward: maintains evidence quality and provenance.</li>
          <li>Governance architect: ensures compliance and audit readiness.</li>
        </ul>
      </div>
    </div>
  );
}

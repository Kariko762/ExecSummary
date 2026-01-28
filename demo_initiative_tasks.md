# Demo Services Initiative Task Backlog (Draft)

> Each task is a JSON object following your required schema. Adjust owners/products/BUs and dates as needed.


## Demo Platform Standardisation & Rationalisation

**initiativeId:** `demo-platform-standardisation`

```json
{
  "id": "task-1769461058581-q2gz2k786f",
  "title": "Define approved demo platform standards (reference architectures)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Platform Architect",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Platform Standards",
  "budget": "45,000",
  "startDate": "2026-02-01",
  "targetDate": "2026-03-31",
  "description": "Produce 2\u20133 approved reference architectures and publish mandatory standards for new demo builds.",
  "milestones": "Discovery | Architecture Draft | Security Review | Publication",
  "risks": "Stakeholder disagreement; security review delays",
  "dependencies": "IT Architecture availability; InfoSec review windows",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-platform-standardisation",
  "linkedGoals": [
    "automate-demo-prep"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581367",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581337",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581554",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581717",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-lfxbcltde7",
  "title": "Execute rationalisation Wave 1 (retire/migrate highest-risk demos)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Platform Lead",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Priority Demo Environments",
  "budget": "180,000",
  "startDate": "2026-04-01",
  "targetDate": "2026-06-30",
  "description": "Migrate/retire the top 20% of highest-risk legacy demos to approved platforms; reduce incidents and assign owners.",
  "milestones": "Prioritisation | Migration Plans | Execution | Stabilisation",
  "risks": "Deal disruption during migration; hidden legacy complexity",
  "dependencies": "Standards published; cloud capacity; SE owner sign-off",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-platform-standardisation",
  "linkedGoals": [
    "automate-demo-prep"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581978",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581954",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581887",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581163",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-k5yjpfy2jr",
  "title": "Complete rationalisation Wave 2 and enforce platform compliance",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Legacy Estate",
  "budget": "320,000",
  "startDate": "2027-07-01",
  "targetDate": "2027-12-31",
  "description": "Scale migration/retirement to reach 85% demos on approved platforms and reduce support cost/complexity.",
  "milestones": "Wave Planning | Execution | Compliance Enforcement | Executive Review",
  "risks": "Platform capacity constraints; change fatigue",
  "dependencies": "Wave 1 lessons learned; IT Ops migration capacity; governance enforcement",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-platform-standardisation",
  "linkedGoals": [
    "automate-demo-prep"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581482",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581299",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581760",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581336",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Automated Demo Provisioning & Factory (Coast)

**initiativeId:** `automated-demo-provisioning-factory`

```json
{
  "id": "task-1769461058581-9z2xm14lwh",
  "title": "Coast automation design + platform integrations",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Automation Product Owner",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Coast Automation",
  "budget": "90,000",
  "startDate": "2026-05-01",
  "targetDate": "2026-06-30",
  "description": "Define automation patterns and integrate Coast with approved platforms; confirm security controls.",
  "milestones": "Requirements | Integration Design | Security Review | Build Plan",
  "risks": "Integration constraints; identity/secrets challenges",
  "dependencies": "Platform standards; Coast licensing; DevOps support",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "automated-demo-provisioning-factory",
  "linkedGoals": [
    "automate-demo-prep",
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581337",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581376",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581365",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581835",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-nhp9n77n3v",
  "title": "Build automated provisioning MVP for pilot demos",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Automation Engineering Lead",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Pilot Demo Blueprints",
  "budget": "180,000",
  "startDate": "2026-07-01",
  "targetDate": "2026-09-30",
  "description": "Deliver one-click provisioning for pilot demos with automated validation and rollback.",
  "milestones": "Blueprints | Pipelines | Validation | MVP Go-Live",
  "risks": "Automation instability; incomplete blueprints",
  "dependencies": "Pilot scope confirmed; cloud permissions; test data readiness",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "automated-demo-provisioning-factory",
  "linkedGoals": [
    "automate-demo-prep",
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581253",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581290",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581395",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581440",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-467nd7k6vq",
  "title": "Scale factory coverage and self-service provisioning",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Provisioning Factory Scale",
  "budget": "180,000",
  "startDate": "2026-10-01",
  "targetDate": "2027-12-31",
  "description": "Expand coverage to 75% and deliver role-based self-service provisioning for Sales/SE teams.",
  "milestones": "Scale Plan | Rollout Waves | Training | Optimisation",
  "risks": "Low adoption; platform variance across business units",
  "dependencies": "Support model; documentation; monitoring/incident response",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "automated-demo-provisioning-factory",
  "linkedGoals": [
    "automate-demo-prep",
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581892",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581400",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581677",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581944",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Data Automation & Refresh

**initiativeId:** `demo-data-automation-refresh`

```json
{
  "id": "task-1769461058581-h07mazjq49",
  "title": "Define certified demo dataset catalog and refresh requirements",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Data Lead",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Demo Datasets",
  "budget": "35,000",
  "startDate": "2026-07-01",
  "targetDate": "2026-08-31",
  "description": "Create the catalog of demo datasets, refresh SLAs, and validation rules aligned to compliance standards.",
  "milestones": "Dataset Inventory | Refresh SLA | Validation Rules | Sign-off",
  "risks": "Unclear dataset ownership; inconsistent sources",
  "dependencies": "Asset registry coverage; owners nominated; compliance guidance",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-automation-refresh",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581981",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581104",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581638",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581272",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-7700d9dpbb",
  "title": "Build automated refresh + seeding pipelines for priority demos",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Data Automation Engineer",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Refresh Automation",
  "budget": "120,000",
  "startDate": "2026-09-01",
  "targetDate": "2026-12-31",
  "description": "Implement automated refresh jobs, seed scripts, and validation checks for priority demo environments.",
  "milestones": "Pipeline Build | Validation | UAT | Production Rollout",
  "risks": "Source system limits; pipeline failures",
  "dependencies": "Data engineering support; test envs; monitoring access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-automation-refresh",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581248",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581216",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581901",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581808",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058581-9lp5d0s1lm",
  "title": "Expand refresh automation coverage and reduce stale-data incidents",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Refresh Scale",
  "budget": "65,000",
  "startDate": "2027-01-01",
  "targetDate": "2027-12-31",
  "description": "Extend automation to 95% coverage and establish quarterly review cadence.",
  "milestones": "Onboard Waves | Monitor | Improve | Quarterly Reviews",
  "risks": "Maintenance burden; refresh windows variance",
  "dependencies": "Platform adoption; compliance certification process",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-automation-refresh",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058581667",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581628",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581697",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058581294",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Capacity & Scheduling Optimisation

**initiativeId:** `demo-capacity-scheduling-optimisation`

```json
{
  "id": "task-1769461058582-phpg37qu86",
  "title": "Baseline capacity model + SLA definition",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Operations Analyst",
  "team": "Demo Operations",
  "businessUnit": "All",
  "product": "Capacity Model",
  "budget": "25,000",
  "startDate": "2026-08-01",
  "targetDate": "2026-09-15",
  "description": "Establish current demo capacity, demand forecasting, and target SLA model across business lines.",
  "milestones": "Data Pull | Model Build | Leadership Review | Approval",
  "risks": "Incomplete activity data; competing priorities",
  "dependencies": "Telemetry availability; Sales Ops inputs; leadership approval",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-capacity-scheduling-optimisation",
  "linkedGoals": [
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582163",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582647",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582473",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582316",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-t6zylomtf2",
  "title": "Implement scheduling + routing improvements",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Operations Lead",
  "team": "Demo Operations",
  "businessUnit": "All",
  "product": "Scheduling Workflow",
  "budget": "55,000",
  "startDate": "2026-09-16",
  "targetDate": "2026-10-31",
  "description": "Deploy improved scheduling workflow (priority routing, escalation, coverage rules) to improve SLA.",
  "milestones": "Workflow Design | Tool Config | Training | Go-Live",
  "risks": "Low adoption; exceptions bypass process",
  "dependencies": "Sales Ops cooperation; tooling access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-capacity-scheduling-optimisation",
  "linkedGoals": [
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582135",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582459",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582871",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582754",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-cucdsbmlvs",
  "title": "Reallocate prep savings into presentation time (operational rollout)",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Operations",
  "businessUnit": "All",
  "product": "Capacity Reallocation",
  "budget": "70,000",
  "startDate": "2026-11-01",
  "targetDate": "2027-12-31",
  "description": "Operationalize reallocation plan and run quarterly capacity reviews to hit presentation-hours target.",
  "milestones": "Rollout | Monitor | Quarterly Review | Optimise",
  "risks": "Prep savings delayed; regional staffing gaps",
  "dependencies": "Automation roadmap delivery; reporting dashboards live",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-capacity-scheduling-optimisation",
  "linkedGoals": [
    "increase-presentation-time"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582192",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582451",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582147",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582636",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Tiled Microsites & Self-Service Demo Experience

**initiativeId:** `tiled-microsites-self-service-experience`

```json
{
  "id": "task-1769461058582-iqojp7xwqm",
  "title": "Expand Tiled licensing + governance model",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Tiled Program Manager",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Tiled Platform",
  "budget": "60,000",
  "startDate": "2026-06-01",
  "targetDate": "2026-07-31",
  "description": "Secure expanded licenses, define governance (templates, publishing, review), and onboard creators.",
  "milestones": "Licensing | Governance | Onboarding | Admin Setup",
  "risks": "Procurement delays; uncontrolled microsite sprawl",
  "dependencies": "Budget approval; IT security review; enablement support",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "tiled-microsites-self-service-experience",
  "linkedGoals": [
    "demo-lead-generation"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582977",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582854",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582688",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582523",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-ro7719oo2w",
  "title": "Build microsite template library (persona journeys)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Experience Designer",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Microsite Templates",
  "budget": "90,000",
  "startDate": "2026-08-01",
  "targetDate": "2026-09-30",
  "description": "Create reusable microsite templates with embedded demo paths, CTAs, and analytics hooks.",
  "milestones": "Design | Build | QA | Pilot Publish",
  "risks": "Template mismatch to selling motion; content backlog",
  "dependencies": "Figma funding; product marketing inputs; analytics standards",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "tiled-microsites-self-service-experience",
  "linkedGoals": [
    "demo-lead-generation"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582732",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582635",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582731",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582415",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-68jcbzmlls",
  "title": "Launch self-service demos + lead capture at scale",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Self-Service Demos",
  "budget": "150,000",
  "startDate": "2026-10-01",
  "targetDate": "2027-12-31",
  "description": "Roll out microsites and self-service demos to reach lead/pipeline targets with ongoing optimisation.",
  "milestones": "Pilot | Seller Rollout | Scale | Optimise",
  "risks": "Seller adoption; compliance constraints",
  "dependencies": "CRM integration; content factory throughput",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "tiled-microsites-self-service-experience",
  "linkedGoals": [
    "demo-lead-generation"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582517",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582995",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582766",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582640",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Enablement & Content Factory

**initiativeId:** `demo-enablement-content-factory`

```json
{
  "id": "task-1769461058582-cuhfb0s39r",
  "title": "Stand up design workflow (Figma) for demo experiences",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Enablement Lead",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Design Workflow",
  "budget": "40,000",
  "startDate": "2026-07-01",
  "targetDate": "2026-08-31",
  "description": "Create a repeatable design system for demo assets and Tiled microsites, including review gates and versioning.",
  "milestones": "Tooling | Design System | Review Gates | Training",
  "risks": "Funding delays; inconsistent adoption",
  "dependencies": "Figma procurement; marketing alignment",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-enablement-content-factory",
  "linkedGoals": [
    "demo-lead-generation",
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582807",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582881",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582535",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582748",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-ugeloolfy7",
  "title": "AI video factory (Synthesia) + content standards",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Content Producer",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "AI Demo Videos",
  "budget": "65,000",
  "startDate": "2026-09-01",
  "targetDate": "2026-11-30",
  "description": "Produce AI video components for demos/microsites with quality standards, approvals, and reuse patterns.",
  "milestones": "Scripts | Production | Review | Publishing",
  "risks": "Quality perception; brand/legal approvals",
  "dependencies": "Synthesia licensing; brand guidelines; legal review cadence",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-enablement-content-factory",
  "linkedGoals": [
    "demo-lead-generation",
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582583",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582124",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582672",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582292",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-dp2ajpoveb",
  "title": "Enablement rollout: playbooks, training, adoption metrics",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Sales Enablement Partner",
  "team": "Sales Enablement",
  "businessUnit": "All",
  "product": "Enablement Rollout",
  "budget": "145,000",
  "startDate": "2026-12-01",
  "targetDate": "2027-12-31",
  "description": "Deliver training and playbooks so sellers/SEs adopt standard assets; track adoption and outcomes.",
  "milestones": "Playbooks | Training | Certification | Quarterly Reviews",
  "risks": "Training fatigue; low completion",
  "dependencies": "Leadership mandate; analytics instrumentation",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-enablement-content-factory",
  "linkedGoals": [
    "demo-lead-generation",
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582150",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582900",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582644",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582657",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Intelligence & NPS Platform

**initiativeId:** `demo-intelligence-nps-platform`

```json
{
  "id": "task-1769461058582-8dvynmm107",
  "title": "Define demo intelligence metrics + event taxonomy",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Analytics Product Owner",
  "team": "RevOps Analytics",
  "businessUnit": "All",
  "product": "Telemetry Standards",
  "budget": "30,000",
  "startDate": "2026-08-01",
  "targetDate": "2026-09-15",
  "description": "Define canonical demo activity event model and executive KPIs.",
  "milestones": "Workshop | Metrics Spec | Taxonomy | Approval",
  "risks": "Taxonomy complexity; stakeholder misalignment",
  "dependencies": "RevOps alignment; CRM object model access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-intelligence-nps-platform",
  "linkedGoals": [
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582750",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582444",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582270",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582549",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-7g87qbujqc",
  "title": "Deliver executive dashboard MVP (coverage + SLA)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "BI Developer",
  "team": "RevOps Analytics",
  "businessUnit": "All",
  "product": "Executive Dashboard",
  "budget": "70,000",
  "startDate": "2026-09-16",
  "targetDate": "2026-10-31",
  "description": "Ship dashboard MVP across business lines (coverage, SLA, volume, incidents, hours).",
  "milestones": "Data Model | Build | UAT | Launch",
  "risks": "Data quality gaps; performance issues",
  "dependencies": "Telemetry feeds; stakeholder UAT; BI access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-intelligence-nps-platform",
  "linkedGoals": [
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582880",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582391",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582758",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582583",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-uniwplvpoj",
  "title": "Implement demo NPS + closed-loop improvements",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Customer Insights Lead",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Demo NPS",
  "budget": "80,000",
  "startDate": "2026-11-01",
  "targetDate": "2027-12-31",
  "description": "Deploy NPS surveys and create monthly improvement loop tied to content and platform fixes.",
  "milestones": "Survey Design | Rollout | Monthly Reviews | Optimisation",
  "risks": "Low response rate; feedback bias",
  "dependencies": "Sales participation; survey tooling; remediation ownership",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-intelligence-nps-platform",
  "linkedGoals": [
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582383",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582981",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582742",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582951",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo-to-Revenue Attribution & Integration

**initiativeId:** `demo-to-revenue-attribution-integration`

```json
{
  "id": "task-1769461058582-us57y5ybyd",
  "title": "Design attribution model + required CRM/Finance fields",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "RevOps Program Manager",
  "team": "Revenue Operations",
  "businessUnit": "All",
  "product": "Attribution Model",
  "budget": "45,000",
  "startDate": "2026-09-01",
  "targetDate": "2026-10-15",
  "description": "Define demo influence model and required CRM/finance data capture.",
  "milestones": "Model Design | Data Requirements | Sign-off | Build Plan",
  "risks": "Attribution disputes; data gaps",
  "dependencies": "Finance validation; CRM admin support",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-to-revenue-attribution-integration",
  "linkedGoals": [
    "integrated-demo-ecosystem-roi-attribution"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582632",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582855",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582300",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582557",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-cskol0hm2t",
  "title": "Implement CRM instrumentation + opportunity linkage",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "CRM Delivery Lead",
  "team": "CRM Team",
  "businessUnit": "All",
  "product": "CRM Integration",
  "budget": "120,000",
  "startDate": "2026-10-16",
  "targetDate": "2026-11-30",
  "description": "Build CRM objects/automations to link demo events to opportunities and surface attribution reporting.",
  "milestones": "Config/Dev | Testing | UAT | Production",
  "risks": "CRM limits; workflow regression risk",
  "dependencies": "Telemetry event model; sandbox availability; release windows",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-to-revenue-attribution-integration",
  "linkedGoals": [
    "integrated-demo-ecosystem-roi-attribution"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582166",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582992",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582974",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582775",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-ew3abezdvs",
  "title": "Publish ROI dashboards + quarterly exec ROI reviews",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Finance Analytics Lead",
  "team": "Finance",
  "businessUnit": "All",
  "product": "ROI Reporting",
  "budget": "115,000",
  "startDate": "2026-12-01",
  "targetDate": "2027-12-31",
  "description": "Deliver ROI dashboards and run quarterly exec ROI reviews to guide prioritisation.",
  "milestones": "Dashboard Build | Validation | Adoption | Quarterly Reviews",
  "risks": "Incomplete revenue linkage; definition drift",
  "dependencies": "Stable data pipelines; agreed definitions; exec sponsorship",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-to-revenue-attribution-integration",
  "linkedGoals": [
    "integrated-demo-ecosystem-roi-attribution"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582325",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582849",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582906",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582609",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Asset Registry & Governance

**initiativeId:** `demo-asset-registry-governance`

```json
{
  "id": "task-1769461058582-3ohb1sjjzb",
  "title": "Define registry schema + required asset metadata",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Asset Governance Lead",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Asset Registry",
  "budget": "25,000",
  "startDate": "2026-02-01",
  "targetDate": "2026-03-15",
  "description": "Define metadata standards and approval gates for all demo assets.",
  "milestones": "Schema | Lifecycle | Governance | Sign-off",
  "risks": "Burdensome metadata; unclear ownership",
  "dependencies": "SE leadership participation; product marketing taxonomy",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-asset-registry-governance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582447",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582234",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582487",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582598",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-vnspvp7rmu",
  "title": "Deploy registry tooling + onboard priority assets",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Operations Lead",
  "team": "Demo Operations",
  "businessUnit": "All",
  "product": "Registry Rollout",
  "budget": "55,000",
  "startDate": "2026-03-16",
  "targetDate": "2026-06-30",
  "description": "Configure registry tool and onboard priority assets; publish operating cadence.",
  "milestones": "Tool Config | Onboarding | Training | Go-Live",
  "risks": "Low submission rate; adoption risk",
  "dependencies": "Tool procurement; owner nominations; comms plan",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-asset-registry-governance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582452",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582829",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582472",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582234",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-gvl250yt87",
  "title": "Run quarterly verification and lifecycle enforcement",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Operations",
  "businessUnit": "All",
  "product": "Verification & Lifecycle",
  "budget": "60,000",
  "startDate": "2026-07-01",
  "targetDate": "2027-12-31",
  "description": "Quarterly verification audits, retire outdated assets, enforce registry compliance for support eligibility.",
  "milestones": "Audit Cycle | Retirements | Reporting | Improvements",
  "risks": "Pushback on retirements; audit overhead",
  "dependencies": "Executive mandate; resourcing for remediation",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-asset-registry-governance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582253",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582756",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582799",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582104",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Data Quality & Compliance

**initiativeId:** `demo-data-quality-compliance`

```json
{
  "id": "task-1769461058582-8nhersj84c",
  "title": "Publish demo data compliance standards (PII, synthetic data, controls)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Compliance Lead",
  "team": "Information Security",
  "businessUnit": "All",
  "product": "Demo Data Standards",
  "budget": "30,000",
  "startDate": "2026-02-15",
  "targetDate": "2026-05-31",
  "description": "Define and approve standards for demo datasets and prohibited data; include certification checklist and audit process.",
  "milestones": "Draft | Legal Review | InfoSec Approval | Publish",
  "risks": "Legal delays; inconsistent adoption",
  "dependencies": "InfoSec/legal availability; data owner alignment",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-quality-compliance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582486",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582733",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582440",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582648",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-fzjt0g1eug",
  "title": "Certify priority demo datasets and remediate gaps",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Data Owner",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Dataset Certification",
  "budget": "45,000",
  "startDate": "2026-06-01",
  "targetDate": "2026-09-30",
  "description": "Certify priority datasets used in active demos; remediate non-compliant sources and document evidence.",
  "milestones": "Assess | Remediate | Certify | Record",
  "risks": "Hidden PII in sources; remediation larger than expected",
  "dependencies": "Dataset inventory; SME availability; source access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-quality-compliance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582939",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582243",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582348",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582922",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-lvszqqpkir",
  "title": "Operationalize compliance audits and exception handling",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Risk & Controls Manager",
  "team": "Risk Management",
  "businessUnit": "All",
  "product": "Audit Operations",
  "budget": "45,000",
  "startDate": "2026-10-01",
  "targetDate": "2027-12-31",
  "description": "Run audit cadence, manage exceptions, and ensure compliance status is visible in dashboards and registry.",
  "milestones": "Audit Cadence | Exceptions | Reporting | Continuous Improvement",
  "risks": "Exception volume; audit fatigue",
  "dependencies": "Registry integration; enforcement policy; leadership support",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-data-quality-compliance",
  "linkedGoals": [
    "demo-asset-governance"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582364",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582795",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582513",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582971",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Standard Demo Narratives & Persona Flows

**initiativeId:** `standard-demo-narratives-persona-flows`

```json
{
  "id": "task-1769461058582-ksrmx7vie7",
  "title": "Define persona frameworks and value narratives",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Narrative Lead",
  "team": "Product Marketing",
  "businessUnit": "All",
  "product": "Persona Frameworks",
  "budget": "30,000",
  "startDate": "2026-06-01",
  "targetDate": "2026-07-31",
  "description": "Create 6 core persona narratives aligned to strategic products; include proof points and objections.",
  "milestones": "Workshops | Drafts | Review | Approval",
  "risks": "Cross-region misalignment; too generic",
  "dependencies": "Product marketing bandwidth; SE input",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "standard-demo-narratives-persona-flows",
  "linkedGoals": [
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582704",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582130",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582287",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582334",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-u5l5srvbe8",
  "title": "Build standard demo flows and reusable scene library",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Demo Experience Designer",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Standard Demo Flows",
  "budget": "60,000",
  "startDate": "2026-08-01",
  "targetDate": "2026-09-30",
  "description": "Translate narratives into standard flows and reusable assets (scenes, scripts, data, CTAs).",
  "milestones": "Flow Design | Asset Build | QA | Pilot",
  "risks": "Backlog; product dependencies",
  "dependencies": "Content factory throughput; environment access",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "standard-demo-narratives-persona-flows",
  "linkedGoals": [
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582267",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582917",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582413",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582444",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-da56m9yn5e",
  "title": "Roll out playbooks + measure conversion uplift",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Sales Enablement Partner",
  "team": "Sales Enablement",
  "businessUnit": "All",
  "product": "Playbooks & Measurement",
  "budget": "70,000",
  "startDate": "2026-10-01",
  "targetDate": "2027-12-31",
  "description": "Deploy playbooks/training and drive win-rate uplift via coaching loops.",
  "milestones": "Training | Adoption | Coaching | Optimisation",
  "risks": "Low usage; measurement gaps",
  "dependencies": "Telemetry + attribution initiatives; leadership reinforcement",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "standard-demo-narratives-persona-flows",
  "linkedGoals": [
    "demo-storytelling-excellence"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582622",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582885",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582710",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582768",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Demo Localization Programme

**initiativeId:** `demo-localization-programme`

```json
{
  "id": "task-1769461058582-insopitn3j",
  "title": "Select priority languages/regions and localization workflow",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Localization Program Manager",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Localization Planning",
  "budget": "35,000",
  "startDate": "2026-07-01",
  "targetDate": "2026-08-15",
  "description": "Agree 6 strategic languages and define translation workflow, SME review, and versioning standards.",
  "milestones": "Priorities | Workflow | Vendor Selection | Sign-off",
  "risks": "Priority disputes; vendor lead times",
  "dependencies": "Regional leadership input; vendor procurement",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-localization-programme",
  "linkedGoals": [
    "demo-localization"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582916",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582698",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582743",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582921",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-7bgit5qxhs",
  "title": "Localize Wave 1 assets (top demos) and validate with regions",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Localization Lead",
  "team": "Localization Team",
  "businessUnit": "EMEA/APAC",
  "product": "Top Demo Assets",
  "budget": "100,000",
  "startDate": "2026-08-16",
  "targetDate": "2026-10-31",
  "description": "Localize priority demos into first 3 languages; complete regional validation and publish.",
  "milestones": "Translation | SME Review | QA | Publish",
  "risks": "Quality issues; brand/legal delays",
  "dependencies": "Content readiness; SME availability; platform multilingual support",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-localization-programme",
  "linkedGoals": [
    "demo-localization"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582211",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582763",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582274",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582891",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-swhyp8mi3p",
  "title": "Scale localization to 6 languages and operationalize updates",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Localization Scale",
  "budget": "85,000",
  "startDate": "2026-11-01",
  "targetDate": "2027-12-31",
  "description": "Extend localization to all target languages and establish update cadence tied to asset lifecycle and releases.",
  "milestones": "Wave 2/3 | Governance | Update Cadence | Adoption Reviews",
  "risks": "Maintenance overhead; uneven adoption",
  "dependencies": "Asset lifecycle governance; enablement rollout",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "demo-localization-programme",
  "linkedGoals": [
    "demo-localization"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582295",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582711",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582720",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582903",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```


## Strategic Product Pilot Programme

**initiativeId:** `strategic-product-pilot-programme`

```json
{
  "id": "task-1769461058582-s053wow6l8",
  "title": "Select 3 strategic pilot products (one per business line)",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Pilot Program Manager",
  "team": "Demo Services",
  "businessUnit": "All",
  "product": "Pilot Selection",
  "budget": "25,000",
  "startDate": "2026-08-01",
  "targetDate": "2026-09-15",
  "description": "Agree pilot products across Banking, International, and Capital Markets with success metrics and owners.",
  "milestones": "Criteria | Shortlist | Approval | Kick-off",
  "risks": "Scope creep; unclear ownership",
  "dependencies": "Pre-sales alignment; product management commitment",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "strategic-product-pilot-programme",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-lead-generation",
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582604",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582805",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582437",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582915",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-rravc4kw0n",
  "title": "Deliver end-to-end demo transformation pilots",
  "status": "On Track",
  "priority": "High",
  "percentage": 0,
  "owner": "Head of Demo Services",
  "team": "Demo Enablement",
  "businessUnit": "All",
  "product": "Pilot Delivery",
  "budget": "200,000",
  "startDate": "2026-09-16",
  "targetDate": "2026-12-31",
  "description": "Implement full model for pilots: standard platform, automation, data refresh, narratives, and microsites where applicable.",
  "milestones": "Design | Build | Validate | Launch",
  "risks": "Pilot complexity; cross-initiative dependencies",
  "dependencies": "Platform standards; Coast MVP; compliance; content readiness",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "strategic-product-pilot-programme",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-lead-generation",
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582263",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582368",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582796",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582851",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

```json
{
  "id": "task-1769461058582-wh9gt1ecyf",
  "title": "Publish pilot-to-scale playbook and replicate patterns",
  "status": "On Track",
  "priority": "Medium",
  "percentage": 0,
  "owner": "RevOps Program Manager",
  "team": "Revenue Operations",
  "businessUnit": "All",
  "product": "Scale Playbook",
  "budget": "75,000",
  "startDate": "2027-01-01",
  "targetDate": "2027-12-31",
  "description": "Document lessons learned and replicate patterns to at least 6 additional strategic products.",
  "milestones": "Playbook | Replication Waves | Reviews | Continuous Improvement",
  "risks": "Reversion to old patterns; insufficient change mgmt",
  "dependencies": "Executive sponsorship; training resources; portfolio governance",
  "linkType": "initiative",
  "goalId": "",
  "initiativeId": "strategic-product-pilot-programme",
  "linkedGoals": [
    "automate-demo-prep",
    "demo-lead-generation",
    "demo-intelligence-nps"
  ],
  "tags": [],
  "steps": [
    {
      "id": "step-1769461058582128",
      "step": "Kick-off + confirm scope and acceptance criteria",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582751",
      "step": "Execute workstream deliverables",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582434",
      "step": "Validate outcomes with stakeholders (UAT / review)",
      "state": "Pending"
    },
    {
      "id": "step-1769461058582854",
      "step": "Publish artifacts and transition to BAU support",
      "state": "Pending"
    }
  ],
  "createdAt": "2026-01-26T20:45:00.000Z",
  "updatedAt": "2026-01-26T20:45:00.000Z",
  "enabledFields": {
    "owner": true,
    "team": true,
    "businessUnit": true,
    "product": true,
    "startDate": true,
    "targetDate": true,
    "budget": true,
    "description": true,
    "milestones": true,
    "risks": true,
    "dependencies": true,
    "steps": true
  }
}
```

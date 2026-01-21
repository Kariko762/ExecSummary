import type { GanttTemplate, GanttTask } from '../types/initiativeGantt';

/**
 * Pre-defined Gantt Templates for Common Demo Development Workflows
 */

// ========== COAST DEPLOYMENT TEMPLATE ==========
export const COAST_SIMPLE_TEMPLATE: GanttTemplate = {
  id: 'coast-simple',
  name: 'Deploy Coast Simple',
  description: 'Standard Coast virtualization deployment for single product demo (6-8 weeks)',
  category: 'coast',
  estimatedDuration: 7, // weeks
  variables: [
    { key: 'organization', label: 'Organization/BU', type: 'select', options: ['Capital Markets', 'Banking', 'International Banking'], required: true },
    { key: 'product', label: 'Product Name', type: 'text', required: true },
    { key: 'owner', label: 'Project Owner', type: 'text', required: true },
    { key: 'buOwner', label: 'Business Owner', type: 'text', required: true }
  ],
  taskStructure: [
    {
      id: '{{organization}}-planning',
      name: '{{organization}} - Planning',
      type: 'phase',
      startDate: '', // Calculated
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#8B5CF6',
      children: [
        {
          id: 'kickoff',
          name: 'Kick-off Meeting',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          status: 'not-started'
        },
        {
          id: 'requirements',
          name: 'Requirements Gathering',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 3,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['kickoff'],
          status: 'not-started'
        },
        {
          id: 'design-review',
          name: 'Design Concept Review',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['requirements'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-development',
      name: '{{organization}} - Development',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#10B981',
      children: [
        {
          id: 'coast-setup',
          name: 'Coast Environment Setup',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 5,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['design-review'],
          status: 'not-started'
        },
        {
          id: 'data-config',
          name: 'Demo Data Configuration',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 4,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['coast-setup'],
          status: 'not-started'
        },
        {
          id: 'initial-draft',
          name: 'Initial Draft Development',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 7,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['data-config'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-review',
      name: '{{organization}} - Review & Testing',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#F59E0B',
      children: [
        {
          id: 'internal-review',
          name: 'Internal Review',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 3,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['initial-draft'],
          status: 'not-started'
        },
        {
          id: 'revisions',
          name: 'Revisions & Refinements',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 4,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['internal-review'],
          status: 'not-started'
        },
        {
          id: 'se-training',
          name: 'SE Training Session',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['revisions'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-release',
      name: '{{organization}} - Production Release',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#EF4444',
      children: [
        {
          id: 'prod-deploy',
          name: 'Production Deployment',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['se-training'],
          status: 'not-started'
        },
        {
          id: 'go-live',
          name: '{{product}} - Go Live',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['prod-deploy'],
          status: 'not-started'
        }
      ]
    }
  ]
};

// ========== TILED COMPLEX TEMPLATE ==========
export const TILED_COMPLEX_TEMPLATE: GanttTemplate = {
  id: 'tiled-complex',
  name: 'Deploy Tiled Complex (20+ Screens)',
  description: 'Complex Tiled interactive demo with 20+ screens (10-12 weeks)',
  category: 'tiled',
  estimatedDuration: 11, // weeks
  variables: [
    { key: 'organization', label: 'Organization/BU', type: 'select', options: ['Capital Markets', 'Banking', 'International Banking'], required: true },
    { key: 'product', label: 'Product Name', type: 'text', required: true },
    { key: 'owner', label: 'Project Owner', type: 'text', required: true },
    { key: 'buOwner', label: 'Business Owner', type: 'text', required: true },
    { key: 'screenCount', label: 'Screen Count', type: 'text', defaultValue: '20', required: false }
  ],
  taskStructure: [
    {
      id: '{{organization}}-planning',
      name: '{{organization}} - Planning',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#8B5CF6',
      children: [
        {
          id: 'kickoff',
          name: 'Kick-off Meeting',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          status: 'not-started'
        },
        {
          id: 'storyboard',
          name: 'Storyboard & Flow Design',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 5,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['kickoff'],
          status: 'not-started'
        },
        {
          id: 'screen-wireframes',
          name: 'Screen Wireframes ({{screenCount}} screens)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 7,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['storyboard'],
          status: 'not-started'
        },
        {
          id: 'design-approval',
          name: 'Design Approval',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['screen-wireframes'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-development',
      name: '{{organization}} - Development',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#10B981',
      children: [
        {
          id: 'tiled-setup',
          name: 'Tiled Project Setup',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['design-approval'],
          status: 'not-started'
        },
        {
          id: 'screen-build-1',
          name: 'Screen Build - Phase 1 (40%)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 10,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['tiled-setup'],
          status: 'not-started'
        },
        {
          id: 'screen-build-2',
          name: 'Screen Build - Phase 2 (40%)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 10,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['screen-build-1'],
          status: 'not-started'
        },
        {
          id: 'screen-build-3',
          name: 'Screen Build - Phase 3 (20%)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 5,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['screen-build-2'],
          status: 'not-started'
        },
        {
          id: 'interactions',
          name: 'Interactive Elements & Hotspots',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 7,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['screen-build-3'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-review',
      name: '{{organization}} - Review & Testing',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#F59E0B',
      children: [
        {
          id: 'qa-testing',
          name: 'QA Testing (All Flows)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 5,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['interactions'],
          status: 'not-started'
        },
        {
          id: 'bug-fixes',
          name: 'Bug Fixes & Polish',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 4,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['qa-testing'],
          status: 'not-started'
        },
        {
          id: 'uat',
          name: 'User Acceptance Testing',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 3,
          progress: 0,
          owner: '{{buOwner}}',
          dependencies: ['bug-fixes'],
          status: 'not-started'
        },
        {
          id: 'se-training',
          name: 'SE Training Session',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['uat'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-release',
      name: '{{organization}} - Production Release',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#EF4444',
      children: [
        {
          id: 'prod-deploy',
          name: 'Production Deployment',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['se-training'],
          status: 'not-started'
        },
        {
          id: 'go-live',
          name: '{{product}} - Go Live',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['prod-deploy'],
          status: 'not-started'
        },
        {
          id: 'monitoring',
          name: 'Post-Launch Monitoring (2 weeks)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 10,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['go-live'],
          status: 'not-started'
        }
      ]
    }
  ]
};

// ========== SYNTHESIA VIDEO TEMPLATE ==========
export const SYNTHESIA_VIDEO_TEMPLATE: GanttTemplate = {
  id: 'synthesia-video',
  name: 'Create Synthesia AI Video',
  description: 'AI-generated personalized demo video (3-4 weeks)',
  category: 'synthesia',
  estimatedDuration: 3.5, // weeks
  variables: [
    { key: 'organization', label: 'Organization/BU', type: 'select', options: ['Capital Markets', 'Banking', 'International Banking'], required: true },
    { key: 'product', label: 'Product Name', type: 'text', required: true },
    { key: 'owner', label: 'Project Owner', type: 'text', required: true },
    { key: 'videoLength', label: 'Video Length (minutes)', type: 'text', defaultValue: '5', required: false }
  ],
  taskStructure: [
    {
      id: '{{organization}}-planning',
      name: '{{organization}} - Planning',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#8B5CF6',
      children: [
        {
          id: 'script-brief',
          name: 'Video Script Brief',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          status: 'not-started'
        },
        {
          id: 'script-writing',
          name: 'Script Writing ({{videoLength}} min)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 3,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['script-brief'],
          status: 'not-started'
        },
        {
          id: 'script-approval',
          name: 'Script Approval',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['script-writing'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-production',
      name: '{{organization}} - Production',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#10B981',
      children: [
        {
          id: 'avatar-selection',
          name: 'AI Avatar Selection',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['script-approval'],
          status: 'not-started'
        },
        {
          id: 'video-generation',
          name: 'Video Generation (Synthesia API)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['avatar-selection'],
          status: 'not-started'
        },
        {
          id: 'review-edit',
          name: 'Review & Edit',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 3,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['video-generation'],
          status: 'not-started'
        }
      ]
    },
    {
      id: '{{organization}}-release',
      name: '{{organization}} - Release',
      type: 'phase',
      startDate: '',
      endDate: '',
      progress: 0,
      owner: '{{owner}}',
      status: 'not-started',
      color: '#EF4444',
      children: [
        {
          id: 'final-approval',
          name: 'Final Approval',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['review-edit'],
          status: 'not-started'
        },
        {
          id: 'distribution',
          name: 'Distribution Setup (Seismic/CRM)',
          type: 'task',
          startDate: '',
          endDate: '',
          duration: 2,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['final-approval'],
          status: 'not-started'
        },
        {
          id: 'go-live',
          name: '{{product}} Video - Go Live',
          type: 'milestone',
          startDate: '',
          endDate: '',
          duration: 1,
          progress: 0,
          owner: '{{owner}}',
          dependencies: ['distribution'],
          status: 'not-started'
        }
      ]
    }
  ]
};

export const GANTT_TEMPLATES: GanttTemplate[] = [
  COAST_SIMPLE_TEMPLATE,
  TILED_COMPLEX_TEMPLATE,
  SYNTHESIA_VIDEO_TEMPLATE
];

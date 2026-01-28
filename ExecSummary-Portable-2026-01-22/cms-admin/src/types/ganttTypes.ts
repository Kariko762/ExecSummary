/**
 * GANTT CHART TYPE DEFINITIONS
 * 
 * TypeScript interfaces for Gantt chart data structures
 * Used by GanttChartPattern, GanttEditorModal, and TaskDetailModal
 */

export interface GanttMilestone {
  date: string;               // ISO format: '2025-01-15'
  title: string;
  completed?: boolean;
}

export interface GanttTask {
  id: string;
  name: string;
  startDate: string;          // ISO format: '2025-01-05'
  endDate: string;            // ISO format: '2025-01-20'
  progress: number;           // 0-100
  status: 'on-track' | 'at-risk' | 'blocked' | 'completed';
  owner: string;
  details: {
    description: string;
    milestones: GanttMilestone[];
    blockers: string[];
    dependencies: string[];   // Task IDs
  };
}

export interface GanttProject {
  id: string;
  name: string;
  tasks: GanttTask[];
}

export interface GanttOrganization {
  id: string;
  name: string;
  color: string;              // CSS variable or hex color
  collapsed: boolean;
  projects: GanttProject[];
}

export interface GanttData {
  title: string;
  startDate: string;          // Chart range start
  endDate: string;            // Chart range end
  organizations: GanttOrganization[];
}

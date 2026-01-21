export type GanttTask = {
  id: string;
  name: string;
  type: 'milestone' | 'task' | 'phase';
  startDate: string;
  endDate: string;
  duration?: number;
  progress: number;
  owner: string;
  dependencies?: string[];
  risks?: string[];
  children?: GanttTask[];
  isCollapsed?: boolean;
  level?: number;
  color?: string;
  status?: 'not-started' | 'in-progress' | 'completed' | 'blocked';
};

export type GanttData = {
  initiativeId: string;
  tasks: GanttTask[];
  createdDate: string;
  lastUpdated: string;
};

export type GanttTemplate = {
  id: string;
  name: string;
  description: string;
  category: 'coast' | 'tiled' | 'synthesia' | 'custom';
  estimatedDuration: number;
  variables: GanttTemplateVariable[];
  taskStructure: GanttTask[];
};

export type GanttTemplateVariable = {
  key: string;
  label: string;
  type: 'text' | 'date' | 'select';
  options?: string[];
  required: boolean;
  defaultValue?: string;
};

export type GanttTemplateInput = {
  templateId: string;
  variables: Record<string, string>;
  startDate?: string;
  endDate?: string;
};

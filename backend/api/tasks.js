/**
 * TASKS SYSTEM API
 * 
 * Centralized task management with full progressBarListDetailed data model
 * Tasks can be referenced across multiple content sections
 * Updates to tasks propagate to all referencing content
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data file
const TASKS_FILE = path.join(__dirname, '../data/tasks.json');

// Ensure data directory exists
async function ensureDataFile() {
  const dataDir = path.dirname(TASKS_FILE);
  await fs.mkdir(dataDir, { recursive: true });
  
  // Initialize tasks file if it doesn't exist
  try {
    await fs.access(TASKS_FILE);
  } catch {
    await fs.writeFile(TASKS_FILE, JSON.stringify({ tasks: [] }, null, 2));
  }
}

// Helper: Read tasks
async function readTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { tasks: [] };
  }
}

// Helper: Write tasks
async function writeTasks(tasksData) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasksData, null, 2));
}

// Helper: Generate ID
function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================
// TASKS ENDPOINTS
// ==========================================

/**
 * GET /api/tasks
 * List all tasks with optional filters
 * Query params: status, priority, owner, search
 */
const getTasks = async (req, res) => {
  try {
    await ensureDataFile();
    
    const { 
      status, 
      priority, 
      businessUnit,
      product,
      owner, 
      tags,
      goalId,
      startDate,
      endDate,
      limit,
      sortBy,
      sortOrder,
      search 
    } = req.query;
    
    const tasksData = await readTasks();
    let filtered = tasksData.tasks;
    
    // Apply filters (comma-separated values = OR logic)
    if (status) {
      const statusValues = status.split(',').map(s => s.trim());
      filtered = filtered.filter(t => statusValues.includes(t.status));
    }
    
    if (priority) {
      const priorityValues = priority.split(',').map(p => p.trim());
      filtered = filtered.filter(t => priorityValues.includes(t.priority));
    }
    
    if (businessUnit) {
      const buValues = businessUnit.split(',').map(b => b.trim());
      filtered = filtered.filter(t => t.businessUnit && buValues.includes(t.businessUnit));
    }
    
    if (product) {
      const productValues = product.split(',').map(p => p.trim());
      filtered = filtered.filter(t => t.product && productValues.includes(t.product));
    }
    
    if (owner) {
      const ownerValues = owner.split(',').map(o => o.trim().toLowerCase());
      filtered = filtered.filter(t => 
        t.owner && ownerValues.some(ov => t.owner.toLowerCase().includes(ov))
      );
    }
    
    if (tags) {
      const tagIds = tags.split(',').map(tag => tag.trim());
      filtered = filtered.filter(t => 
        t.tags && Array.isArray(t.tags) && tagIds.some(tagId => t.tags.includes(tagId))
      );
    }
    
    if (goalId) {
      filtered = filtered.filter(t => t.goalId === goalId);
    }
    
    // Date range filtering
    if (startDate) {
      filtered = filtered.filter(t => t.targetDate && new Date(t.targetDate) >= new Date(startDate));
    }
    
    if (endDate) {
      filtered = filtered.filter(t => t.targetDate && new Date(t.targetDate) <= new Date(endDate));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
      );
    }
    
    // Apply sorting
    const sortField = sortBy || 'createdAt';
    const order = sortOrder === 'desc' ? -1 : 1;
    
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      // Handle special cases
      if (sortField === 'targetDate' || sortField === 'createdAt') {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      } else if (sortField === 'progress' || sortField === 'percentage') {
        aVal = a.percentage || 0;
        bVal = b.percentage || 0;
      } else if (sortField === 'priority') {
        const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aVal = priorityMap[a.priority] || 0;
        bVal = priorityMap[b.priority] || 0;
      }
      
      if (aVal < bVal) return -1 * order;
      if (aVal > bVal) return 1 * order;
      return 0;
    });
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit, 10);
      filtered = filtered.slice(0, limitNum);
    }
    
    res.json({
      success: true,
      tasks: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error getting tasks:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve tasks' });
  }
};

/**
 * GET /api/tasks/:id
 * Get single task by ID
 */
const getTask = async (req, res) => {
  try {
    const { id } = req.params;
    const tasksData = await readTasks();
    const task = tasksData.tasks.find(t => t.id === id);
    
    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('Error getting task:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve task' });
  }
};

/**
 * POST /api/tasks
 * Create new task
 * Body: Full task object with all progressBarListDetailed fields
 */
const createTask = async (req, res) => {
  try {
    await ensureDataFile();
    
    const {
      title,
      owner,
      team,
      businessUnit,
      product,
      startDate,
      targetDate,
      percentage,
      status,
      budget,
      priority,
      description,
      milestones,
      risks,
      dependencies,
      steps
    } = req.body;
    
    // Validation
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    
    const newTask = {
      id: generateId(),
      title,
      owner: owner || '',
      team: team || '',
      businessUnit: businessUnit || '',
      product: product || '',
      startDate: startDate || new Date().toISOString().split('T')[0],
      targetDate: targetDate || '',
      percentage: percentage || 0,
      status: status || 'On Track',
      budget: budget || '',
      priority: priority || 'Medium',
      description: description || '',
      milestones: milestones || '',
      risks: risks || '',
      dependencies: dependencies || '',
      steps: steps || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const tasksData = await readTasks();
    tasksData.tasks.push(newTask);
    await writeTasks(tasksData);
    
    res.status(201).json({
      success: true,
      task: newTask
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, error: 'Failed to create task' });
  }
};

/**
 * PUT /api/tasks/:id
 * Update existing task
 */
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const tasksData = await readTasks();
    const taskIndex = tasksData.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    // Update task
    const updatedTask = {
      ...tasksData.tasks[taskIndex],
      ...updates,
      id, // Preserve original ID
      createdAt: tasksData.tasks[taskIndex].createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    tasksData.tasks[taskIndex] = updatedTask;
    await writeTasks(tasksData);
    
    res.json({
      success: true,
      task: updatedTask
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, error: 'Failed to update task' });
  }
};

/**
 * DELETE /api/tasks/:id
 * Delete task
 */
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const tasksData = await readTasks();
    const taskIndex = tasksData.tasks.findIndex(t => t.id === id);
    
    if (taskIndex === -1) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }
    
    const deletedTask = tasksData.tasks[taskIndex];
    tasksData.tasks.splice(taskIndex, 1);
    await writeTasks(tasksData);
    
    res.json({
      success: true,
      task: deletedTask
    });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, error: 'Failed to delete task' });
  }
};

/**
 * GET /api/tasks/stats
 * Get task statistics and overview
 */
const getTaskStats = async (req, res) => {
  try {
    await ensureDataFile();
    const tasksData = await readTasks();
    const tasks = tasksData.tasks;
    
    // Calculate statistics
    const stats = {
      total: tasks.length,
      byStatus: {
        'On Track': tasks.filter(t => t.status === 'On Track').length,
        'At Risk': tasks.filter(t => t.status === 'At Risk').length,
        'Blocked': tasks.filter(t => t.status === 'Blocked').length,
        'Complete': tasks.filter(t => t.status === 'Complete').length
      },
      byPriority: {
        'High': tasks.filter(t => t.priority === 'High').length,
        'Medium': tasks.filter(t => t.priority === 'Medium').length,
        'Low': tasks.filter(t => t.priority === 'Low').length
      },
      averageCompletion: tasks.length > 0 
        ? Math.round(tasks.reduce((sum, t) => sum + (t.percentage || 0), 0) / tasks.length)
        : 0
    };
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting task stats:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve task stats' });
  }
};

// Export all endpoints
export default function registerTasksRoutes(app) {
  app.get('/api/tasks', getTasks);
  app.get('/api/tasks/stats', getTaskStats);
  app.get('/api/tasks/:id', getTask);
  app.post('/api/tasks', createTask);
  app.put('/api/tasks/:id', updateTask);
  app.delete('/api/tasks/:id', deleteTask);
}

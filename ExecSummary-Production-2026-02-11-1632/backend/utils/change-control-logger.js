/**
 * CHANGE CONTROL LOGGER UTILITY
 * 
 * Centralized logging for all system changes with field-level diff tracking
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHANGE_LOG_FILE = path.join(__dirname, '../data', 'change-control-log.json');

// Initialize change log file
async function ensureChangeLog() {
  try {
    await fs.access(CHANGE_LOG_FILE);
  } catch {
    await fs.writeFile(CHANGE_LOG_FILE, JSON.stringify({ events: [] }, null, 2));
  }
}

/**
 * Calculate field-level differences between old and new objects
 * @param {Object} oldObj - Original object
 * @param {Object} newObj - New object with changes
 * @returns {Object} - Object with {fieldName: {old: value, new: value}}
 */
function calculateDiff(oldObj, newObj) {
  const diff = {};
  const allKeys = new Set([...Object.keys(oldObj || {}), ...Object.keys(newObj || {})]);
  
  for (const key of allKeys) {
    // Skip internal/system fields
    if (['id', 'createdAt', 'updatedAt', 'lastUpdated'].includes(key)) continue;
    
    const oldValue = oldObj?.[key];
    const newValue = newObj?.[key];
    
    // Only include if values are different
    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      diff[key] = { old: oldValue, new: newValue };
    }
  }
  
  return Object.keys(diff).length > 0 ? diff : null;
}

/**
 * Log a change event
 * @param {Object} event - Event details
 * @param {string} event.eventType - Type of event (goal-created, task-updated, etc.)
 * @param {string} event.entityType - Type of entity (goal, task, note, etc.)
 * @param {string} event.entityId - ID of the entity
 * @param {Object} event.metadata - Additional event data
 * @param {string} event.user - User who made the change (optional)
 */
export async function logChange({ eventType, entityType, entityId, metadata = {}, user = 'current-user' }) {
  try {
    await ensureChangeLog();
    
    const log = JSON.parse(await fs.readFile(CHANGE_LOG_FILE, 'utf8'));
    
    const event = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      eventType,
      entityType,
      entityId,
      user,
      metadata
    };
    
    log.events.push(event);
    await fs.writeFile(CHANGE_LOG_FILE, JSON.stringify(log, null, 2));
    
    console.log(`📋 Change logged: ${eventType} - ${entityType}:${entityId}`);
    return { success: true, event };
  } catch (error) {
    console.error('⚠️ Failed to log change:', error);
    // Don't throw - logging failure shouldn't break the main operation
    return { success: false, error: error.message };
  }
}

/**
 * Log goal creation
 */
export async function logGoalCreated(goal) {
  return logChange({
    eventType: 'goal-created',
    entityType: 'goal',
    entityId: goal.id,
    metadata: {
      title: goal.title,
      status: goal.status,
      category: goal.category
    }
  });
}

/**
 * Log goal update with field-level changes
 */
export async function logGoalUpdated(goalId, changes, oldGoal) {
  const eventType = changes.status && changes.status !== oldGoal?.status 
    ? 'goal-status-changed' 
    : 'goal-updated';
  
  const diff = calculateDiff(oldGoal, { ...oldGoal, ...changes });
  
  return logChange({
    eventType,
    entityType: 'goal',
    entityId: goalId,
    metadata: {
      title: changes.title || oldGoal?.title,
      changes: diff
    }
  });
}

/**
 * Log goal deletion
 */
export async function logGoalDeleted(goal) {
  return logChange({
    eventType: 'goal-deleted',
    entityType: 'goal',
    entityId: goal.id,
    metadata: {
      title: goal.title,
      status: goal.status,
      deletedData: goal // Store full object for reference
    }
  });
}

/**
 * Log initiative creation
 */
export async function logInitiativeCreated(initiative) {
  return logChange({
    eventType: 'initiative-created',
    entityType: 'initiative',
    entityId: initiative.id,
    metadata: {
      title: initiative.title,
      status: initiative.status,
      linkedGoal: initiative.linkedGoal
    }
  });
}

/**
 * Log initiative update with field-level changes
 */
export async function logInitiativeUpdated(initiativeId, changes, oldInitiative) {
  const eventType = changes.status && changes.status !== oldInitiative?.status
    ? 'initiative-status-changed'
    : 'initiative-updated';
  
  const diff = calculateDiff(oldInitiative, { ...oldInitiative, ...changes });
  
  return logChange({
    eventType,
    entityType: 'initiative',
    entityId: initiativeId,
    metadata: {
      title: changes.title || oldInitiative?.title,
      changes: diff
    }
  });
}

/**
 * Log initiative deletion
 */
export async function logInitiativeDeleted(initiative) {
  return logChange({
    eventType: 'initiative-deleted',
    entityType: 'initiative',
    entityId: initiative.id,
    metadata: {
      title: initiative.title,
      status: initiative.status,
      deletedData: initiative
    }
  });
}

/**
 * Log task creation
 */
export async function logTaskCreated(task) {
  return logChange({
    eventType: 'task-created',
    entityType: 'task',
    entityId: task.id,
    metadata: {
      title: task.title,
      status: task.status,
      priority: task.priority,
      linkedGoal: task.linkedGoal,
      linkedInitiative: task.linkedInitiative
    }
  });
}

/**
 * Log task update with field-level changes
 */
export async function logTaskUpdated(taskId, changes, oldTask) {
  const eventType = changes.status && changes.status !== oldTask?.status
    ? 'task-status-changed'
    : 'task-updated';
  
  const diff = calculateDiff(oldTask, { ...oldTask, ...changes });
  
  return logChange({
    eventType,
    entityType: 'task',
    entityId: taskId,
    metadata: {
      title: changes.title || oldTask?.title,
      changes: diff
    }
  });
}

/**
 * Log task deletion
 */
export async function logTaskDeleted(task) {
  return logChange({
    eventType: 'task-deleted',
    entityType: 'task',
    entityId: task.id,
    metadata: {
      title: task.title,
      status: task.status,
      priority: task.priority,
      deletedData: task
    }
  });
}

/**
 * Log note creation
 */
export async function logNoteCreated(note) {
  return logChange({
    eventType: 'note-created',
    entityType: 'note',
    entityId: note.id,
    metadata: {
      title: note.title,
      category: note.category,
      tags: note.tags,
      date: note.createdAt || note.date
    }
  });
}

/**
 * Log note deletion
 */
export async function logNoteDeleted(note) {
  return logChange({
    eventType: 'note-deleted',
    entityType: 'note',
    entityId: note.id,
    metadata: {
      title: note.title,
      category: note.category,
      tags: note.tags,
      deletedData: note
    }
  });
}

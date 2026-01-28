import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import authRoutes from './api/auth.js';
import goalsRoutes from './api/goals.js';
import initiativesRoutes from './api/initiatives.js';
import designSystemRoutes from './api/design-system.js';
import tagsRoutes from './api/tags.js';
import dataEngineRoutes from './api/data-engine.js';
import tasksRoutes from './api/tasks.js';
import businessUnitsRoutes from './api/businessUnits.js';
import peopleRoutes from './api/people.js';
import technologiesMenuRoutes from './api/technologiesMenu.js';
import { logTaskCreated, logTaskUpdated, logNoteCreated, logNoteDeleted } from './utils/change-control-logger.js';
import { getTenants, createTenant, deleteTenant, getTenantContent, getTenantStats, updateTenantStats } from './api/tenants.js';
import {
  getNotes, getNote, createNote, updateNote, deleteNote, getNoteCountsByTask,
  getSections, getSection, createSection, updateSection, archiveSection, deleteSection,
  addNotesToSection, removeNoteFromSection, reorderNotesInSection
} from './api/notes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Authentication routes
app.use('/api/auth', authRoutes);

// Goals Management Routes
app.use('/api/goals', goalsRoutes);

// Initiatives Management Routes
app.use('/api/initiatives', initiativesRoutes);

// Design System Routes
app.use('/api/design-system', designSystemRoutes);

// Tags Management Routes
app.use('/api/tags', tagsRoutes);

// Data Engine Routes
app.use('/api/data-engine', dataEngineRoutes);

// Tasks Management Routes
tasksRoutes(app);

// Business Units Management Routes
app.use('/api/business-units', businessUnitsRoutes);

// People Management Routes
app.use('/api/people', peopleRoutes);

// Technologies Menu Routes
app.use('/api/technologies-menu', technologiesMenuRoutes);

// Tenant Management Routes (Organizations & Initiatives)
app.get('/api/tenants', getTenants);
app.post('/api/tenants', createTenant);
app.delete('/api/tenants/:type/:slug', deleteTenant);
app.get('/api/tenants/:type/:slug/content', getTenantContent);
app.get('/api/tenants/:type/:slug/stats', getTenantStats);

// ============================================
// Notes System Routes
// ============================================
app.get('/api/notes', getNotes);
app.get('/api/notes/count/by-task', getNoteCountsByTask); // Must be before /:id route
app.get('/api/notes/:id', getNote);
app.post('/api/notes', createNote);
app.put('/api/notes/:id', updateNote);
app.delete('/api/notes/:id', deleteNote);

// Sections Routes
app.get('/api/sections', getSections);
app.get('/api/sections/:id', getSection);
app.post('/api/sections', createSection);
app.put('/api/sections/:id', updateSection);
app.put('/api/sections/:id/archive', archiveSection);
app.delete('/api/sections/:id', deleteSection);

// Section-Note Linking Routes
app.post('/api/sections/:id/notes', addNotesToSection);
app.delete('/api/sections/:id/notes/:noteId', removeNoteFromSection);
app.put('/api/sections/:id/reorder', reorderNotesInSection);

// Timeline Notes Routes
const TIMELINE_NOTES_FILE = path.join(__dirname, 'data', 'timeline-notes.json');

app.get('/api/timeline-notes', async (req, res) => {
  try {
    const { taskId } = req.query;
    const data = await readJSONFile(TIMELINE_NOTES_FILE).catch(() => ({ notes: [] }));
    let notes = data.notes || [];
    
    // Filter by taskId if provided
    if (taskId) {
      notes = notes.filter(note => note.taskId && note.taskId === taskId);
    }
    
    res.json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/timeline-notes', async (req, res) => {
  try {
    const data = await readJSONFile(TIMELINE_NOTES_FILE).catch(() => ({ notes: [] }));
    const newNote = {
      id: `note-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.notes.push(newNote);
    await writeJSONFile(TIMELINE_NOTES_FILE, data);
    
    // Log note creation
    await logNoteCreated(newNote);
    
    res.json({ success: true, note: newNote });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/timeline-notes/:id', async (req, res) => {
  try {
    const data = await readJSONFile(TIMELINE_NOTES_FILE).catch(() => ({ notes: [] }));
    const index = data.notes.findIndex(n => n.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Note not found' });
    }
    data.notes[index] = {
      ...data.notes[index],
      ...req.body,
      id: req.params.id,
      updatedAt: new Date().toISOString()
    };
    await writeJSONFile(TIMELINE_NOTES_FILE, data);
    res.json({ success: true, note: data.notes[index] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/timeline-notes/:id', async (req, res) => {
  try {
    const data = await readJSONFile(TIMELINE_NOTES_FILE).catch(() => ({ notes: [] }));
    const deletedNote = data.notes.find(n => n.id === req.params.id);
    data.notes = data.notes.filter(n => n.id !== req.params.id);
    await writeJSONFile(TIMELINE_NOTES_FILE, data);
    
    // Log note deletion
    if (deletedNote) {
      await logNoteDeleted(deletedNote);
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CHANGE CONTROL / AUDIT LOG API
// ============================================
const CHANGE_LOG_FILE = path.join(__dirname, 'data', 'change-control-log.json');

// Initialize change log file
async function ensureChangeLog() {
  try {
    await fs.access(CHANGE_LOG_FILE);
  } catch {
    await fs.writeFile(CHANGE_LOG_FILE, JSON.stringify({ events: [] }, null, 2));
  }
}

// Log a change event
app.post('/api/change-control', async (req, res) => {
  try {
    await ensureChangeLog();
    const { eventType, entityType, entityId, metadata } = req.body;
    
    const log = JSON.parse(await fs.readFile(CHANGE_LOG_FILE, 'utf8'));
    
    const event = {
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType,
      entityType,
      entityId,
      user: req.body.user || 'current-user',
      metadata: metadata || {}
    };
    
    log.events.push(event);
    await fs.writeFile(CHANGE_LOG_FILE, JSON.stringify(log, null, 2));
    
    res.json({ success: true, event });
  } catch (error) {
    console.error('Error logging change:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Query change log
app.get('/api/change-control', async (req, res) => {
  try {
    await ensureChangeLog();
    const { eventType, entityType, since, limit } = req.query;
    
    const log = JSON.parse(await fs.readFile(CHANGE_LOG_FILE, 'utf8'));
    let events = log.events;
    
    // Filter by event type
    if (eventType) {
      events = events.filter(e => e.eventType === eventType);
    }
    
    // Filter by entity type
    if (entityType) {
      events = events.filter(e => e.entityType === entityType);
    }
    
    // Filter by date
    if (since) {
      const sinceDate = new Date(since);
      events = events.filter(e => new Date(e.timestamp) >= sinceDate);
    }
    
    // Sort by timestamp descending (newest first)
    events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Limit results
    if (limit) {
      events = events.slice(0, parseInt(limit));
    }
    
    res.json({ success: true, events, total: events.length });
  } catch (error) {
    console.error('Error querying change log:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get last report date before a given week
app.get('/api/change-control/last-report-date', async (req, res) => {
  try {
    await ensureChangeLog();
    const { weekStart } = req.query;
    
    if (!weekStart) {
      return res.status(400).json({ success: false, error: 'weekStart parameter required' });
    }
    
    const log = JSON.parse(await fs.readFile(CHANGE_LOG_FILE, 'utf8'));
    const weekStartDate = new Date(weekStart);
    
    // Find most recent report-generated event before this week
    const reportEvents = log.events
      .filter(e => e.eventType === 'report-generated' && e.entityType === 'leadership-summary')
      .filter(e => new Date(e.timestamp) < weekStartDate)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (reportEvents.length > 0) {
      const lastReport = reportEvents[0];
      res.json({ 
        success: true, 
        lastReportDate: lastReport.timestamp,
        lastReportId: lastReport.entityId,
        metadata: lastReport.metadata 
      });
    } else {
      // No previous report - use a default date (e.g., 30 days ago)
      const defaultDate = new Date(weekStartDate);
      defaultDate.setDate(defaultDate.getDate() - 30);
      res.json({ 
        success: true, 
        lastReportDate: defaultDate.toISOString(),
        isDefault: true,
        message: 'No previous report found, using 30 days ago'
      });
    }
  } catch (error) {
    console.error('Error getting last report date:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Weekly Summary - Create from Timeline Notes
app.post('/api/weekly-summary/create', async (req, res) => {
  try {
    const { weekLabel, summaryType, summaryData } = req.body;
    
    if (!weekLabel || !summaryType || !summaryData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: weekLabel, summaryType, summaryData' 
      });
    }

    // Only support BLUF type for TSX generation
    if (summaryType !== 'bluf') {
      return res.status(400).json({ 
        success: false, 
        error: 'Only BLUF summary type is supported for TSX generation' 
      });
    }

    const timestamp = Date.now();
    const filename = `leadership-summary-${timestamp}.tsx`;
    const CONTENT_DIR = path.join(__dirname, 'data', 'content');
    const filepath = path.join(CONTENT_DIR, filename);

    // Add metadata if not present
    if (!summaryData.metadata) {
      summaryData.metadata = {
        weekStart: '',
        weekEnd: '',
        generatedBy: 'AI Assistant',
        title: `Weekly Leadership Summary - ${weekLabel}`
      };
    }

    // Generate TSX file content with embedded data
    const tsxContent = `import { motion } from 'framer-motion';
import { Target, AlertTriangle } from 'lucide-react';

// GENERATED DATA - Edit the LEADERSHIP_DATA const below to update content
const LEADERSHIP_DATA = ${JSON.stringify(summaryData, null, 2)};

export default function LeadershipSummary() {
  return (
    <div className="space-y-8">
      <DesktopBLUFSection data={LEADERSHIP_DATA.bluf} />
      <DesktopPrioritizationSection data={LEADERSHIP_DATA.prioritization} />
      <DesktopRisksSection data={LEADERSHIP_DATA.risks} />
    </div>
  );
}

function DesktopBLUFSection({ data }) {
  return (
    <div className="space-y-3">
      <div className="px-4 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-base font-roobert-bold text-white">Executive Summary (BLUF)</h3>
        </div>
      </div>
      <div className="space-y-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-red)' }}>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-red)' }}>1</div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-red)' }}>Bottom Line Up Front</h4>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                {data.bottomLine.map((item, idx) => <li key={idx} className="flex items-start gap-2"><span className="text-fis-eggplant dark:text-fis-raspberry mt-0.5">•</span><span>{item}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-blue)' }}>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-blue)' }}>2</div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-blue)' }}>Background</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">{data.background}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-purple)' }}>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-purple)' }}>3</div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-purple)' }}>Assessment</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light leading-relaxed">{data.assessment}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-green)' }}>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-green)' }}>4</div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-green)' }}>Recommendations</h4>
              <ul className="space-y-1.5 text-sm text-gray-700 dark:text-gray-300 font-roobert-light">
                {data.recommendations.map((item, idx) => <li key={idx} className="flex items-start gap-2"><span className="text-green-600 dark:text-green-400 mt-0.5">✓</span><span>{item}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border-l-4" style={{ borderLeftColor: 'var(--accent-orange)' }}>
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-roobert-bold text-white" style={{ background: 'var(--accent-orange)' }}>5</div>
            <div className="flex-1">
              <h4 className="text-sm font-roobert-bold uppercase tracking-wide mb-2" style={{ color: 'var(--accent-orange)' }}>Asks</h4>
              <div className="space-y-2">
                {data.asks.map((ask, idx) => <div key={idx} className="flex items-start gap-2"><span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white shrink-0" style={{ background: ask.urgency === 'High' ? 'var(--accent-red)' : ask.urgency === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>{ask.urgency}</span><span className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light">{ask.item} <span className="text-gray-500 dark:text-gray-400">({ask.owner})</span></span></div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopPrioritizationSection({ data }) {
  return (
    <div className="space-y-3">
      <div className="px-4 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))' }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded"><Target className="w-4 h-4 text-white" /></div>
          <h3 className="text-base font-roobert-bold text-white">Prioritization</h3>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item, idx) => <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: item.priority === 'High' ? 'var(--accent-red)' : item.priority === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}><div className="flex items-start justify-between mb-3"><h4 className="text-base font-roobert-bold text-gray-900 dark:text-white">{item.title}</h4><span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" style={{ background: item.priority === 'High' ? 'var(--accent-red)' : item.priority === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-blue)' }}>{item.priority}</span></div><p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light mb-3">{item.description}</p><div className="grid grid-cols-2 gap-3 mb-3"><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Impact</div><div className="text-sm text-gray-900 dark:text-white font-roobert-light">{item.impact}</div></div><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Status</div><div className="text-sm text-gray-900 dark:text-white font-roobert-light">{item.status}</div></div><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Linked Goal</div><div className="text-sm text-fis-eggplant dark:text-fis-raspberry font-roobert-medium">{item.linkedGoal}</div></div><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Linked Initiative</div><div className="text-sm text-fis-eggplant dark:text-fis-raspberry font-roobert-medium">{item.linkedInitiative}</div></div></div><div className="grid grid-cols-2 gap-3"><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Milestones</div><ul className="space-y-0.5">{item.milestones.map((milestone, midx) => <li key={midx} className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light flex items-center gap-1.5"><span className="text-green-600 dark:text-green-400">✓</span>{milestone}</li>)}</ul></div><div><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Deliverables</div><ul className="space-y-0.5">{item.deliverables.map((deliverable, didx) => <li key={didx} className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light flex items-center gap-1.5"><span className="text-fis-eggplant dark:text-fis-raspberry">•</span>{deliverable}</li>)}</ul></div></div><div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs"><div className="text-gray-600 dark:text-gray-400 font-roobert-light">Owner: <span className="text-gray-900 dark:text-white font-roobert-medium">{item.owner}</span></div><div className="text-gray-600 dark:text-gray-400 font-roobert-light">Due: <span className="text-gray-900 dark:text-white font-roobert-medium">{item.dueDate}</span></div></div></div>)}
      </div>
    </div>
  );
}

function DesktopRisksSection({ data }) {
  return (
    <div className="space-y-3">
      <div className="px-4 py-2.5 rounded-lg" style={{ background: 'linear-gradient(135deg, var(--accent-red), var(--accent-orange))' }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded"><AlertTriangle className="w-4 h-4 text-white" /></div>
          <h3 className="text-base font-roobert-bold text-white">Risks</h3>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {data.map((risk, idx) => <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border-l-4" style={{ borderLeftColor: risk.severity === 'High' ? 'var(--accent-red)' : risk.severity === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-yellow)', backgroundColor: risk.severity === 'High' ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}><div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2"><span className="px-2 py-0.5 text-[10px] font-roobert-bold rounded uppercase text-white" style={{ background: risk.severity === 'High' ? 'var(--accent-red)' : risk.severity === 'Medium' ? 'var(--accent-orange)' : 'var(--accent-yellow)' }}>{risk.severity}</span><span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-[10px] font-roobert-bold rounded uppercase">{risk.probability} Probability</span></div></div><h4 className="text-base font-roobert-bold text-gray-900 dark:text-white mb-2">{risk.title}</h4><p className="text-sm text-gray-700 dark:text-gray-300 font-roobert-light mb-3">{risk.description}</p><div className="space-y-2 mb-3"><div className="flex items-start gap-2"><span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium min-w-[60px]">Impact:</span><span className="text-xs text-gray-900 dark:text-white font-roobert-light">{risk.impact}</span></div><div className="flex items-start gap-2"><span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium min-w-[60px]">Owner:</span><span className="text-xs text-gray-900 dark:text-white font-roobert-light">{risk.owner}</span></div><div className="flex items-start gap-2"><span className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium min-w-[60px]">Category:</span><span className="text-xs text-gray-900 dark:text-white font-roobert-light">{risk.category}</span></div></div><div className="pt-3 border-t border-gray-200 dark:border-gray-700"><div className="text-xs text-gray-500 dark:text-gray-400 font-roobert-medium mb-1">Mitigation Plan</div><p className="text-xs text-gray-700 dark:text-gray-300 font-roobert-light">{risk.mitigation}</p></div></div>)}
      </div>
    </div>
  );
}
`;

    // Write TSX file
    await fs.promises.writeFile(filepath, tsxContent, 'utf8');

    console.log(`✅ Created Leadership Summary TSX: ${filename}`);
    
    // Log to change control
    try {
      await ensureChangeLog();
      const log = JSON.parse(await fs.readFile(CHANGE_LOG_FILE, 'utf8'));
      log.events.push({
        id: `event-${timestamp}`,
        timestamp: new Date().toISOString(),
        eventType: 'report-generated',
        entityType: 'leadership-summary',
        entityId: `leadership-summary-${timestamp}`,
        user: 'current-user',
        metadata: {
          weekLabel,
          weekStart: summaryData.metadata?.weekStart || '',
          weekEnd: summaryData.metadata?.weekEnd || '',
          summaryType,
          filename
        }
      });
      await fs.promises.writeFile(CHANGE_LOG_FILE, JSON.stringify(log, null, 2));
      console.log(`📋 Logged report generation to change control`);
    } catch (logError) {
      console.error('⚠️ Failed to log to change control:', logError);
      // Don't fail the request if logging fails
    }
    
    res.json({ 
      success: true, 
      filename,
      filepath,
      id: `leadership-summary-${timestamp}`,
      message: 'Leadership Summary TSX file created successfully'
    });

  } catch (error) {
    console.error('❌ Error creating leadership summary:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Path to data directory
const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_DIR = path.join(__dirname, 'data', 'content'); // Unified content directory
const TAGS_FILE = path.join(__dirname, 'data', 'content-tags.json');
const NOTE_TAGS_FILE = path.join(__dirname, 'data', 'note-tags.json');
const COMMENTS_FILE = path.join(__dirname, 'data', 'comments.json');

// Helper function to read JSON file
async function readJSONFile(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

// Helper function to write JSON file
async function writeJSONFile(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    throw new Error(`Failed to write file: ${error.message}`);
  }
}

// Helper function to list files in directory
async function listFiles(directory) {
  try {
    const files = await fs.readdir(directory);
    return files.filter(file => file.endsWith('.json'));
  } catch (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

// ============================================
// UNIFIED CONTENT ENDPOINTS (Tag-Based)
// ============================================

// GET all content (with optional tag/tenant filtering)
app.get('/api/content', async (req, res) => {
  try {
    const { tag, tenant, tenantType } = req.query;
    const allContent = [];
    
    // If tenant filtering is requested, only read from that specific tenant folder
    if (tenant && tenantType) {
      try {
        const tenantDir = tenantType === 'org' 
          ? path.join(DATA_DIR, 'orgs', tenant)
          : path.join(DATA_DIR, 'initiatives', tenant);
        
        const files = await listFiles(tenantDir);
        const tenantContent = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(tenantDir, file);
            return await readJSONFile(filePath);
          })
        );
        allContent.push(...tenantContent);
      } catch (error) {
        console.log(`No content for ${tenantType} ${tenant}:`, error.message);
      }
    } else {
      // Read all content from all locations
      
      // Read from main content directory
      try {
        const files = await listFiles(CONTENT_DIR);
        const contentItems = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(CONTENT_DIR, file);
            return await readJSONFile(filePath);
          })
        );
        allContent.push(...contentItems);
      } catch (error) {
        console.log('No content in main directory:', error.message);
      }
      
      // Read from organization folders
      try {
        const orgsDir = path.join(DATA_DIR, 'orgs');
        const orgFolders = await fs.readdir(orgsDir);
        for (const orgSlug of orgFolders) {
          if (orgSlug === 'registry.json') continue;
          const orgContentDir = path.join(orgsDir, orgSlug);
          const stat = await fs.stat(orgContentDir);
          if (stat.isDirectory()) {
            const files = await listFiles(orgContentDir);
            const orgContent = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(orgContentDir, file);
                return await readJSONFile(filePath);
              })
            );
            allContent.push(...orgContent);
          }
        }
      } catch (error) {
        console.log('No organization content:', error.message);
      }
      
      // Read from initiative folders
      try {
        const initiativesDir = path.join(DATA_DIR, 'initiatives');
        const initiativeFolders = await fs.readdir(initiativesDir);
        for (const initiativeSlug of initiativeFolders) {
          if (initiativeSlug === 'registry.json') continue;
          const initiativeContentDir = path.join(initiativesDir, initiativeSlug);
          const stat = await fs.stat(initiativeContentDir);
          if (stat.isDirectory()) {
            const files = await listFiles(initiativeContentDir);
            const initiativeContent = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(initiativeContentDir, file);
                return await readJSONFile(filePath);
              })
            );
            allContent.push(...initiativeContent);
          }
        }
      } catch (error) {
        console.log('No initiative content:', error.message);
      }
    }
    
    // Filter by tag if provided
    const filteredContent = tag 
      ? allContent.filter(item => item._contentTag === tag)
      : allContent;
    
    // Sort by date (newest first)
    filteredContent.sort((a, b) => {
      const dateA = new Date(a.date || a.lastUpdated || a.updatedAt || 0);
      const dateB = new Date(b.date || b.lastUpdated || b.updatedAt || 0);
      return dateB - dateA;
    });
    
    res.json({ success: true, content: filteredContent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single content item by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
    const content = await readJSONFile(filePath);
    res.json(content);
  } catch (error) {
    res.status(404).json({ error: 'Content not found' });
  }
});

// POST create new content
app.post('/api/content', async (req, res) => {
  try {
    const content = req.body;
    console.log('📝 POST /api/content - Content ID:', content.id);
    console.log('📝 POST /api/content - _tenant:', JSON.stringify(content._tenant));
    
    // Check if content is assigned to a tenant (organization or initiative)
    let filePath;
    if (content._tenant) {
      const { type, slug } = content._tenant;
      const tenantDir = path.join(DATA_DIR, type === 'org' ? 'orgs' : 'initiatives', slug);
      filePath = path.join(tenantDir, `${content.id}.json`);
      
      // Ensure tenant directory exists
      await fs.mkdir(tenantDir, { recursive: true });
      
      // Update tenant stats after save
      await writeJSONFile(filePath, content);
      await updateTenantStats(type, slug);
    } else {
      // Save to regular content directory
      filePath = path.join(CONTENT_DIR, `${content.id}.json`);
      await writeJSONFile(filePath, content);
    }
    
    res.status(201).json({ message: 'Content created', data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing content
app.put('/api/content/:id', async (req, res) => {
  try {
    const content = req.body;
    
    // Check if content is assigned to a tenant (organization or initiative)
    let filePath;
    if (content._tenant) {
      const { type, slug } = content._tenant;
      const tenantDir = path.join(DATA_DIR, type === 'org' ? 'orgs' : 'initiatives', slug);
      filePath = path.join(tenantDir, `${req.params.id}.json`);
      
      // Ensure tenant directory exists
      await fs.mkdir(tenantDir, { recursive: true });
      
      // Update tenant stats after save
      await writeJSONFile(filePath, content);
      await updateTenantStats(type, slug);
    } else {
      // Save to regular content directory
      filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
      await writeJSONFile(filePath, content);
    }
    
    res.json({ message: 'Content updated', data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LEGACY TYPE-SPECIFIC ENDPOINTS (Deprecated - kept for backwards compatibility)
// ============================================







// ============================================
// FILE IMPORT ENDPOINT
// ============================================

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// POST import JSON file
app.post('/api/import/:type', upload.single('file'), async (req, res) => {
  try {
    const { type } = req.params; // 'summaries', 'executive-iq', 'organizations'
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Read uploaded file
    const fileContent = await fs.readFile(file.path, 'utf8');
    const jsonData = JSON.parse(fileContent);
    
    // Determine target directory
    let targetDir;
    switch (type) {
      case 'summaries':
        targetDir = path.join(DATA_DIR, 'summaries');
        break;
      case 'executive-iq':
        targetDir = path.join(DATA_DIR, 'executive-iq');
        break;
      case 'organizations':
        targetDir = path.join(DATA_DIR, 'organizations');
        break;
      case 'performance':
        targetDir = path.join(DATA_DIR, 'performance');
        break;
      default:
        return res.status(400).json({ error: 'Invalid type' });
    }
    
    // Write to appropriate location
    const targetPath = path.join(targetDir, `${jsonData.id}.json`);
    await writeJSONFile(targetPath, jsonData);
    
    // Clean up uploaded file
    await fs.unlink(file.path);
    
    res.json({ 
      message: 'File imported successfully', 
      data: jsonData 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LOGO UPLOAD
// ============================================

// POST upload custom logo
app.post('/api/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create public/logos directory if it doesn't exist
    const logosDir = path.join(__dirname, 'public', 'logos');
    await fs.mkdir(logosDir, { recursive: true });
    
    // Generate filename with timestamp
    const ext = path.extname(file.originalname);
    const filename = `custom-logo-${Date.now()}${ext}`;
    const targetPath = path.join(logosDir, filename);
    
    // Move file from uploads to public/logos
    await fs.rename(file.path, targetPath);
    
    // Return URL
    const logoUrl = `/logos/${filename}`;
    res.json({ url: logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// TEMPLATES
// ============================================

// Get all templates
app.get('/api/templates', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../cms-admin/src/templates');
    const files = await listFiles(templatesDir);
    
    const templates = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(templatesDir, file);
        const data = await readJSONFile(filePath);
        
        // Count non-metadata keys as sections
        const sectionCount = Object.keys(data).filter(key => 
          !key.startsWith('_template_') && 
          !key.startsWith('_enabled_') && 
          !key.startsWith('_completed_') &&
          !['id', 'status', 'protectionEnabled', 'quarter', 'year', 'date', 'title'].includes(key)
        ).length;
        
        return {
          id: file.replace('.json', ''),
          name: data._template_name || file.replace('.json', '').replace(/-/g, ' '),
          description: data._template_description || '',
          fileName: file,
          sectionCount: sectionCount,
          createdAt: data._template_created || new Date().toISOString(),
          updatedAt: data._template_updated || new Date().toISOString()
        };
      })
    );
    
    res.json({ success: true, templates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific template
app.get('/api/templates/:id', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../cms-admin/src/templates');
    const filePath = path.join(templatesDir, `${req.params.id}.json`);
    const data = await readJSONFile(filePath);
    res.json({ success: true, template: data });
  } catch (error) {
    res.status(404).json({ error: 'Template not found' });
  }
});

// Save a new template
app.post('/api/templates', async (req, res) => {
  try {
    const { name, description, template } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' });
    }
    
    // Generate template ID from name
    const templateId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const templatesDir = path.join(__dirname, '../cms-admin/src/templates');
    const filePath = path.join(templatesDir, `${templateId}.json`);
    
    // Create templates directory if it doesn't exist
    await fs.mkdir(templatesDir, { recursive: true });
    
    // Save template data directly (already in correct format from frontend)
    // Add metadata
    const templateWithMetadata = {
      ...template,
      _template_name: name,
      _template_description: description || '',
      _template_created: new Date().toISOString(),
      _template_updated: new Date().toISOString()
    };
    
    await writeJSONFile(filePath, templateWithMetadata);
    
    res.json({ 
      success: true, 
      id: templateId,
      message: `Template "${name}" saved successfully`,
      template: templateWithMetadata
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update an existing template
app.put('/api/templates/:id', async (req, res) => {
  try {
    const { name, description, sections } = req.body;
    const templatesDir = path.join(__dirname, '../cms-admin/src/templates');
    const filePath = path.join(templatesDir, `${req.params.id}.json`);
    
    // Read existing template
    const existing = await readJSONFile(filePath);
    
    // Update template
    const template = {
      ...existing,
      name: name || existing.name,
      description: description || existing.description,
      sections: sections || existing.sections,
      updatedAt: new Date().toISOString()
    };
    
    await writeJSONFile(filePath, template);
    
    res.json({ 
      success: true, 
      message: `Template "${template.name}" updated successfully`,
      template
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a template
app.delete('/api/templates/:id', async (req, res) => {
  try {
    const templatesDir = path.join(__dirname, '../cms-admin/src/templates');
    const filePath = path.join(templatesDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// ============================================
// HEALTH CHECK
// ============================================

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend API is running' });
});

// ============================================
// CONTENT TAGS ENDPOINTS
// ============================================

// GET all content tags
app.get('/api/content-tags', async (req, res) => {
  try {
    const tags = await readJSONFile(TAGS_FILE);
    res.json(tags.tags || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single tag by ID
app.get('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const tag = tagsData.tags.find(t => t.id === req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new tag
app.post('/api/content-tags', async (req, res) => {
  try {
    const newTag = {
      ...req.body,
      created: new Date().toISOString()
    };
    
    const tagsData = await readJSONFile(TAGS_FILE);
    
    // Check for duplicate ID
    if (tagsData.tags.some(t => t.id === newTag.id)) {
      return res.status(400).json({ error: 'Tag ID already exists' });
    }
    
    tagsData.tags.push(newTag);
    await writeJSONFile(TAGS_FILE, tagsData);
    
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing tag
app.put('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const tagIndex = tagsData.tags.findIndex(t => t.id === req.params.id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Preserve created date
    const updatedTag = {
      ...req.body,
      created: tagsData.tags[tagIndex].created
    };
    
    tagsData.tags[tagIndex] = updatedTag;
    await writeJSONFile(TAGS_FILE, tagsData);
    
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tag
app.delete('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const initialLength = tagsData.tags.length;
    
    tagsData.tags = tagsData.tags.filter(t => t.id !== req.params.id);
    
    if (tagsData.tags.length === initialLength) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    await writeJSONFile(TAGS_FILE, tagsData);
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET tag usage statistics (count published/draft content with this tag)
app.get('/api/content-tags/:id/usage', async (req, res) => {
  try {
    const tagId = req.params.id;
    let publishedCount = 0;
    let draftCount = 0;

    // Helper function to scan directory for tag usage
    const scanDirectory = async (dirPath) => {
      try {
        const files = await listFiles(dirPath);
        for (const file of files) {
          const filePath = path.join(dirPath, file);
          const content = await readJSONFile(filePath);

          // Check if content has this tag (check both old and new tag formats)
          const hasTag = content._contentTag === tagId ||
                        content.contentTag === tagId ||
                        content.standard_header?.contentTag === tagId;

          if (hasTag) {
            if (content.status === 'published') {
              publishedCount++;
            } else {
              draftCount++;
            }
          }
        }
      } catch (error) {
        // Directory might not exist, skip silently
      }
    };

    // Scan main content directory
    await scanDirectory(CONTENT_DIR);

    // Scan organization directories
    try {
      const orgsDir = path.join(DATA_DIR, 'orgs');
      const orgFolders = await fs.readdir(orgsDir);
      for (const orgSlug of orgFolders) {
        if (orgSlug === 'registry.json') continue;
        const orgContentDir = path.join(orgsDir, orgSlug);
        const stat = await fs.stat(orgContentDir);
        if (stat.isDirectory()) {
          await scanDirectory(orgContentDir);
        }
      }
    } catch (error) {
      // No organization content, skip
    }

    // Scan initiative directories
    try {
      const initiativesDir = path.join(DATA_DIR, 'initiatives');
      const initiativeFolders = await fs.readdir(initiativesDir);
      for (const initiativeSlug of initiativeFolders) {
        if (initiativeSlug === 'registry.json') continue;
        const initiativeContentDir = path.join(initiativesDir, initiativeSlug);
        const stat = await fs.stat(initiativeContentDir);
        if (stat.isDirectory()) {
          await scanDirectory(initiativeContentDir);
        }
      }
    } catch (error) {
      // No initiative content, skip
    }

    res.json({
      tagId,
      publishedCount,
      draftCount,
      totalCount: publishedCount + draftCount
    });
  } catch (error) {
    console.error('Tag usage error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COMMENTS ENDPOINTS
// ============================================

// GET all comments for a specific content item
app.get('/api/comments/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const commentsData = await readJSONFile(COMMENTS_FILE);
    
    const itemComments = commentsData.comments.filter(
      c => c.contentId === contentId && c.contentType === contentType
    );
    
    // Sort by timestamp (newest first)
    itemComments.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(itemComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all comments (for displaying counts across all content)
app.get('/api/comments', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    res.json(commentsData.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new comment
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contentId: req.body.contentId,
      contentType: req.body.contentType,
      author: req.body.author,
      text: req.body.text,
      timestamp: Date.now(),
      edited: false
    };
    
    const commentsData = await readJSONFile(COMMENTS_FILE);
    commentsData.comments.push(newComment);
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing comment
app.put('/api/comments/:id', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    const commentIndex = commentsData.comments.findIndex(c => c.id === req.params.id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Update only text, mark as edited
    commentsData.comments[commentIndex] = {
      ...commentsData.comments[commentIndex],
      text: req.body.text,
      edited: true,
      editedAt: Date.now()
    };
    
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.json(commentsData.comments[commentIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    const initialLength = commentsData.comments.length;
    
    commentsData.comments = commentsData.comments.filter(c => c.id !== req.params.id);
    
    if (commentsData.comments.length === initialLength) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// NOTE TAGS ENDPOINTS (separate from content tags)
// ============================================

// GET all note tags
app.get('/api/note-tags', async (req, res) => {
  try {
    const tags = await readJSONFile(NOTE_TAGS_FILE);
    res.json(tags.tags || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single note tag by ID
app.get('/api/note-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(NOTE_TAGS_FILE);
    const tag = tagsData.tags.find(t => t.id === req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Note tag not found' });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new note tag
app.post('/api/note-tags', async (req, res) => {
  try {
    const newTag = {
      ...req.body,
      created: new Date().toISOString()
    };
    
    const tagsData = await readJSONFile(NOTE_TAGS_FILE);
    
    // Check for duplicate ID
    if (tagsData.tags.some(t => t.id === newTag.id)) {
      return res.status(400).json({ error: 'Note tag ID already exists' });
    }
    
    tagsData.tags.push(newTag);
    await writeJSONFile(NOTE_TAGS_FILE, tagsData);
    
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing note tag
app.put('/api/note-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(NOTE_TAGS_FILE);
    const tagIndex = tagsData.tags.findIndex(t => t.id === req.params.id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Note tag not found' });
    }
    
    // Preserve created date
    const updatedTag = {
      ...req.body,
      created: tagsData.tags[tagIndex].created
    };
    
    tagsData.tags[tagIndex] = updatedTag;
    await writeJSONFile(NOTE_TAGS_FILE, tagsData);
    
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE note tag
app.delete('/api/note-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(NOTE_TAGS_FILE);
    const initialLength = tagsData.tags.length;
    
    tagsData.tags = tagsData.tags.filter(t => t.id !== req.params.id);
    
    if (tagsData.tags.length === initialLength) {
      return res.status(404).json({ error: 'Note tag not found' });
    }
    
    await writeJSONFile(NOTE_TAGS_FILE, tagsData);
    res.json({ message: 'Note tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET note tag usage statistics
app.get('/api/note-tags/:id/usage', async (req, res) => {
  try {
    const tagId = req.params.id;
    const NOTES_DIR = path.join(__dirname, 'data', 'notes', 'notes');
    let count = 0;

    try {
      const files = await listFiles(NOTES_DIR);
      for (const file of files) {
        const filePath = path.join(NOTES_DIR, file);
        const note = await readJSONFile(filePath);
        
        if (note.category === tagId) {
          count++;
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }

    res.json({
      tagId,
      noteCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/content`);
  console.log(`  POST   /api/content`);
  console.log(`  PUT    /api/content/:id`);
  console.log(`  DELETE /api/content/:id`);
  console.log(`  GET    /api/tenants`);
  console.log(`  POST   /api/tenants`);
  console.log(`  DELETE /api/tenants/:type/:slug`);
  console.log(`  GET    /api/tenants/:type/:slug/content`);
  console.log(`  GET    /api/tenants/:type/:slug/stats`);
  console.log(`  GET    /api/templates`);
  console.log(`  GET    /api/templates/:id`);
  console.log(`  POST   /api/templates`);
  console.log(`  PUT    /api/templates/:id`);
  console.log(`  DELETE /api/templates/:id`);
  console.log(`  POST   /api/import/:type (with file upload)`);
  console.log(`  POST   /api/upload-logo`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/verify`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/auth/users (admin)`);
  console.log(`  POST   /api/auth/users (admin)`);
  console.log(`  PUT    /api/auth/users/:id (admin)`);
  console.log(`  PUT    /api/auth/users/:id/password (admin)`);
  console.log(`  DELETE /api/auth/users/:id (admin)`);
  console.log(`  GET    /api/health`);
  console.log(`\n📌 Content Tags:`);
  console.log(`  GET    /api/content-tags`);
  console.log(`  GET    /api/content-tags/:id`);
  console.log(`  POST   /api/content-tags`);
  console.log(`  PUT    /api/content-tags/:id`);
  console.log(`  DELETE /api/content-tags/:id`);
  console.log(`  GET    /api/content-tags/:id/usage`);
  console.log(`\n💬 Comments:`);
  console.log(`  GET    /api/comments`);
  console.log(`  GET    /api/comments/:contentType/:contentId`);
  console.log(`  POST   /api/comments`);
  console.log(`  PUT    /api/comments/:id`);
  console.log(`  DELETE /api/comments/:id`);
});

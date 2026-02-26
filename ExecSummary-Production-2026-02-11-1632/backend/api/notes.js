/**
 * NOTES SYSTEM API
 * 
 * Manages notes and sections with many-to-many relationships
 * - Notes: Atomic units of information
 * - Sections: Collections/Reports (Weekly, Monthly, Quarterly, Custom)
 * - Links: Many-to-many junction table
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directories
const NOTES_DIR = path.join(__dirname, '../data/notes/notes');
const SECTIONS_DIR = path.join(__dirname, '../data/notes/sections');
const LINKS_FILE = path.join(__dirname, '../data/notes/links/note-section-links.json');

// Ensure directories exist
async function ensureDirectories() {
  await fs.mkdir(path.join(__dirname, '../data/notes'), { recursive: true });
  await fs.mkdir(NOTES_DIR, { recursive: true });
  await fs.mkdir(SECTIONS_DIR, { recursive: true });
  await fs.mkdir(path.join(__dirname, '../data/notes/links'), { recursive: true });
  
  // Initialize links file if it doesn't exist
  try {
    await fs.access(LINKS_FILE);
  } catch {
    await fs.writeFile(LINKS_FILE, JSON.stringify({ links: [] }, null, 2));
  }
}

// Helper: Read links
async function readLinks() {
  try {
    const data = await fs.readFile(LINKS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { links: [] };
  }
}

// Helper: Write links
async function writeLinks(linksData) {
  await fs.writeFile(LINKS_FILE, JSON.stringify(linksData, null, 2));
}

// Helper: Generate ID
function generateId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ==========================================
// NOTES ENDPOINTS
// ==========================================

/**
 * GET /api/notes
 * List all notes with optional filters
 * Query params: category, linkedType, linkedSlug, sectionId, taskId, search
 */
const getNotes = async (req, res) => {
  try {
    await ensureDirectories();
    
    const { category, linkedType, linkedSlug, sectionId, taskId, search } = req.query;
    
    // Read all note files
    const noteFiles = await fs.readdir(NOTES_DIR);
    const notes = [];
    
    for (const file of noteFiles) {
      if (file.endsWith('.json')) {
        const noteData = await fs.readFile(path.join(NOTES_DIR, file), 'utf8');
        const note = JSON.parse(noteData);
        notes.push(note);
      }
    }
    
    // Apply filters
    let filtered = notes;
    
    if (category) {
      filtered = filtered.filter(n => n.category === category);
    }
    
    if (linkedType && linkedSlug) {
      filtered = filtered.filter(n => 
        n.linkedTo && 
        n.linkedTo.type === linkedType && 
        n.linkedTo.slug === linkedSlug
      );
    }
    
    if (sectionId) {
      filtered = filtered.filter(n => n.sectionIds.includes(sectionId));
    }
    
    // NEW: Filter by taskId
    if (taskId) {
      filtered = filtered.filter(n => n.taskId === taskId);
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(searchLower) ||
        n.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      notes: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error getting notes:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve notes' });
  }
};

/**
 * GET /api/notes/:id
 * Get single note by ID
 */
const getNote = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(NOTES_DIR, `${id}.json`);
    
    const noteData = await fs.readFile(filePath, 'utf8');
    const note = JSON.parse(noteData);
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error getting note:', error);
    res.status(404).json({ success: false, error: 'Note not found' });
  }
};

/**
 * POST /api/notes
 * Create new note
 * Body: { title, content, category, linkedTo, sectionIds, tags }
 */
const createNote = async (req, res) => {
  try {
    await ensureDirectories();
    
    const { title, content, category, linkedTo, sectionIds, tags, businessUnits } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const note = {
      id: generateId('note'),
      title,
      content,
      category: category || 'general',
      businessUnits: Array.isArray(businessUnits) ? businessUnits : [],
      linkedTo: linkedTo || null,
      sectionIds: sectionIds || [],
      tags: tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'current-user' // TODO: Get from auth context
    };
    
    // Save note
    const filePath = path.join(NOTES_DIR, `${note.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(note, null, 2));
    
    // Create links if sections provided
    if (sectionIds && sectionIds.length > 0) {
      const linksData = await readLinks();
      
      for (let i = 0; i < sectionIds.length; i++) {
        linksData.links.push({
          noteId: note.id,
          sectionId: sectionIds[i],
          displayOrder: 999, // Add to end
          addedAt: new Date().toISOString()
        });
      }
      
      await writeLinks(linksData);
    }
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ success: false, error: 'Failed to create note' });
  }
};

/**
 * PUT /api/notes/:id
 * Update existing note
 */
const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, linkedTo, tags, businessUnits } = req.body;
    
    const filePath = path.join(NOTES_DIR, `${id}.json`);
    const noteData = await fs.readFile(filePath, 'utf8');
    const note = JSON.parse(noteData);
    
    // Update fields
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    if (businessUnits !== undefined) note.businessUnits = Array.isArray(businessUnits) ? businessUnits : [];
    if (linkedTo !== undefined) note.linkedTo = linkedTo;
    if (tags !== undefined) note.tags = tags;
    
    note.updatedAt = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(note, null, 2));
    
    res.json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ success: false, error: 'Failed to update note' });
  }
};

/**
 * DELETE /api/notes/:id
 * Delete note and all its section links
 */
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete note file
    const filePath = path.join(NOTES_DIR, `${id}.json`);
    await fs.unlink(filePath);
    
    // Remove all links
    const linksData = await readLinks();
    linksData.links = linksData.links.filter(link => link.noteId !== id);
    await writeLinks(linksData);
    
    res.json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ success: false, error: 'Failed to delete note' });
  }
};

// ==========================================
// SECTIONS ENDPOINTS
// ==========================================

/**
 * GET /api/sections
 * List all sections with metadata
 * Query params: status (active/archived/draft)
 */
const getSections = async (req, res) => {
  try {
    await ensureDirectories();
    
    const { status } = req.query;
    
    // Read all section files
    const sectionFiles = await fs.readdir(SECTIONS_DIR);
    const sections = [];
    
    for (const file of sectionFiles) {
      if (file.endsWith('.json')) {
        const sectionData = await fs.readFile(path.join(SECTIONS_DIR, file), 'utf8');
        const section = JSON.parse(sectionData);
        
        // Count notes in this section
        const linksData = await readLinks();
        const noteCount = linksData.links.filter(l => l.sectionId === section.id).length;
        section.noteCount = noteCount;
        
        sections.push(section);
      }
    }
    
    // Apply filters
    let filtered = sections;
    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }
    
    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      sections: filtered,
      total: filtered.length
    });
  } catch (error) {
    console.error('Error getting sections:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve sections' });
  }
};

/**
 * GET /api/sections/:id
 * Get section with all its notes
 */
const getSection = async (req, res) => {
  try {
    const { id } = req.params;
    const filePath = path.join(SECTIONS_DIR, `${id}.json`);
    
    const sectionData = await fs.readFile(filePath, 'utf8');
    const section = JSON.parse(sectionData);
    
    // Get linked notes
    const linksData = await readLinks();
    const sectionLinks = linksData.links
      .filter(l => l.sectionId === id)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    // Load note details
    const notes = [];
    for (const link of sectionLinks) {
      try {
        const noteData = await fs.readFile(path.join(NOTES_DIR, `${link.noteId}.json`), 'utf8');
        const note = JSON.parse(noteData);
        notes.push({
          ...note,
          displayOrder: link.displayOrder
        });
      } catch (err) {
        console.warn(`Note ${link.noteId} not found, skipping`);
      }
    }
    
    res.json({
      success: true,
      section: {
        ...section,
        notes
      }
    });
  } catch (error) {
    console.error('Error getting section:', error);
    res.status(404).json({ success: false, error: 'Section not found' });
  }
};

/**
 * POST /api/sections
 * Create new section
 * Body: { name, description, type, startDate, endDate, color, icon }
 */
const createSection = async (req, res) => {
  try {
    await ensureDirectories();
    
    const { name, description, type, startDate, endDate, color, icon } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Section name is required' });
    }
    
    const section = {
      id: generateId('section'),
      name,
      description: description || '',
      type: type || 'custom',
      startDate: startDate || null,
      endDate: endDate || null,
      status: 'active',
      noteOrder: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'current-user', // TODO: Get from auth context
      color: color || 'blue',
      icon: icon || 'FileText',
      exportSettings: {
        includeTableOfContents: true,
        groupBy: 'category',
        format: 'detailed'
      }
    };
    
    // Save section
    const filePath = path.join(SECTIONS_DIR, `${section.id}.json`);
    await fs.writeFile(filePath, JSON.stringify(section, null, 2));
    
    res.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Error creating section:', error);
    res.status(500).json({ success: false, error: 'Failed to create section' });
  }
};

/**
 * PUT /api/sections/:id
 * Update section metadata
 */
const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const filePath = path.join(SECTIONS_DIR, `${id}.json`);
    const sectionData = await fs.readFile(filePath, 'utf8');
    const section = JSON.parse(sectionData);
    
    // Update allowed fields
    const allowedFields = ['name', 'description', 'type', 'startDate', 'endDate', 'color', 'icon', 'exportSettings'];
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        section[field] = updates[field];
      }
    });
    
    section.updatedAt = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(section, null, 2));
    
    res.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Error updating section:', error);
    res.status(500).json({ success: false, error: 'Failed to update section' });
  }
};

/**
 * PUT /api/sections/:id/archive
 * Archive/unarchive section
 */
const archiveSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { archive } = req.body; // true or false
    
    const filePath = path.join(SECTIONS_DIR, `${id}.json`);
    const sectionData = await fs.readFile(filePath, 'utf8');
    const section = JSON.parse(sectionData);
    
    section.status = archive ? 'archived' : 'active';
    section.updatedAt = new Date().toISOString();
    
    await fs.writeFile(filePath, JSON.stringify(section, null, 2));
    
    res.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Error archiving section:', error);
    res.status(500).json({ success: false, error: 'Failed to archive section' });
  }
};

/**
 * DELETE /api/sections/:id
 * Delete section (keeps notes, removes links)
 */
const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete section file
    const filePath = path.join(SECTIONS_DIR, `${id}.json`);
    await fs.unlink(filePath);
    
    // Remove all links to this section
    const linksData = await readLinks();
    linksData.links = linksData.links.filter(link => link.sectionId !== id);
    await writeLinks(linksData);
    
    res.json({
      success: true,
      message: 'Section deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting section:', error);
    res.status(500).json({ success: false, error: 'Failed to delete section' });
  }
};

// ==========================================
// LINKING ENDPOINTS
// ==========================================

/**
 * POST /api/sections/:id/notes
 * Add note(s) to section
 * Body: { noteIds: string[] }
 */
const addNotesToSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteIds } = req.body;
    
    if (!noteIds || !Array.isArray(noteIds)) {
      return res.status(400).json({ error: 'noteIds array is required' });
    }
    
    const linksData = await readLinks();
    
    // Find max display order for this section
    const sectionLinks = linksData.links.filter(l => l.sectionId === id);
    let maxOrder = sectionLinks.length > 0 
      ? Math.max(...sectionLinks.map(l => l.displayOrder)) 
      : 0;
    
    // Add new links
    const newLinks = [];
    for (const noteId of noteIds) {
      // Check if link already exists
      const exists = linksData.links.some(l => 
        l.noteId === noteId && l.sectionId === id
      );
      
      if (!exists) {
        maxOrder++;
        const link = {
          noteId,
          sectionId: id,
          displayOrder: maxOrder,
          addedAt: new Date().toISOString()
        };
        linksData.links.push(link);
        newLinks.push(link);
        
        // Update note's sectionIds
        try {
          const noteFile = path.join(NOTES_DIR, `${noteId}.json`);
          const noteData = await fs.readFile(noteFile, 'utf8');
          const note = JSON.parse(noteData);
          if (!note.sectionIds.includes(id)) {
            note.sectionIds.push(id);
            await fs.writeFile(noteFile, JSON.stringify(note, null, 2));
          }
        } catch (err) {
          console.warn(`Could not update note ${noteId}:`, err);
        }
      }
    }
    
    await writeLinks(linksData);
    
    res.json({
      success: true,
      added: newLinks.length,
      links: newLinks
    });
  } catch (error) {
    console.error('Error adding notes to section:', error);
    res.status(500).json({ success: false, error: 'Failed to add notes to section' });
  }
};

/**
 * DELETE /api/sections/:id/notes/:noteId
 * Remove note from section
 */
const removeNoteFromSection = async (req, res) => {
  try {
    const { id, noteId } = req.params;
    
    const linksData = await readLinks();
    const initialLength = linksData.links.length;
    
    linksData.links = linksData.links.filter(link => 
      !(link.noteId === noteId && link.sectionId === id)
    );
    
    await writeLinks(linksData);
    
    // Update note's sectionIds
    try {
      const noteFile = path.join(NOTES_DIR, `${noteId}.json`);
      const noteData = await fs.readFile(noteFile, 'utf8');
      const note = JSON.parse(noteData);
      note.sectionIds = note.sectionIds.filter(sid => sid !== id);
      await fs.writeFile(noteFile, JSON.stringify(note, null, 2));
    } catch (err) {
      console.warn(`Could not update note ${noteId}:`, err);
    }
    
    const removed = initialLength > linksData.links.length;
    
    res.json({
      success: true,
      removed
    });
  } catch (error) {
    console.error('Error removing note from section:', error);
    res.status(500).json({ success: false, error: 'Failed to remove note from section' });
  }
};

/**
 * GET /api/notes/count/by-task
 * Get note counts grouped by task ID
 * Query params: taskIds (comma-separated) or returns all
 */
const getNoteCountsByTask = async (req, res) => {
  try {
    await ensureDirectories();
    
    const { taskIds } = req.query;
    
    // Read all note files
    const noteFiles = await fs.readdir(NOTES_DIR);
    const taskCounts = {};
    
    for (const file of noteFiles) {
      if (file.endsWith('.json')) {
        const noteData = await fs.readFile(path.join(NOTES_DIR, file), 'utf8');
        const note = JSON.parse(noteData);
        
        if (note.taskId) {
          taskCounts[note.taskId] = (taskCounts[note.taskId] || 0) + 1;
        }
      }
    }
    
    // Filter by requested taskIds if provided
    let result = taskCounts;
    if (taskIds) {
      const requestedIds = taskIds.split(',');
      result = {};
      requestedIds.forEach(id => {
        result[id] = taskCounts[id] || 0;
      });
    }
    
    res.json({
      success: true,
      counts: result
    });
  } catch (error) {
    console.error('Error getting note counts:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve note counts' });
  }
};

/**
 * PUT /api/sections/:id/reorder
 * Reorder notes in section
 * Body: { noteOrder: string[] } - array of note IDs in desired order
 */
const reorderNotesInSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { noteOrder } = req.body;
    
    if (!noteOrder || !Array.isArray(noteOrder)) {
      return res.status(400).json({ error: 'noteOrder array is required' });
    }
    
    const linksData = await readLinks();
    
    // Update display order for each note in this section
    noteOrder.forEach((noteId, index) => {
      const link = linksData.links.find(l => 
        l.noteId === noteId && l.sectionId === id
      );
      if (link) {
        link.displayOrder = index;
      }
    });
    
    await writeLinks(linksData);
    
    res.json({
      success: true,
      message: 'Notes reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering notes:', error);
    res.status(500).json({ success: false, error: 'Failed to reorder notes' });
  }
};

// ==========================================
// EXPORT
// ==========================================

export {
  // Notes
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getNoteCountsByTask,
  
  // Sections
  getSections,
  getSection,
  createSection,
  updateSection,
  archiveSection,
  deleteSection,
  
  // Linking
  addNotesToSection,
  removeNoteFromSection,
  reorderNotesInSection
};

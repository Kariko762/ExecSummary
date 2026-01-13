import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const TAGS_FILE = path.join(__dirname, '../data/tags.json');

// Helper: Read tags
async function readTags() {
  try {
    const data = await fs.readFile(TAGS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return { tags: [] };
  }
}

// Helper: Write tags
async function writeTags(data) {
  await fs.writeFile(TAGS_FILE, JSON.stringify(data, null, 2));
}

// GET /api/tags - Get all tags
router.get('/', async (req, res) => {
  try {
    const data = await readTags();
    res.json({ success: true, tags: data.tags });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch tags' });
  }
});

// POST /api/tags - Create new tag
router.post('/', async (req, res) => {
  try {
    const { name, color, description } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ success: false, error: 'Name and color are required' });
    }
    
    const data = await readTags();
    
    // Check for duplicate names
    if (data.tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Tag with this name already exists' });
    }
    
    const newTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      description: description || '',
      createdAt: new Date().toISOString()
    };
    
    data.tags.push(newTag);
    await writeTags(data);
    
    res.json({ success: true, tag: newTag });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ success: false, error: 'Failed to create tag' });
  }
});

// PUT /api/tags/:id - Update tag
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    
    const data = await readTags();
    const tagIndex = data.tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }
    
    // Check for duplicate names (excluding current tag)
    if (name && data.tags.some(tag => tag.id !== id && tag.name.toLowerCase() === name.toLowerCase())) {
      return res.status(400).json({ success: false, error: 'Tag with this name already exists' });
    }
    
    data.tags[tagIndex] = {
      ...data.tags[tagIndex],
      name: name || data.tags[tagIndex].name,
      color: color || data.tags[tagIndex].color,
      description: description !== undefined ? description : data.tags[tagIndex].description
    };
    
    await writeTags(data);
    
    res.json({ success: true, tag: data.tags[tagIndex] });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ success: false, error: 'Failed to update tag' });
  }
});

// DELETE /api/tags/:id - Delete tag
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await readTags();
    const tagIndex = data.tags.findIndex(tag => tag.id === id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ success: false, error: 'Tag not found' });
    }
    
    // Check if tag is in use by any notes
    const notesFile = path.join(__dirname, '../data/timeline-notes.json');
    try {
      const notesData = await fs.readFile(notesFile, 'utf-8');
      const notes = JSON.parse(notesData);
      
      const isInUse = notes.notes?.some(note => note.tag === id);
      if (isInUse) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete tag that is in use by notes. Please remove tag from notes first.' 
        });
      }
    } catch (error) {
      // If timeline-notes.json doesn't exist or can't be read, proceed with deletion
      console.warn('Could not check tag usage in notes:', error);
    }
    
    data.tags.splice(tagIndex, 1);
    await writeTags(data);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ success: false, error: 'Failed to delete tag' });
  }
});

// GET /api/tags/:id/usage - Get tag usage count
router.get('/:id/usage', async (req, res) => {
  try {
    const { id } = req.params;
    
    const notesFile = path.join(__dirname, '../data/timeline-notes.json');
    let count = 0;
    
    try {
      const notesData = await fs.readFile(notesFile, 'utf-8');
      const notes = JSON.parse(notesData);
      count = notes.notes?.filter(note => note.tag === id).length || 0;
    } catch (error) {
      // If file doesn't exist, count is 0
      count = 0;
    }
    
    res.json({ success: true, count });
  } catch (error) {
    console.error('Error getting tag usage:', error);
    res.status(500).json({ success: false, error: 'Failed to get tag usage' });
  }
});

export default router;

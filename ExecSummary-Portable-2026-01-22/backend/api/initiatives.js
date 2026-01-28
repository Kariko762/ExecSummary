import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const INITIATIVES_FILE = path.join(__dirname, '../data/initiatives/registry.json');
const GOALS_FILE = path.join(__dirname, '../data/goals/goals.json');

// Helper function to read initiatives
async function readInitiatives() {
  try {
    const data = await fs.readFile(INITIATIVES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading initiatives:', error);
    return { initiatives: [] };
  }
}

// Helper function to write initiatives
async function writeInitiatives(data) {
  try {
    await fs.writeFile(INITIATIVES_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing initiatives:', error);
    return false;
  }
}

// Helper function to read goals
async function readGoals() {
  try {
    const data = await fs.readFile(GOALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading goals:', error);
    return { goals: [] };
  }
}

// GET all initiatives
router.get('/', async (req, res) => {
  try {
    const data = await readInitiatives();
    res.json({ success: true, initiatives: data.initiatives });
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch initiatives' });
  }
});

// GET single initiative with linked goals
router.get('/:id', async (req, res) => {
  try {
    const initiativesData = await readInitiatives();
    const goalsData = await readGoals();
    
    const initiative = initiativesData.initiatives.find(i => i.id === req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    // Fetch linked goals
    const linkedGoals = initiative.linkedGoals 
      ? goalsData.goals.filter(g => initiative.linkedGoals.includes(g.id))
      : [];
    
    res.json({ 
      success: true, 
      initiative,
      linkedGoals 
    });
  } catch (error) {
    console.error('Error fetching initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch initiative' });
  }
});

// POST create new initiative
router.post('/', async (req, res) => {
  try {
    const data = await readInitiatives();
    const newInitiative = {
      ...req.body,
      id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      linkedAssets: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Check for duplicate ID
    if (data.initiatives.find(i => i.id === newInitiative.id)) {
      return res.status(400).json({ success: false, error: 'Initiative with this ID already exists' });
    }
    
    data.initiatives.push(newInitiative);
    const success = await writeInitiatives(data);
    
    if (success) {
      res.status(201).json({ success: true, initiative: newInitiative });
    } else {
      res.status(500).json({ success: false, error: 'Failed to create initiative' });
    }
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to create initiative' });
  }
});

// PUT update existing initiative
router.put('/:id', async (req, res) => {
  try {
    const data = await readInitiatives();
    const index = data.initiatives.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    data.initiatives[index] = {
      ...data.initiatives[index],
      ...req.body,
      id: req.params.id, // Preserve original ID
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    const success = await writeInitiatives(data);
    
    if (success) {
      res.json({ success: true, initiative: data.initiatives[index] });
    } else {
      res.status(500).json({ success: false, error: 'Failed to update initiative' });
    }
  } catch (error) {
    console.error('Error updating initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to update initiative' });
  }
});

// DELETE initiative
router.delete('/:id', async (req, res) => {
  try {
    const data = await readInitiatives();
    const index = data.initiatives.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    data.initiatives.splice(index, 1);
    const success = await writeInitiatives(data);
    
    if (success) {
      res.json({ success: true, message: 'Initiative deleted successfully' });
    } else {
      res.status(500).json({ success: false, error: 'Failed to delete initiative' });
    }
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to delete initiative' });
  }
});

export default router;

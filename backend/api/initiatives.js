import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { logInitiativeCreated, logInitiativeUpdated, logInitiativeDeleted } from '../utils/change-control-logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const INITIATIVES_DIR = path.join(__dirname, '../data/initiatives');
const GOALS_FILE = path.join(__dirname, '../data/goals/goals.json');

// Helper function to discover all initiative files
async function discoverInitiatives() {
  try {
    console.log('📁 Discovering initiatives in:', INITIATIVES_DIR);
    const files = await fs.readdir(INITIATIVES_DIR);
    console.log('📂 Found files:', files);
    const initiatives = [];
    
    for (const file of files) {
      // Skip non-JSON files and special files
      if (!file.endsWith('.json') || file === 'index.json' || file === 'registry.json') {
        console.log(`⏭️  Skipping ${file}`);
        continue;
      }
      
      try {
        const filePath = path.join(INITIATIVES_DIR, file);
        console.log(`📖 Reading ${file}...`);
        const content = await fs.readFile(filePath, 'utf8');
        const initiative = JSON.parse(content);
        
        // Extract metadata for list view with executive-level data
        initiatives.push({
          id: initiative.id,
          name: initiative.name,
          shortName: initiative.shortName,
          status: initiative.status,
          priority: initiative.priority,
          category: initiative.category,
          owner: initiative.owner,
          sponsor: initiative.sponsor,
          progress: initiative.progress || 0,
          startDate: initiative.startDate,
          endDate: initiative.endDate,
          linkedGoals: initiative.linkedGoals || [],
          linkedAssets: initiative.linkedAssets,
          smartGoal: initiative.smartGoal ? {
            statement: initiative.smartGoal.statement,
            measurable: initiative.smartGoal.measurable
          } : undefined,
          budget: initiative.budget ? {
            total: initiative.budget.total,
            allocated: initiative.budget.allocated,
            spent: initiative.budget.spent,
            currency: initiative.budget.currency
          } : undefined,
          businessCase: initiative.businessCase ? {
            roi: initiative.businessCase.roi,
            paybackPeriod: initiative.businessCase.paybackPeriod
          } : undefined
        });
        console.log(`✅ Added initiative: ${initiative.name}`);
      } catch (error) {
        console.error(`❌ Error reading ${file}:`, error.message);
        // Skip invalid JSON files
      }
    }
    
    console.log(`📊 Total initiatives found: ${initiatives.length}`);
    return initiatives;
  } catch (error) {
    console.error('❌ Error discovering initiatives:', error);
    return [];
  }
}

// Helper function to read single initiative file
async function readInitiative(id) {
  try {
    const filePath = path.join(INITIATIVES_DIR, `${id}.json`);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading initiative ${id}:`, error);
    return null;
  }
}

// Helper function to write single initiative file
async function writeInitiative(id, data) {
  try {
    const filePath = path.join(INITIATIVES_DIR, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error writing initiative ${id}:`, error);
    return false;
  }
}

// Helper function to delete initiative file
async function deleteInitiativeFile(id) {
  try {
    const filePath = path.join(INITIATIVES_DIR, `${id}.json`);
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting initiative ${id}:`, error);
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

// GET all initiatives (from index for performance)
router.get('/', async (req, res) => {
  try {
    const initiatives = await discoverInitiatives();
    res.json({ success: true, initiatives });
  } catch (error) {
    console.error('Error fetching initiatives:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch initiatives' });
  }
});

// GET single initiative with linked goals (from individual file)
router.get('/:id', async (req, res) => {
  try {
    const initiative = await readInitiative(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    // Fetch linked goals
    const goalsData = await readGoals();
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
    const newInitiative = {
      ...req.body,
      id: req.body.id || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      createdAt: req.body.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check if initiative already exists
    const existing = await readInitiative(newInitiative.id);
    if (existing) {
      return res.status(400).json({ success: false, error: 'Initiative with this ID already exists' });
    }
    
    // Write individual initiative file (that's it - no index to update!)
    const writeSuccess = await writeInitiative(newInitiative.id, newInitiative);
    if (!writeSuccess) {
      return res.status(500).json({ success: false, error: 'Failed to create initiative file' });
    }
    
    // Log initiative creation
    await logInitiativeCreated(newInitiative);
    
    res.status(201).json({ success: true, initiative: newInitiative });
  } catch (error) {
    console.error('Error creating initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to create initiative' });
  }
});

// PUT update existing initiative
router.put('/:id', async (req, res) => {
  try {
    const initiative = await readInitiative(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    const oldInitiative = { ...initiative };
    
    const updatedInitiative = {
      ...initiative,
      ...req.body,
      id: req.params.id, // Preserve original ID
      updatedAt: new Date().toISOString()
    };
    
    // Write updated initiative file (that's it - auto-discovered on next GET)
    const writeSuccess = await writeInitiative(req.params.id, updatedInitiative);
    if (!writeSuccess) {
      return res.status(500).json({ success: false, error: 'Failed to update initiative file' });
    }
    
    // Log initiative update
    await logInitiativeUpdated(req.params.id, req.body, oldInitiative);
    
    res.json({ success: true, initiative: updatedInitiative });
  } catch (error) {
    console.error('Error updating initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to update initiative' });
  }
});

// DELETE initiative
router.delete('/:id', async (req, res) => {
  try {
    const initiative = await readInitiative(req.params.id);
    
    if (!initiative) {
      return res.status(404).json({ success: false, error: 'Initiative not found' });
    }
    
    // Delete initiative file (that's it - auto-removed from list)
    const deleteSuccess = await deleteInitiativeFile(req.params.id);
    if (!deleteSuccess) {
      return res.status(500).json({ success: false, error: 'Failed to delete initiative file' });
    }
    
    // Log initiative deletion
    await logInitiativeDeleted(initiative);
    
    res.json({ success: true, message: 'Initiative deleted successfully' });
  } catch (error) {
    console.error('Error deleting initiative:', error);
    res.status(500).json({ success: false, error: 'Failed to delete initiative' });
  }
});

export default router;

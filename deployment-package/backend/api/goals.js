import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const GOALS_FILE = path.join(__dirname, '../data/goals/goals.json');

// Helper function to read goals
async function readGoals() {
  try {
    const data = await fs.readFile(GOALS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading goals:', error);
    return { goals: [], categories: [] };
  }
}

// Helper function to write goals
async function writeGoals(data) {
  try {
    await fs.writeFile(GOALS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing goals:', error);
    return false;
  }
}

// GET all goals
router.get('/', async (req, res) => {
  try {
    const data = await readGoals();
    res.json(data);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// GET single goal by ID
router.get('/:id', async (req, res) => {
  try {
    const data = await readGoals();
    const goal = data.goals.find(g => g.id === req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(500).json({ error: 'Failed to fetch goal' });
  }
});

// POST create new goal
router.post('/', async (req, res) => {
  try {
    const data = await readGoals();
    const newGoal = {
      ...req.body,
      id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      linkedAssets: 0,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    // Check for duplicate ID
    if (data.goals.find(g => g.id === newGoal.id)) {
      return res.status(400).json({ error: 'Goal with this ID already exists' });
    }
    
    data.goals.push(newGoal);
    const success = await writeGoals(data);
    
    if (success) {
      res.status(201).json(newGoal);
    } else {
      res.status(500).json({ error: 'Failed to create goal' });
    }
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PUT update existing goal
router.put('/:id', async (req, res) => {
  try {
    const data = await readGoals();
    const index = data.goals.findIndex(g => g.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    data.goals[index] = {
      ...data.goals[index],
      ...req.body,
      id: req.params.id, // Preserve original ID
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    
    const success = await writeGoals(data);
    
    if (success) {
      res.json(data.goals[index]);
    } else {
      res.status(500).json({ error: 'Failed to update goal' });
    }
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE goal
router.delete('/:id', async (req, res) => {
  try {
    const data = await readGoals();
    const index = data.goals.findIndex(g => g.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    data.goals.splice(index, 1);
    const success = await writeGoals(data);
    
    if (success) {
      res.json({ success: true, message: 'Goal deleted' });
    } else {
      res.status(500).json({ error: 'Failed to delete goal' });
    }
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// POST update linked assets count
router.post('/:id/update-count', async (req, res) => {
  try {
    const data = await readGoals();
    const goal = data.goals.find(g => g.id === req.params.id);
    
    if (!goal) {
      return res.status(404).json({ error: 'Goal not found' });
    }
    
    goal.linkedAssets = req.body.count || 0;
    goal.lastUpdated = new Date().toISOString().split('T')[0];
    
    const success = await writeGoals(data);
    
    if (success) {
      res.json(goal);
    } else {
      res.status(500).json({ error: 'Failed to update count' });
    }
  } catch (error) {
    console.error('Error updating linked assets count:', error);
    res.status(500).json({ error: 'Failed to update count' });
  }
});

// ===== CATEGORIES MANAGEMENT =====

// GET all categories
router.get('/categories/all', async (req, res) => {
  try {
    const data = await readGoals();
    res.json(data.categories || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST create category
router.post('/categories/create', async (req, res) => {
  try {
    const data = await readGoals();
    const newCategory = {
      id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...req.body
    };
    
    data.categories = data.categories || [];
    data.categories.push(newCategory);
    
    const success = await writeGoals(data);
    if (success) {
      res.json(newCategory);
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// PUT update category
router.put('/categories/:id', async (req, res) => {
  try {
    const data = await readGoals();
    const index = data.categories.findIndex(c => c.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    data.categories[index] = { ...data.categories[index], ...req.body, id: req.params.id };
    
    const success = await writeGoals(data);
    if (success) {
      res.json(data.categories[index]);
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
  try {
    const data = await readGoals();
    data.categories = data.categories.filter(c => c.id !== req.params.id);
    
    const success = await writeGoals(data);
    if (success) {
      res.json({ message: 'Category deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ===== CRO IMPACT AREAS MANAGEMENT =====

// GET all CRO impact areas
router.get('/cro-impact/all', async (req, res) => {
  try {
    const data = await readGoals();
    res.json(data.croImpactAreas || []);
  } catch (error) {
    console.error('Error fetching CRO impact areas:', error);
    res.status(500).json({ error: 'Failed to fetch CRO impact areas' });
  }
});

// POST create CRO impact area
router.post('/cro-impact/create', async (req, res) => {
  try {
    const data = await readGoals();
    const newArea = {
      id: req.body.id || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      ...req.body
    };
    
    data.croImpactAreas = data.croImpactAreas || [];
    data.croImpactAreas.push(newArea);
    
    const success = await writeGoals(data);
    if (success) {
      res.json(newArea);
    } else {
      res.status(500).json({ error: 'Failed to create CRO impact area' });
    }
  } catch (error) {
    console.error('Error creating CRO impact area:', error);
    res.status(500).json({ error: 'Failed to create CRO impact area' });
  }
});

// PUT update CRO impact area
router.put('/cro-impact/:id', async (req, res) => {
  try {
    const data = await readGoals();
    const index = data.croImpactAreas.findIndex(a => a.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'CRO impact area not found' });
    }
    
    data.croImpactAreas[index] = { ...data.croImpactAreas[index], ...req.body, id: req.params.id };
    
    const success = await writeGoals(data);
    if (success) {
      res.json(data.croImpactAreas[index]);
    } else {
      res.status(500).json({ error: 'Failed to update CRO impact area' });
    }
  } catch (error) {
    console.error('Error updating CRO impact area:', error);
    res.status(500).json({ error: 'Failed to update CRO impact area' });
  }
});

// DELETE CRO impact area
router.delete('/cro-impact/:id', async (req, res) => {
  try {
    const data = await readGoals();
    data.croImpactAreas = data.croImpactAreas.filter(a => a.id !== req.params.id);
    
    const success = await writeGoals(data);
    if (success) {
      res.json({ message: 'CRO impact area deleted successfully' });
    } else {
      res.status(500).json({ error: 'Failed to delete CRO impact area' });
    }
  } catch (error) {
    console.error('Error deleting CRO impact area:', error);
    res.status(500).json({ error: 'Failed to delete CRO impact area' });
  }
});

export default router;

import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/businessUnits.json');

// Helper function to read business units
async function readBusinessUnits() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading business units:', error);
    return [];
  }
}

// Helper function to write business units
async function writeBusinessUnits(units) {
  await fs.writeFile(DATA_FILE, JSON.stringify(units, null, 2));
}

// Helper function to get all descendants of a unit
function getDescendants(units, parentId) {
  const descendants = [];
  const children = units.filter(u => u.parentId === parentId);
  
  for (const child of children) {
    descendants.push(child);
    descendants.push(...getDescendants(units, child.id));
  }
  
  return descendants;
}

// Helper function to build hierarchy
function buildHierarchy(units, parentId = null) {
  return units
    .filter(u => u.parentId === parentId)
    .map(unit => ({
      ...unit,
      children: buildHierarchy(units, unit.id)
    }));
}

// GET all business units (with optional hierarchy format)
router.get('/', async (req, res) => {
  try {
    const units = await readBusinessUnits();
    const { format } = req.query;
    
    if (format === 'hierarchy') {
      const hierarchy = buildHierarchy(units);
      res.json({ success: true, units: hierarchy });
    } else {
      res.json({ success: true, units });
    }
  } catch (error) {
    console.error('Error fetching business units:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single business unit by ID
router.get('/:id', async (req, res) => {
  try {
    const units = await readBusinessUnits();
    const unit = units.find(u => u.id === req.params.id);
    
    if (!unit) {
      return res.status(404).json({ success: false, error: 'Business unit not found' });
    }
    
    res.json({ success: true, unit });
  } catch (error) {
    console.error('Error fetching business unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET all people assigned to a unit (with rollup from children)
router.get('/:id/people', async (req, res) => {
  try {
    const units = await readBusinessUnits();
    const unit = units.find(u => u.id === req.params.id);
    
    if (!unit) {
      return res.status(404).json({ success: false, error: 'Business unit not found' });
    }
    
    // Get all descendants
    const descendants = getDescendants(units, unit.id);
    const allUnitIds = [unit.id, ...descendants.map(d => d.id)];
    
    // Get people assigned to any of these units
    const peopleData = await fs.readFile(path.join(__dirname, '../data/people.json'), 'utf8');
    const people = JSON.parse(peopleData);
    
    const assignedPeople = people.filter(person => 
      person.assignedUnits.some(unitId => allUnitIds.includes(unitId))
    );
    
    res.json({ success: true, people: assignedPeople, unitIds: allUnitIds });
  } catch (error) {
    console.error('Error fetching people for business unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new business unit
router.post('/', async (req, res) => {
  try {
    const { name, level, parentId } = req.body;
    
    if (!name || !level) {
      return res.status(400).json({ success: false, error: 'Name and level are required' });
    }
    
    const units = await readBusinessUnits();
    
    // Build full path
    let fullPath = name;
    if (parentId) {
      const parent = units.find(u => u.id === parentId);
      if (parent) {
        fullPath = `${parent.fullPath} > ${name}`;
      }
    }
    
    const newUnit = {
      id: `${level.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      level,
      parentId: parentId || null,
      fullPath
    };
    
    units.push(newUnit);
    await writeBusinessUnits(units);
    
    res.json({ success: true, unit: newUnit });
  } catch (error) {
    console.error('Error creating business unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update business unit
router.put('/:id', async (req, res) => {
  try {
    const { name, level, parentId } = req.body;
    const units = await readBusinessUnits();
    const index = units.findIndex(u => u.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Business unit not found' });
    }
    
    // Build full path
    let fullPath = name;
    if (parentId) {
      const parent = units.find(u => u.id === parentId);
      if (parent) {
        fullPath = `${parent.fullPath} > ${name}`;
      }
    }
    
    units[index] = {
      ...units[index],
      name,
      level,
      parentId: parentId || null,
      fullPath
    };
    
    // Update full paths of all descendants
    const updateDescendantPaths = (unitId) => {
      const children = units.filter(u => u.parentId === unitId);
      for (const child of children) {
        const parent = units.find(u => u.id === child.parentId);
        child.fullPath = `${parent.fullPath} > ${child.name}`;
        updateDescendantPaths(child.id);
      }
    };
    updateDescendantPaths(units[index].id);
    
    await writeBusinessUnits(units);
    
    res.json({ success: true, unit: units[index] });
  } catch (error) {
    console.error('Error updating business unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE business unit
router.delete('/:id', async (req, res) => {
  try {
    const units = await readBusinessUnits();
    const unit = units.find(u => u.id === req.params.id);
    
    if (!unit) {
      return res.status(404).json({ success: false, error: 'Business unit not found' });
    }
    
    // Check if unit has children
    const hasChildren = units.some(u => u.parentId === req.params.id);
    if (hasChildren) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete unit with children. Delete children first.' 
      });
    }
    
    const filteredUnits = units.filter(u => u.id !== req.params.id);
    await writeBusinessUnits(filteredUnits);
    
    res.json({ success: true, message: 'Business unit deleted' });
  } catch (error) {
    console.error('Error deleting business unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

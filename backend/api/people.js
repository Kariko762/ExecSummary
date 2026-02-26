import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/people.json');

// Helper function to read people
async function readPeople() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading people:', error);
    return [];
  }
}

// Helper function to write people
async function writePeople(people) {
  await fs.writeFile(DATA_FILE, JSON.stringify(people, null, 2));
}

// GET all people
router.get('/', async (req, res) => {
  try {
    const people = await readPeople();
    res.json({ success: true, people });
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single person by ID
router.get('/:id', async (req, res) => {
  try {
    const people = await readPeople();
    const person = people.find(p => p.id === req.params.id);
    
    if (!person) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }
    
    res.json({ success: true, person });
  } catch (error) {
    console.error('Error fetching person:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET people by business unit (with rollup from children)
router.get('/by-unit/:unitId', async (req, res) => {
  try {
    const people = await readPeople();
    
    // Get all descendants of the unit
    const unitsData = await fs.readFile(path.join(__dirname, '../data/businessUnits.json'), 'utf8');
    const units = JSON.parse(unitsData);
    
    // Helper to get descendants
    function getDescendants(parentId) {
      const descendants = [];
      const children = units.filter(u => u.parentId === parentId);
      
      for (const child of children) {
        descendants.push(child);
        descendants.push(...getDescendants(child.id));
      }
      
      return descendants;
    }
    
    const descendants = getDescendants(req.params.unitId);
    const allUnitIds = [req.params.unitId, ...descendants.map(d => d.id)];
    
    const assignedPeople = people.filter(person => 
      person.assignedUnits.some(unitId => allUnitIds.includes(unitId))
    );
    
    res.json({ success: true, people: assignedPeople });
  } catch (error) {
    console.error('Error fetching people by unit:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new person
router.post('/', async (req, res) => {
  try {
    const { email, firstName, lastName, role, function: func, region, managerId, assignedUnits } = req.body;
    
    if (!email || !firstName || !lastName) {
      return res.status(400).json({ success: false, error: 'Email, first name, and last name are required' });
    }
    
    const people = await readPeople();
    
    // Check for duplicate email
    if (people.some(p => p.email === email)) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    
    const newPerson = {
      id: `person-${Date.now()}`,
      email,
      firstName,
      lastName,
      role: role || '',
      function: func || '',
      region: region || '',
      managerId: managerId || '',
      assignedUnits: assignedUnits || []
    };
    
    people.push(newPerson);
    await writePeople(people);
    
    res.json({ success: true, person: newPerson });
  } catch (error) {
    console.error('Error creating person:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update person
router.put('/:id', async (req, res) => {
  try {
    const { email, firstName, lastName, role, function: func, region, managerId, assignedUnits, vendorLicenses, technologyAssignments } = req.body;
    const people = await readPeople();
    const index = people.findIndex(p => p.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }
    
    // Check for duplicate email (excluding current person)
    if (people.some(p => p.email === email && p.id !== req.params.id)) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    
    people[index] = {
      ...people[index],
      email,
      firstName,
      lastName,
      role: role || '',
      function: func || '',
      region: region || '',
      managerId: managerId || '',
      assignedUnits: assignedUnits || [],
      vendorLicenses: vendorLicenses || people[index].vendorLicenses || [],
      technologyAssignments: technologyAssignments || people[index].technologyAssignments || []
    };
    
    await writePeople(people);
    
    res.json({ success: true, person: people[index] });
  } catch (error) {
    console.error('Error updating person:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE person
router.delete('/:id', async (req, res) => {
  try {
    const people = await readPeople();
    const filteredPeople = people.filter(p => p.id !== req.params.id);
    
    if (filteredPeople.length === people.length) {
      return res.status(404).json({ success: false, error: 'Person not found' });
    }
    
    await writePeople(filteredPeople);
    
    res.json({ success: true, message: 'Person deleted' });
  } catch (error) {
    console.error('Error deleting person:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

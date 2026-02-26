import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_FILE = path.join(__dirname, '../data/technologiesMenu.json');

// Helper function to read menu items
async function readMenuItems() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading technologies menu:', error);
    return [];
  }
}

// Helper function to write menu items
async function writeMenuItems(items) {
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2));
}

// GET all menu items (sorted by order)
router.get('/', async (req, res) => {
  try {
    const items = await readMenuItems();
    const sortedItems = items.sort((a, b) => a.order - b.order);
    res.json({ success: true, items: sortedItems });
  } catch (error) {
    console.error('Error fetching technologies menu:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single menu item by ID
router.get('/:id', async (req, res) => {
  try {
    const items = await readMenuItems();
    const item = items.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    res.json({ success: true, item });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new menu item
router.post('/', async (req, res) => {
  try {
    const { name, contentId } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, error: 'Name is required' });
    }
    
    const items = await readMenuItems();
    
    // Get next order number
    const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.order)) : 0;
    
    const newItem = {
      id: `tech-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      contentId: contentId || null,
      order: maxOrder + 1
    };
    
    items.push(newItem);
    await writeMenuItems(items);
    
    res.json({ success: true, item: newItem });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update menu item
router.put('/:id', async (req, res) => {
  try {
    const { name, contentId, order } = req.body;
    const items = await readMenuItems();
    const index = items.findIndex(i => i.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    items[index] = {
      ...items[index],
      name: name || items[index].name,
      contentId: contentId !== undefined ? contentId : items[index].contentId,
      order: order !== undefined ? order : items[index].order
    };
    
    await writeMenuItems(items);
    
    res.json({ success: true, item: items[index] });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT reorder menu items
router.put('/reorder/all', async (req, res) => {
  try {
    const { itemIds } = req.body; // Array of IDs in new order
    
    if (!Array.isArray(itemIds)) {
      return res.status(400).json({ success: false, error: 'itemIds must be an array' });
    }
    
    const items = await readMenuItems();
    
    // Update order for each item
    itemIds.forEach((id, index) => {
      const item = items.find(i => i.id === id);
      if (item) {
        item.order = index + 1;
      }
    });
    
    await writeMenuItems(items);
    
    res.json({ success: true, items });
  } catch (error) {
    console.error('Error reordering menu items:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
  try {
    const items = await readMenuItems();
    const filteredItems = items.filter(i => i.id !== req.params.id);
    
    if (filteredItems.length === items.length) {
      return res.status(404).json({ success: false, error: 'Menu item not found' });
    }
    
    await writeMenuItems(filteredItems);
    
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

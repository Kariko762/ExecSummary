import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const DESIGN_SYSTEM_FILE = path.join(__dirname, '..', 'data', 'design-system.json');

// Default design system (fallback)
function getDefaultDesignSystem() {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    light: {
      colors: [
        { key: 'brand-primary', label: 'Brand Primary', value: '#431C5B', description: 'Primary brand color (Eggplant)' },
        { key: 'brand-secondary', label: 'Brand Secondary', value: '#B21A53', description: 'Secondary brand color (Raspberry)' },
        { key: 'text-primary', label: 'Text Primary', value: '#111827', description: 'Primary text' },
        { key: 'surface-base', label: 'Surface Base', value: '#FFFFFF', description: 'Base surface color' }
      ],
      fonts: {
        primary: 'Roobert, sans-serif',
        header: 'Roobert Heavy, sans-serif',
        body: 'Roobert, sans-serif'
      }
    },
    dark: {
      colors: [
        { key: 'brand-primary', label: 'Brand Primary', value: '#B21A53', description: 'Dark mode primary' },
        { key: 'text-primary', label: 'Text Primary', value: '#F9FAFB', description: 'Dark mode primary text' },
        { key: 'surface-base', label: 'Surface Base', value: '#111827', description: 'Dark mode base surface' }
      ],
      fonts: {
        primary: 'Roobert, sans-serif',
        header: 'Roobert Heavy, sans-serif',
        body: 'Roobert, sans-serif'
      }
    },
    activeTheme: 'light'
  };
}

/**
 * GET /api/design-system
 * Fetch the current design system configuration
 */
router.get('/', async (req, res) => {
  try {
    const data = await fs.readFile(DESIGN_SYSTEM_FILE, 'utf8');
    const designSystem = JSON.parse(data);
    
    console.log('✅ Design system loaded from file');
    res.json(designSystem);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return defaults and create file
      console.log('⚠️ Design system file not found, creating with defaults');
      const defaultSystem = getDefaultDesignSystem();
      
      try {
        await fs.writeFile(DESIGN_SYSTEM_FILE, JSON.stringify(defaultSystem, null, 2), 'utf8');
        console.log('✅ Default design system file created');
      } catch (writeError) {
        console.error('❌ Failed to create default file:', writeError.message);
      }
      
      res.json(defaultSystem);
    } else {
      console.error('❌ Failed to load design system:', error.message);
      res.status(500).json({ 
        error: 'Failed to load design system',
        message: error.message 
      });
    }
  }
});

/**
 * POST /api/design-system
 * Save updated design system configuration
 */
router.post('/', async (req, res) => {
  try {
    const designSystem = req.body;
    
    // Validate basic structure
    if (!designSystem.light || !designSystem.dark) {
      return res.status(400).json({ 
        error: 'Invalid design system format',
        message: 'Design system must contain "light" and "dark" themes' 
      });
    }
    
    // Add timestamp
    designSystem.timestamp = new Date().toISOString();
    
    // Save to file
    await fs.writeFile(
      DESIGN_SYSTEM_FILE,
      JSON.stringify(designSystem, null, 2),
      'utf8'
    );
    
    console.log('✅ Design system saved successfully');
    res.json({ 
      success: true, 
      message: 'Design system saved successfully',
      timestamp: designSystem.timestamp
    });
  } catch (error) {
    console.error('❌ Failed to save design system:', error.message);
    res.status(500).json({ 
      error: 'Failed to save design system',
      message: error.message 
    });
  }
});

/**
 * GET /api/design-system/theme/:theme
 * Fetch a specific theme (light or dark)
 */
router.get('/theme/:theme', async (req, res) => {
  try {
    const { theme } = req.params;
    
    if (theme !== 'light' && theme !== 'dark') {
      return res.status(400).json({ 
        error: 'Invalid theme',
        message: 'Theme must be "light" or "dark"' 
      });
    }
    
    const data = await fs.readFile(DESIGN_SYSTEM_FILE, 'utf8');
    const designSystem = JSON.parse(data);
    
    res.json(designSystem[theme]);
  } catch (error) {
    if (error.code === 'ENOENT') {
      const defaultSystem = getDefaultDesignSystem();
      res.json(defaultSystem[req.params.theme]);
    } else {
      console.error('❌ Failed to load theme:', error.message);
      res.status(500).json({ 
        error: 'Failed to load theme',
        message: error.message 
      });
    }
  }
});

export default router;

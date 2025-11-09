import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import authRoutes from './api/auth.js';

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

// Path to data directory
const DATA_DIR = path.join(__dirname, '../src/data');

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
// SUMMARIES ENDPOINTS
// ============================================

// GET all summaries
app.get('/api/summaries', async (req, res) => {
  try {
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const files = await listFiles(summariesDir);
    
    const summaries = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(summariesDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    // Sort by date (newest first)
    summaries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single summary by ID
app.get('/api/summaries/:id', async (req, res) => {
  try {
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const filePath = path.join(summariesDir, `${req.params.id}.json`);
    const summary = await readJSONFile(filePath);
    res.json(summary);
  } catch (error) {
    res.status(404).json({ error: 'Summary not found' });
  }
});

// POST create new summary
app.post('/api/summaries', async (req, res) => {
  try {
    const summary = req.body;
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const filePath = path.join(summariesDir, `${summary.id}.json`);
    
    await writeJSONFile(filePath, summary);
    res.status(201).json({ message: 'Summary created', data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing summary
app.put('/api/summaries/:id', async (req, res) => {
  try {
    const summary = req.body;
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const filePath = path.join(summariesDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, summary);
    res.json({ message: 'Summary updated', data: summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE summary
app.delete('/api/summaries/:id', async (req, res) => {
  try {
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const filePath = path.join(summariesDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Summary deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// EXECUTIVE IQ ENDPOINTS
// ============================================

// GET all ExecutiveIQ articles
app.get('/api/executive-iq', async (req, res) => {
  try {
    const execIQDir = path.join(DATA_DIR, 'executive-iq');
    const files = await listFiles(execIQDir);
    
    const articles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(execIQDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single ExecutiveIQ article
app.get('/api/executive-iq/:id', async (req, res) => {
  try {
    const execIQDir = path.join(DATA_DIR, 'executive-iq');
    const filePath = path.join(execIQDir, `${req.params.id}.json`);
    const article = await readJSONFile(filePath);
    res.json(article);
  } catch (error) {
    res.status(404).json({ error: 'Article not found' });
  }
});

// POST create new ExecutiveIQ article
app.post('/api/executive-iq', async (req, res) => {
  try {
    const article = req.body;
    const execIQDir = path.join(DATA_DIR, 'executive-iq');
    const filePath = path.join(execIQDir, `${article.id}.json`);
    
    await writeJSONFile(filePath, article);
    res.status(201).json({ message: 'Article created', data: article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update ExecutiveIQ article
app.put('/api/executive-iq/:id', async (req, res) => {
  try {
    const article = req.body;
    const execIQDir = path.join(DATA_DIR, 'executive-iq');
    const filePath = path.join(execIQDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, article);
    res.json({ message: 'Article updated', data: article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE ExecutiveIQ article
app.delete('/api/executive-iq/:id', async (req, res) => {
  try {
    const execIQDir = path.join(DATA_DIR, 'executive-iq');
    const filePath = path.join(execIQDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// ORGANIZATIONS ENDPOINTS
// ============================================

// GET all organizations
app.get('/api/organizations', async (req, res) => {
  try {
    const orgsDir = path.join(DATA_DIR, 'organizations');
    const files = await listFiles(orgsDir);
    
    const organizations = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(orgsDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    res.json(organizations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single organization
app.get('/api/organizations/:id', async (req, res) => {
  try {
    const orgsDir = path.join(DATA_DIR, 'organizations');
    const filePath = path.join(orgsDir, `${req.params.id}.json`);
    const organization = await readJSONFile(filePath);
    res.json(organization);
  } catch (error) {
    res.status(404).json({ error: 'Organization not found' });
  }
});

// POST create organization
app.post('/api/organizations', async (req, res) => {
  try {
    const organization = req.body;
    const orgsDir = path.join(DATA_DIR, 'organizations');
    const filePath = path.join(orgsDir, `${organization.id}.json`);
    
    await writeJSONFile(filePath, organization);
    res.status(201).json({ message: 'Organization created', data: organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update organization
app.put('/api/organizations/:id', async (req, res) => {
  try {
    const organization = req.body;
    const orgsDir = path.join(DATA_DIR, 'organizations');
    const filePath = path.join(orgsDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, organization);
    res.json({ message: 'Organization updated', data: organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE organization
app.delete('/api/organizations/:id', async (req, res) => {
  try {
    const orgsDir = path.join(DATA_DIR, 'organizations');
    const filePath = path.join(orgsDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Organization deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// PERFORMANCE ENDPOINTS
// ============================================

// GET all performance data
app.get('/api/performance', async (req, res) => {
  try {
    const perfDir = path.join(DATA_DIR, 'performance');
    const files = await listFiles(perfDir);
    
    const performances = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(perfDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    // Sort by date descending
    performances.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json(performances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single performance data
app.get('/api/performance/:id', async (req, res) => {
  try {
    const perfDir = path.join(DATA_DIR, 'performance');
    const filePath = path.join(perfDir, `${req.params.id}.json`);
    const performance = await readJSONFile(filePath);
    res.json(performance);
  } catch (error) {
    res.status(404).json({ error: 'Performance data not found' });
  }
});

// POST create performance data
app.post('/api/performance', async (req, res) => {
  try {
    const performance = req.body;
    const perfDir = path.join(DATA_DIR, 'performance');
    const filePath = path.join(perfDir, `${performance.id}.json`);
    
    await writeJSONFile(filePath, performance);
    res.status(201).json({ message: 'Performance data created', data: performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update performance data
app.put('/api/performance/:id', async (req, res) => {
  try {
    const performance = req.body;
    const perfDir = path.join(DATA_DIR, 'performance');
    const filePath = path.join(perfDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, performance);
    res.json({ message: 'Performance data updated', data: performance });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE performance data
app.delete('/api/performance/:id', async (req, res) => {
  try {
    const perfDir = path.join(DATA_DIR, 'performance');
    const filePath = path.join(perfDir, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Performance data deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
// KNOWLEDGE BASE CATEGORIES ENDPOINTS
// ============================================

// GET all KB categories
app.get('/api/kb-categories', async (req, res) => {
  try {
    const categoriesDir = path.join(DATA_DIR, 'kb-categories');
    const files = await listFiles(categoriesDir);
    
    const categories = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(categoriesDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    categories.sort((a, b) => a.name.localeCompare(b.name));
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single KB category by ID
app.get('/api/kb-categories/:id', async (req, res) => {
  try {
    const categoriesDir = path.join(DATA_DIR, 'kb-categories');
    const filePath = path.join(categoriesDir, `${req.params.id}.json`);
    const category = await readJSONFile(filePath);
    res.json(category);
  } catch (error) {
    res.status(404).json({ error: 'Category not found' });
  }
});

// POST create new KB category
app.post('/api/kb-categories', async (req, res) => {
  try {
    const category = req.body;
    const categoriesDir = path.join(DATA_DIR, 'kb-categories');
    const filePath = path.join(categoriesDir, `${category.id}.json`);
    
    await writeJSONFile(filePath, category);
    res.json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing KB category
app.put('/api/kb-categories/:id', async (req, res) => {
  try {
    const category = req.body;
    const categoriesDir = path.join(DATA_DIR, 'kb-categories');
    const filePath = path.join(categoriesDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, category);
    res.json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KB category
app.delete('/api/kb-categories/:id', async (req, res) => {
  try {
    const categoriesDir = path.join(DATA_DIR, 'kb-categories');
    const filePath = path.join(categoriesDir, `${req.params.id}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// KNOWLEDGE BASE ARTICLES ENDPOINTS
// ============================================

// GET all KB articles
app.get('/api/knowledge-base', async (req, res) => {
  try {
    const articlesDir = path.join(DATA_DIR, 'knowledge-base');
    const files = await listFiles(articlesDir);
    
    const articles = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(articlesDir, file);
        return await readJSONFile(filePath);
      })
    );
    
    articles.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single KB article by ID
app.get('/api/knowledge-base/:id', async (req, res) => {
  try {
    const articlesDir = path.join(DATA_DIR, 'knowledge-base');
    const filePath = path.join(articlesDir, `${req.params.id}.json`);
    const article = await readJSONFile(filePath);
    res.json(article);
  } catch (error) {
    res.status(404).json({ error: 'Article not found' });
  }
});

// POST create new KB article
app.post('/api/knowledge-base', async (req, res) => {
  try {
    const article = req.body;
    const articlesDir = path.join(DATA_DIR, 'knowledge-base');
    const filePath = path.join(articlesDir, `${article.id}.json`);
    
    await writeJSONFile(filePath, article);
    res.json({ success: true, message: 'Article created successfully', article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing KB article
app.put('/api/knowledge-base/:id', async (req, res) => {
  try {
    const article = req.body;
    const articlesDir = path.join(DATA_DIR, 'knowledge-base');
    const filePath = path.join(articlesDir, `${req.params.id}.json`);
    
    await writeJSONFile(filePath, article);
    res.json({ success: true, message: 'Article updated successfully', article });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE KB article
app.delete('/api/knowledge-base/:id', async (req, res) => {
  try {
    const articlesDir = path.join(DATA_DIR, 'knowledge-base');
    const filePath = path.join(articlesDir, `${req.params.id}.json`);
    
    await fs.unlink(filePath);
    res.json({ success: true, message: 'Article deleted successfully' });
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API running on http://localhost:${PORT}`);
  console.log(`📁 Data directory: ${DATA_DIR}`);
  console.log(`\nAvailable endpoints:`);
  console.log(`  GET    /api/summaries`);
  console.log(`  GET    /api/summaries/:id`);
  console.log(`  POST   /api/summaries`);
  console.log(`  PUT    /api/summaries/:id`);
  console.log(`  DELETE /api/summaries/:id`);
  console.log(`  GET    /api/executive-iq`);
  console.log(`  POST   /api/executive-iq`);
  console.log(`  PUT    /api/executive-iq/:id`);
  console.log(`  DELETE /api/executive-iq/:id`);
  console.log(`  GET    /api/organizations`);
  console.log(`  POST   /api/organizations`);
  console.log(`  PUT    /api/organizations/:id`);
  console.log(`  DELETE /api/organizations/:id`);
  console.log(`  GET    /api/templates`);
  console.log(`  GET    /api/templates/:id`);
  console.log(`  POST   /api/templates`);
  console.log(`  PUT    /api/templates/:id`);
  console.log(`  DELETE /api/templates/:id`);
  console.log(`  GET    /api/kb-categories`);
  console.log(`  GET    /api/kb-categories/:id`);
  console.log(`  POST   /api/kb-categories`);
  console.log(`  PUT    /api/kb-categories/:id`);
  console.log(`  DELETE /api/kb-categories/:id`);
  console.log(`  GET    /api/knowledge-base`);
  console.log(`  GET    /api/knowledge-base/:id`);
  console.log(`  POST   /api/knowledge-base`);
  console.log(`  PUT    /api/knowledge-base/:id`);
  console.log(`  DELETE /api/knowledge-base/:id`);
  console.log(`  POST   /api/import/:type (with file upload)`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  POST   /api/auth/verify`);
  console.log(`  POST   /api/auth/logout`);
  console.log(`  GET    /api/auth/users (admin)`);
  console.log(`  POST   /api/auth/users (admin)`);
  console.log(`  PUT    /api/auth/users/:id (admin)`);
  console.log(`  DELETE /api/auth/users/:id (admin)`);
  console.log(`  GET    /api/health`);
});

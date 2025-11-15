import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import authRoutes from './api/auth.js';
import { getTenants, createTenant, deleteTenant, getTenantContent, getTenantStats, updateTenantStats } from './api/tenants.js';

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

// Tenant Management Routes (Organizations & Initiatives)
app.get('/api/tenants', getTenants);
app.post('/api/tenants', createTenant);
app.delete('/api/tenants/:type/:slug', deleteTenant);
app.get('/api/tenants/:type/:slug/content', getTenantContent);
app.get('/api/tenants/:type/:slug/stats', getTenantStats);

// Feature Flags API - returns enabled/disabled state for orgs and initiatives
app.get('/api/feature-flags', (req, res) => {
  // These would be stored in a database in production
  // For now, they're managed in localStorage on the CMS side
  // The main app can check localStorage directly or we can sync via backend
  res.json({
    organizationsEnabled: true,  // Default to enabled
    initiativesEnabled: true     // Default to enabled
  });
});

// Path to data directory
const DATA_DIR = path.join(__dirname, 'data');
const CONTENT_DIR = path.join(__dirname, 'data', 'content'); // Unified content directory
const TAGS_FILE = path.join(__dirname, 'data', 'content-tags.json');
const COMMENTS_FILE = path.join(__dirname, 'data', 'comments.json');

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
// UNIFIED CONTENT ENDPOINTS (Tag-Based)
// ============================================

// GET all content (with optional tag/tenant filtering)
app.get('/api/content', async (req, res) => {
  try {
    const { tag, tenant, tenantType } = req.query;
    const allContent = [];
    
    // If tenant filtering is requested, only read from that specific tenant folder
    if (tenant && tenantType) {
      try {
        const tenantDir = tenantType === 'org' 
          ? path.join(DATA_DIR, 'orgs', tenant)
          : path.join(DATA_DIR, 'initiatives', tenant);
        
        const files = await listFiles(tenantDir);
        const tenantContent = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(tenantDir, file);
            return await readJSONFile(filePath);
          })
        );
        allContent.push(...tenantContent);
      } catch (error) {
        console.log(`No content for ${tenantType} ${tenant}:`, error.message);
      }
    } else {
      // Read all content from all locations
      
      // Read from main content directory
      try {
        const files = await listFiles(CONTENT_DIR);
        const contentItems = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(CONTENT_DIR, file);
            return await readJSONFile(filePath);
          })
        );
        allContent.push(...contentItems);
      } catch (error) {
        console.log('No content in main directory:', error.message);
      }
      
      // Read from organization folders
      try {
        const orgsDir = path.join(DATA_DIR, 'orgs');
        const orgFolders = await fs.readdir(orgsDir);
        for (const orgSlug of orgFolders) {
          if (orgSlug === 'registry.json') continue;
          const orgContentDir = path.join(orgsDir, orgSlug);
          const stat = await fs.stat(orgContentDir);
          if (stat.isDirectory()) {
            const files = await listFiles(orgContentDir);
            const orgContent = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(orgContentDir, file);
                return await readJSONFile(filePath);
              })
            );
            allContent.push(...orgContent);
          }
        }
      } catch (error) {
        console.log('No organization content:', error.message);
      }
      
      // Read from initiative folders
      try {
        const initiativesDir = path.join(DATA_DIR, 'initiatives');
        const initiativeFolders = await fs.readdir(initiativesDir);
        for (const initiativeSlug of initiativeFolders) {
          if (initiativeSlug === 'registry.json') continue;
          const initiativeContentDir = path.join(initiativesDir, initiativeSlug);
          const stat = await fs.stat(initiativeContentDir);
          if (stat.isDirectory()) {
            const files = await listFiles(initiativeContentDir);
            const initiativeContent = await Promise.all(
              files.map(async (file) => {
                const filePath = path.join(initiativeContentDir, file);
                return await readJSONFile(filePath);
              })
            );
            allContent.push(...initiativeContent);
          }
        }
      } catch (error) {
        console.log('No initiative content:', error.message);
      }
    }
    
    // Filter by tag if provided
    const filteredContent = tag 
      ? allContent.filter(item => item._contentTag === tag)
      : allContent;
    
    // Sort by date (newest first)
    filteredContent.sort((a, b) => {
      const dateA = new Date(a.date || a.lastUpdated || a.updatedAt || 0);
      const dateB = new Date(b.date || b.lastUpdated || b.updatedAt || 0);
      return dateB - dateA;
    });
    
    res.json({ success: true, content: filteredContent });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single content item by ID
app.get('/api/content/:id', async (req, res) => {
  try {
    const filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
    const content = await readJSONFile(filePath);
    res.json(content);
  } catch (error) {
    res.status(404).json({ error: 'Content not found' });
  }
});

// POST create new content
app.post('/api/content', async (req, res) => {
  try {
    const content = req.body;
    console.log('📝 POST /api/content - Content ID:', content.id);
    console.log('📝 POST /api/content - _tenant:', JSON.stringify(content._tenant));
    
    // Check if content is assigned to a tenant (organization or initiative)
    let filePath;
    if (content._tenant) {
      const { type, slug } = content._tenant;
      const tenantDir = path.join(DATA_DIR, type === 'org' ? 'orgs' : 'initiatives', slug);
      filePath = path.join(tenantDir, `${content.id}.json`);
      
      // Ensure tenant directory exists
      await fs.mkdir(tenantDir, { recursive: true });
      
      // Update tenant stats after save
      await writeJSONFile(filePath, content);
      await updateTenantStats(type, slug);
    } else {
      // Save to regular content directory
      filePath = path.join(CONTENT_DIR, `${content.id}.json`);
      await writeJSONFile(filePath, content);
    }
    
    res.status(201).json({ message: 'Content created', data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing content
app.put('/api/content/:id', async (req, res) => {
  try {
    const content = req.body;
    
    // Check if content is assigned to a tenant (organization or initiative)
    let filePath;
    if (content._tenant) {
      const { type, slug } = content._tenant;
      const tenantDir = path.join(DATA_DIR, type === 'org' ? 'orgs' : 'initiatives', slug);
      filePath = path.join(tenantDir, `${req.params.id}.json`);
      
      // Ensure tenant directory exists
      await fs.mkdir(tenantDir, { recursive: true });
      
      // Update tenant stats after save
      await writeJSONFile(filePath, content);
      await updateTenantStats(type, slug);
    } else {
      // Save to regular content directory
      filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
      await writeJSONFile(filePath, content);
    }
    
    res.json({ message: 'Content updated', data: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE content
app.delete('/api/content/:id', async (req, res) => {
  try {
    const filePath = path.join(CONTENT_DIR, `${req.params.id}.json`);
    await fs.unlink(filePath);
    res.json({ message: 'Content deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// LEGACY TYPE-SPECIFIC ENDPOINTS (Deprecated - kept for backwards compatibility)
// ============================================

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

// GET all organizations from registry
app.get('/api/organizations', async (req, res) => {
  try {
    const registryPath = path.join(DATA_DIR, 'orgs', 'registry.json');
    const registry = await readJSONFile(registryPath);
    res.json({ success: true, organizations: registry.organizations || [] });
  } catch (error) {
    res.json({ success: true, organizations: [] }); // Return empty if registry doesn't exist
  }
});

// GET all initiatives from registry
app.get('/api/initiatives', async (req, res) => {
  try {
    const registryPath = path.join(DATA_DIR, 'initiatives', 'registry.json');
    const registry = await readJSONFile(registryPath);
    res.json({ success: true, initiatives: registry.initiatives || [] });
  } catch (error) {
    res.json({ success: true, initiatives: [] }); // Return empty if registry doesn't exist
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
// LOGO UPLOAD
// ============================================

// POST upload custom logo
app.post('/api/upload-logo', upload.single('logo'), async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Create public/logos directory if it doesn't exist
    const logosDir = path.join(__dirname, 'public', 'logos');
    await fs.mkdir(logosDir, { recursive: true });
    
    // Generate filename with timestamp
    const ext = path.extname(file.originalname);
    const filename = `custom-logo-${Date.now()}${ext}`;
    const targetPath = path.join(logosDir, filename);
    
    // Move file from uploads to public/logos
    await fs.rename(file.path, targetPath);
    
    // Return URL
    const logoUrl = `/logos/${filename}`;
    res.json({ url: logoUrl });
  } catch (error) {
    console.error('Logo upload error:', error);
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

// ============================================
// CONTENT TAGS ENDPOINTS
// ============================================

// GET all content tags
app.get('/api/content-tags', async (req, res) => {
  try {
    const tags = await readJSONFile(TAGS_FILE);
    res.json(tags.tags || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET single tag by ID
app.get('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const tag = tagsData.tags.find(t => t.id === req.params.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new tag
app.post('/api/content-tags', async (req, res) => {
  try {
    const newTag = {
      ...req.body,
      created: new Date().toISOString()
    };
    
    const tagsData = await readJSONFile(TAGS_FILE);
    
    // Check for duplicate ID
    if (tagsData.tags.some(t => t.id === newTag.id)) {
      return res.status(400).json({ error: 'Tag ID already exists' });
    }
    
    tagsData.tags.push(newTag);
    await writeJSONFile(TAGS_FILE, tagsData);
    
    res.status(201).json(newTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing tag
app.put('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const tagIndex = tagsData.tags.findIndex(t => t.id === req.params.id);
    
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    // Preserve created date
    const updatedTag = {
      ...req.body,
      created: tagsData.tags[tagIndex].created
    };
    
    tagsData.tags[tagIndex] = updatedTag;
    await writeJSONFile(TAGS_FILE, tagsData);
    
    res.json(updatedTag);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE tag
app.delete('/api/content-tags/:id', async (req, res) => {
  try {
    const tagsData = await readJSONFile(TAGS_FILE);
    const initialLength = tagsData.tags.length;
    
    tagsData.tags = tagsData.tags.filter(t => t.id !== req.params.id);
    
    if (tagsData.tags.length === initialLength) {
      return res.status(404).json({ error: 'Tag not found' });
    }
    
    await writeJSONFile(TAGS_FILE, tagsData);
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET tag usage statistics (count published/draft content with this tag)
app.get('/api/content-tags/:id/usage', async (req, res) => {
  try {
    const tagId = req.params.id;
    let publishedCount = 0;
    let draftCount = 0;
    
    // Scan summaries directory
    const summariesDir = path.join(DATA_DIR, 'summaries');
    const summaryFiles = await listFiles(summariesDir);
    
    for (const file of summaryFiles) {
      const filePath = path.join(summariesDir, file);
      const content = await readJSONFile(filePath);
      
      // Check if content has this tag
      if (content.standard_header?.contentTag === tagId || content.contentTag === tagId) {
        if (content.status === 'published') {
          publishedCount++;
        } else {
          draftCount++;
        }
      }
    }
    
    // Could scan other content types here (executive-iq, knowledge-base, etc.)
    
    res.json({
      tagId,
      publishedCount,
      draftCount,
      totalCount: publishedCount + draftCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// COMMENTS ENDPOINTS
// ============================================

// GET all comments for a specific content item
app.get('/api/comments/:contentType/:contentId', async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const commentsData = await readJSONFile(COMMENTS_FILE);
    
    const itemComments = commentsData.comments.filter(
      c => c.contentId === contentId && c.contentType === contentType
    );
    
    // Sort by timestamp (newest first)
    itemComments.sort((a, b) => b.timestamp - a.timestamp);
    
    res.json(itemComments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all comments (for displaying counts across all content)
app.get('/api/comments', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    res.json(commentsData.comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new comment
app.post('/api/comments', async (req, res) => {
  try {
    const newComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      contentId: req.body.contentId,
      contentType: req.body.contentType,
      author: req.body.author,
      text: req.body.text,
      timestamp: Date.now(),
      edited: false
    };
    
    const commentsData = await readJSONFile(COMMENTS_FILE);
    commentsData.comments.push(newComment);
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT update existing comment
app.put('/api/comments/:id', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    const commentIndex = commentsData.comments.findIndex(c => c.id === req.params.id);
    
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    // Update only text, mark as edited
    commentsData.comments[commentIndex] = {
      ...commentsData.comments[commentIndex],
      text: req.body.text,
      edited: true,
      editedAt: Date.now()
    };
    
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.json(commentsData.comments[commentIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE comment
app.delete('/api/comments/:id', async (req, res) => {
  try {
    const commentsData = await readJSONFile(COMMENTS_FILE);
    const initialLength = commentsData.comments.length;
    
    commentsData.comments = commentsData.comments.filter(c => c.id !== req.params.id);
    
    if (commentsData.comments.length === initialLength) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    await writeJSONFile(COMMENTS_FILE, commentsData);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
  console.log(`  GET    /api/initiatives`);
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
  console.log(`\n📌 Content Tags:`);
  console.log(`  GET    /api/content-tags`);
  console.log(`  GET    /api/content-tags/:id`);
  console.log(`  POST   /api/content-tags`);
  console.log(`  PUT    /api/content-tags/:id`);
  console.log(`  DELETE /api/content-tags/:id`);
  console.log(`  GET    /api/content-tags/:id/usage`);
  console.log(`\n💬 Comments:`);
  console.log(`  GET    /api/comments`);
  console.log(`  GET    /api/comments/:contentType/:contentId`);
  console.log(`  POST   /api/comments`);
  console.log(`  PUT    /api/comments/:id`);
  console.log(`  DELETE /api/comments/:id`);
});

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORGS_DIR = path.join(DATA_DIR, 'orgs');
const INITIATIVES_DIR = path.join(DATA_DIR, 'initiatives');

// Get registry file path based on type
const getRegistryPath = (type) => {
  const dir = type === 'org' ? ORGS_DIR : INITIATIVES_DIR;
  return path.join(dir, 'registry.json');
};

// Get tenant folder path
const getTenantDir = (type, slug) => {
  const baseDir = type === 'org' ? ORGS_DIR : INITIATIVES_DIR;
  return path.join(baseDir, slug);
};

// Read registry
const readRegistry = async (type) => {
  try {
    const registryPath = getRegistryPath(type);
    const data = await fs.readFile(registryPath, 'utf8');
    const registry = JSON.parse(data);
    return type === 'org' ? registry.organizations : registry.initiatives;
  } catch (error) {
    console.error(`Error reading ${type} registry:`, error);
    return [];
  }
};

// Write registry
const writeRegistry = async (type, items) => {
  const registryPath = getRegistryPath(type);
  const data = type === 'org' 
    ? { organizations: items }
    : { initiatives: items };
  await fs.writeFile(registryPath, JSON.stringify(data, null, 2));
};

// Update tenant stats
const updateTenantStats = async (type, slug) => {
  const tenantDir = getTenantDir(type, slug);
  
  try {
    const files = await fs.readdir(tenantDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    let publishedCount = 0;
    let draftCount = 0;
    
    for (const file of jsonFiles) {
      const filePath = path.join(tenantDir, file);
      const content = JSON.parse(await fs.readFile(filePath, 'utf8'));
      if (content.status === 'published') publishedCount++;
      else draftCount++;
    }
    
    // Update registry
    const registry = await readRegistry(type);
    const tenant = registry.find(t => t.slug === slug);
    if (tenant) {
      tenant.contentCount = jsonFiles.length;
      tenant.publishedCount = publishedCount;
      tenant.draftCount = draftCount;
      await writeRegistry(type, registry);
    }
    
    return { contentCount: jsonFiles.length, publishedCount, draftCount };
  } catch (error) {
    return { contentCount: 0, publishedCount: 0, draftCount: 0 };
  }
};

// API handlers
const getTenants = async (req, res) => {
  const { type } = req.query; // 'org' or 'initiative'
  
  if (!type || !['org', 'initiative'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type parameter. Use org or initiative' });
  }
  
  try {
    const tenants = await readRegistry(type);
    
    // Update stats for all tenants
    for (const tenant of tenants) {
      const stats = await updateTenantStats(type, tenant.slug);
      Object.assign(tenant, stats);
    }
    
    res.json(tenants);
  } catch (error) {
    console.error('Error getting tenants:', error);
    res.status(500).json({ error: 'Failed to retrieve tenants' });
  }
};

const createTenant = async (req, res) => {
  const { type, name, description } = req.body;
  
  if (!type || !['org', 'initiative'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Use org or initiative' });
  }
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  
  try {
    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    
    const registry = await readRegistry(type);
    
    // Check if slug already exists
    if (registry.find(t => t.slug === slug)) {
      return res.status(400).json({ error: 'A tenant with this name already exists' });
    }
    
    // Create new tenant
    const newTenant = {
      id: slug,
      name,
      slug,
      description: description || '',
      createdDate: new Date().toISOString().split('T')[0],
      contentCount: 0,
      publishedCount: 0,
      draftCount: 0
    };
    
    registry.push(newTenant);
    await writeRegistry(type, registry);
    
    // Create tenant directory
    const tenantDir = getTenantDir(type, slug);
    await fs.mkdir(tenantDir, { recursive: true });
    
    res.status(201).json(newTenant);
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({ error: 'Failed to create tenant' });
  }
};

const deleteTenant = async (req, res) => {
  const { type, slug } = req.params;
  
  if (!type || !['org', 'initiative'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  
  try {
    const registry = await readRegistry(type);
    const tenant = registry.find(t => t.slug === slug);
    
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant not found' });
    }
    
    // Check if tenant has content
    const tenantDir = getTenantDir(type, slug);
    try {
      const files = await fs.readdir(tenantDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete tenant with existing content',
          contentCount: jsonFiles.length 
        });
      }
      
      // Delete directory
      await fs.rmdir(tenantDir);
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    // Remove from registry
    const updatedRegistry = registry.filter(t => t.slug !== slug);
    await writeRegistry(type, updatedRegistry);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({ error: 'Failed to delete tenant' });
  }
};

const getTenantContent = async (req, res) => {
  const { type, slug } = req.params;
  
  if (!type || !['org', 'initiative'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  
  try {
    const tenantDir = getTenantDir(type, slug);
    const files = await fs.readdir(tenantDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    
    const content = [];
    for (const file of jsonFiles) {
      const filePath = path.join(tenantDir, file);
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
      content.push({
        ...data,
        id: file.replace('.json', ''),
        _tenant: slug,
        _tenantType: type
      });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error getting tenant content:', error);
    res.status(500).json({ error: 'Failed to retrieve content' });
  }
};

const getTenantStats = async (req, res) => {
  const { type, slug } = req.params;
  
  if (!type || !['org', 'initiative'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  
  try {
    const stats = await updateTenantStats(type, slug);
    res.json(stats);
  } catch (error) {
    console.error('Error getting tenant stats:', error);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

export {
  getTenants,
  createTenant,
  deleteTenant,
  getTenantContent,
  getTenantStats,
  updateTenantStats
};

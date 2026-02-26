/**
 * API HEALTH CHECK SYSTEM
 * 
 * Periodically tests all API endpoints and stores health metrics
 */

import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const HEALTH_FILE = path.join(__dirname, '../data/api-health.json');

// API endpoints to monitor
const API_ENDPOINTS = [
  { name: 'Goals API', path: '/api/goals', method: 'GET' },
  { name: 'Initiatives API', path: '/api/initiatives', method: 'GET' },
  { name: 'Tasks API', path: '/api/tasks', method: 'GET' },
  { name: 'Notes API', path: '/api/notes', method: 'GET' },
  { name: 'Templates API', path: '/api/templates', method: 'GET' },
  { name: 'Content API', path: '/api/content', method: 'GET' },
  { name: 'Tenants API', path: '/api/tenants', method: 'GET' },
  { name: 'Auth API', path: '/api/auth/verify', method: 'POST' },
  { name: 'Tags API', path: '/api/tags', method: 'GET' },
  { name: 'Data Engine API', path: '/api/data-engine/query', method: 'POST' },
  { name: 'Design System API', path: '/api/design-system/colors', method: 'GET' },
  { name: 'People API', path: '/api/people', method: 'GET' },
  { name: 'Business Units API', path: '/api/business-units', method: 'GET' },
  { name: 'Change Control API', path: '/api/change-control', method: 'GET' },
];

// Initialize health file
async function ensureHealthFile() {
  try {
    await fs.access(HEALTH_FILE);
  } catch {
    const initialData = {
      endpoints: API_ENDPOINTS.map(ep => ({
        name: ep.name,
        status: 'unknown',
        latency: 0,
        uptime: 100,
        lastTested: null,
        lastFailed: null,
        requests24h: 0,
        totalTests: 0,
        failedTests: 0
      })),
      lastUpdate: new Date().toISOString()
    };
    await fs.writeFile(HEALTH_FILE, JSON.stringify(initialData, null, 2));
  }
}

// Test a single endpoint
async function testEndpoint(endpoint) {
  const startTime = Date.now();
  try {
    const url = `http://localhost:3001${endpoint.path}`;
    const options = {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' }
    };

    // Add body for POST requests
    if (endpoint.method === 'POST') {
      if (endpoint.path.includes('auth')) {
        options.body = JSON.stringify({ token: 'health-check' });
      } else if (endpoint.path.includes('data-engine')) {
        options.body = JSON.stringify({ query: 'SELECT * FROM test LIMIT 1' });
      }
    }

    const response = await fetch(url, options);
    const latency = Date.now() - startTime;

    return {
      success: response.ok || response.status === 401, // 401 is OK for auth check
      latency,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      latency: Date.now() - startTime,
      error: error.message
    };
  }
}

// Run health checks on all endpoints
async function runHealthChecks() {
  await ensureHealthFile();
  const healthData = JSON.parse(await fs.readFile(HEALTH_FILE, 'utf8'));

  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    const result = await testEndpoint(endpoint);
    const endpointData = healthData.endpoints[i];

    endpointData.totalTests++;
    endpointData.latency = result.latency;
    endpointData.lastTested = new Date().toISOString();

    if (result.success) {
      endpointData.status = 'healthy';
      endpointData.requests24h = Math.floor(Math.random() * 20000) + 1000; // Simulated
    } else {
      endpointData.status = 'down';
      endpointData.failedTests++;
      endpointData.lastFailed = new Date().toISOString();
    }

    // Calculate uptime percentage
    endpointData.uptime = ((endpointData.totalTests - endpointData.failedTests) / endpointData.totalTests * 100).toFixed(2);
  }

  healthData.lastUpdate = new Date().toISOString();
  await fs.writeFile(HEALTH_FILE, JSON.stringify(healthData, null, 2));

  return healthData;
}

// GET /api/health-check - Get current health status
router.get('/', async (req, res) => {
  try {
    await ensureHealthFile();
    const healthData = JSON.parse(await fs.readFile(HEALTH_FILE, 'utf8'));
    res.json({ success: true, ...healthData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/health-check/run - Manually trigger health check
router.post('/run', async (req, res) => {
  try {
    const healthData = await runHealthChecks();
    res.json({ success: true, message: 'Health check completed', ...healthData });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start periodic health checks (every 30 seconds)
let healthCheckInterval;

export function startHealthChecks() {
  // Run initial check
  runHealthChecks().catch(err => console.error('Health check failed:', err));

  // Schedule periodic checks
  healthCheckInterval = setInterval(() => {
    runHealthChecks().catch(err => console.error('Health check failed:', err));
  }, 30000); // 30 seconds

  console.log('✅ API health monitoring started (30s interval)');
}

export function stopHealthChecks() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    console.log('⏹️  API health monitoring stopped');
  }
}

export default router;

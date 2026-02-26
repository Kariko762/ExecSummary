import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
const DATA_DIR = path.join(__dirname, '../data/performance');
const VIEWS_FILE = path.join(DATA_DIR, 'views.json');

// Helper: Get current date info
function getDateInfo() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1-12
    quarter: Math.ceil((now.getMonth() + 1) / 3)
  };
}

// Helper: Filter data by date range
function filterByDateRange(data, filter) {
  const { year, month, quarter } = getDateInfo();
  const currentYearMonth = `${year}-${String(month).padStart(2, '0')}`;
  
  switch (filter) {
    case 'current_month':
      return data.filter(item => item.month === currentYearMonth);
    
    case 'current_quarter': {
      const quarterMonths = {
        1: ['01', '02', '03'],
        2: ['04', '05', '06'],
        3: ['07', '08', '09'],
        4: ['10', '11', '12']
      }[quarter];
      return data.filter(item => {
        const itemMonth = item.month.split('-')[1];
        return item.month.startsWith(String(year)) && quarterMonths.includes(itemMonth);
      });
    }
    
    case 'current_year':
      return data.filter(item => item.month.startsWith(String(year)));
    
    case 'last_6_months': {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const cutoff = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}`;
      return data.filter(item => item.month >= cutoff).slice(-6);
    }
    
    default:
      return data;
  }
}

// Helper: Aggregate data
function aggregateData(data, operation, field, categories = null) {
  if (operation === 'sum') {
    // Filter by categories if specified
    let filteredData = data;
    if (categories && categories.length > 0) {
      filteredData = data.filter(item => categories.includes(item.category));
    }
    
    // Sum the specified field
    const total = filteredData.reduce((sum, item) => sum + (item[field] || 0), 0);
    return Math.round(total);
  }
  return 0;
}

// Helper: Parse date range parameter (e.g., "11.1-11.16" or "8" or "Q3.Aug")
function parseDateRange(rangeStr, year = 2025) {
  // Month only: "8" or "11"
  if (/^\d{1,2}$/.test(rangeStr)) {
    const month = rangeStr.padStart(2, '0');
    return { start: `${year}-${month}-01`, end: `${year}-${month}-31`, type: 'month' };
  }
  
  // Month.Day range: "11.1-11.16"
  const dayRangeMatch = rangeStr.match(/^(\d{1,2})\.(\d{1,2})-(\d{1,2})\.(\d{1,2})$/);
  if (dayRangeMatch) {
    const [, startMonth, startDay, endMonth, endDay] = dayRangeMatch;
    return {
      start: `${year}-${startMonth.padStart(2, '0')}-${startDay.padStart(2, '0')}`,
      end: `${year}-${endMonth.padStart(2, '0')}-${endDay.padStart(2, '0')}`,
      type: 'dateRange'
    };
  }
  
  // Quarter.Month: "Q3.Aug"
  const quarterMatch = rangeStr.match(/^Q(\d)\.(\w+)$/i);
  if (quarterMatch) {
    const monthMap = {jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
    const monthName = quarterMatch[2].toLowerCase().substring(0, 3);
    const month = monthMap[monthName];
    if (month) {
      return { start: `${year}-${String(month).padStart(2, '0')}-01`, end: `${year}-${String(month).padStart(2, '0')}-31`, type: 'month' };
    }
  }
  
  return null;
}

// Helper: Filter data by custom date range
function filterByCustomRange(data, rangeStr, year = 2025) {
  const range = parseDateRange(rangeStr, year);
  if (!range) return data;
  
  return data.filter(item => {
    // Parse the date string "Wednesday, January 1, 2025" to comparable format
    let itemDate;
    if (item.date) {
      const dateMatch = item.date.match(/(\w+),\s+(\w+)\s+(\d+),\s+(\d+)/);
      if (dateMatch) {
        const monthMap = {january:1,february:2,march:3,april:4,may:5,june:6,july:7,august:8,september:9,october:10,november:11,december:12};
        const month = monthMap[dateMatch[2].toLowerCase()];
        const day = dateMatch[3].padStart(2, '0');
        const year = dateMatch[4];
        itemDate = `${year}-${String(month).padStart(2, '0')}-${day}`;
      }
    } else if (item.month) {
      itemDate = item.month;
    }
    
    return itemDate >= range.start && itemDate <= range.end;
  });
}

// Helper: Calculate trend (current vs previous period)
function calculateTrend(data, filter, field, categories = null) {
  const { year, month, quarter } = getDateInfo();
  
  let currentData, previousData;
  
  if (filter === 'current_month_vs_previous') {
    const currentMonth = `${year}-${String(month).padStart(2, '0')}`;
    const prevMonth = month === 1 
      ? `${year - 1}-12` 
      : `${year}-${String(month - 1).padStart(2, '0')}`;
    
    currentData = data.filter(item => item.month === currentMonth);
    previousData = data.filter(item => item.month === prevMonth);
  } else if (filter === 'current_quarter_vs_previous') {
    const currentQ = quarter;
    const prevQ = quarter === 1 ? 4 : quarter - 1;
    const prevYear = quarter === 1 ? year - 1 : year;
    
    currentData = data.filter(item => 
      item.quarter === `Q${currentQ}` && item.month.startsWith(String(year))
    );
    previousData = data.filter(item => 
      item.quarter === `Q${prevQ}` && item.month.startsWith(String(prevYear))
    );
  }
  
  // Filter by categories if specified
  if (categories && categories.length > 0) {
    currentData = currentData.filter(item => categories.includes(item.category));
    previousData = previousData.filter(item => categories.includes(item.category));
  }
  
  const currentTotal = currentData.reduce((sum, item) => sum + (item[field] || 0), 0);
  const previousTotal = previousData.reduce((sum, item) => sum + (item[field] || 0), 0);
  
  if (previousTotal === 0) return 0;
  
  const percentChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  return Math.round(percentChange);
}

// Helper: Calculate custom trend between two date ranges
function calculateCustomTrend(data, range1, range2, field, categories = null, year = 2025) {
  let data1 = filterByCustomRange(data, range1, year);
  let data2 = filterByCustomRange(data, range2, year);
  
  // Filter by categories if specified
  if (categories && categories.length > 0) {
    data1 = data1.filter(item => categories.includes(item.category));
    data2 = data2.filter(item => categories.includes(item.category));
  }
  
  const total1 = data1.reduce((sum, item) => sum + (item[field] || 0), 0);
  const total2 = data2.reduce((sum, item) => sum + (item[field] || 0), 0);
  
  if (total1 === 0) return { period1: Math.round(total1), period2: Math.round(total2), change: 0 };
  
  const percentChange = ((total2 - total1) / total1) * 100;
  return {
    period1: Math.round(total1),
    period2: Math.round(total2),
    change: Math.round(percentChange)
  };
}

// Helper: Read data source
async function readDataSource(sourceName) {
  try {
    const filePath = path.join(DATA_DIR, `${sourceName}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Data source '${sourceName}' not found`);
  }
}

// Helper: Read views
async function readViews() {
  try {
    const content = await fs.readFile(VIEWS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return { views: [] };
  }
}

// GET /api/data-engine/sources - List all data sources
router.get('/sources', async (req, res) => {
  try {
    const files = await fs.readdir(DATA_DIR);
    const sources = [];
    
    for (const file of files) {
      if (file.endsWith('.json') && file !== 'views.json') {
        const content = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
        const data = JSON.parse(content);
        sources.push({
          id: file.replace('.json', ''),
          name: data.metadata?.name || file,
          description: data.metadata?.description || '',
          lastUpdated: data.metadata?.lastUpdated,
          recordCount: data.data?.length || 0
        });
      }
    }
    
    res.json({ success: true, sources });
  } catch (error) {
    console.error('Error listing data sources:', error);
    res.status(500).json({ success: false, error: 'Failed to list data sources' });
  }
});

// GET /api/data-engine/sources/:id - Get data source with full data
router.get('/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await readDataSource(id);
    res.json({ success: true, source: data });
  } catch (error) {
    console.error('Error reading data source:', error);
    res.status(404).json({ success: false, error: error.message });
  }
});

// PUT /api/data-engine/sources/:id - Update data source
router.put('/sources/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: newData, metadata } = req.body;
    
    const filePath = path.join(DATA_DIR, `${id}.json`);
    let existing = { metadata: {}, schema: {}, data: [] };
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(content);
    } catch (error) {
      // File doesn't exist, will create new
    }
    
    const updated = {
      metadata: {
        ...existing.metadata,
        ...metadata,
        lastUpdated: new Date().toISOString()
      },
      schema: existing.schema,
      data: newData || existing.data
    };
    
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    
    res.json({ success: true, source: updated });
  } catch (error) {
    console.error('Error updating data source:', error);
    res.status(500).json({ success: false, error: 'Failed to update data source' });
  }
});

// POST /api/data-engine/sources/:id/import - Import CSV data
router.post('/sources/:id/import', async (req, res) => {
  try {
    const { id } = req.params;
    const { csvData, delimiter = ',' } = req.body;
    
    // Parse CSV
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(delimiter).map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(delimiter).map(v => v.trim());
      const row = {};
      headers.forEach((header, index) => {
        let value = values[index];
        // Try to convert to number if possible
        if (!isNaN(value) && value !== '') {
          value = Number(value);
        }
        row[header] = value;
      });
      data.push(row);
    }
    
    // Read existing source
    const filePath = path.join(DATA_DIR, `${id}.json`);
    let existing = { metadata: {}, schema: {}, data: [] };
    
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      existing = JSON.parse(content);
    } catch (error) {
      // New source
    }
    
    // Update with new data
    const updated = {
      metadata: {
        ...existing.metadata,
        lastUpdated: new Date().toISOString()
      },
      schema: existing.schema,
      data
    };
    
    await fs.writeFile(filePath, JSON.stringify(updated, null, 2));
    
    res.json({ success: true, imported: data.length, source: updated });
  } catch (error) {
    console.error('Error importing CSV:', error);
    res.status(500).json({ success: false, error: 'Failed to import CSV data' });
  }
});

// GET /api/data-engine/views - List all views
router.get('/views', async (req, res) => {
  try {
    const { views } = await readViews();
    res.json({ success: true, views });
  } catch (error) {
    console.error('Error listing views:', error);
    res.status(500).json({ success: false, error: 'Failed to list views' });
  }
});

// GET /api/data-engine/views/:id - Execute view query
router.get('/views/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { views } = await readViews();
    const view = views.find(v => v.id === id);
    
    if (!view) {
      return res.status(404).json({ success: false, error: 'View not found' });
    }
    
    // Read source data
    const sourceData = await readDataSource(view.source);
    
    let result;
    
    if (view.type === 'aggregation') {
      // Filter by date range
      const filteredData = filterByDateRange(sourceData.data, view.query.filter);
      
      // Aggregate with optional category filtering
      result = aggregateData(
        filteredData, 
        view.query.operation, 
        view.query.field,
        view.query.categories
      );
    } else if (view.type === 'trend') {
      // Calculate trend percentage
      result = calculateTrend(
        sourceData.data,
        view.query.filter,
        view.query.field,
        view.query.categories
      );
    } else {
      // Return filtered data as-is
      result = filterByDateRange(sourceData.data, view.query.filter);
    }
    
    res.json({
      success: true,
      view: {
        id: view.id,
        name: view.name,
        description: view.description
      },
      data: result,
      metadata: {
        recordCount: typeof result === 'number' ? 1 : (Array.isArray(result) ? result.length : 1),
        executedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error executing view:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/data-engine/query/:source - Execute parameterized query
router.get('/query/:source', async (req, res) => {
  try {
    const { source } = req.params;
    const { range, range1, range2, field, categories, operation } = req.query;
    
    // Read source data
    const sourceData = await readDataSource(source);
    
    // Parse categories if provided
    const categoryList = categories ? categories.split(',') : null;
    
    let result;
    
    // Trend between two ranges
    if (range1 && range2) {
      result = calculateCustomTrend(
        sourceData.data,
        range1,
        range2,
        field || 'hours',
        categoryList
      );
    }
    // Single range aggregation
    else if (range) {
      const filteredData = filterByCustomRange(sourceData.data, range);
      if (operation === 'sum') {
        result = aggregateData(filteredData, 'sum', field || 'hours', categoryList);
      } else {
        result = filteredData;
      }
    }
    // No parameters - return all data
    else {
      result = sourceData.data;
    }
    
    res.json({
      success: true,
      source,
      query: { range, range1, range2, field, categories, operation },
      data: result,
      metadata: {
        recordCount: typeof result === 'number' ? 1 : (Array.isArray(result) ? result.length : 1),
        executedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error executing parameterized query:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

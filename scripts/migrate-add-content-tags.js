/**
 * Migration Script: Add _contentTag field to existing content files
 * 
 * This script scans all JSON files in src/data and backend/uploads folders
 * and adds the appropriate _contentTag field based on the folder location.
 * 
 * Usage: node scripts/migrate-add-content-tags.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tag mapping based on folder structure
const FOLDER_TAG_MAP = {
  'summaries': 'weekly-summary',
  'executive-iq': 'executive-iq',
  'organizations': 'organizations',
  'performance': 'performance',
  'knowledge-base': 'knowledge-base',
  'kb-categories': 'kb-categories'
};

// Directories to scan
const SCAN_PATHS = [
  path.join(__dirname, '..', 'src', 'data'),
  path.join(__dirname, '..', 'backend', 'uploads')
];

let stats = {
  scanned: 0,
  updated: 0,
  skipped: 0,
  errors: 0
};

/**
 * Recursively find all JSON files in a directory
 */
function findJsonFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Determine the content tag based on file path
 */
function getTagFromPath(filePath) {
  for (const [folder, tag] of Object.entries(FOLDER_TAG_MAP)) {
    if (filePath.includes(path.sep + folder + path.sep) || 
        filePath.includes(path.sep + folder)) {
      return tag;
    }
  }
  return null;
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
  stats.scanned++;
  
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Check if _contentTag already exists
    if (data._contentTag) {
      console.log(`⏭️  Skipped (already has tag): ${path.basename(filePath)} -> ${data._contentTag}`);
      stats.skipped++;
      return;
    }
    
    // Determine the appropriate tag
    const tag = getTagFromPath(filePath);
    
    if (!tag) {
      console.log(`⚠️  No tag mapping found for: ${filePath}`);
      stats.skipped++;
      return;
    }
    
    // Add the _contentTag field (insert after id/title for readability)
    const updatedData = {
      ...data,
      _contentTag: tag
    };
    
    // Reorder to put _contentTag near the top (after id, quarter, year, date, title)
    const orderedData = {};
    const priorityFields = ['id', 'quarter', 'year', 'date', 'title', 'name', 'displayName'];
    
    // Add priority fields first
    priorityFields.forEach(field => {
      if (updatedData[field] !== undefined) {
        orderedData[field] = updatedData[field];
      }
    });
    
    // Add _contentTag
    orderedData._contentTag = tag;
    
    // Add remaining fields
    Object.keys(updatedData).forEach(key => {
      if (!orderedData.hasOwnProperty(key)) {
        orderedData[key] = updatedData[key];
      }
    });
    
    // Write back to file with proper formatting
    fs.writeFileSync(filePath, JSON.stringify(orderedData, null, 2), 'utf8');
    
    console.log(`✅ Updated: ${path.basename(filePath)} -> ${tag}`);
    stats.updated++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main migration function
 */
function migrate() {
  console.log('🚀 Starting content tag migration...\n');
  
  SCAN_PATHS.forEach(scanPath => {
    if (!fs.existsSync(scanPath)) {
      console.log(`⚠️  Path does not exist: ${scanPath}`);
      return;
    }
    
    console.log(`📂 Scanning: ${scanPath}`);
    const files = findJsonFiles(scanPath);
    
    files.forEach(file => {
      processFile(file);
    });
    
    console.log(''); // Blank line between scan paths
  });
  
  // Print summary
  console.log('━'.repeat(60));
  console.log('📊 Migration Summary:');
  console.log(`   Total files scanned: ${stats.scanned}`);
  console.log(`   Files updated: ${stats.updated}`);
  console.log(`   Files skipped: ${stats.skipped}`);
  console.log(`   Errors: ${stats.errors}`);
  console.log('━'.repeat(60));
  
  if (stats.updated > 0) {
    console.log('\n✨ Migration complete! Files have been updated with _contentTag fields.');
    console.log('💡 Tip: Restart your backend server to pick up the changes.');
  } else {
    console.log('\n✨ No files needed updating.');
  }
}

// Run migration
migrate();

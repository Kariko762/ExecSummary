/**
 * Knowledge Base Import Script
 * Converts Markdown files to KB article JSON format
 * 
 * Usage: node scripts/import-kb-from-md.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// KB Source and destination paths
const KB_SOURCE = path.join(__dirname, '..', 'knowledge-base');
const KB_DEST = path.join(__dirname, '..', 'src', 'data', 'knowledge-base');
const CATEGORIES_DEST = path.join(__dirname, '..', 'src', 'data', 'kb-categories');

// Ensure destination directories exist
if (!fs.existsSync(KB_DEST)) {
  fs.mkdirSync(KB_DEST, { recursive: true });
}

// Helper: Extract title from markdown
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].replace(/\*\*/g, '').trim() : 'Untitled';
}

// Helper: Extract description from first paragraph after title
function extractDescription(content) {
  const lines = content.split('\n');
  let foundTitle = false;
  for (const line of lines) {
    if (line.startsWith('# ')) {
      foundTitle = true;
      continue;
    }
    if (foundTitle && line.trim() && !line.startsWith('#') && !line.startsWith('*') && !line.startsWith('-')) {
      return line.replace(/\*\*/g, '').trim();
    }
  }
  return '';
}

// Helper: Extract all H2 sections as steps
function extractSteps(content) {
  const steps = [];
  const sections = content.split(/^##\s+/m).slice(1); // Skip content before first H2
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const title = lines[0].replace(/\*\*/g, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    steps.push({
      _type: 'step',
      _enabled: true,
      _completed: false,
      stepNumber: index + 1,
      title: title,
      description: content.substring(0, 500), // First 500 chars
      instructions: content,
      expectedOutcome: '',
      screenshot: '',
      duration: ''
    });
  });
  
  return steps;
}

// Helper: Extract code blocks
function extractCodeBlocks(content) {
  const codeBlocks = [];
  const regex = /```(\w+)?\n([\s\S]+?)```/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    codeBlocks.push({
      _type: 'codeBlock',
      _enabled: true,
      _completed: false,
      language: language,
      code: code,
      title: `${language} Example`,
      explanation: ''
    });
  }
  
  return codeBlocks;
}

// Helper: Extract lists as key points
function extractKeyPoints(content) {
  const keyPoints = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    if (line.match(/^[-*]\s+(.+)$/)) {
      const point = line.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').trim();
      if (point.length > 10 && point.length < 200) { // Filter reasonable lengths
        keyPoints.push(point);
      }
    }
  });
  
  return keyPoints.slice(0, 10); // Top 10 points
}

// Helper: Estimate read time (200 words per minute)
function estimateReadTime(content) {
  const words = content.split(/\s+/).length;
  return Math.ceil(words / 200);
}

// Helper: Extract tags from content and filename
function extractTags(content, filename, category) {
  const tags = [category];
  
  // Add tags based on keywords in content
  const keywords = {
    'chart': 'charts',
    'template': 'templates',
    'render': 'rendering',
    'layout': 'layout',
    'metadata': 'metadata',
    'expression': 'expressions',
    'api': 'api',
    'component': 'components',
    'react': 'react',
    'typescript': 'typescript',
    'integration': 'integration',
    'troubleshooting': 'troubleshooting'
  };
  
  const lowerContent = content.toLowerCase();
  for (const [keyword, tag] of Object.entries(keywords)) {
    if (lowerContent.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 5); // Max 5 tags
}

// Helper: Determine article type from content
function determineArticleType(content, filename) {
  if (filename.includes('guide') || content.includes('step-by-step') || content.includes('How to')) {
    return 'tutorial';
  }
  if (filename.includes('troubleshoot') || content.includes('Troubleshooting')) {
    return 'troubleshooting';
  }
  if (filename.includes('reference') || content.includes('Reference')) {
    return 'reference';
  }
  return 'how-to';
}

// Helper: Determine difficulty from content complexity
function determineDifficulty(content) {
  const hasCode = content.includes('```');
  const hasTechnicalTerms = /typescript|interface|component|architecture/i.test(content);
  const wordCount = content.split(/\s+/).length;
  
  if (wordCount > 2000 && hasCode && hasTechnicalTerms) {
    return 'advanced';
  }
  if (wordCount > 1000 || hasCode) {
    return 'intermediate';
  }
  return 'beginner';
}

// Main conversion function
function convertMarkdownToKB(mdPath, category) {
  const content = fs.readFileSync(mdPath, 'utf-8');
  const filename = path.basename(mdPath, '.md');
  
  const title = extractTitle(content);
  const overview = extractDescription(content);
  const steps = extractSteps(content);
  const codeExamples = extractCodeBlocks(content);
  const keyPoints = extractKeyPoints(content);
  const tags = extractTags(content, filename, category);
  const articleType = determineArticleType(content, filename);
  const difficulty = determineDifficulty(content);
  const readTime = estimateReadTime(content);
  
  // Create KB article following the 27-section template
  const kbArticle = {
    // Standard header
    id: `kb-${filename}`,
    quarter: title, // Use article title instead of date
    year: new Date().getFullYear(),
    date: new Date().toISOString().split('T')[0],
    title: title,
    status: 'published',
    protectionEnabled: false,
    
    // Article metadata
    category: category,
    _category_type: 'text',
    _enabled_category: true,
    _completed_category: true,
    
    tags: tags,
    _tags_type: 'list',
    _enabled_tags: true,
    _completed_tags: true,
    
    articleType: articleType,
    _articleType_type: 'text',
    _enabled_articleType: true,
    _completed_articleType: true,
    
    difficulty: difficulty,
    _difficulty_type: 'text',
    _enabled_difficulty: true,
    _completed_difficulty: true,
    
    estimatedReadTime: `${readTime} min`,
    _estimatedReadTime_type: 'text',
    _enabled_estimatedReadTime: true,
    _completed_estimatedReadTime: true,
    
    author: 'System Generated',
    _author_type: 'text',
    _enabled_author: true,
    _completed_author: true,
    
    publishDate: new Date().toISOString(),
    _publishDate_type: 'date',
    _enabled_publishDate: true,
    _completed_publishDate: true,
    
    lastUpdated: new Date().toISOString(),
    _lastUpdated_type: 'date',
    _enabled_lastUpdated: true,
    _completed_lastUpdated: true,
    
    version: '1.0',
    _version_type: 'text',
    _enabled_version: true,
    _completed_version: true,
    
    // Content sections
    summary: overview,
    _summary_type: 'textarea',
    _enabled_summary: true,
    _completed_summary: overview.length > 0,
    
    overview: overview,
    _overview_type: 'textarea',
    _enabled_overview: true,
    _completed_overview: overview.length > 0,
    
    keyPoints: keyPoints,
    _keyPoints_type: 'list',
    _enabled_keyPoints: keyPoints.length > 0,
    _completed_keyPoints: keyPoints.length > 0,
    
    steps: steps,
    _steps_type: 'nestedCards',
    _steps_fields: {
      stepNumber: { type: 'number', label: 'Step #', required: true },
      title: { type: 'text', label: 'Title', required: true },
      description: { type: 'textarea', label: 'Description' },
      instructions: { type: 'textarea', label: 'Instructions' },
      expectedOutcome: { type: 'text', label: 'Expected Outcome' },
      screenshot: { type: 'text', label: 'Screenshot URL' },
      duration: { type: 'text', label: 'Duration' }
    },
    _enabled_steps: steps.length > 0,
    _completed_steps: steps.length > 0,
    
    codeExamples: codeExamples,
    _codeExamples_type: 'nestedCards',
    _codeExamples_fields: {
      language: { type: 'text', label: 'Language', required: true },
      code: { type: 'textarea', label: 'Code', required: true },
      title: { type: 'text', label: 'Title' },
      explanation: { type: 'textarea', label: 'Explanation' }
    },
    _enabled_codeExamples: codeExamples.length > 0,
    _completed_codeExamples: codeExamples.length > 0,
    
    // Placeholder sections (to be filled manually if needed)
    prerequisites: [],
    _prerequisites_type: 'list',
    _enabled_prerequisites: false,
    _completed_prerequisites: false,
    
    requiredTools: [],
    _requiredTools_type: 'nestedCards',
    _requiredTools_fields: {
      name: { type: 'text', label: 'Tool Name', required: true },
      version: { type: 'text', label: 'Version' },
      downloadLink: { type: 'text', label: 'Download Link' },
      purpose: { type: 'text', label: 'Purpose' }
    },
    _enabled_requiredTools: false,
    _completed_requiredTools: false,
    
    troubleshooting: [],
    _troubleshooting_type: 'nestedCards',
    _troubleshooting_fields: {
      issue: { type: 'text', label: 'Issue', required: true },
      symptoms: { type: 'textarea', label: 'Symptoms' },
      cause: { type: 'text', label: 'Cause' },
      solution: { type: 'textarea', label: 'Solution', required: true },
      preventionTips: { type: 'textarea', label: 'Prevention Tips' }
    },
    _enabled_troubleshooting: false,
    _completed_troubleshooting: false,
    
    relatedArticles: [],
    _relatedArticles_type: 'list',
    _enabled_relatedArticles: false,
    _completed_relatedArticles: false,
    
    // Template metadata
    _template_name: 'KB Article Import',
    _template_description: 'Imported from Markdown',
    _template_created: new Date().toISOString(),
    _template_updated: new Date().toISOString()
  };
  
  return kbArticle;
}

// Process all MD files
function processKnowledgeBase() {
  console.log('🚀 Starting Knowledge Base import...\n');
  
  const categories = {
    'developer': 'development',
    'reference': 'technical',
    'user-guides': 'support',
    'workflows': 'business'
  };
  
  let totalProcessed = 0;
  
  for (const [folder, categoryId] of Object.entries(categories)) {
    const folderPath = path.join(KB_SOURCE, folder);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Skipping missing folder: ${folder}`);
      continue;
    }
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.md'));
    
    console.log(`📁 Processing ${folder}/ (${files.length} files)`);
    
    files.forEach(file => {
      const mdPath = path.join(folderPath, file);
      const kbArticle = convertMarkdownToKB(mdPath, categoryId);
      
      const outputPath = path.join(KB_DEST, `${kbArticle.id}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(kbArticle, null, 2));
      
      console.log(`   ✅ ${file} → ${kbArticle.id}.json`);
      totalProcessed++;
    });
    
    console.log('');
  }
  
  console.log(`✨ Import complete! Processed ${totalProcessed} articles.`);
  console.log(`📍 Output location: ${KB_DEST}\n`);
  console.log('Next steps:');
  console.log('1. Review generated JSON files');
  console.log('2. Fill in missing sections (prerequisites, troubleshooting, etc.)');
  console.log('3. Add related article links');
  console.log('4. Update categories if needed');
  console.log('5. Test in CMS Admin\n');
}

// Run the import
processKnowledgeBase();

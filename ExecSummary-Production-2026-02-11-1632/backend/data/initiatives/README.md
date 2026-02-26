# Initiatives File Structure

## Organization (Auto-Discovery)

Each initiative is stored in its own JSON file and **automatically discovered** by the backend:
- **Filename format**: `{initiative-id}.json`
- **Location**: `backend/data/initiatives/`
- **No index needed** - Backend scans directory on each request

## Files

- `{initiative-id}.json` - Complete initiative data with full SMART goals, budget, resources, etc.
- `registry.json` - DEPRECATED - Old monolithic file (kept for migration reference only)

## How It Works

1. **Drop a file** - Save any valid initiative JSON as `{id}.json` in this folder
2. **Auto-discovery** - Backend reads all `.json` files on every GET request
3. **Validation** - Invalid JSON files are skipped with console warnings
4. **No maintenance** - No index to update, no manual registration required

## Why This Approach?

1. **Zero maintenance** - Just drop JSON files, they're automatically picked up
2. **Self-validating** - Invalid files are skipped, won't break the system
3. **Scalable** - Works with 1 initiative or 1000 initiatives
4. **Simple** - No index to sync, no two sources of truth
5. **Version Control** - Git diffs show exact changes to specific initiatives
6. **Concurrent Safe** - Each initiative is independent

## Files Ignored

- `index.json` - No longer used (deleted)
- `registry.json` - Old format, kept for reference
- Non-JSON files - Only `.json` files are processed

## Backend Implementation

```javascript
// Auto-discovers all initiatives from folder
async function discoverInitiatives() {
  const files = await fs.readdir(INITIATIVES_DIR);
  const initiatives = [];
  
  for (const file of files) {
    if (!file.endsWith('.json') || file === 'registry.json') continue;
    
    try {
      const initiative = JSON.parse(await fs.readFile(file));
      initiatives.push({
        id: initiative.id,
        name: initiative.name,
        status: initiative.status,
        // ... other metadata
      });
    } catch (error) {
      console.error(`Skipping invalid file: ${file}`);
    }
  }
  
  return initiatives;
}
```

## Usage

**To add an initiative:**
```bash
# Just save the JSON file with the initiative ID as filename
backend/data/initiatives/my-new-initiative.json
```

**To update an initiative:**
```bash
# Edit the file directly, changes picked up on next API call
```

**To remove an initiative:**
```bash
# Delete the file, removed from list on next API call
```

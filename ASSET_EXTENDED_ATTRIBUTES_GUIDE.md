# Asset Management System - Business-Aligned Extended Attributes

## 📋 Overview

The asset management system uses a **two-tier data architecture**:

1. **Core Asset Information** - Baseline operational fields for ALL assets (`assets-register.json`)
2. **Extended Asset Attributes** - Business-focused strategic fields for SOME assets (`asset-extended-attributes.json`)

This approach keeps the data model clean by separating **operational asset details** from **business context and strategic value**. Extended attributes focus on:

- **Business Ownership** (Owner, Pre-Sales Owner, Development Manager)
- **Revenue & Financial Impact** (Revenue Influenced, Deal Value, Costs)
- **Client Alignment** (Active Clients, Target Clients, Client Ratings)
- **Strategic Value** (Strategic Importance, Project Alignment)
- **Performance Metrics** (Demo Count, View Count, Conversion Rate)

**NOT** operational metrics like maintenance schedules, uptime SLAs, or support tier classifications.

---

## 🏗️ Data Structure

### **Core Asset Information** (`/backend/data/assets-register.json`)

All assets have these baseline properties:

```json
{
  "id": "asset-001",
  "name": "Banking Demo Server - EMEA",
  "category": "Live Environment",
  "type": "Server",
  "environmentType": "Production Demo Tenant",
  "location": "Azure",
  "businessUnit": "banking-international",
  "status": "active",
  "owner": "Sarah Chen",
  "cost": "$1,200/month",
  "vendorId": null,
  "relatedVendors": [],
  "hasExtendedAttributes": true
}
```

**Key Fields:**
- `id` - Unique asset identifier (e.g., `asset-001`)
- `name` - Asset display name
- `category` - **Technology** or **Live Environment**
- `type` - Technology: `Coast`, `Synthesia`, `Tiled`, `Other` | Live: `Server`, `URL`, `Container`, `Database`
- `businessUnit` - BU owner (kebab-case)
- `status` - `active`, `pending`, `archived`
- `owner` - Primary asset owner
- `hasExtendedAttributes` - Boolean flag indicating if extended data exists

---

### **Extended Asset Attributes** (`/backend/data/asset-extended-attributes.json`)

Optional fields linked by `assetId`:

```json
{
  "assetId": "asset-001",
  "owner": "Sarah Chen",
  "preSalesOwner": "Richard Willcock",
  "developmentManager": "Klaus Mueller",
  "businessUnit": "Banking International",
  "purpose": "Primary EMEA demo environment for tier-1 banking clients",
  "deployedDate": "2024-08-15",
  "monthlyCost": "$1,200",
  "annualCost": "$14,400",
  "activeClients": ["HSBC", "Deutsche Bank", "BNP Paribas"],
  "revenueInfluenced": "$18.2M",
  "strategicImportance": "Critical",
  "projectAlignment": ["EMEA Banking Expansion 2026", "HSBC Digital Transformation"],
  "documentationUrl": "https://docs.fis.com/demo-environments/banking-emea",
  "notes": "Primary demo environment for HSBC and Deutsche Bank strategic deals."
}
```

**Common Extended Fields:**

**Business Ownership & Team:**
- `owner` - Primary asset owner
- `preSalesOwner` - Pre-Sales responsible party
- `developmentManager` - Development team manager
- `contentCreator` - Content author (for technology assets)
- `projectManager` - PM for client-specific projects

**Business Context:**
- `businessUnit` - Business unit (friendly name)
- `purpose` - Clear description of asset's business purpose
- `strategicImportance` - **Critical** | **High** | **Medium** | **Low**
- `projectAlignment` - Array of related project/initiative names

**Financial & Revenue:**
- `monthlyCost` - Monthly infrastructure cost
- `annualCost` - Annual total cost
- `revenueInfluenced` - Total revenue influenced by this asset
- `dealValue` - Specific deal value (for client-specific assets)
- `dealStage` - Deal stage (for client environments)
- `conversionRate` - Demo-to-deal conversion rate

**Client Information:**
- `activeClients` - Array of client names using this asset
- `clientName` - Primary client (for dedicated environments)
- `clientContact` - Client project team contact
- `targetClients` - Target clients (for assets in development)
- `avgClientRating` - Average client feedback rating (1-5)

**Technology Asset Metrics:**
- `demosPerformed` - Number of demos using this asset
- `viewCount` - Total views (for microsites/videos)
- `avgMonthlyDemos` - Average monthly demo count
- `avgMonthlyUsers` - Average monthly active users

**Vendor & License Information:**
- `vendorName` - Technology vendor name
- `licenseStatus` - **Active** | **Expiring** | **Renewal Required**
- `licenseExpiration` - License expiration date

**Content Details (Technology Assets):**
- `createdDate` - Content creation date
- `lastUpdated` - Last content update date
- `videoDuration` - Video/presentation length
- `languages` - Array of available languages

**Project & Timeline:**
- `deployedDate` - When asset was deployed/launched
- `contractEndDate` - Contract end date (client-specific)
- `requestDate` - Request date (for pending assets)
- `estimatedCompletionDate` - ETA for completion

**Metadata:**
- `url` - Direct URL (for web assets)
- `documentationUrl` - Technical documentation link
- `notes` - Free-form business notes
- `relatedAssets` - Array of related asset IDs
- `status` - Status for assets in development

---

## 🔌 API Endpoints

### **1. Get All Assets (Core Info)**
```http
GET http://localhost:3001/api/assets
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastUpdated": "2026-02-24T10:00:00Z",
    "assets": [ /* array of all core assets */ ],
    "filterOptions": { /* category/type options */ }
  }
}
```

---

### **2. Get Extended Attributes for Specific Asset**
```http
GET http://localhost:3001/api/assets/asset-001/extended
```

**Response:**
```json
{
  "success": true,
  "data": {
    "assetId": "asset-001",
    "preSalesOwner": "Richard Willcock",
    "developmentManager": "Klaus Mueller",
    /* ... all extended fields */
  }
}
```

If no extended attributes exist:
```json
{
  "success": true,
  "data": null,
  "message": "No extended attributes found for this asset"
}
```

---

### **3. Get All Extended Attributes**
```http
GET http://localhost:3001/api/assets/extended/all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lastUpdated": "2026-02-25T10:00:00Z",
    "extendedAttributes": [ /* array of all extended attribute objects */ ]
  }
}
```

---

## 💡 Usage Examples

### **Frontend Component Example**

```typescript
// Fetch core asset
const assetResponse = await fetch('http://localhost:3001/api/assets');
const { data: { assets } } = await assetResponse.json();

const myAsset = assets.find(a => a.id === 'asset-001');

// Check if extended attributes exist
if (myAsset.hasExtendedAttributes) {
  const extResponse = await fetch(`http://localhost:3001/api/assets/${myAsset.id}/extended`);
  const { data: extendedData } = await extResponse.json();
  
  if (extendedData) {
    console.log('Pre-Sales Owner:', extendedData.preSalesOwner);
    console.log('Development Manager:', extendedData.developmentManager);
    console.log('Last Maintenance:', extendedData.lastMaintenance);
  }
}
```

---

### **Join Core + Extended in UI**

```typescript
interface AssetWithExtended {
  core: CoreAsset;
  extended: ExtendedAttributes | null;
}

async function getAssetWithDetails(assetId: string): Promise<AssetWithExtended> {
  // Fetch core asset
  const assetsResp = await fetch('http://localhost:3001/api/assets');
  const { data: { assets } } = await assetsResp.json();
  const coreAsset = assets.find((a: any) => a.id === assetId);
  
  if (!coreAsset) throw new Error('Asset not found');
  
  // Fetch extended if flag is true
  let extendedData = null;
  if (coreAsset.hasExtendedAttributes) {
    const extResp = await fetch(`http://localhost:3001/api/assets/${assetId}/extended`);
    const { data } = await extResp.json();
    extendedData = data;
  }
  
  return { core: coreAsset, extended: extendedData };
}

// Example: Get all critical assets with revenue data
async function getCriticalAssets() {
  const assetsResp = await fetch('http://localhost:3001/api/assets');
  const extResp = await fetch('http://localhost:3001/api/assets/extended/all');
  
  const { data: { assets } } = await assetsResp.json();
  const { data: { extendedAttributes } } = await extResp.json();
  
  const criticalAssets = extendedAttributes
    .filter(ext => ext.strategicImportance === 'Critical')
    .map(ext => {
      const core = assets.find(a => a.id === ext.assetId);
      return {
        id: ext.assetId,
        name: core?.name,
        owner: ext.owner,
        revenue: ext.revenueInfluenced,
        clients: ext.activeClients,
        projects: ext.projectAlignment
      };
    });
  
  return criticalAssets;
}

// Example: Calculate total revenue by business unit
async function getRevenueByBU() {
  const extResp = await fetch('http://localhost:3001/api/assets/extended/all');
  const { data: { extendedAttributes } } = await extResp.json();
  
  const revenueByBU = extendedAttributes.reduce((acc, ext) => {
    const bu = ext.businessUnit || 'Unknown';
    const revenue = parseFloat(ext.revenueInfluenced?.replace(/[$M,]/g, '') || '0');
    acc[bu] = (acc[bu] || 0) + revenue;
    return acc;
  }, {});
  
  return revenueByBU;
}
```

---

## 🎯 Benefits of This Architecture

### **1. Business-Focused Data Model**
- Core assets remain clean with universal fields
- Extended attributes capture **business context** not operations
- Focus on: ownership, revenue impact, client alignment, strategic value
- No operational clutter (maintenance schedules, uptime metrics, support tiers)

### **2. Strategic Visibility**
- Track revenue influenced by each asset
- Link assets to strategic projects and initiatives
- Identify high-performing assets by client ratings and conversion rates
- Understand asset ROI and business justification

### **3. Performance**
- List views load fast (core data only)
- Detail views fetch extended business data on-demand
- Reduces payload size for bulk operations

### **4. Flexibility**
- Each asset type has unique business-relevant fields
- Technology assets: `demosPerformed`, `avgClientRating`, `viewCount`, `conversionRate`
- Infrastructure assets: `activeClients`, `revenueInfluenced`, `dealValue`
- Client-specific: `clientName`, `dealStage`, `contractEndDate`
- No need for conditional field validation in core schema

### **5. Business Alignment**
- Clear ownership structure (Owner, Pre-Sales Owner, Dev Manager)
- Project/initiative alignment tracking
- Strategic importance classification
- Client relationship visibility

---

## 📊 Current Asset Inventory & Business Metrics

| Category | Count | Extended Attrs | Total Revenue Influenced |
|----------|-------|----------------|--------------------------|
| **Technology Assets** | 5 | 5 | ~$45M |
| **Live Environment** | 10 | 9 | ~$62M |
| **Total** | 15 | 14 | **~$107M** |

### Strategic Importance Distribution
- **Critical**: 4 assets (HSBC UAT, Banking EMEA Server, Capital Markets Server, MUFG Video)
- **High**: 4 assets (Coast Payments Demo, Asset 011, Asset 012, Asset 013)
- **Medium**: 3 assets
- **Low**: 1 asset

### Technology Vendors
- Coast (2 assets) - $6.4M+ revenue influenced
- Synthesia (1 asset) - $12M deal secured
- Tiled (2 assets) - $26.7M+ revenue influenced
- Powtoon (1 asset) - Internal use

### Top Revenue-Generating Assets
1. **asset-009**: Capital Markets Server - $34.8M
2. **asset-003**: Tiled Capital Markets Microsite - $22.5M
3. **asset-001**: Banking EMEA Server - $18.2M
4. **asset-005**: MUFG Synthesia Video - $12M deal

### Business Unit Distribution
- Banking International: 5 assets
- Banking North America: 3 assets
- Capital Markets: 4 assets
- Payments: 2 assets
- Cross-BU: 1 asset

---

## 🔄 Adding New Assets

### Step 1: Add Core Asset
Edit `/backend/data/assets-register.json`:

```json
{
  "id": "asset-016",
  "name": "New Demo Asset",
  "category": "Technology",
  "type": "Coast",
  "businessUnit": "payments",
  "status": "active",
  "owner": "Your Name",
  "vendorId": "vendor-coast",
  "hasExtendedAttributes": true
}
```

### Step 2: Add Extended Attributes (Optional)
Edit `/backend/data/asset-extended-attributes.json`:

```json
{
  "assetId": "asset-016",
  "preSalesOwner": "Jane Doe",
  "developmentManager": "John Smith",
  "createdDate": "2026-02-25",
  "demoCount": 0,
  "notes": "New demo asset for Q1 2026 campaign"
}
```

---

## 🚀 Next Steps

1. **Update AssetDashboard.tsx** to display business metrics:
   - Revenue influenced by asset
   - Active clients
   - Strategic importance badges
   - Project alignment tags

2. **Create Business Reports**:
   - Assets by strategic importance
   - Revenue influenced by business unit
   - Top-performing assets by client rating
   - Asset ROI analysis (revenue vs cost)

3. **Add Filtering/Sorting**:
   - Filter by strategic importance
   - Filter by pre-sales owner
   - Sort by revenue influenced
   - Filter by active clients

4. **Build Executive Dashboard**:
   - Total revenue influenced across all assets
   - Critical assets requiring attention
   - Assets by project alignment
   - Cost vs revenue analysis

5. **Create Asset Detail Modal**:
   - Full business context view
   - Client testimonials/ratings
   - Project linkage visualization
   - Cost/revenue metrics

---

## 📝 Notes

- Asset IDs follow format: `asset-XXX` (padded to 3 digits)
- Vendor IDs follow format: `vendor-{name}` (e.g., `vendor-synthesia`)
- All dates use ISO 8601 format (YYYY-MM-DD)
- Business units in extended attributes use friendly names ("Banking International")
- Business units in core assets use kebab-case ("banking-international")
- Extended attributes focus on **business value**, not operational metrics
- Strategic importance: **Critical** > **High** > **Medium** > **Low**
- Revenue values use format: `$XX.XM` (millions) or `$XXK` (thousands)
- Extended attributes are completely optional - only add what's needed for business context
- Operational details (uptime, maintenance, support tiers) belong in separate operations tracking systems



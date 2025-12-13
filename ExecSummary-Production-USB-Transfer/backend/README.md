# Backend API for Executive Summary Dashboard

File-based CMS backend - manages JSON files with CRUD operations.

## Setup

```bash
cd backend
npm install
npm run dev
```

Server runs on: http://localhost:3001

## API Endpoints

### Summaries
- `GET /api/summaries` - Get all summaries
- `GET /api/summaries/:id` - Get single summary
- `POST /api/summaries` - Create new summary
- `PUT /api/summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary

### ExecutiveIQ
- `GET /api/executive-iq` - Get all articles
- `GET /api/executive-iq/:id` - Get single article
- `POST /api/executive-iq` - Create article
- `PUT /api/executive-iq/:id` - Update article
- `DELETE /api/executive-iq/:id` - Delete article

### Organizations
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get single organization
- `POST /api/organizations` - Create organization
- `PUT /api/organizations/:id` - Update organization
- `DELETE /api/organizations/:id` - Delete organization

### Import
- `POST /api/import/:type` - Import JSON file (multipart/form-data)
  - Types: `summaries`, `executive-iq`, `organizations`

## Example Usage

### Get all summaries
```bash
curl http://localhost:3001/api/summaries
```

### Create new summary
```bash
curl -X POST http://localhost:3001/api/summaries \
  -H "Content-Type: application/json" \
  -d @new-summary.json
```

### Import file
```bash
curl -X POST http://localhost:3001/api/import/summaries \
  -F "file=@week-nov-07-2024.json"
```

## Data Storage

All data stored in: `../src/data/`
- `summaries/*.json`
- `executive-iq/*.json`
- `organizations/*.json`

No database needed - direct file manipulation.

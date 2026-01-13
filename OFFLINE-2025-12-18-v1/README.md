# Executive Summary Platform - Offline Deployment
**Build Date:** December 18, 2025  
**Version:** v1

## 🚀 Quick Start

### Option 1: Automated Start (Recommended)
```powershell
# Windows
.\START-SERVER.bat

# Or PowerShell
.\START-SERVER.ps1
```

### Option 2: Manual Start
```powershell
cd backend
npm install
npm start
```

Then open your browser:
- **Frontend:** http://localhost:3001
- **CMS Admin:** http://localhost:3001/cms-admin

## 📦 What's Included

### Frontend (`/frontend`)
- Executive Summary viewer
- Timeline visualization
- Content modal with dynamic rendering
- Hero grid layouts
- Dark/light mode support

### CMS Admin (`/cms-admin`)
- Template Builder with 22 asset types
- Asset Library with live previews
- Timeline Notes Manager with new note labels feature
- Design System Injector
- Hero Grid Builder

### Backend (`/backend`)
- Express.js API server
- Data management endpoints
- Template storage
- Timeline notes system
- Tag management

## ✨ Latest Features (Dec 18, 2025)

### Timeline Asset - Note Labels
- **New Feature:** Add custom note labels above timeline milestones
- Supports plain text and Expression Engine syntax
- Purple rounded labels with arrow pointers
- Perfect for highlighting key milestones with custom annotations

**Example Usage:**
```json
{
  "date": "Q1 2024",
  "title": "Project Kickoff",
  "note": "TEXT NOTE",
  "description": "Initial planning phase",
  "completed": true
}
```

### Asset Library Updates
- All 22 assets with live interactive previews
- Updated Timeline asset showcasing note labels
- Expression support in notes
- Multi-column preview toggle
- Live data editing

## 🔧 System Requirements

- Node.js 16+ (includes npm)
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Windows, macOS, or Linux

## 📁 Folder Structure

```
OFFLINE-2025-12-18-v1/
├── frontend/          # Built React frontend
├── cms-admin/         # Built CMS admin app
├── backend/           # Node.js server
│   ├── server.js
│   ├── package.json
│   ├── data/          # JSON data storage
│   └── api/           # API endpoints
├── START-SERVER.bat   # Windows launcher
├── START-SERVER.ps1   # PowerShell launcher
└── README.md          # This file
```

## 🌐 Ports

- **3001** - Backend API & Static File Server
- Frontend and CMS Admin are served by the backend

## 🛠️ Troubleshooting

### Port Already in Use
```powershell
# Windows: Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Dependencies Not Installing
```powershell
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Cannot Access Application
1. Check backend is running (terminal should show "Server started")
2. Verify port 3001 is not blocked by firewall
3. Try accessing http://127.0.0.1:3001 instead

## 📝 Notes

- **Fully Offline**: All dependencies bundled, no internet required
- **Data Storage**: All data stored in `/backend/data` as JSON files
- **Customization**: Edit templates and content via CMS Admin
- **Backups**: Regularly backup `/backend/data` folder

## 🎯 Quick Features Guide

### Creating a Timeline with Note Labels
1. Open CMS Admin
2. Navigate to: **Engine & Templates > Asset Library**
3. Find "Project Milestones" asset
4. In edit mode, add note labels to each milestone
5. Save and preview

### Using Expression Engine in Notes
Timeline notes support expressions like:
- `{{trendUp}} 35% Better`
- `{{quarterName}}`
- `{{projectStatus}}`

## 📞 Support

For issues or questions, refer to the knowledge base in `/docs` or contact your system administrator.

---
**Built with ❤️ using React, Node.js, and TypeScript**

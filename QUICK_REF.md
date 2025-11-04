# 🚀 Quick Reference Card

## Development
```bash
npm run dev      # http://localhost:5173
```

## Build & Deploy
```bash
npm run build    # Creates dist/ folder
# Copy dist/ to your offline server
```

## File Structure
```
src/
├── data/summaries.ts          ← EDIT: Add/update summaries
├── index.css                  ← EDIT: Change fonts
└── components/                ← EDIT: Customize UI

tailwind.config.js             ← EDIT: Change colors
```

## Adding a Summary
Edit `src/data/summaries.ts`:
```typescript
{
  id: 'q1-2025',
  quarter: 'Q1',
  year: 2025,
  date: '2025-03-31',
  title: 'Your Title',
  highlights: ['Item 1', 'Item 2'],
  keyMetrics: {
    revenue: 15000000,
    growth: 52,
    customers: 18000,
    satisfaction: 75
  },
  // ... rest of structure
}
```

## Change Colors
Edit `tailwind.config.js`:
```javascript
colors: {
  blue: { 500: '#YOUR_COLOR' },
  purple: { 500: '#YOUR_COLOR' }
}
```

## Useful URLs
- Dev Server: http://localhost:5173
- Docs: README.md
- Deploy Guide: DEPLOYMENT.md
- Customization: CUSTOMIZATION.md

## Common Tasks
- ✏️ **Edit Data**: `src/data/summaries.ts`
- 🎨 **Change Theme**: `tailwind.config.js`
- 🔤 **Update Fonts**: `src/index.css`
- 🖼️ **Edit Logo**: `src/components/Header.tsx`

## After Changes
```bash
npm run build    # Rebuild
# Copy dist/ to server
# Clear browser cache
```

## Features
- ✅ Dark/Light toggle
- ✅ Search bar
- ✅ Timeline scroll
- ✅ Presentation mode (fullscreen icon)
- ✅ Print to PDF (in detail view)
- ✅ 100% offline

## Browser Support
Chrome 90+ | Firefox 88+ | Edge 90+ | Safari 14+

---
**Need Help?** Check README.md or browser console (F12)

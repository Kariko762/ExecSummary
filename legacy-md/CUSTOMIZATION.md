# Customization Guide 🎨

## Quick Start Tips

Your Executive Summary Dashboard is fully customizable. Here's how to make it yours!

## 📊 Adding New Executive Summaries

### Location
Edit: `src/data/summaries.ts`

### Template
```typescript
{
  id: 'q1-2025',           // Unique ID
  quarter: 'Q1',           // Quarter (Q1, Q2, Q3, Q4)
  year: 2025,              // Year
  date: '2025-03-31',      // ISO date format
  title: 'Your Amazing Quarter Title',
  
  highlights: [
    'First major achievement',
    'Second impressive milestone',
    'Third breakthrough moment',
    'Fourth key win',
    'Fifth notable success'
  ],
  
  keyMetrics: {
    revenue: 15000000,     // In dollars
    growth: 52,            // Percentage
    customers: 18000,      // Number of customers
    satisfaction: 75       // NPS score
  },
  
  departments: [
    {
      name: 'Engineering',
      performance: 94,      // 0-100 score
      budget: 4500000,      // In dollars
      headcount: 92,        // Number of employees
      achievements: [
        'Achievement 1',
        'Achievement 2',
        'Achievement 3'
      ]
    },
    // Add more departments...
  ],
  
  initiatives: [
    {
      name: 'Strategic Initiative Name',
      status: 'on-track',   // completed, on-track, at-risk, delayed
      progress: 75,         // 0-100 percentage
      owner: 'Department',  // Owning team
      impact: 'high'        // high, medium, low
    },
    // Add more initiatives...
  ],
  
  risks: [
    {
      description: 'Brief risk description',
      severity: 'medium',   // high, medium, low
      mitigation: 'How we are addressing it'
    },
    // Add more risks...
  ],
  
  outlook: 'Forward-looking statement about next quarter/year expectations and strategic focus areas.'
}
```

## 🎨 Customizing Colors

### Location
Edit: `tailwind.config.js`

### Brand Colors
```javascript
theme: {
  extend: {
    colors: {
      // Add your corporate colors
      brand: {
        primary: '#YOUR_COLOR',
        secondary: '#YOUR_COLOR',
        accent: '#YOUR_COLOR',
      },
      // Or override default colors
      blue: {
        500: '#YOUR_BLUE',
        600: '#YOUR_DARKER_BLUE',
      }
    },
  },
}
```

### Gradient Colors
Edit in `src/index.css` or component files:
```css
/* Change gradient backgrounds */
.bg-gradient-to-br {
  from-blue-600 to-purple-600
  /* Change to your brand colors */
  from-brand-primary to-brand-secondary
}
```

## 🔤 Using Different Fonts

### If You Have New Fonts

1. **Add font files** to a folder (like `CustomFont/`)

2. **Update** `src/index.css`:
```css
@font-face {
  font-family: 'YourFont';
  src: url('/CustomFont/YourFont-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'YourFont';
  src: url('/CustomFont/YourFont-Bold.otf') format('opentype');
  font-weight: 700;
  font-style: normal;
}
```

3. **Update** `tailwind.config.js`:
```javascript
fontFamily: {
  'sans': ['YourFont', 'system-ui', 'sans-serif'],
}
```

4. **Rebuild**:
```bash
npm run build
```

### Using System Fonts
```javascript
// In tailwind.config.js
fontFamily: {
  'sans': ['Inter', 'system-ui', 'sans-serif'],
  // Or
  'sans': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto'],
}
```

## 🖼️ Adding a Company Logo

### Option 1: Replace Logo Component
Edit `src/components/Header.tsx`:

```typescript
// Replace the ES logo with an image
<img 
  src="/assets/your-logo.png" 
  alt="Company Logo" 
  className="h-10 w-auto"
/>
```

### Option 2: Update Gradient Logo
Keep the gradient but change initials:
```typescript
<span className="text-white font-roobert-heavy text-xl">
  YC  {/* Your Company */}
</span>
```

## 📐 Adjusting Layout

### Card Grid Columns
Edit `src/App.tsx`:

```typescript
// Change from 2 columns to 3
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Or single column for detailed view
<div className="grid grid-cols-1 gap-8 max-w-4xl mx-auto">
```

### Dashboard Chart Layout
Edit `src/components/Dashboard.tsx`:

```typescript
// Change from 2 charts to 3 charts
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

// Or stack vertically
<div className="space-y-6">
```

## 🎭 Customizing Animations

### Speed
Edit animation durations in components:

```typescript
// Slower animations
transition={{ duration: 1 }}  // Instead of 0.5

// Faster animations
transition={{ duration: 0.2 }}  // Instead of 0.5
```

### Disable Animations
Add to component:
```typescript
transition={{ duration: 0 }}
```

Or remove `motion.` components and use regular `div`, `section`, etc.

## 📊 Custom Metrics

### Add New Metric Cards
In `src/components/SummaryCard.tsx`, add a new metric:

```typescript
<div className="glass rounded-lg p-3">
  <div className="flex items-center space-x-2 mb-1">
    <YourIcon className="w-4 h-4 text-orange-500" />
    <span className="text-xs font-roobert-light">Your Metric</span>
  </div>
  <p className="text-lg font-roobert-heavy">
    {summary.yourMetric}
  </p>
</div>
```

### Update TypeScript Types
In `src/types/index.ts`:

```typescript
export interface ExecutiveSummary {
  // ... existing fields
  yourMetric?: number;  // Add new field
}
```

## 🌈 Theme Customization

### Default Theme
Change default theme in `src/contexts/ThemeContext.tsx`:

```typescript
const [theme, setTheme] = useState<Theme>(() => {
  return 'light';  // Instead of 'dark'
});
```

### Add New Theme
Create a custom theme beyond dark/light:
1. Add CSS variables in `src/index.css`
2. Extend theme context with 'corporate' option
3. Update toggle to cycle through themes

## 📱 Mobile Customization

### Adjust Breakpoints
In `tailwind.config.js`:

```javascript
theme: {
  screens: {
    'sm': '640px',
    'md': '768px',
    'lg': '1024px',
    'xl': '1280px',
    '2xl': '1536px',
    // Add custom breakpoint
    'tablet': '900px',
  }
}
```

### Mobile-Specific Styles
Use responsive classes:
```typescript
className="text-sm md:text-base lg:text-lg"
className="hidden lg:block"  // Hide on mobile
className="lg:hidden"         // Show only on mobile
```

## 🔍 Search Customization

### Search More Fields
Edit `src/App.tsx`:

```typescript
const filteredSummaries = executiveSummaries.filter(summary => {
  const searchLower = searchQuery.toLowerCase();
  return (
    // Existing searches...
    summary.outlook.toLowerCase().includes(searchLower) ||
    summary.departments.some(d => d.name.toLowerCase().includes(searchLower))
  );
});
```

## 🎯 Adding New Pages

### 1. Create Component
Create `src/components/NewPage.tsx`:

```typescript
export const NewPage = () => {
  return (
    <div>
      <h1>Your New Page</h1>
      {/* Your content */}
    </div>
  );
};
```

### 2. Add Route
In `src/App.tsx`:

```typescript
import { Routes, Route } from 'react-router-dom';
import { NewPage } from './components/NewPage';

// In your component:
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

## 💡 Pro Tips

1. **Always rebuild** after changes: `npm run build`
2. **Test locally first**: `npm run dev`
3. **Keep backups** of your data files
4. **Use version control** (Git) for tracking changes
5. **Document custom changes** for your team

## 🔄 Update Process

1. Edit source files
2. Test with `npm run dev`
3. Build with `npm run build`
4. Copy `dist` folder to server
5. Clear browser cache
6. Verify changes

## 📞 Need Help?

- Check console for errors (F12 in browser)
- Verify TypeScript types match your data
- Run `npm run lint` to catch issues
- Rebuild after every change

## 🎉 Make It Yours!

This dashboard is your canvas. Customize it to perfectly match your company's brand and needs!

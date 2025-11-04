# Executive Summary Dashboard 🚀

A premium, modern executive summary website built with React, TypeScript, and cutting-edge UI/UX design. Features include 3D cards, glassmorphism effects, smooth animations, interactive data visualizations, and full offline capability.

## ✨ Features

- **🎨 Premium Design**: Glassmorphism effects, 3D card animations, and smooth transitions
- **📊 Data Visualizations**: Beautiful charts with Recharts showing revenue, growth, and customer metrics
- **📅 Interactive Timeline**: Horizontal timeline navigation through quarterly summaries
- **🎭 Presentation Mode**: Full-screen mode perfect for board meetings
- **🌓 Dark/Light Mode**: Elegant theme switching with persistent preferences
- **🔍 Smart Search**: Instant search across all summaries and highlights
- **📱 Fully Responsive**: Mobile-first design that looks great on all devices
- **💾 100% Offline**: All assets bundled locally - no internet required
- **🖨️ Print Support**: Generate beautiful PDF reports
- **⚡ Lightning Fast**: Built with Vite for optimal performance

## 🎯 Key Components

### 1. **Dashboard**
- Real-time styled KPIs with animated counters
- Revenue and customer growth charts
- Performance metrics at a glance

### 2. **Summary Cards**
- 3D card effects with hover animations
- Key metrics display (Revenue, Customers, Growth, NPS)
- Quick preview of highlights

### 3. **Timeline Navigation**
- Horizontal scroll timeline
- Visual representation of quarterly progress
- Quick navigation to any period

### 4. **Detail View**
- Comprehensive summary information
- Department performance radial charts
- Strategic initiatives with progress tracking
- Risk assessment and mitigation strategies
- Future outlook section

### 5. **Presentation Mode**
- Full-screen display
- Perfect for executive meetings
- Clean, distraction-free interface

## 🛠️ Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Lucide React** - Beautiful icons
- **Roobert Font** - Corporate typography

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder, ready for deployment to your offline server.

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
ExecSummary/
├── RoobertFont/          # Corporate fonts
├── src/
│   ├── components/       # React components
│   │   ├── Header.tsx
│   │   ├── Dashboard.tsx
│   │   ├── SummaryCard.tsx
│   │   ├── SummaryDetail.tsx
│   │   └── Timeline.tsx
│   ├── contexts/         # React contexts
│   │   ├── ThemeContext.tsx
│   │   └── PresentationContext.tsx
│   ├── data/            # Sample data
│   │   └── summaries.ts
│   ├── types/           # TypeScript types
│   │   └── index.ts
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🎨 Customization

### Adding New Summaries

Edit `src/data/summaries.ts` to add or modify executive summaries:

```typescript
{
  id: 'q1-2025',
  quarter: 'Q1',
  year: 2025,
  date: '2025-03-31',
  title: 'Your Title Here',
  highlights: [
    'Key achievement 1',
    'Key achievement 2',
  ],
  keyMetrics: {
    revenue: 15000000,
    growth: 52,
    customers: 18000,
    satisfaction: 75
  },
  // ... more fields
}
```

### Customizing Colors

Edit `tailwind.config.js` to modify the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      // Add your brand colors here
    },
  },
}
```

### Changing Fonts

The project uses Roobert font family. To use different fonts:
1. Add font files to a folder
2. Update `src/index.css` @font-face declarations
3. Modify `tailwind.config.js` fontFamily settings

## 🌐 Offline Deployment

This application is designed to run completely offline:

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Copy the `dist` folder** to your offline server

3. **Serve static files** using any web server:
   - IIS (Windows Server)
   - Apache
   - Nginx
   - Python: `python -m http.server 8000` (from dist folder)

4. **All assets are bundled** - no external CDN dependencies

## 🎯 Features Breakdown

### Glassmorphism Design
- Frosted glass effects throughout
- Backdrop blur for depth
- Semi-transparent elements
- Modern, premium aesthetic

### 3D Card Effects
- Transform on hover
- Depth perception
- Smooth transitions
- Interactive feedback

### Animations
- Page load animations
- Scroll-triggered effects
- Hover micro-interactions
- Chart animations

### Data Visualization
- Line charts for trends
- Bar charts for comparisons
- Radial charts for performance
- Custom tooltips
- Responsive sizing

## 💡 Usage Tips

1. **Search**: Use the search bar to quickly find specific summaries or highlights
2. **Timeline**: Scroll horizontally to navigate through time periods
3. **Presentation Mode**: Click the presentation icon for full-screen board meeting view
4. **Theme Toggle**: Switch between dark and light modes based on preference
5. **Print**: Use the printer icon in detail view to generate PDF reports
6. **Mobile**: Fully responsive - works great on tablets and phones

## 🔧 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📝 Data Structure

Each executive summary includes:
- **Basic Info**: Quarter, year, date, title
- **Key Metrics**: Revenue, growth, customers, satisfaction
- **Highlights**: Major achievements (array)
- **Departments**: Performance data for each department
- **Initiatives**: Strategic initiatives with progress
- **Risks**: Risk assessment and mitigation
- **Outlook**: Future expectations and goals

## 🎨 Design System

- **Font Weights**:
  - Light (300) - Body text, descriptions
  - Regular (400) - Standard text
  - Medium (500) - Emphasis
  - SemiBold (600) - Subheadings
  - Bold (700) - Headings
  - Heavy (800) - Titles, hero text

- **Color Palette**:
  - Primary: Blue (#3B82F6)
  - Secondary: Purple (#8B5CF6)
  - Success: Green (#10B981)
  - Warning: Yellow (#F59E0B)
  - Danger: Red (#EF4444)

## 🤝 Contributing

This is a corporate internal tool. For modifications:
1. Update the data in `src/data/summaries.ts`
2. Customize styling in Tailwind config
3. Rebuild and redeploy

## 📄 License

Internal corporate use only.

## 🎉 Enjoy Your Executive Dashboard!

Built with ❤️ for data-driven decision making.

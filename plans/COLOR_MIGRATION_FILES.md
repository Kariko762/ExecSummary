# Color Migration File List

## 🔴 PRIORITY 1: Render Engine Components (CRITICAL)

### Renderers (src/renderers/)
- [ ] `BarChartRenderer.tsx` - Hardcoded grid/axis colors (#e5e7eb, #6b7280), default fill (#6B1B5E)
- [ ] `LineChartRenderer.tsx` - Hardcoded grid/axis colors, default stroke (#6B1B5E)
- [ ] `PieChartRenderer.tsx` - Check for hardcoded colors
- [ ] `HorizontalRuleRenderer.tsx` - Default color (#E5E7EB)
- [ ] `ListRenderer.tsx` - Check for hardcoded styles
- [ ] `NestedCardsRenderer.tsx` - Check for hardcoded styles
- [ ] `MetricCardsRenderer.tsx` - Check for hardcoded styles
- [ ] `NumberRenderer.tsx` - Check for hardcoded styles
- [ ] `TextRenderer.tsx` - Check for hardcoded styles

### Engine Components (cms-admin/src/components/)
- [ ] `EngineAssetsPreview.tsx` - Chart colors array (#6B1B5E, #B21A53, #3B82F6, #10B981, #F59E0B, #EF4444)
- [ ] `EngineAssetsModal.tsx` - Check for hardcoded colors
- [ ] `EditorModalV2.tsx` - Check for hardcoded colors in UI
- [ ] `RenderFactory.tsx` - Check for hardcoded colors

## 🟡 PRIORITY 2: Core Dashboard Components

### Main App Components (src/components/)
- [ ] `Dashboard.tsx` - Multiple hardcoded chart colors (#431C5B, #1D1F48, #B21A53, #3bcd3e, #403040)
- [ ] `ActivityHoursChart.tsx` - Hardcoded bar colors (#431C5B, #1D1F48, #B21A53)
- [ ] `TopAssetsChart.tsx` - Colors array ['#431C5B', '#1D1F48', '#B21A53', '#3bcd3e', '#403040']
- [ ] `SummaryDetail.tsx` - Hardcoded colors (#3bcd3e, #10B981, #3B82F6, #F59E0B)
- [ ] `SummaryDetailV2.tsx` - backgroundColor: '#ffffff'
- [ ] `Header.tsx` - backgroundColor: '#ffffff' in export
- [ ] `OrganizationDashboard.tsx` - Check for hardcoded colors
- [ ] `StrategicInitiativesDashboard.tsx` - Check for hardcoded colors
- [ ] `StrategicInitiativeModal.tsx` - backgroundColor: '#ffffff'
- [ ] `ExecutiveIQDetail.tsx` - Check for hardcoded colors

## 🟢 PRIORITY 3: Secondary Components

### CMS Components
- [ ] `CMSHeader.tsx` - Check for hardcoded colors
- [ ] `ConfirmationModal.tsx` - Check for hardcoded colors
- [ ] `APIDashboardModal.tsx` - Check for hardcoded colors
- [ ] `StyleSchemeManagerV2.tsx` - May have hardcoded preview colors
- [ ] `TemplateBuilder.tsx` - Check for hardcoded colors
- [ ] `SystemSettingsManager.tsx` - Check for hardcoded colors

## 📊 Chart Color Standardization Needed

**Current Hardcoded Palettes:**
1. **Primary Palette**: `['#431C5B', '#1D1F48', '#B21A53', '#3bcd3e', '#403040']`
   - Used in: Dashboard.tsx, TopAssetsChart.tsx, ActivityHoursChart.tsx
   
2. **Engine Palette**: `['#6B1B5E', '#B21A53', '#3B82F6', '#10B981', '#F59E0B', '#EF4444']`
   - Used in: EngineAssetsPreview.tsx

3. **Status Colors**: 
   - Success: #10B981 / #3bcd3e
   - Warning: #F59E0B
   - Info: #3B82F6
   - Error: #EF4444

4. **Chart UI Elements**:
   - Grid: #e5e7eb
   - Axis: #6b7280
   - Background: #ffffff

## ✅ Action Plan

### Step 1: Create Chart Color Palette in Design System
Add to `src/design-system/colors.ts`:
```typescript
export const ChartColors = {
  // Primary data series colors
  series: {
    eggplant: '#431C5B',      // FIS Eggplant (Primary)
    navy: '#1D1F48',          // FIS Navy
    raspberry: '#B21A53',     // FIS Raspberry
    green: '#3bcd3e',         // Success/Positive
    purple: '#403040',        // Neutral
  },
  
  // Chart UI elements
  grid: {
    light: '#e5e7eb',         // gray-200
    dark: '#374151',          // gray-700
  },
  
  axis: {
    light: '#6b7280',         // gray-500
    dark: '#9ca3af',          // gray-400
  },
  
  // Data visualization palette (for multiple series)
  palette: [
    '#431C5B',  // Eggplant
    '#1D1F48',  // Navy
    '#B21A53',  // Raspberry
    '#3bcd3e',  // Green
    '#3B82F6',  // Blue
    '#F59E0B',  // Amber
  ],
  
  // Status-specific colors
  performance: {
    excellent: '#10B981',     // green-500
    good: '#3B82F6',          // blue-500
    warning: '#F59E0B',       // amber-500
    poor: '#EF4444',          // red-500
  }
};
```

### Step 2: Update Priority 1 Files (Render Engine)
1. Update all renderers to use `ChartColors`
2. Update EngineAssetsPreview.tsx
3. Update EditorModalV2.tsx if needed

### Step 3: Update Priority 2 Files (Core Dashboards)
1. Replace hardcoded arrays with `ChartColors.palette`
2. Update chart components to use `ChartColors.grid` and `ChartColors.axis`
3. Test in light/dark mode

### Step 4: Update Priority 3 Files (Secondary)
1. Replace remaining hardcoded colors
2. Verify consistency across app

## 📝 Notes
- Focus on Render Engine first (affects template system)
- Chart colors most visible to users
- Background colors (#ffffff) for exports can stay for now
- Dark mode chart colors need testing

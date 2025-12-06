# Fix All TypeScript Errors - Systematic Approach
# Run this from C:\ExecSummary

Write-Host "Starting TypeScript error fixes..." -ForegroundColor Cyan

# Fix 1: Change unused data parameters to _data in validation schemas
Write-Host "`n1. Fixing unused parameters in validation schemas..." -ForegroundColor Yellow

# cms-admin validationSchema
$file = "cms-admin\src\schemas\validationSchema.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    # Fix unused data parameters in check functions
    $content = $content -replace "check: \(data, content, sectionKey\) => !!", "check: (_data, content, sectionKey) => !!"
    $content | Set-Content $file -NoNewline
    Write-Host "  ✓ Fixed $file" -ForegroundColor Green
}

# src validationSchema (shared)
$file = "src\schemas\validationSchema.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "check: \(data, content, sectionKey\) => !!", "check: (_data, content, sectionKey) => !!"
    $content | Set-Content $file -NoNewline
    Write-Host "  ✓ Fixed $file" -ForegroundColor Green
}

# Fix 2: Remove duplicate properties in src/types/schema.ts
Write-Host "`n2. Fixing duplicate properties in schema.ts..." -ForegroundColor Yellow

$file = "src\types\schema.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    
    # Find and remove duplicate itemSchema/fields in FieldSchema
    # This is tricky - we need to keep only ONE definition of each
    # Let's read the file and manually fix it
    Write-Host "  ⚠ Please manually check src/types/schema.ts for duplicate properties" -ForegroundColor Yellow
}

# Fix 3: Fix import type syntax in all renderer files
Write-Host "`n3. Fixing import type syntax..." -ForegroundColor Yellow

$rendererFiles = @(
    "src\renderers\BarChartRenderer.tsx",
    "src\renderers\EmbeddedVideoRenderer.tsx",
    "src\renderers\ExpressionRenderer.tsx",
    "src\renderers\ImageRenderer.tsx",
    "src\renderers\LineChartRenderer.tsx",
    "src\renderers\ListRenderer.tsx",
    "src\renderers\MetricCardsRenderer.tsx",
    "src\renderers\NestedCardsRenderer.tsx",
    "src\renderers\NumberRenderer.tsx",
    "src\renderers\ObjectFormRenderer.tsx",
    "src\renderers\PieChartRenderer.tsx",
    "src\renderers\RadialChartRenderer.tsx",
    "src\renderers\TableLayoutRenderer.tsx",
    "src\renderers\TextareaRenderer.tsx",
    "src\renderers\TextRenderer.tsx",
    "src\renderers\VideoRenderer.tsx"
)

foreach ($file in $rendererFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Fix RendererProps
        $content = $content -replace "import \{ RendererProps", "import type { RendererProps"
        
        # Fix FieldSchema
        $content = $content -replace "import \{ (\w+), FieldSchema", "import type { `$1, FieldSchema"
        $content = $content -replace "import \{ RendererProps, FieldSchema", "import type { RendererProps, FieldSchema"
        
        $content | Set-Content $file -NoNewline
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    }
}

# Fix 4: Fix context files
Write-Host "`n4. Fixing context files..." -ForegroundColor Yellow

$contextFiles = @(
    "src\contexts\PresentationContext.tsx",
    "src\contexts\ThemeContext.tsx"
)

foreach ($file in $contextFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import React, \{ ([^}]+), ReactNode", "import React, { `$1, type ReactNode"
        $content | Set-Content $file -NoNewline
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    }
}

# Fix 5: Fix schema imports
Write-Host "`n5. Fixing schema imports..." -ForegroundColor Yellow

$file = "src\schemas\summarySchema.ts"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "import \{ ContentSchema, FieldSchema", "import type { ContentSchema, FieldSchema"
    $content | Set-Content $file -NoNewline
    Write-Host "  ✓ Fixed $file" -ForegroundColor Green
}

# Fix 6: Fix expression parser
Write-Host "`n6. Fixing expressionParser..." -ForegroundColor Yellow

$file = "src\utils\expressionParser.tsx"
if (Test-Path $file) {
    $content = Get-Content $file -Raw
    $content = $content -replace "import \{ ([^}]*), LucideIcon", "import { `$1, type LucideIcon"
    $content | Set-Content $file -NoNewline
    Write-Host "  ✓ Fixed $file" -ForegroundColor Green
}

# Fix 7: Fix cms-admin specific files
Write-Host "`n7. Fixing cms-admin files..." -ForegroundColor Yellow

$cmsFiles = @(
    "cms-admin\src\components\LoginPage.tsx",
    "cms-admin\src\components\ProtectedRoute.tsx",
    "cms-admin\src\contexts\AuthContext.tsx"
)

foreach ($file in $cmsFiles) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $content = $content -replace "import React, \{ ([^}]+), ReactNode", "import React, { `$1, type ReactNode"
        $content = $content -replace "import React, \{ ([^}]+), FormEvent", "import React, { `$1, type FormEvent"
        $content | Set-Content $file -NoNewline
        Write-Host "  ✓ Fixed $file" -ForegroundColor Green
    }
}

Write-Host "`n✓ TypeScript error fixes applied!" -ForegroundColor Green
Write-Host "Note: Some errors require manual fixes (schema duplicates, unused variables)" -ForegroundColor Yellow

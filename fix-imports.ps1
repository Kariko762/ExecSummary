# Fix TypeScript Import Type Errors
# Simple, reliable fixes

Write-Host "Fixing import type syntax..." -ForegroundColor Cyan

# Fix ../src renderers
$files = @(
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

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) | ForEach-Object {
            $_ -replace 'import \{ RendererProps', 'import type { RendererProps' `
               -replace 'import \{ RendererProps, FieldSchema', 'import type { RendererProps, FieldSchema'
        } | Set-Content $file
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Fix context files - ReactNode
$files = @(
    "src\contexts\PresentationContext.tsx",
    "src\contexts\ThemeContext.tsx",
    "cms-admin\src\components\LoginPage.tsx",
    "cms-admin\src\components\ProtectedRoute.tsx",
    "cms-admin\src\contexts\AuthContext.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        (Get-Content $file) | ForEach-Object {
            $_ -replace ', ReactNode \}', ', type ReactNode }' `
               -replace ', FormEvent \}', ', type FormEvent }'
        } | Set-Content $file
        Write-Host "  ✓ $file" -ForegroundColor Green
    }
}

# Fix summarySchema
if (Test-Path "src\schemas\summarySchema.ts") {
    (Get-Content "src\schemas\summarySchema.ts") | ForEach-Object {
        $_ -replace 'import \{ ContentSchema, FieldSchema', 'import type { ContentSchema, FieldSchema'
    } | Set-Content "src\schemas\summarySchema.ts"
    Write-Host "  ✓ summarySchema.ts" -ForegroundColor Green
}

# Fix expressionParser
if (Test-Path "src\utils\expressionParser.tsx") {
    (Get-Content "src\utils\expressionParser.tsx") | ForEach-Object {
        $_ -replace ', LucideIcon \}', ', type LucideIcon }'
    } | Set-Content "src\utils\expressionParser.tsx"
    Write-Host "  ✓ expressionParser.tsx" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Green

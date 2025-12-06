# Fix unused parameter warnings in validationSchema.ts

$file = "C:\ExecSummary\cms-admin\src\schemas\validationSchema.ts"
$content = Get-Content $file -Raw

# Replace all instances where data parameter is unused
$content = $content -replace "check: \(data, content, sectionKey\) =>", "check: (_data, content, sectionKey) =>"
$content = $content -replace "message: \(data, content, sectionKey\) =>", "message: (_data, content, sectionKey) =>"

Set-Content $file -Value $content -NoNewline
Write-Host "Fixed unused parameters in validationSchema.ts"

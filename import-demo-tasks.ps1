# Import Demo Initiative Tasks from Markdown to tasks.json
$markdownFile = "C:\ExecSummary\demo_initiative_tasks.md"
$tasksFile = "C:\ExecSummary\backend\data\tasks.json"

Write-Host "Reading markdown file..." -ForegroundColor Cyan
$content = Get-Content $markdownFile -Raw

Write-Host "Extracting JSON task objects..." -ForegroundColor Cyan
$jsonBlocks = [regex]::Matches($content, '```json\s*([\s\S]*?)\s*```')
Write-Host "Found $($jsonBlocks.Count) JSON task objects" -ForegroundColor Green

$newTasks = @()
$errorCount = 0

foreach ($match in $jsonBlocks) {
    $jsonText = $match.Groups[1].Value.Trim()
    try {
        $task = $jsonText | ConvertFrom-Json
        $newTasks += $task
        Write-Host "  Parsed: $($task.title)" -ForegroundColor Gray
    } catch {
        $errorCount++
        Write-Host "  Failed to parse JSON block" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Successfully parsed: $($newTasks.Count) tasks" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "Failed to parse: $errorCount tasks" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Reading existing tasks.json..." -ForegroundColor Cyan
$tasksData = Get-Content $tasksFile -Raw | ConvertFrom-Json
$existingCount = $tasksData.tasks.Count
Write-Host "Current task count: $existingCount" -ForegroundColor Gray

$existingIds = @($tasksData.tasks | ForEach-Object { $_.id })
$addedCount = 0

foreach ($task in $newTasks) {
    if ($existingIds -notcontains $task.id) {
        $tasksData.tasks += $task
        $addedCount++
    } else {
        Write-Host "  Skipping duplicate: $($task.title)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Adding $addedCount new tasks..." -ForegroundColor Cyan
$tasksData | ConvertTo-Json -Depth 20 | Set-Content $tasksFile

Write-Host ""
Write-Host "COMPLETE!" -ForegroundColor Green
Write-Host "  Before: $existingCount tasks" -ForegroundColor Gray
Write-Host "  Added:  $addedCount tasks" -ForegroundColor Green
Write-Host "  After:  $($tasksData.tasks.Count) tasks" -ForegroundColor Cyan
Write-Host ""
Write-Host "Tasks saved to: $tasksFile" -ForegroundColor White

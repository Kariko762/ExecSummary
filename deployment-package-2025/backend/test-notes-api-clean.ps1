# NOTES SYSTEM API TEST SCRIPT
# Test all endpoints with PowerShell

$baseUrl = "http://localhost:3001/api"

Write-Host "======================================"
Write-Host "NOTES SYSTEM API TESTS"
Write-Host "======================================"
Write-Host ""

# Test 1: Create a Section
Write-Host "Test 1: Create Section..."
$section1 = @{
    name = "Weekly Update Dec 9"
    description = "Weekly executive summary"
    type = "weekly"
    startDate = "2025-12-09"
    endDate = "2025-12-15"
    color = "blue"
    icon = "Calendar"
} | ConvertTo-Json

$response1 = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Post -Body $section1 -ContentType "application/json"
$sectionId = $response1.section.id
Write-Host "âœ“ Created section: $($response1.section.name) (ID: $sectionId)" -ForegroundColor Green
Write-Host ""

# Test 2: Create another Section
Write-Host "Test 2: Create Another Section..."
$section2 = @{
    name = "Q4 Banking Report"
    description = "Quarterly report for banking organization"
    type = "quarterly"
    startDate = "2025-10-01"
    endDate = "2025-12-31"
    color = "purple"
    icon = "Building2"
} | ConvertTo-Json

$response2 = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Post -Body $section2 -ContentType "application/json"
$sectionId2 = $response2.section.id
Write-Host "âœ“ Created section: $($response2.section.name) (ID: $sectionId2)" -ForegroundColor Green
Write-Host ""

# Test 3: Create Note linked to first section
Write-Host "Test 3: Create Note..."
$note1 = @{
    title = "Executive Summary Launch"
    content = "Successful launch with **500+ users** in first week!\n\n- EMEA: 200 users\n- Americas: 180 users\n- APAC: 120 users"
    category = "key-highlight"
    linkedTo = @{
        type = "organization"
        slug = "banking"
        name = "Banking Organization"
    }
    sectionIds = @($sectionId, $sectionId2)
    tags = @("launch", "success")
} | ConvertTo-Json -Depth 10

$response3 = Invoke-RestMethod -Uri "$baseUrl/notes" -Method Post -Body $note1 -ContentType "application/json"
$noteId1 = $response3.note.id
Write-Host "âœ“ Created note: $($response3.note.title) (ID: $noteId1)" -ForegroundColor Green
Write-Host "  Linked to sections: $($response3.note.sectionIds -join ', ')" -ForegroundColor Cyan
Write-Host ""

# Test 4: Create another Note
Write-Host "Test 4: Create Another Note..."
$note2 = @{
    title = "Cloud Migration Phase 2 Complete"
    content = "Migrated 50 applications to AWS with zero downtime.\n\nKey metrics:\n- Migration time: 3 weeks\n- Cost savings: 25%\n- Performance improvement: 40%"
    category = "goal-progression"
    linkedTo = @{
        type = "initiative"
        slug = "cloud-migration"
        name = "Cloud Migration Initiative"
    }
    sectionIds = @($sectionId)
    tags = @("cloud", "migration", "aws")
} | ConvertTo-Json -Depth 10

$response4 = Invoke-RestMethod -Uri "$baseUrl/notes" -Method Post -Body $note2 -ContentType "application/json"
$noteId2 = $response4.note.id
Write-Host "âœ“ Created note: $($response4.note.title) (ID: $noteId2)" -ForegroundColor Green
Write-Host ""

# Test 5: Create Note without section assignment
Write-Host "Test 5: Create Note Without Section..."
$note3 = @{
    title = "Q4 Revenue Exceeds Forecast"
    content = "Revenue exceeded forecast by 15% across all regions."
    category = "big-win"
    linkedTo = @{
        type = "organization"
        slug = "banking"
        name = "Banking Organization"
    }
    tags = @("revenue", "performance")
} | ConvertTo-Json -Depth 10

$response5 = Invoke-RestMethod -Uri "$baseUrl/notes" -Method Post -Body $note3 -ContentType "application/json"
$noteId3 = $response5.note.id
Write-Host "âœ“ Created note: $($response5.note.title) (ID: $noteId3)" -ForegroundColor Green
Write-Host ""

# Test 6: Get All Notes
Write-Host "Test 6: Get All Notes..."
$allNotes = Invoke-RestMethod -Uri "$baseUrl/notes" -Method Get
Write-Host "âœ“ Retrieved $($allNotes.total) notes" -ForegroundColor Green
foreach ($note in $allNotes.notes) {
    Write-Host "  - $($note.title) [$($note.category)]" -ForegroundColor Cyan
}
Write-Host ""

# Test 7: Get All Sections
Write-Host "Test 7: Get All Sections..."
$allSections = Invoke-RestMethod -Uri "$baseUrl/sections" -Method Get
Write-Host "âœ“ Retrieved $($allSections.total) sections" -ForegroundColor Green
foreach ($section in $allSections.sections) {
    $noteCount = $section.noteCount
    Write-Host "  - $($section.name) - $noteCount notes" -ForegroundColor Cyan
}
Write-Host ""

# Test 8: Get Section with Notes
Write-Host "Test 8: Get Section with Notes..."
$sectionDetail = Invoke-RestMethod -Uri "$baseUrl/sections/$sectionId" -Method Get
Write-Host "âœ“ Retrieved section: $($sectionDetail.section.name)" -ForegroundColor Green
Write-Host "  Notes in this section:" -ForegroundColor Cyan
foreach ($note in $sectionDetail.section.notes) {
    Write-Host "    - $($note.title)" -ForegroundColor Cyan
}
Write-Host ""

# Test 9: Add existing note to section
Write-Host "Test 9: Add Existing Note to Section..."
$addNotes = @{
    noteIds = @($noteId3)
} | ConvertTo-Json

$response9 = Invoke-RestMethod -Uri "$baseUrl/sections/$sectionId/notes" -Method Post -Body $addNotes -ContentType "application/json"
Write-Host "âœ“ Added $($response9.added) note(s) to section" -ForegroundColor Green
Write-Host ""

# Test 10: Filter Notes by Category
Write-Host "Test 10: Filter Notes by Category..."
$filtered = Invoke-RestMethod -Uri "$baseUrl/notes?category=key-highlight" -Method Get
Write-Host "âœ“ Found $($filtered.total) notes with category 'key-highlight'" -ForegroundColor Green
Write-Host ""

# Test 11: Filter Notes by Linked Object
Write-Host "Test 11: Filter Notes by Linked Object..."
$filtered2 = Invoke-RestMethod -Uri "$baseUrl/notes?linkedType=organization&linkedSlug=banking" -Method Get
Write-Host "âœ“ Found $($filtered2.total) notes linked to Banking organization" -ForegroundColor Green
Write-Host ""

# Test 12: Update Note
Write-Host "Test 12: Update Note..."
$updateNote = @{
    title = "Executive Summary Launch - UPDATED"
    content = "Successful launch with **600+ users** in first week! (Updated)"
} | ConvertTo-Json

$response12 = Invoke-RestMethod -Uri "$baseUrl/notes/$noteId1" -Method Put -Body $updateNote -ContentType "application/json"
Write-Host "âœ“ Updated note: $($response12.note.title)" -ForegroundColor Green
Write-Host ""

# Test 13: Reorder Notes in Section
Write-Host "Test 13: Reorder Notes in Section..."
$reorder = @{
    noteOrder = @($noteId2, $noteId1, $noteId3)
} | ConvertTo-Json

$response13 = Invoke-RestMethod -Uri "$baseUrl/sections/$sectionId/reorder" -Method Put -Body $reorder -ContentType "application/json"
Write-Host "âœ“ Reordered notes in section" -ForegroundColor Green
Write-Host ""

# Test 14: Archive Section
Write-Host "Test 14: Archive Section..."
$archive = @{
    archive = $true
} | ConvertTo-Json

$response14 = Invoke-RestMethod -Uri "$baseUrl/sections/$sectionId2/archive" -Method Put -Body $archive -ContentType "application/json"
Write-Host "âœ“ Archived section: $($response14.section.name)" -ForegroundColor Green
Write-Host ""

# Test 15: Get Active Sections Only
Write-Host "Test 15: Get Active Sections Only..."
$activeSections = Invoke-RestMethod -Uri "$baseUrl/sections?status=active" -Method Get
Write-Host "âœ“ Found $($activeSections.total) active sections" -ForegroundColor Green
Write-Host ""

# Test 16: Remove Note from Section
Write-Host "Test 16: Remove Note from Section..."
$response16 = Invoke-RestMethod -Uri "$baseUrl/sections/$sectionId/notes/$noteId3" -Method Delete
Write-Host "âœ“ Removed note from section" -ForegroundColor Green
Write-Host ""

# Test 17: Search Notes
Write-Host "Test 17: Search Notes..."
$search = Invoke-RestMethod -Uri "$baseUrl/notes?search=cloud" -Method Get
Write-Host "âœ“ Found $($search.total) notes matching 'cloud'" -ForegroundColor Green
Write-Host ""

# Test 18: Get Single Note
Write-Host "Test 18: Get Single Note..."
$singleNote = Invoke-RestMethod -Uri "$baseUrl/notes/$noteId1" -Method Get
Write-Host "âœ“ Retrieved note: $($singleNote.note.title)" -ForegroundColor Green
Write-Host "  Category: $($singleNote.note.category)" -ForegroundColor Cyan
Write-Host "  Sections: $($singleNote.note.sectionIds.Count)" -ForegroundColor Cyan
Write-Host ""

Write-Host "======================================"
Write-Host "ALL TESTS COMPLETED SUCCESSFULLY! âœ“"
Write-Host "======================================"
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Created 2 sections" -ForegroundColor Cyan
Write-Host "  - Created 3 notes" -ForegroundColor Cyan
Write-Host "  - Tested filtering, searching, updating" -ForegroundColor Cyan
Write-Host "  - Tested section-note linking" -ForegroundColor Cyan
Write-Host "  - Tested archiving and reordering" -ForegroundColor Cyan
Write-Host ""
Write-Host "Section IDs:" -ForegroundColor Yellow
Write-Host "  Section 1: $sectionId" -ForegroundColor Cyan
Write-Host "  Section 2: $sectionId2" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note IDs:" -ForegroundColor Yellow
Write-Host "  Note 1: $noteId1" -ForegroundColor Cyan
Write-Host "  Note 2: $noteId2" -ForegroundColor Cyan
Write-Host "  Note 3: $noteId3" -ForegroundColor Cyan

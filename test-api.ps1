# Test Backend API Script
# Tests various backend API endpoints

param(
    [string]$TokenFile = "access-token.txt",
    [string]$ApiUrl = "http://localhost:8081"
)

$ErrorActionPreference = "Continue"

Write-Host "`n=== Testing Backend API ===" -ForegroundColor Cyan

# Check if token file exists
if (-not (Test-Path $TokenFile)) {
    Write-Host "✗ Token file not found: $TokenFile" -ForegroundColor Red
    Write-Host "  Run: .\get-token.ps1" -ForegroundColor Yellow
    exit 1
}

# Read token
$token = Get-Content $TokenFile -Raw
if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "✗ Token file is empty: $TokenFile" -ForegroundColor Red
    Write-Host "  Run: .\get-token.ps1" -ForegroundColor Yellow
    exit 1
}

$token = $token.Trim()
Write-Host "✓ Token loaded from: $TokenFile" -ForegroundColor Green

# Test health endpoint (no auth required)
Write-Host "`n[1/8] Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" -UseBasicParsing -TimeoutSec 5
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✓ Health check passed: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
    Write-Host "  Make sure backend is running: .\start-services.ps1" -ForegroundColor Yellow
    exit 1
}

# Test authenticated endpoints
$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

$testResults = @()

# Test Profiles endpoint
Write-Host "`n[2/8] Testing Profiles endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/profiles" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $profiles = $response.Content | ConvertFrom-Json
    Write-Host "✓ Profiles: Retrieved $($profiles.Count) profiles" -ForegroundColor Green
    $testResults += @{Test="Profiles"; Status="PASS"; Details="$($profiles.Count) profiles"}
} catch {
    Write-Host "✗ Profiles test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Profiles"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Doctors endpoint
Write-Host "`n[3/8] Testing Doctors endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/doctors" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $doctors = $response.Content | ConvertFrom-Json
    Write-Host "✓ Doctors: Retrieved $($doctors.Count) doctors" -ForegroundColor Green
    $testResults += @{Test="Doctors"; Status="PASS"; Details="$($doctors.Count) doctors"}
} catch {
    Write-Host "✗ Doctors test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Doctors"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Products endpoint
Write-Host "`n[4/8] Testing Products endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/products" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $products = $response.Content | ConvertFrom-Json
    Write-Host "✓ Products: Retrieved $($products.Count) products" -ForegroundColor Green
    $testResults += @{Test="Products"; Status="PASS"; Details="$($products.Count) products"}
} catch {
    Write-Host "✗ Products test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Products"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Sectors endpoint
Write-Host "`n[5/8] Testing Sectors endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/sectors" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $sectors = $response.Content | ConvertFrom-Json
    Write-Host "✓ Sectors: Retrieved $($sectors.Count) sectors" -ForegroundColor Green
    $testResults += @{Test="Sectors"; Status="PASS"; Details="$($sectors.Count) sectors"}
} catch {
    Write-Host "✗ Sectors test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Sectors"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Bricks endpoint
Write-Host "`n[6/8] Testing Bricks endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/bricks" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $bricks = $response.Content | ConvertFrom-Json
    Write-Host "✓ Bricks: Retrieved $($bricks.Count) bricks" -ForegroundColor Green
    $testResults += @{Test="Bricks"; Status="PASS"; Details="$($bricks.Count) bricks"}
} catch {
    Write-Host "✗ Bricks test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Bricks"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Action Plans endpoint
Write-Host "`n[7/8] Testing Action Plans endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/action-plans" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $actionPlans = $response.Content | ConvertFrom-Json
    Write-Host "✓ Action Plans: Retrieved $($actionPlans.Count) action plans" -ForegroundColor Green
    $testResults += @{Test="Action Plans"; Status="PASS"; Details="$($actionPlans.Count) action plans"}
} catch {
    Write-Host "✗ Action Plans test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Action Plans"; Status="FAIL"; Details=$_.Exception.Message}
}

# Test Visits endpoint
Write-Host "`n[8/8] Testing Visits endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/visits" -Headers $headers -UseBasicParsing -TimeoutSec 10
    $visits = $response.Content | ConvertFrom-Json
    Write-Host "✓ Visits: Retrieved $($visits.Count) visits" -ForegroundColor Green
    $testResults += @{Test="Visits"; Status="PASS"; Details="$($visits.Count) visits"}
} catch {
    Write-Host "✗ Visits test failed: $_" -ForegroundColor Red
    $testResults += @{Test="Visits"; Status="FAIL"; Details=$_.Exception.Message}
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
$passed = ($testResults | Where-Object { $_.Status -eq "PASS" }).Count
$failed = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$total = $testResults.Count

Write-Host "Total tests: $total" -ForegroundColor White
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

Write-Host "`nDetailed results:" -ForegroundColor Yellow
foreach ($result in $testResults) {
    $color = if ($result.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  $($result.Status): $($result.Test) - $($result.Details)" -ForegroundColor $color
}

if ($failed -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Some tests failed. Check backend logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs backend" -ForegroundColor Cyan
}

Write-Host ""


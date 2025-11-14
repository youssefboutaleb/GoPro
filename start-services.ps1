# Start Docker Services Script
# Starts all services defined in docker-compose.yml

param(
    [switch]$Build = $false
)

Write-Host "`n=== Starting Medico Services ===" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/4] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "  Opening Docker Desktop..." -ForegroundColor Yellow
    $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerPath) {
        Start-Process $dockerPath
        Write-Host "  Please wait for Docker Desktop to start, then run this script again." -ForegroundColor Yellow
    } else {
        Write-Host "  Docker Desktop not found at: $dockerPath" -ForegroundColor Red
        Write-Host "  Please install Docker Desktop or start it manually." -ForegroundColor Red
    }
    exit 1
}

# Start services
Write-Host "`n[2/4] Starting services..." -ForegroundColor Yellow
if ($Build) {
    Write-Host "  Building and starting services..." -ForegroundColor Gray
    docker-compose up -d --build
} else {
    docker-compose up -d
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to start services" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Services started" -ForegroundColor Green

# Wait for services to initialize
Write-Host "`n[3/4] Waiting for services to initialize..." -ForegroundColor Yellow
Write-Host "  This may take 60-90 seconds..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Check service status
Write-Host "`n[4/4] Checking service status..." -ForegroundColor Yellow
docker-compose ps

# Test backend health
Write-Host "`n=== Testing Backend Health ===" -ForegroundColor Cyan
Start-Sleep -Seconds 5
$maxRetries = 6
$retryCount = 0
$backendReady = $false

while ($retryCount -lt $maxRetries -and -not $backendReady) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Backend is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
            $backendReady = $true
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "  Waiting for backend... ($retryCount/$maxRetries)" -ForegroundColor Gray
            Start-Sleep -Seconds 10
        } else {
            Write-Host "⚠ Backend not ready yet. Check logs:" -ForegroundColor Yellow
            Write-Host "  docker-compose logs backend" -ForegroundColor Cyan
        }
    }
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "`n✅ Services started!" -ForegroundColor Green
Write-Host "`nAccess URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:8081" -ForegroundColor White
Write-Host "  - Swagger UI:  http://localhost:8081/q/swagger-ui" -ForegroundColor White
Write-Host "  - Keycloak:    http://localhost:8080 (admin/admin)" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  - Get token:   .\get-token.ps1" -ForegroundColor Cyan
Write-Host "  - Test API:    .\test-api.ps1" -ForegroundColor Cyan
Write-Host "  - View logs:   .\view-logs.ps1" -ForegroundColor Cyan
Write-Host "  - Check health: .\check-health.ps1" -ForegroundColor Cyan

Write-Host ""


# Stop Docker Services Script
# Stops all services defined in docker-compose.yml

Write-Host "`n=== Stopping Medico Services ===" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/2] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Nothing to stop." -ForegroundColor Yellow
    exit 0
}

# Stop services
Write-Host "`n[2/2] Stopping services..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services stopped" -ForegroundColor Green
} else {
    Write-Host "⚠ Some services may not have stopped cleanly" -ForegroundColor Yellow
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ All services stopped" -ForegroundColor Green
Write-Host "`nTo start services again:" -ForegroundColor Yellow
Write-Host "  .\start-services.ps1" -ForegroundColor Cyan
Write-Host ""


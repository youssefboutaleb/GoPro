# Clean Docker Resources Script
# Removes containers, volumes, and optionally images

param(
    [switch]$Images = $false,
    [switch]$Volumes = $true,
    [switch]$Force = $false
)

Write-Host "`n=== Cleaning Docker Resources ===" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/3] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    exit 1
}

# Stop services first
Write-Host "`n[2/3] Stopping services..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services stopped" -ForegroundColor Green
} else {
    Write-Host "⚠ Some services may not have stopped cleanly" -ForegroundColor Yellow
}

# Clean resources
Write-Host "`n[3/3] Cleaning resources..." -ForegroundColor Yellow

if ($Volumes) {
    Write-Host "  Removing volumes..." -ForegroundColor Gray
    docker-compose down -v
    Write-Host "✓ Volumes removed" -ForegroundColor Green
}

if ($Images) {
    Write-Host "  Removing images..." -ForegroundColor Gray
    if ($Force) {
        docker-compose down --rmi all --force-rm
    } else {
        docker-compose down --rmi local
    }
    Write-Host "✓ Images removed" -ForegroundColor Green
}

# Additional cleanup
Write-Host "`nCleaning up unused resources..." -ForegroundColor Yellow
docker system prune -f | Out-Null
Write-Host "✓ Unused resources cleaned" -ForegroundColor Green

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Cleanup completed" -ForegroundColor Green

if ($Volumes) {
    Write-Host "⚠ All data volumes have been removed!" -ForegroundColor Yellow
    Write-Host "  Database data will be recreated on next start" -ForegroundColor Gray
}

Write-Host "`nTo start services again:" -ForegroundColor Yellow
Write-Host "  .\start-services.ps1" -ForegroundColor Cyan
Write-Host ""


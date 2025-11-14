# Check Service Health Script
# Checks the health status of all services

Write-Host "`n=== Checking Service Health ===" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "`n[1/5] Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running" -ForegroundColor Red
    exit 1
}

# Check container status
Write-Host "`n[2/5] Checking container status..." -ForegroundColor Yellow
$containers = docker-compose ps --format json | ConvertFrom-Json
$running = 0
$total = $containers.Count

foreach ($container in $containers) {
    $status = $container.State
    $name = $container.Name
    if ($status -eq "running") {
        Write-Host "✓ $name : $status" -ForegroundColor Green
        $running++
    } else {
        Write-Host "✗ $name : $status" -ForegroundColor Red
    }
}

Write-Host "`nContainers: $running/$total running" -ForegroundColor $(if ($running -eq $total) { "Green" } else { "Yellow" })

# Check PostgreSQL
Write-Host "`n[3/5] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $result = docker-compose exec -T postgresql pg_isready -U medico_user -d medico_db 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL is not ready" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Cannot check PostgreSQL: $_" -ForegroundColor Red
}

# Check Keycloak
Write-Host "`n[4/5] Checking Keycloak..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/realms/medico" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Keycloak is accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Keycloak is not accessible: $_" -ForegroundColor Red
}

# Check Backend
Write-Host "`n[5/5] Checking Backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    $health = $response.Content | ConvertFrom-Json
    Write-Host "✓ Backend is healthy: $($health.status)" -ForegroundColor Green
    
    # Check readiness
    try {
        $readyResponse = Invoke-WebRequest -Uri "http://localhost:8081/health/ready" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        $ready = $readyResponse.Content | ConvertFrom-Json
        Write-Host "✓ Backend is ready: $($ready.status)" -ForegroundColor Green
    } catch {
        Write-Host "⚠ Backend readiness check failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Backend is not accessible: $_" -ForegroundColor Red
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "Service URLs:" -ForegroundColor Yellow
Write-Host "  - Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API: http://localhost:8081" -ForegroundColor White
Write-Host "  - Swagger UI:  http://localhost:8081/q/swagger-ui" -ForegroundColor White
Write-Host "  - Keycloak:    http://localhost:8080" -ForegroundColor White

if ($running -eq $total) {
    Write-Host "`n✅ All services are running!" -ForegroundColor Green
} else {
    Write-Host "`n⚠ Some services are not running. Start services:" -ForegroundColor Yellow
    Write-Host "  .\start-services.ps1" -ForegroundColor Cyan
}

Write-Host ""


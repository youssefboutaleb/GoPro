# View Service Logs Script
# Displays logs for Docker services

param(
    [string]$Service = "",
    [int]$Tail = 100,
    [switch]$Follow = $false
)

Write-Host "`n=== Viewing Service Logs ===" -ForegroundColor Cyan

# Check if Docker is running
try {
    docker ps | Out-Null
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Build docker-compose command
$command = "docker-compose logs"

if ($Follow) {
    $command += " -f"
    Write-Host "Following logs (Ctrl+C to stop)..." -ForegroundColor Yellow
} else {
    $command += " --tail=$Tail"
    Write-Host "Showing last $Tail lines..." -ForegroundColor Yellow
}

if ($Service) {
    $command += " $Service"
    Write-Host "Service: $Service" -ForegroundColor Gray
} else {
    Write-Host "All services" -ForegroundColor Gray
}

Write-Host ""

# Execute command
Invoke-Expression $command

Write-Host ""


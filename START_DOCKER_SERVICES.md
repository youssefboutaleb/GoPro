# Starting Docker Services - Quick Guide

## Issue: Docker Desktop Not Running

The error message indicates that Docker Desktop is not running on your Windows machine.

## Solution Steps

### Step 1: Start Docker Desktop

**Option A: From Start Menu**
1. Press `Windows Key`
2. Type "Docker Desktop"
3. Click on "Docker Desktop" application
4. Wait for Docker Desktop to start (you'll see a whale icon in system tray)

**Option B: From Command Line**
```powershell
# Try to start Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

**Option C: Check if Docker Desktop is installed**
```powershell
# Check if Docker Desktop exists
Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Step 2: Wait for Docker Desktop to Start

- Look for the Docker whale icon in your system tray (bottom right)
- Wait until it shows "Docker Desktop is running"
- This usually takes 30-60 seconds

### Step 3: Verify Docker is Running

```powershell
# Check Docker version
docker --version

# Check if Docker daemon is accessible
docker ps
```

If these commands work, Docker is running!

### Step 4: Start the Services

Once Docker Desktop is running:

```powershell
# Navigate to project directory (if not already there)
cd C:\Users\YoussefBOUTALEB\Downloads\GoPro\GoPro

# Start all services in detached mode
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 5: Wait for Services to Start

Services need time to start:
- PostgreSQL: ~10 seconds
- Keycloak: ~30-60 seconds (longest)
- Backend: ~20-30 seconds

### Step 6: Verify Services are Running

```powershell
# Check all containers
docker-compose ps

# Check backend health
curl http://localhost:8081/health

# Check Keycloak
curl http://localhost:8080/realms/medico
```

## Troubleshooting

### If Docker Desktop won't start:
1. Check if virtualization is enabled in BIOS
2. Check Windows Features: Enable "Virtual Machine Platform" and "Windows Subsystem for Linux"
3. Restart your computer
4. Reinstall Docker Desktop if needed

### If services fail to start:
```powershell
# View detailed logs
docker-compose logs backend
docker-compose logs keycloak
docker-compose logs postgresql

# Restart a specific service
docker-compose restart backend

# Rebuild and start
docker-compose up -d --build
```

### If ports are already in use:
```powershell
# Check what's using port 8081
netstat -ano | findstr :8081

# Check what's using port 8080
netstat -ano | findstr :8080

# Check what's using port 5432
netstat -ano | findstr :5432
```

## Quick Start Script

Save this as `start-services.ps1`:

```powershell
# Start Docker Services Script
Write-Host "Checking Docker..." -ForegroundColor Yellow

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    Write-Host "  Opening Docker Desktop..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    Write-Host "  Please wait for Docker Desktop to start, then run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting services..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Checking service status..." -ForegroundColor Yellow
docker-compose ps

Write-Host "Testing backend health..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081/health" -UseBasicParsing
    Write-Host "✓ Backend is responding (HTTP $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠ Backend not ready yet. Wait a bit longer and check logs:" -ForegroundColor Yellow
    Write-Host "  docker-compose logs backend" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Services started! You can now:" -ForegroundColor Green
Write-Host "  - Test API: .\test-backend-api.ps1" -ForegroundColor Cyan
Write-Host "  - View logs: docker-compose logs -f" -ForegroundColor Cyan
Write-Host "  - Swagger UI: http://localhost:8081/q/swagger-ui" -ForegroundColor Cyan
```


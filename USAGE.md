# Usage Guide

Practical guide for using and operating the Medico KPI Application.

## 📋 Table of Contents

- [Service Management](#service-management)
- [Authentication](#authentication)
- [API Testing](#api-testing)
- [Monitoring & Logs](#monitoring--logs)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## 🚀 Service Management

### Starting Services

```powershell
# Start all services in detached mode
.\start-services.ps1

# Or manually:
docker-compose up -d
```

**Expected startup time:**
- PostgreSQL: ~10 seconds
- Keycloak: ~30-60 seconds (longest)
- Backend: ~20-30 seconds
- Frontend: ~30-60 seconds

### Stopping Services

```powershell
# Stop all services
.\stop-services.ps1

# Or manually:
docker-compose down
```

### Restarting Services

```powershell
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart keycloak
```

### Checking Service Status

```powershell
# Check health of all services
.\check-health.ps1

# Or manually:
docker-compose ps
docker-compose logs --tail=50
```

## 🔐 Authentication

### Getting an Access Token

#### Option 1: User Authentication (Password Grant)

```powershell
# Get token with username/password
.\get-token.ps1 -Username "user@example.com" -Password "password"

# Default credentials (if configured in Keycloak):
.\get-token.ps1 -Username "admin" -Password "admin"
```

#### Option 2: Service Account (Client Credentials)

```powershell
# Get token using service account (automatic fallback)
.\get-token.ps1 -UseServiceAccount

# Or let script auto-fallback if user auth fails
.\get-token.ps1
```

**Token is saved to**: `access-token.txt`

### Using the Token

```powershell
# Read token from file
$token = Get-Content access-token.txt

# Use in API calls
Invoke-WebRequest -Uri "http://localhost:8081/profiles" `
  -Headers @{Authorization="Bearer $token"}
```

### Keycloak Admin Console

1. Open: http://localhost:8080
2. Login with:
   - Username: `admin`
   - Password: `admin`
3. Select realm: `medico`
4. Manage users, roles, clients, etc.

## 🧪 API Testing

### Quick API Test

```powershell
# Run automated API test suite
.\test-api.ps1
```

### Manual API Testing

#### Using PowerShell

```powershell
# Get token first
.\get-token.ps1
$token = Get-Content access-token.txt

# Test health endpoint (no auth required)
Invoke-WebRequest -Uri "http://localhost:8081/health"

# Test authenticated endpoint
Invoke-WebRequest -Uri "http://localhost:8081/profiles" `
  -Headers @{Authorization="Bearer $token"} `
  -Method GET | ConvertFrom-Json
```

#### Using Swagger UI

1. Get token: `.\get-token.ps1`
2. Open: http://localhost:8081/q/swagger-ui
3. Click **"Authorize"** button
4. Paste token from `access-token.txt`
5. Test endpoints interactively

#### Using cURL (if available)

```bash
# Get token
TOKEN=$(cat access-token.txt)

# Test endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/profiles
```

### Common API Operations

#### Get All Profiles

```powershell
$token = Get-Content access-token.txt
$response = Invoke-WebRequest -Uri "http://localhost:8081/profiles" `
  -Headers @{Authorization="Bearer $token"}
$response.Content | ConvertFrom-Json
```

#### Create a Doctor

```powershell
$token = Get-Content access-token.txt
$body = @{
    firstName = "John"
    lastName = "Doe"
    specialty = "Cardiology"
    brickId = "00000000-0000-0000-0000-000000000001"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8081/doctors" `
  -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} `
  -Method POST `
  -Body $body
```

#### Update a Product

```powershell
$token = Get-Content access-token.txt
$id = "00000000-0000-0000-0000-000000000001"
$body = @{
    name = "Updated Product Name"
    therapeuticClass = "Cardiology"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8081/products/$id" `
  -Headers @{Authorization="Bearer $token"; "Content-Type"="application/json"} `
  -Method PUT `
  -Body $body
```

#### Delete a Resource

```powershell
$token = Get-Content access-token.txt
$id = "00000000-0000-0000-0000-000000000001"

Invoke-WebRequest -Uri "http://localhost:8081/products/$id" `
  -Headers @{Authorization="Bearer $token"} `
  -Method DELETE
```

## 📊 Monitoring & Logs

### Viewing Logs

```powershell
# View logs for all services
.\view-logs.ps1

# Or manually:
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f keycloak
docker-compose logs -f postgresql
docker-compose logs -f frontend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Health Checks

```powershell
# Check all service health
.\check-health.ps1

# Manual health checks:
# Backend
Invoke-WebRequest -Uri "http://localhost:8081/health"

# Keycloak
Invoke-WebRequest -Uri "http://localhost:8080/realms/medico"

# PostgreSQL (from within container)
docker-compose exec postgresql pg_isready -U medico_user
```

### Service Status

```powershell
# List all containers
docker-compose ps

# Container resource usage
docker stats

# Inspect specific container
docker inspect medico-backend
```

## 🔧 Common Tasks

### Rebuild Services

```powershell
# Rebuild and restart all services
docker-compose up -d --build

# Rebuild specific service
docker-compose build backend
docker-compose up -d backend
```

### Database Operations

#### Access PostgreSQL

```powershell
# Connect to PostgreSQL
docker-compose exec postgresql psql -U medico_user -d medico_db

# Run SQL query
docker-compose exec postgresql psql -U medico_user -d medico_db -c "SELECT * FROM profiles;"
```

#### Backup Database

```powershell
# Create backup
docker-compose exec postgresql pg_dump -U medico_user medico_db > backup.sql

# Restore backup
docker-compose exec -T postgresql psql -U medico_user medico_db < backup.sql
```

### Keycloak Operations

#### Import/Export Realm

```powershell
# Export realm (from Keycloak admin console)
# Or realm is already in: keycloak/medico-realm.json

# To re-import, restart Keycloak container
docker-compose restart keycloak
```

#### Create New User (via Admin Console)

1. Open: http://localhost:8080
2. Login as admin
3. Select realm: `medico`
4. Go to **Users** → **Add user**
5. Fill in details and set password
6. Assign roles in **Role Mappings** tab

### Frontend Development

#### Run Frontend Locally

```powershell
cd frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:3000

#### Build Frontend

```powershell
cd frontend
npm run build
```

### Backend Development

#### Run Backend Locally

```powershell
cd backend
mvn quarkus:dev
```

Backend will run on: http://localhost:8080 (or configured port)

#### Run Backend Tests

```powershell
cd backend
mvn test
mvn verify  # Includes integration tests
```

## 🐛 Troubleshooting

### Service Won't Start

**Problem**: Container exits immediately or keeps restarting

**Solution**:
```powershell
# Check logs
docker-compose logs <service-name>

# Check if port is in use
netstat -ano | findstr :8081

# Restart service
docker-compose restart <service-name>
```

### Backend Can't Connect to Keycloak

**Problem**: `Connection refused` or `401 Unauthorized`

**Solution**:
```powershell
# Wait for Keycloak to fully start (60+ seconds)
docker-compose logs -f keycloak

# Verify Keycloak is accessible
Invoke-WebRequest -Uri "http://localhost:8080/realms/medico"

# Restart backend after Keycloak is ready
docker-compose restart backend
```

### Backend Can't Connect to Database

**Problem**: `Connection refused` or database errors

**Solution**:
```powershell
# Check PostgreSQL is running
docker-compose ps postgresql

# Check database logs
docker-compose logs postgresql

# Restart PostgreSQL
docker-compose restart postgresql
```

### Token Generation Fails

**Problem**: `401 Unauthorized` or `500 Internal Server Error`

**Solution**:
```powershell
# Check Keycloak logs
docker-compose logs keycloak

# Try service account fallback
.\get-token.ps1 -UseServiceAccount

# Verify Keycloak realm is imported
# Open: http://localhost:8080 → Login → Select realm: medico
```

### Frontend Can't Connect to Backend

**Problem**: CORS errors or connection refused

**Solution**:
```powershell
# Verify backend is running
Invoke-WebRequest -Uri "http://localhost:8081/health"

# Check CORS configuration in backend/application.properties
# Verify NEXT_PUBLIC_API_URL in frontend environment
```

### Port Already in Use

**Problem**: `Bind for 0.0.0.0:8081 failed: port is already allocated`

**Solution**:
```powershell
# Find process using port
netstat -ano | findstr :8081

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Database Schema Errors

**Problem**: `Schema-validation: wrong column type`

**Solution**:
```powershell
# Temporary fix: Set database.generation=update in application.properties
# Then restart backend
docker-compose restart backend

# Permanent fix: Align database schema with entities
# Run Flyway migrations or update schema manually
```

## 📝 Tips & Best Practices

1. **Always check logs first** when troubleshooting
2. **Wait for Keycloak** to fully start before testing authentication
3. **Use service account tokens** for automated testing
4. **Keep tokens secure** - don't commit `access-token.txt` to git
5. **Use health endpoints** to verify service readiness
6. **Monitor resource usage** with `docker stats` if services are slow
7. **Backup database** before major changes
8. **Use Swagger UI** for interactive API testing

## 🔗 Quick Reference

| Service | URL | Default Credentials |
|---------|-----|---------------------|
| Frontend | http://localhost:3000 | - |
| Backend API | http://localhost:8081 | - |
| Swagger UI | http://localhost:8081/q/swagger-ui | - |
| Keycloak | http://localhost:8080 | admin/admin |
| PostgreSQL | localhost:5432 | medico_user/medico_password |

| Script | Purpose |
|--------|---------|
| `start-services.ps1` | Start all Docker services |
| `stop-services.ps1` | Stop all Docker services |
| `get-token.ps1` | Get authentication token |
| `test-api.ps1` | Test backend API endpoints |
| `view-logs.ps1` | View service logs |
| `check-health.ps1` | Check service health |
| `clean.ps1` | Clean Docker resources |


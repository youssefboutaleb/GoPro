# Medico KPI Application

A full-stack medical KPI (Key Performance Indicators) management system migrated from React + Supabase to React + Next.js frontend with Quarkus (Java) backend, PostgreSQL database, and Keycloak authentication.

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend**: React + Next.js (TypeScript)
- **Backend**: Quarkus (Java 17+)
- **Database**: PostgreSQL
- **Authentication**: Keycloak (OIDC/OAuth2)
- **Containerization**: Docker & Docker Compose

### System Components

```
┌─────────────────┐
│   Frontend      │  Next.js (Port 3000)
│   (React)       │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│   Backend       │  Quarkus (Port 8081)
│   (Java)        │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│PostgreSQL│ │Keycloak│
│ (Port    │ │ (Port  │
│  5432)   │ │  8080) │
└─────────┘ └────────┘
```

## 📋 Prerequisites

- **Docker Desktop** (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- **PowerShell** (Windows) or Bash (Linux/Mac)
- **Java 17+** (for local backend development, optional)
- **Node.js 18+** (for local frontend development, optional)

## 🚀 Quick Start

### 1. Start All Services

```powershell
# Start all Docker containers
.\start-services.ps1

# Or manually:
docker-compose up -d
```

### 2. Verify Services

```powershell
# Check service status
.\check-health.ps1

# Or manually:
docker-compose ps
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Swagger UI**: http://localhost:8081/q/swagger-ui
- **Keycloak Admin**: http://localhost:8080 (admin/admin)

### 4. Get Authentication Token

```powershell
# Get access token for API testing
.\get-token.ps1

# Token will be saved to: access-token.txt
```

## 📁 Project Structure

```
GoPro/
├── backend/                 # Quarkus backend
│   ├── src/
│   │   ├── main/java/      # Java source code
│   │   └── resources/      # Configuration files
│   ├── Dockerfile
│   └── pom.xml
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── keycloak/              # Keycloak configuration
│   ├── Dockerfile
│   └── medico-realm.json  # Realm configuration
├── postgresql/            # Database initialization
│   ├── Dockerfile
│   └── init.sql
├── docker-compose.yml     # Main orchestration file
├── README.md              # This file
└── USAGE.md               # Usage guide
```

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/src/main/resources/application.properties`)

```properties
# Database
QUARKUS_DATASOURCE_JDBC_URL=jdbc:postgresql://postgresql:5432/medico_db
QUARKUS_DATASOURCE_USERNAME=medico_user
QUARKUS_DATASOURCE_PASSWORD=medico_password

# Keycloak
QUARKUS_OIDC_AUTH_SERVER_URL=http://keycloak:8080/realms/medico
QUARKUS_OIDC_CLIENT_ID=medico-backend
QUARKUS_OIDC_CREDENTIALS_SECRET=secret
```

#### Frontend (`.env` or `docker-compose.yml`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=medico
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=medico-frontend
```

### Keycloak Realm

The Keycloak realm `medico` is automatically imported from `keycloak/medico-realm.json` and includes:

- **Realm**: `medico`
- **Clients**:
  - `medico-backend` (service account)
  - `medico-frontend` (public client)
- **Roles**: `admin`, `sales_director`, `supervisor`, `delegate`
- **Default Users**: Configured in realm JSON

## 🔌 API Endpoints

### Health & Status

- `GET /health` - Health check
- `GET /health/ready` - Readiness check
- `GET /health/live` - Liveness check

### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user profile

### Resources

- **Profiles**: `/profiles` (GET, POST, PUT, DELETE)
- **Doctors**: `/doctors` (GET, POST, PUT, DELETE)
- **Products**: `/products` (GET, POST, PUT, DELETE)
- **Sectors**: `/sectors` (GET, POST, PUT, DELETE)
- **Bricks**: `/bricks` (GET, POST, PUT, DELETE)
- **Visits**: `/visits` (GET, POST, PUT, DELETE)
- **Action Plans**: `/action-plans` (GET, POST, PUT, DELETE)
- **Sales Plans**: `/sales-plans` (GET, POST, PUT, DELETE)
- **Sales**: `/sales` (GET, POST, PUT, DELETE)

All endpoints (except `/health/*`) require authentication via Bearer token.

**Full API Documentation**: http://localhost:8081/q/swagger-ui

## 🧪 Testing

### Test Backend API

```powershell
# Run API test suite
.\test-api.ps1

# Or manually test endpoints
$token = Get-Content access-token.txt
Invoke-WebRequest -Uri "http://localhost:8081/profiles" `
  -Headers @{Authorization="Bearer $token"}
```

### Integration Tests

```powershell
# Run backend integration tests
cd backend
mvn test
```

## 🐛 Troubleshooting

### Services Won't Start

```powershell
# Check Docker is running
docker ps

# View service logs
.\view-logs.ps1

# Or specific service:
docker-compose logs backend
docker-compose logs keycloak
```

### Port Conflicts

```powershell
# Check what's using a port
netstat -ano | findstr :8081
netstat -ano | findstr :8080
netstat -ano | findstr :5432
```

### Database Connection Issues

```powershell
# Restart PostgreSQL
docker-compose restart postgresql

# Check database logs
docker-compose logs postgresql
```

### Keycloak Connection Issues

```powershell
# Wait for Keycloak to fully start (can take 60+ seconds)
docker-compose logs -f keycloak

# Restart Keycloak
docker-compose restart keycloak
```

### Backend Won't Start

```powershell
# Check backend logs
docker-compose logs backend

# Common issues:
# - Keycloak not ready (wait longer)
# - Database connection failed (check PostgreSQL)
# - Schema validation errors (check application.properties)
```

## 🧹 Cleanup

```powershell
# Stop all services
.\stop-services.ps1

# Remove containers and volumes
.\clean.ps1

# Or manually:
docker-compose down -v
```

## 📚 Additional Resources

- **Usage Guide**: See `USAGE.md` for detailed usage instructions
- **API Documentation**: http://localhost:8081/q/swagger-ui (when services are running)
- **Keycloak Admin Console**: http://localhost:8080 (admin/admin)

## 🔐 Security Notes

- **Default credentials** are for development only
- **Change all passwords** before production deployment
- **Use HTTPS** in production
- **Configure CORS** properly for production domains
- **Review Keycloak realm settings** for production security

## 📝 Development

### Local Backend Development

```powershell
cd backend
mvn quarkus:dev
```

### Local Frontend Development

```powershell
cd frontend
npm install
npm run dev
```

### Database Migrations

Flyway migrations are in `backend/src/main/resources/db/migration/` and run automatically on startup.

## 📄 License

[Add your license information here]

## 👥 Contributors

[Add contributor information here]


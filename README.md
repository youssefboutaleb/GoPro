# Medico KPI Metrics Application

A comprehensive medical KPI metrics tracking application built with React, Quarkus, PostgreSQL, and Keycloak.

## Architecture Overview

This application has been migrated from React + Supabase to a modern microservices architecture:

- **Frontend**: Next.js + React + TypeScript
- **Backend**: Quarkus (Java) with REST APIs
- **Database**: PostgreSQL
- **Authentication**: Keycloak (OIDC/OAuth2)
- **Containerization**: Docker & Docker Compose

## Project Structure

```
migrated-medico-app/
├── frontend/           # React frontend application
├── backend/            # Quarkus backend application
├── postgresql/         # PostgreSQL database configuration
├── keycloak/           # Keycloak authentication server
├── docker-compose.yml  # Docker orchestration
└── README.md           # This file
```

## Prerequisites

- Docker and Docker Compose
- Java 17+ (for local development)
- Node.js 18+ (for local development)
- Maven 3.8+ (for backend build)

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd migrated-medico-app

# Copy environment configuration
cp .env.example .env
```

### 2. Start with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8081
- **Keycloak Admin**: http://localhost:8080 (admin/admin)
- **PostgreSQL**: localhost:5432

### 4. Default Users

The application comes with pre-configured test users:

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| sales-director | director123 | Sales Director |
| supervisor | supervisor123 | Supervisor |
| delegate | delegate123 | Delegate |

## Development Setup

### Backend Development

```bash
cd backend

# Install dependencies
mvn clean install

# Run in development mode
mvn quarkus:dev

# Build production JAR
mvn clean package -DskipTests
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Configuration

### Environment Variables

#### Backend Configuration
```properties
# Database
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/medico_db
quarkus.datasource.username=medico_user
quarkus.datasource.password=medico_password

# Keycloak
quarkus.oidc.auth-server-url=http://localhost:8080/realms/medico
quarkus.oidc.client-id=medico-backend
quarkus.oidc.credentials.secret=secret

# CORS
quarkus.http.cors.origins=http://localhost:3000
```

#### Frontend Configuration
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8081

# Keycloak Configuration
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8080
NEXT_PUBLIC_KEYCLOAK_REALM=medico
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=medico-frontend
```

### Keycloak Realm Setup

The Keycloak realm is automatically configured with:

- **Realm**: `medico`
- **Clients**: 
  - `medico-backend` (confidential client)
  - `medico-frontend` (public client)
- **Roles**: `admin`, `sales_director`, `supervisor`, `delegate`
- **Users**: Pre-configured test users with different roles

## API Documentation

The backend provides comprehensive API documentation via OpenAPI/Swagger:

- **Swagger UI**: http://localhost:8081/q/swagger-ui
- **OpenAPI JSON**: http://localhost:8081/openapi

### Main API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

#### Profiles
- `GET /profiles` - Get all profiles
- `GET /profiles/{id}` - Get profile by ID
- `POST /profiles` - Create new profile
- `PUT /profiles/{id}` - Update profile
- `DELETE /profiles/{id}` - Delete profile

#### Visits
- `GET /visits` - Get all visits
- `GET /visits/{id}` - Get visit by ID
- `POST /visits` - Create new visit
- `PUT /visits/{id}` - Update visit
- `DELETE /visits/{id}` - Delete visit

#### Action Plans
- `GET /action-plans` - Get all action plans
- `GET /action-plans/{id}` - Get action plan by ID
- `POST /action-plans` - Create new action plan
- `PUT /action-plans/{id}` - Update action plan
- `DELETE /action-plans/{id}` - Delete action plan

## Database Schema

The application uses the following main entities:

### Users & Roles
- **profiles** - User profiles with roles
- **sectors** - Geographic sectors
- **bricks** - Territorial divisions

### Medical Data
- **doctors** - Doctor information
- **products** - Medical products
- **visits** - Doctor visits

### KPIs & Planning
- **sales_plans** - Sales planning
- **sales** - Sales data
- **action_plans** - Action plans

## Authentication Flow

1. **User Login**: Frontend redirects to Keycloak login page
2. **Token Exchange**: Keycloak returns JWT token
3. **API Access**: Frontend includes token in API requests
4. **Token Validation**: Backend validates token with Keycloak
5. **Role-based Access**: Backend enforces role-based permissions

## Security Features

- **OIDC/OAuth2 Authentication** via Keycloak
- **JWT Token Validation** for API access
- **Role-based Authorization** with fine-grained permissions
- **CORS Configuration** for cross-origin requests
- **Input Validation** and sanitization
- **SQL Injection Prevention** via ORM

## Monitoring & Logging

- **Health Checks**: Built-in health endpoints
- **Metrics**: Micrometer metrics integration
- **Logging**: Structured logging with log levels
- **Tracing**: Request tracing capabilities

## Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgresql
   
   # Verify database is initialized
   docker exec -it medico-postgresql psql -U medico_user -d medico_db -c "\dt"
   ```

2. **Keycloak Issues**
   ```bash
   # Check Keycloak logs
   docker-compose logs keycloak
   
   # Verify realm is imported
   docker exec -it medico-keycloak curl http://localhost:8080/admin/realms/medico
   ```

3. **Backend Connection**
   ```bash
   # Check backend logs
   docker-compose logs backend
   
   # Test API endpoint
   curl http://localhost:8081/health
   ```

### Performance Tuning

- **Database**: Configure connection pooling
- **Keycloak**: Adjust token lifetimes
- **Backend**: Enable caching and optimization
- **Frontend**: Implement lazy loading

## Deployment

### Production Deployment

1. **Environment Configuration**
   ```bash
   # Update environment variables for production
   cp .env.production .env
   ```

2. **Build Production Images**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

3. **Deploy with Docker Swarm/Kubernetes**
   ```bash
   docker stack deploy -c docker-compose.prod.yml medico
   ```

### Scaling Considerations

- **Database**: Use connection pooling and read replicas
- **Keycloak**: Configure clustering for high availability
- **Backend**: Enable horizontal scaling with load balancing
- **Frontend**: Next.js supports static export or server-side rendering

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review troubleshooting section

## Acknowledgments

- Quarkus team for the excellent framework
- Keycloak team for authentication solutions
- React community for frontend tools
- PostgreSQL team for the robust database
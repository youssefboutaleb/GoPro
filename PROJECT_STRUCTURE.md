# Medico KPI Metrics - Project Structure

## Overview

This document outlines the complete project structure of the migrated Medico KPI Metrics application.

## Directory Structure

```
migrated-medico-app/
├── frontend/                     # React Frontend Application
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── contexts/            # React contexts (Keycloak auth)
│   │   ├── services/            # API services
│   │   ├── pages/               # Application pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript type definitions
│   │   ├── utils/               # Utility functions
│   │   └── i18n/                # Internationalization
│   ├── public/                  # Static assets
│   ├── package.json             # Frontend dependencies
│   ├── Dockerfile               # Frontend container
│   └── .env                     # Frontend environment variables
│
├── backend/                     # Quarkus Backend Application
│   ├── src/main/java/com/medico/
│   │   ├── entities/            # JPA entities
│   │   ├── dto/                 # Data transfer objects
│   │   ├── repositories/        # Database repositories
│   │   ├── resources/           # REST API endpoints
│   │   ├── services/            # Business logic services
│   │   ├── config/              # Configuration classes
│   │   └── security/            # Security configurations
│   ├── src/main/resources/
│   │   ├── application.properties # Application configuration
│   │   └── db/migration/        # Database migrations
│   ├── pom.xml                  # Maven dependencies
│   ├── Dockerfile               # Backend container
│   └── build.sh                 # Build script
│
├── postgresql/                  # PostgreSQL Database
│   ├── Dockerfile               # PostgreSQL container
│   ├── init.sql                 # Initial database setup
│   └── data/                    # Database data volume
│
├── keycloak/                    # Keycloak Authentication
│   ├── Dockerfile               # Keycloak container
│   ├── medico-realm.json        # Keycloak realm configuration
│   └── data/                    # Keycloak data volume
│
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
├── .env                         # Environment variables
├── .env.production              # Production environment template
├── setup.sh                     # Setup script
├── README.md                    # Main documentation
├── MIGRATION_SUMMARY.md         # Migration summary
└── PROJECT_STRUCTURE.md         # This file
```

## Key Components

### Backend (Quarkus)
- **Entities**: JPA entities mapping to database tables
- **DTOs**: Data transfer objects for API communication
- **Repositories**: Database access layer using Panache
- **Resources**: REST API endpoints
- **Services**: Business logic implementation
- **Config**: Application configuration and CORS settings

### Frontend (React)
- **Components**: Reusable UI components
- **Contexts**: Keycloak authentication context
- **Services**: API communication layer
- **Pages**: Application pages and routes
- **Hooks**: Custom React hooks
- **Types**: TypeScript type definitions

### Infrastructure
- **PostgreSQL**: Primary database
- **Keycloak**: Authentication and authorization server
- **Docker**: Containerization
- **Docker Compose**: Service orchestration

## Configuration Files

### Backend Configuration
- `application.properties`: Quarkus configuration
- `pom.xml`: Maven dependencies and build configuration
- `Dockerfile`: Backend container definition

### Frontend Configuration
- `package.json`: Node.js dependencies
- `.env`: Environment variables
- `Dockerfile`: Frontend container definition

### Infrastructure Configuration
- `docker-compose.yml`: Development services
- `docker-compose.prod.yml`: Production services
- `.env`: Environment variables
- `setup.sh`: Automated setup script

## Database Schema

### Core Tables
- `profiles`: User profiles and roles
- `sectors`: Geographic sectors
- `bricks`: Territorial divisions
- `doctors`: Doctor information
- `products`: Medical products
- `visits`: Doctor visits
- `sales_plans`: Sales planning
- `sales`: Sales data
- `action_plans`: Action plans

### Relationships
- Profiles can have supervisors
- Doctors belong to bricks
- Bricks belong to sectors
- Visits link delegates, doctors, and products
- Action plans have multiple targeted entities

## API Endpoints

### Authentication
- `POST /auth/login`: User login
- `POST /auth/refresh`: Token refresh
- `POST /auth/logout`: User logout
- `GET /auth/me`: Current user profile

### Profiles
- `GET /profiles`: List all profiles
- `GET /profiles/{id}`: Get profile by ID
- `POST /profiles`: Create new profile
- `PUT /profiles/{id}`: Update profile
- `DELETE /profiles/{id}`: Delete profile

### Visits
- `GET /visits`: List all visits
- `GET /visits/{id}`: Get visit by ID
- `POST /visits`: Create new visit
- `PUT /visits/{id}`: Update visit
- `DELETE /visits/{id}`: Delete visit

### Action Plans
- `GET /action-plans`: List all action plans
- `GET /action-plans/{id}`: Get action plan by ID
- `POST /action-plans`: Create new action plan
- `PUT /action-plans/{id}`: Update action plan
- `DELETE /action-plans/{id}`: Delete action plan

## Security

### Authentication
- Keycloak OIDC/OAuth2
- JWT token validation
- Role-based access control

### Authorization
- Fine-grained permissions
- Role-based API access
- Resource protection

### Security Headers
- CORS configuration
- Content Security Policy
- XSS protection

## Deployment

### Development
```bash
docker-compose up -d
```

### Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Local Development
```bash
# Backend
mvn quarkus:dev

# Frontend
npm run dev
```

## Monitoring

### Health Checks
- Application health endpoints
- Database connectivity checks
- Service dependency validation

### Logging
- Structured logging
- Log levels configuration
- Audit trails

### Metrics
- Application performance metrics
- Database performance metrics
- API response time metrics

## Maintenance

### Updates
- Dependency updates
- Security patches
- Performance optimizations

### Backups
- Database backups
- Configuration backups
- Keycloak realm exports

### Monitoring
- Health check monitoring
- Performance monitoring
- Error tracking

## Support

### Documentation
- API documentation (OpenAPI)
- Architecture diagrams
- Deployment guides
- Troubleshooting guides

### Testing
- Unit tests
- Integration tests
- End-to-end tests
- Performance tests

### Troubleshooting
- Common issues
- Log analysis
- Performance tuning

---

This project structure provides a solid foundation for the Medico KPI Metrics application with clear separation of concerns, scalable architecture, and comprehensive documentation.
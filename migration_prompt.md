Role: Senior Full-Stack Architect and DevOps Expert.

Your mission: Receive a local Git repository built with React + Vite and Supabase (the project is working). Your responsibility is to fully migrate the project to React + Next.js, Quarkus, Keycloak (BFF pattern: Keycloak used only within Quarkus and consumed via Quarkus APIs by the React frontend), and PostgreSQL; then clean, containerize, test, and document the complete application so it runs reliably with Docker and docker-compose.

Your tasks:

Understand the entire application structure and current behavior, including:

Frontend (React).

Backend logic implemented with Supabase (authentication, roles and authorization, database, API calls, etc.).

Migrate technologies:

Migrate the frontend from React + Vite to React + Next.js.

Migrate the backend from Supabase to Quarkus + PostgreSQL + Keycloak (BFF).

Replace all Supabase authentication and API logic with Quarkus REST APIs using Keycloak-based authentication.

Implement PostgreSQL as the new persistent database and migrate schema/data as needed to preserve existing functionality.

Maintain existing application functionality (features, flows, roles, etc.). Update API endpoints, authentication flows, and environment configurations accordingly.

Containerize the entire system with Docker:

One container for the React frontend.

One container for the Quarkus backend.

One container for PostgreSQL.

One container for Keycloak.
Ensure correct inter-container communication and service startup order (services should wait for dependencies as appropriate).

Generate all configuration and setup files:

Dockerfile for each service.

docker-compose.yml (to orchestrate all containers).

.env files for environment configuration.

Provide complete documentation explaining:

Project architecture overview.

Local setup and installation steps.

Configuration and environment variable details.

How to run and test the application locally.

Required Keycloak realm setup (realms, clients, roles, etc.).

Output expected:

Fully migrated source code (React + Next.js + Quarkus + Keycloak + PostgreSQL).

All Docker configuration files.

Step-by-step README.md for setup and local testing.
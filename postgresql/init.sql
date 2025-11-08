-- Initialize PostgreSQL databases and users
-- Note: Tables are created by Flyway migrations when the backend starts
-- Data insertion should be done after tables are created

-- Create Keycloak database and user
CREATE DATABASE keycloak_db;
CREATE USER keycloak_user WITH PASSWORD 'keycloak_password';
GRANT ALL PRIVILEGES ON DATABASE keycloak_db TO keycloak_user;
ALTER DATABASE keycloak_db OWNER TO keycloak_user;

-- Note: Default data insertion should be done after Flyway migrations create the tables
-- This can be done via a separate migration script or through the application
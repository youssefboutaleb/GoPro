FROM quay.io/keycloak/keycloak:25.0.2

# Enable health and metrics (these are build-time settings)
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Copy realm configuration
COPY medico-realm.json /opt/keycloak/data/import/

# Build the optimized Keycloak image
# Note: Database connection settings are provided at runtime via docker-compose
RUN /opt/keycloak/bin/kc.sh build

# Expose ports
EXPOSE 8080

# Start Keycloak in development mode with realm import
# Database and admin credentials are set via environment variables in docker-compose
CMD ["start-dev", "--import-realm"]
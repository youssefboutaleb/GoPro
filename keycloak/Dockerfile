FROM quay.io/keycloak/keycloak:25.0.2

# Set environment variables
ENV KEYCLOAK_ADMIN=admin
ENV KEYCLOAK_ADMIN_PASSWORD=admin
ENV KC_DB=postgres
ENV KC_DB_URL=jdbc:postgresql://postgresql:5432/keycloak_db
ENV KC_DB_USERNAME=keycloak_user
ENV KC_DB_PASSWORD=keycloak_password

# Enable health and metrics
ENV KC_HEALTH_ENABLED=true
ENV KC_METRICS_ENABLED=true

# Copy realm configuration
COPY medico-realm.json /opt/keycloak/data/import/

# Build the optimized Keycloak image
RUN /opt/keycloak/bin/kc.sh build

# Expose ports
EXPOSE 8080

# Start Keycloak with import
CMD ["start-dev", "--import-realm"]
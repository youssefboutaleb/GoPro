FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=medico_db
ENV POSTGRES_USER=medico_user
ENV POSTGRES_PASSWORD=medico_password

# Copy initialization scripts
COPY init.sql /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432
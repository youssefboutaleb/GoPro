FROM openjdk:17-jdk-slim

WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the application files
COPY target/medico-backend-1.0.0-SNAPSHOT-runner.jar /app/app.jar
COPY target/lib/* /app/lib/

# Expose the application port
EXPOSE 8080

# Set the JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application
CMD ["java", "-jar", "/app/app.jar"]
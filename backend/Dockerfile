# Build stage
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy Maven configuration file first (for better layer caching)
COPY pom.xml .

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install necessary packages (Alpine uses apk, not apt-get)
RUN apk add --no-cache curl

# Copy the Quarkus application files from build stage
COPY --from=build /build/target/quarkus-app /app/quarkus-app

# Expose the application port
EXPOSE 8080

# Set the JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application using quarkus-run.jar
CMD ["java", "-jar", "/app/quarkus-app/quarkus-run.jar"]
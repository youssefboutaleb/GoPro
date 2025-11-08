#!/bin/bash

# Build script for Medico Backend

echo "Building Medico Backend..."

# Clean previous builds
echo "Cleaning previous builds..."
mvn clean

# Install dependencies and build
echo "Installing dependencies and building..."
mvn install -DskipTests

# Build native image (optional)
if [ "$1" = "native" ]; then
    echo "Building native image..."
    mvn package -Pnative -DskipTests
fi

# Build Docker image
echo "Building Docker image..."
docker build -t medico-backend .

echo "Build completed successfully!"
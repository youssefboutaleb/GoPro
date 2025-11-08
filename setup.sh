#!/bin/bash

# Medico KPI Metrics Application Setup Script

set -e

echo "🚀 Medico KPI Metrics Application Setup"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from template..."
    cp .env.example .env 2>/dev/null || cp .env.production .env.example 2>/dev/null || {
        print_error "No .env template found. Please create .env file manually."
        exit 1
    }
    print_warning "Please edit .env file with your configuration before continuing."
    read -p "Press Enter to continue after editing .env file..."
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p backend/target
mkdir -p frontend/node_modules
mkdir -p postgresql/data
mkdir -p keycloak/data

# Build backend
print_status "Building backend..."
cd backend
if [ -f "pom.xml" ]; then
    print_status "Building with Maven..."
    mvn clean package -DskipTests
else
    print_warning "Maven build file not found. Skipping backend build."
fi
cd ..

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    npm run build
else
    print_warning "Frontend package.json not found. Skipping frontend build."
fi
cd ..

# Start services
print_status "Starting services with Docker Compose..."
if command -v docker-compose &> /dev/null; then
    docker-compose up -d
elif command -v docker compose &> /dev/null; then
    docker compose up -d
else
    print_error "Unable to find docker-compose command"
    exit 1
fi

# Wait for services to start
print_status "Waiting for services to start..."
sleep 30

# Check service health
print_status "Checking service health..."
services=("postgresql" "keycloak" "backend" "frontend")

for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        print_status "$service is running ✓"
    else
        print_warning "$service may not be running properly"
    fi
done

# Display access URLs
echo ""
echo "🎉 Setup completed!"
echo "=================="
echo ""
echo "Application URLs:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8081"
echo "- Keycloak Admin: http://localhost:8080"
echo "- API Documentation: http://localhost:8081/q/swagger-ui"
echo ""
echo "Default Users:"
echo "- Admin: admin/admin123"
echo "- Sales Director: sales-director/director123"
echo "- Supervisor: supervisor/supervisor123"
echo "- Delegate: delegate/delegate123"
echo ""
echo "Commands:"
echo "- View logs: docker-compose logs -f"
echo "- Stop services: docker-compose down"
echo "- Restart services: docker-compose restart"
echo ""
echo "For production deployment, use: docker-compose -f docker-compose.prod.yml up -d"

# Create a simple test script
cat > test-connection.sh << 'EOF'
#!/bin/bash
echo "Testing application connections..."
echo "==========================="

# Test frontend
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000

# Test backend health
echo "Testing backend health..."
curl -s -o /dev/null -w "Backend Health: %{http_code}\n" http://localhost:8081/health

# Test Keycloak
echo "Testing Keycloak..."
curl -s -o /dev/null -w "Keycloak: %{http_code}\n" http://localhost:8080/health

echo ""
echo "If all status codes are 200, the application is running correctly!"
EOF

chmod +x test-connection.sh

print_status "Setup script completed successfully!"
print_status "You can now test the application with: ./test-connection.sh"
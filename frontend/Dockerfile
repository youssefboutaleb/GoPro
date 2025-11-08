FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Install a simple HTTP server to serve the built files
RUN npm install -g serve

# Expose the port
EXPOSE 3000

# Serve the built application
CMD ["serve", "-s", "dist", "-l", "3000"]
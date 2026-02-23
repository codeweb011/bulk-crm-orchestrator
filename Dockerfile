# Use Node LTS
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy rest of the code
COPY . .

# Build the app
RUN npm run build

# Expose port (optional for worker)
EXPOSE 3000

# Start app
CMD ["node", "dist/main.js"]
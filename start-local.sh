#!/bin/bash

echo "🚀 Starting BrandGEO Monitor locally..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please run './setup-mac.sh' first or copy .env.example to .env"
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@15
fi

# Check if database exists
if ! psql -lqt | cut -d \| -f 1 | grep -qw brandgeo_monitor; then
    echo "Creating database..."
    createdb brandgeo_monitor
fi

# Setup database schema
echo "Setting up database schema..."
npm run db:push

# Start the application
echo "Starting development server..."
echo "🌐 Opening http://localhost:5000"
npm run dev
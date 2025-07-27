# BrandGEO Monitor - Local Deployment Guide

## Prerequisites

### 1. Install Homebrew (if not already installed)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 2. Install Node.js (v18 or higher)
```bash
brew install node
```

### 3. Install Git (if not already installed)
```bash
brew install git
```

### 4. Install PostgreSQL
```bash
brew install postgresql@15
brew services start postgresql@15
```

## Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/sabyasm/BrandPulse.git
cd BrandPulse
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Database Setup

#### Create PostgreSQL Database
```bash
# Create database user (optional, you can use default postgres user)
createuser -s brandgeo_user

# Create database
createdb brandgeo_monitor
```

#### Set Database URL
Create a `.env` file in the project root:
```bash
touch .env
```

Add the following to `.env`:
```env
# Database Configuration
DATABASE_URL="postgresql://postgres:@localhost:5432/brandgeo_monitor"

# OpenRouter API Key (Required for AI analysis)
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000
```

### Step 4: Database Schema Setup
```bash
# Push database schema (using Drizzle Kit)
npm run db:push
```

### Step 5: Get OpenRouter API Key

1. Go to [OpenRouter.ai](https://openrouter.ai)
2. Sign up for an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and replace `your_openrouter_api_key_here` in your `.env` file

### Step 6: Start the Application
```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Quick Setup Script

Create and run this script for automated setup:

### `setup-mac.sh`
```bash
#!/bin/bash

echo "🚀 Setting up BrandGEO Monitor on macOS..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    brew install node
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Setup database
echo "Setting up database..."
createdb brandgeo_monitor 2>/dev/null || echo "Database already exists"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
DATABASE_URL="postgresql://postgres:@localhost:5432/brandgeo_monitor"
OPENROUTER_API_KEY="your_openrouter_api_key_here"
NODE_ENV=development
PORT=5000
EOL
    echo "⚠️  Please add your OpenRouter API key to the .env file"
fi

# Setup database schema
echo "Setting up database schema..."
npm run db:push

echo "✅ Setup complete! Run 'npm run dev' to start the application."
echo "📝 Don't forget to add your OpenRouter API key to the .env file"
echo "🌐 App will be available at http://localhost:5000"
```

### Make script executable and run:
```bash
chmod +x setup-mac.sh
./setup-mac.sh
```

## Available Scripts

### Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Management
```bash
# Push schema changes to database
npm run db:push

# Open database studio (GUI) - if available
npm run db:studio

# Type checking
npm run check
```

### Development Tools
```bash
# Type checking
npm run type-check

# Lint code
npm run lint

# Format code
npm run format
```

## Troubleshooting

### Common Issues

#### 1. PostgreSQL Connection Error
```bash
# Check if PostgreSQL is running
brew services list | grep postgresql

# Start PostgreSQL if not running
brew services start postgresql@15

# Check connection
psql -d brandgeo_monitor -c "SELECT version();"
```

#### 2. Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use different port in .env
PORT=5001
```

#### 3. Node.js Version Issues
```bash
# Check Node.js version
node --version

# Install specific version if needed
brew install node@18
```

#### 4. Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

### Database Reset
If you need to reset the database:
```bash
# Drop and recreate database
dropdb brandgeo_monitor
createdb brandgeo_monitor
npm run db:push
```

## Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://postgres:@localhost:5432/brandgeo_monitor` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI analysis | Yes | `sk-or-v1-xxx...` |
| `NODE_ENV` | Environment mode | No | `development` |
| `PORT` | Server port | No | `5000` |

## Features Verification

After setup, verify these features work:

1. **Landing Page**: Visit `http://localhost:5000`
2. **Competitor Monitor**: Navigate to competitor analysis
3. **AI Analysis**: Add OpenRouter API key and test analysis
4. **Brand Logos**: Verify logos display in results
5. **Analysis History**: Check sidebar functionality

## Production Deployment Notes

For production deployment, consider:

1. Use environment-specific database (not local PostgreSQL)
2. Set `NODE_ENV=production`
3. Configure proper domain and SSL
4. Set up monitoring and logging
5. Use process manager like PM2
6. Configure backup strategy for database

## Support

If you encounter issues:

1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Confirm OpenRouter API key is valid
5. Check network connectivity for API calls

For additional support, refer to the project documentation or create an issue in the repository.
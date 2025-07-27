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
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install PostgreSQL if not installed
if ! command -v psql &> /dev/null; then
    echo "Installing PostgreSQL..."
    brew install postgresql@15
    brew services start postgresql@15
else
    echo "✅ PostgreSQL already installed"
    # Make sure it's running
    brew services start postgresql@15 2>/dev/null || echo "PostgreSQL already running"
fi

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Setup database
echo "Setting up database..."
createdb brandgeo_monitor 2>/dev/null || echo "Database 'brandgeo_monitor' already exists"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:@localhost:5432/brandgeo_monitor"

# OpenRouter API Key (Required for AI analysis)
OPENROUTER_API_KEY="your_openrouter_api_key_here"

# Node Environment
NODE_ENV=development

# Server Configuration
PORT=5000
EOL
    echo "⚠️  Please add your OpenRouter API key to the .env file"
else
    echo "✅ .env file already exists"
fi

# Setup database schema
echo "Setting up database schema..."
npm run db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your OpenRouter API key to the .env file"
echo "   - Visit https://openrouter.ai to get your API key"
echo "   - Replace 'your_openrouter_api_key_here' in .env"
echo "2. Run 'npm run dev' to start the application"
echo "3. Open http://localhost:5000 in your browser"
echo ""
echo "🌐 App will be available at http://localhost:5000"
echo "📝 Check DEPLOYMENT.md for detailed instructions"
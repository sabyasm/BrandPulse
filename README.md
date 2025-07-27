# BrandGEO Monitor

A comprehensive brand monitoring platform that enables competitive analysis across 50+ AI models using OpenRouter integration. Monitor how AI models rank your brand against competitors and discover which brands they recommend.

## Features

- **Multi-LLM Analysis**: Execute prompts across 50+ AI models simultaneously
- **Brand Recognition**: Intelligent brand mapping with authentic company logos
- **Competitive Intelligence**: Analyze how AI models rank brands and make recommendations
- **Real-time Monitoring**: Track brand visibility and competitor positioning
- **Enhanced Analytics**: AI-powered aggregation and insights from multiple providers

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Clone and setup automatically
git clone https://github.com/sabyasm/BrandPulse.git
cd BrandPulse
./setup-mac.sh
```

### Option 2: Manual Setup
1. Install prerequisites (Node.js, PostgreSQL)
2. Clone repository and install dependencies
3. Setup database and environment variables
4. Get OpenRouter API key
5. Start the application

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenRouter API (50+ providers)
- **Build Tools**: Vite, esbuild

## API Integration

The platform integrates with OpenRouter to access multiple AI providers:
- OpenAI (GPT-4.1, GPT-4o Mini)
- Anthropic (Claude 3.7, Claude 4)
- Google (Gemini 2.5)
- DeepSeek, Kimi, Grok, and more

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:@localhost:5432/brandgeo_monitor"
OPENROUTER_API_KEY="your_api_key_here"
NODE_ENV=development
PORT=5000
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:push      # Deploy database schema
npm run check        # Type checking
```

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── gemini.ts        # AI aggregation
│   └── logo-service.ts  # Brand recognition
├── shared/              # Shared types
└── drizzle/            # Database migrations
```

## Key Features

### Brand Monitor
- Extract company information from URLs
- Monitor brand mentions across AI models
- Track competitive positioning

### Competitor Monitor  
- Custom prompt analysis
- AI provider comparison
- Enhanced reporting with insights

### Dynamic Logo Recognition
- 100+ major brand mappings
- Google Favicon API integration
- Emoji fallbacks for categories

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for setup problems
- Review console logs for error details
- Ensure API keys are properly configured
- Verify database connectivity

## Acknowledgments

- OpenRouter for AI model access
- Shadcn/ui for component library
- Drizzle for database ORM
- Tailwind CSS for styling
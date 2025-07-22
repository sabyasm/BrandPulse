# BrandGEO Monitor

A multi-provider AI-powered brand monitoring platform that enables comprehensive competitive analysis across various AI models and providers.

## 🚀 Features

### Competitor Monitor (Primary Feature)
- **AI-Powered Competitor Analysis**: Discover which brands AI models recommend in response to specific queries
- **Multi-Provider Support**: Analyze recommendations across multiple AI providers simultaneously
- **Custom Prompt Testing**: Test your own prompts to understand competitive positioning
- **Comprehensive Reports**: Get detailed insights on brand rankings and AI provider perspectives

### Supported AI Models
- **Google**: Gemini 2.5 Flash
- **DeepSeek**: DeepSeek Chat v3
- **xAI**: Grok 4  
- **OpenAI**: GPT-4.1, GPT-4o Mini
- **Anthropic**: Claude 4, Claude 3.7 Sonnet
- **MoonshotAI**: Kimi K2

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Components**: shadcn/ui + Tailwind CSS
- **API Integration**: OpenRouter for multi-provider AI access
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state

## 🏗️ Architecture

### Frontend
- **Modern React**: Function components with hooks
- **TypeScript**: Full type safety across the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui for consistent UI components

### Backend
- **RESTful API**: Express.js with structured routes
- **Database Management**: Drizzle ORM with PostgreSQL
- **AI Integration**: OpenRouter API for multi-provider access
- **Real-time Updates**: Progress tracking for long-running analyses

### Data Flow
1. **Query Input**: Users enter competitive analysis prompts
2. **AI Processing**: System queries multiple AI providers simultaneously
3. **Results Aggregation**: Responses analyzed for brand mentions and rankings
4. **Insights Generation**: Competitive positioning and recommendations extracted
5. **Visualization**: Results displayed with comprehensive analysis

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenRouter API key

### Environment Variables
```env
OPENROUTER_API_KEY=your_openrouter_api_key
DATABASE_URL=your_database_connection_string
```

### Installation & Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Production Build
```bash
# Build for production
npm run build

# Start production server  
npm run start
```

## 📊 Key Features

### Competitor Analysis
- Multi-provider AI query execution
- Brand mention extraction and ranking
- Competitive positioning insights
- Custom prompt testing capabilities

### Analysis Management
- Historical analysis tracking
- Progress monitoring for long-running queries
- Results export and sharing
- Analysis comparison tools

### Provider Insights
- Per-provider brand recommendations
- Cross-provider consistency analysis
- Model-specific bias detection
- Provider performance metrics

## 🔧 Configuration

### AI Providers
The application supports multiple AI providers through OpenRouter:
- Configure provider selection per analysis
- Customize model parameters
- Set provider-specific prompts

### Analysis Settings
- Custom prompt creation
- Provider selection
- Analysis depth configuration
- Result filtering options

## 📈 Future Roadmap

### Planned Features
- **Brand Monitor**: Complete brand visibility tracking (Coming Soon)
- **Advanced Analytics**: Deeper insights and trend analysis
- **API Access**: Programmatic access to analysis results
- **Team Collaboration**: Multi-user workspace management
- **Integration Ecosystem**: Connect with popular marketing tools

## 🤝 Contributing

This project follows modern web development best practices:
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Conventional commits for version control

## 📄 License

This project is proprietary software developed for competitive intelligence purposes.

---

**Note**: Brand Monitor functionality is currently under development and will be available soon. The current focus is on Competitor Monitor capabilities.
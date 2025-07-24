# BrandGEO Monitor

## Overview

BrandGEO Monitor is a full-stack web application that analyzes brand visibility and competitive positioning using AI models. The application provides two main analysis modes:

1. **Brand Monitor**: Analyzes how AI models rank your brand against competitors
2. **Competitor Monitor**: Discovers which brands AI models recommend in response to specific queries

The application uses OpenRouter API for accessing multiple AI providers and provides comprehensive analysis of brand visibility across different AI models.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite for development and build processes
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Integration**: OpenRouter API for multiple AI model access
- **Session Management**: Express sessions with PostgreSQL storage

### Build System
- **Development**: tsx for TypeScript execution in development
- **Production**: esbuild for server bundling, Vite for client bundling
- **Database Migrations**: Drizzle Kit for schema management

## Key Components

### Database Schema
- **Users**: User authentication and management
- **Companies**: Extracted company information (name, URL, description, industry, etc.)
- **Brand Analyses**: Analysis configurations, progress tracking, and results storage
- **Results Structure**: Provider responses, competitor analysis, and insights

### Core Features
1. **Company Information Extraction**: Extracts company details from URLs (for brand monitoring)
2. **AI Provider Integration**: Supports multiple AI models via OpenRouter (GPT-4, Claude 3, Gemini Pro, Perplexity)
3. **Dual Analysis Modes**: 
   - Brand monitoring with industry-specific prompts
   - Competitor monitoring with custom user prompts
4. **Progress Tracking**: Real-time analysis progress monitoring
5. **Results Analysis**: 
   - Brand visibility scoring and competitor comparison
   - Competitor recommendation tracking showing which LLM recommends which brand
6. **Custom Prompt Support**: Users can add custom prompts for competitor analysis

## Recent Changes (July 24, 2025)
✓ **NEW LANDING PAGE**: Created OpenRouter-inspired homepage for brand monitoring platform
  - Built hero section showcasing single prompt execution across 50+ AI models
  - Added featured AI providers section with statistics (OpenAI GPT-4, Claude 3.5 Sonnet, Gemini Pro)
  - Included platform metrics section (12M+ brand queries, 50+ AI providers, 2.5k+ users)
  - Created features showcase highlighting multi-LLM analysis and competitive intelligence
  - Maintained BrandGEO branding with gradient styling and Flame logo
  - Added clear call-to-action directing users to competitor monitor functionality
  - Updated routing to use new landing page as homepage (/) with competitor monitor at /competitor-monitor

## Previous Changes (July 21, 2025)
✓ **MAJOR UPDATE**: Enhanced competitor monitor functionality with AI-powered analysis pipeline:
  - GPT-4.1 prompt enhancement: Original user prompts are enhanced to force structured brand ranking
  - Structured output: AI providers return JSON with positives/negatives for each brand
  - Gemini 2.5 Pro super aggregator: Processes all results to create comprehensive reports
  - Two-view reporting system: By AI Provider and By Brand (similar to customer review format)
✓ Updated schema to support enhanced competitor analysis data structure
✓ Created new backend functions:
  - `generateEnhancedPrompt()`: Uses GPT-4.1 to create detailed ranking prompts
  - `callOpenRouterWithStructuredOutput()`: Requests JSON responses with positives/negatives
  - Enhanced `processCompetitorResults()`: Creates aggregated analysis with dual report views
✓ Built new frontend components:
  - `EnhancedCompetitorResults`: Displays "AI Providers think" format similar to customer reviews
  - Two-tab system: "Report by Brand" and "Report by AI Provider"
  - Enhanced prompt display showing GPT-4.1 generated analysis instructions
✓ Integrated conditional rendering: Uses enhanced view when aggregated analysis available
✓ Maintained backward compatibility with existing competitor analysis for fallback
✓ **CRITICAL FIX**: Fixed structured response fallback processing in Gemini super aggregator
  - Resolved issue where fallback ignored structured AI responses when Gemini JSON parsing failed
  - Enhanced fallback now processes authentic data from all AI providers (Gemini 2.5, Claude 3.7, GPT-4.1, Grok 4)
  - Successfully displays comprehensive brand analysis with "AI Providers think" format using real provider insights
  - Validates multi-provider analysis with up to 10 brands and 4 AI providers contributing structured rankings
✓ **UI REFINEMENTS**: Enhanced competitor monitor interface for better usability
  - Added copy icon to enhanced prompt display for easy copying of GPT-4.1 generated prompts
  - Made AI summary more succinct (3-4 sentences) instead of verbose descriptions
  - Removed hardcoded scoring text and made summaries dynamic based on actual provider data
  - Implemented collapsible provider insights (collapsed by default) to clean up brand card interface
✓ **FINAL POLISH**: Improved ranking display and brand deduplication
  - Fixed ranking display to show proper positions (1st, 2nd, 3rd) instead of average scores
  - Removed "AI providers appreciate" prefix from brand summaries for cleaner text
  - Enhanced Gemini super aggregator with explicit brand deduplication instructions
  - Added examples for consolidating variations like "RBC Royal Bank" vs "Royal Bank of Canada (RBC)"

## Previous Changes (July 19, 2025)
✓ Updated branding from "FireGEO Monitor" to "BrandGEO Monitor"
✓ Added competitor monitoring functionality with custom prompts
✓ Implemented dual-mode interface (Brand Monitor / Competitor Monitor)
✓ Added competitor results display showing which AI models recommend which brands
✓ Enhanced schema to support competitor analysis type and results
✓ Created competitor-specific UI components and analysis workflows
✓ Updated AI provider models to latest OpenRouter models:
  - Gemini 2.5, DeepSeek v3, Grok 4, OpenAI GPT4.1, Claude 4, Kimi K2, Claude 3.7
✓ Implemented real-time results display during competitor analysis processing
✓ Fixed competitor analysis backend to work without company requirement
✓ Successfully integrated OpenRouter API with real API key authentication
✓ Enhanced brand extraction patterns to identify software platforms and tools
✓ Validated multi-provider analysis with Gemini 2.5, Claude 3.7, and Kimi K2
✓ Implemented comprehensive error handling for rate limits and API failures
✓ Integrated Gemini 2.5 API for post-processing competitor analysis results
✓ Created enhanced "Top Recommended Brands" section with proper brand names and reasoning
✓ Added "Results by Prompt" section with green + and orange - sentiment indicators
✓ Implemented fallback handling for both Gemini processing and OpenRouter failuresssing and basic extraction methods

### UI Components
- **Dashboard**: Main interface with sidebar navigation
- **URL Input Section**: Company URL extraction and API key management
- **Industry Prompts**: Industry-specific analysis configuration
- **Progress Tracking**: Real-time analysis status updates
- **Results Display**: Tabbed interface showing analysis results

## Data Flow

1. **User Input**: User provides company URL and configures analysis parameters
2. **Company Extraction**: System extracts company information (mock implementation)
3. **Analysis Configuration**: User selects AI providers, prompts, and settings
4. **AI Processing**: System queries multiple AI providers with configured prompts
5. **Results Aggregation**: Responses are analyzed for brand mentions and scoring
6. **Visualization**: Results are displayed with competitive analysis and insights

## External Dependencies

### AI Integration
- **OpenRouter API**: Primary integration for accessing multiple AI models
- **Supported Models**: OpenAI GPT-4, Anthropic Claude, Google Gemini, Perplexity Sonar
- **Authentication**: API key-based authentication

### Database
- **Neon Database**: Serverless PostgreSQL provider
- **Connection**: Environment-based connection string
- **ORM**: Drizzle ORM with TypeScript type safety

### Development Tools
- **Replit Integration**: Development environment optimizations
- **Error Handling**: Runtime error overlay for development
- **Hot Reload**: Vite HMR for frontend, tsx for backend

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR
- **Backend**: tsx with auto-restart
- **Database**: Development database via Neon
- **Environment**: Replit-optimized development setup

### Production Build
- **Frontend**: Static assets built with Vite
- **Backend**: Bundled with esbuild for Node.js deployment
- **Database**: Production PostgreSQL via Neon
- **Serving**: Express serves both API and static frontend

### Configuration Management
- **Environment Variables**: Database URL, API keys
- **Build Scripts**: Separate development and production configurations
- **Type Safety**: Full TypeScript coverage across frontend and backend

The application follows a monorepo structure with shared TypeScript types between frontend and backend, ensuring type safety across the entire stack. The architecture supports real-time analysis tracking and can be extended to support additional AI providers and analysis types.
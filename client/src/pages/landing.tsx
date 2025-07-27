import { useState, useEffect } from "react";
import { Flame, ArrowRight, Zap, Target, Users, BarChart3, Brain, Search, Star, ChevronRight, Play, Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";

// Featured AI Provider data
const featuredProviders = [
  {
    name: "OpenAI GPT-4.1",
    provider: "openai",
    domain: "openai.com",
    sentiment: "positive",
    mentionFreq: "High",
    confidence: "94%",
    lastUpdated: "2h ago",
    color: "bg-emerald-50 text-emerald-700"
  },
  {
    name: "Claude 3.7 Sonnet", 
    provider: "anthropic",
    domain: "anthropic.com",
    sentiment: "positive",
    mentionFreq: "High", 
    confidence: "92%",
    lastUpdated: "1h ago",
    color: "bg-blue-50 text-blue-700"
  },
  {
    name: "Gemini 2.5 Pro",
    provider: "google", 
    domain: "google.com",
    sentiment: "neutral",
    mentionFreq: "Medium",
    confidence: "89%",
    lastUpdated: "3h ago", 
    color: "bg-violet-50 text-violet-700"
  }
];

// Rotating placeholder examples
const placeholderExamples = [
  "Which fitness tracker is best for beginners?",
  "Why do people prefer Brand A over Brand B?",
  "Is Brand A better than Brand B for finance?",
  "Top luxury hotels in Paris?",
  "Why do people choose Tesla over BMW?",
  "Best project management tools for teams?",
  "Which smartphone has the best camera?"
];

// Helper function to get sentiment emoji
const getSentimentEmoji = (sentiment: string) => {
  switch (sentiment) {
    case "positive": return "🟢";
    case "neutral": return "🟡";
    case "negative": return "🔴";
    default: return "🟡";
  }
};

const stats = [
  { value: "12M+", label: "Brand Queries", description: "Monthly brand analysis requests" },
  { value: "50+", label: "AI Providers", description: "Connected AI model providers" },
  { value: "2.5k+", label: "Active Users", description: "Businesses monitoring brands" },
  { value: "95%", label: "Accuracy", description: "Brand mention detection rate" }
];

const features = [
  {
    icon: Brain,
    title: "Multi-LLM Analysis",
    description: "Execute brand queries across 50+ AI models simultaneously for comprehensive insights"
  },
  {
    icon: Target,
    title: "Brand Positioning",
    description: "Track how your brand ranks against competitors in AI recommendations"
  },
  {
    icon: BarChart3,
    title: "Real-time Intelligence",
    description: "Get instant insights on brand perception across different AI providers"
  },
  {
    icon: Search,
    title: "Competitive Analysis",
    description: "Monitor competitor mentions and positioning in AI responses"
  }
];

export default function Landing() {
  const [demoPrompt, setDemoPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BrandGEO Monitor</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/competitor-monitor" className="text-gray-600 hover:text-gray-900 transition-colors">
                Try Demo
              </Link>
              <Button variant="outline" size="sm">
                Sign In
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-16 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <Badge className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 font-medium mb-6">
                  <Zap className="w-4 h-4 mr-2" />
                  AI-Powered Brand Intelligence
                </Badge>
                
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                  The Unified Platform For{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Brand Monitoring
                  </span>
                </h1>
                
                <p className="text-xl font-semibold text-gray-700 mb-8 max-w-2xl leading-relaxed">
                  Instantly see how the world's leading AI models perceive your brand and your competitors.
                </p>

                {/* Demo Input */}
                <div className="relative mb-8">
                  <div className="flex max-w-2xl">
                    <Input
                      value={demoPrompt}
                      onChange={(e) => setDemoPrompt(e.target.value)}
                      placeholder={placeholderExamples[placeholderIndex]}
                      className="text-lg px-6 py-4 h-14 border-2 border-gray-200 rounded-l-xl focus:border-blue-500 focus:ring-0 transition-all duration-300"
                    />
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8 h-14 rounded-l-none rounded-r-xl"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 text-left">
                    ✨ Analyze across OpenAI, Anthropic, Google, and 47+ more providers
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    View Demo Results
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8"
                    asChild
                  >
                    <Link href="/competitor-monitor">
                      Start Free Analysis
                      <Search className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right Content - Featured Providers */}
              <div className="relative">
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">AI Models Are Choosing Favorites. Where Do You Stand?</h3>
                    <Badge variant="secondary" className="text-xs">
                      View All 50+
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {featuredProviders.map((provider, index) => (
                      <div key={provider.name} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${provider.color}`}>
                            <img 
                              src={`https://www.google.com/s2/favicons?domain=${provider.domain}&sz=32`}
                              alt={provider.name}
                              className="w-6 h-6"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'block';
                                }
                              }}
                            />
                            <span className="text-lg hidden">{provider.provider === 'openai' ? '🤖' : provider.provider === 'anthropic' ? '🧠' : '💎'}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                            <p className="text-sm text-gray-500">by {provider.provider}</p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="text-center">
                              <div className="flex items-center justify-center">
                                <span className="text-lg">{getSentimentEmoji(provider.sentiment)}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Sentiment</p>
                            </div>
                            <div>
                              <span className="font-semibold text-blue-600">{provider.mentionFreq}</span>
                              <p className="text-xs text-gray-500">Frequency</p>
                            </div>
                            <div>
                              <span className="font-semibold text-emerald-600">{provider.confidence}</span>
                              <p className="text-xs text-gray-500">Confidence</p>
                            </div>
                            <div>
                              <span className="font-semibold text-gray-600">{provider.lastUpdated}</span>
                              <p className="text-xs text-gray-500">Updated</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual Summary - Sentiment Spectrum */}
                <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h4 className="text-sm font-semibold text-gray-700 mb-6">Brand Sentiment Spectrum</h4>
                  <div className="relative pb-8">
                    {/* Enhanced gradient bar */}
                    <div className="h-3 bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400 rounded-full shadow-sm"></div>
                    
                    {/* Sentiment markers positioned correctly */}
                    <div className="absolute -top-2 w-full">
                      {/* GPT-4.1 - Positive (right side) */}
                      <div className="absolute" style={{left: '82%'}}>
                        <div className="w-4 h-4 bg-emerald-500 rounded-full shadow-md border-2 border-white"></div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">GPT-4.1</span>
                        </div>
                      </div>
                      
                      {/* Claude - Positive (right-center) */}
                      <div className="absolute" style={{left: '75%'}}>
                        <div className="w-4 h-4 bg-emerald-400 rounded-full shadow-md border-2 border-white"></div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">Claude</span>
                        </div>
                      </div>
                      
                      {/* Gemini - Neutral (center) */}
                      <div className="absolute" style={{left: '50%'}}>
                        <div className="w-4 h-4 bg-amber-400 rounded-full shadow-md border-2 border-white"></div>
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                          <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-md">Gemini</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Labels */}
                    <div className="flex justify-between items-center mt-8">
                      <span className="text-xs font-medium text-red-500">Negative</span>
                      <span className="text-xs font-medium text-amber-500">Neutral</span>
                      <span className="text-xs font-medium text-emerald-500">Positive</span>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full opacity-10 animate-pulse animation-delay-200"></div>
              </div>
            </div>
          </div>
        </section>



        {/* Features Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium mb-6">
                <Star className="w-4 h-4 mr-2" />
                Powerful Features
              </Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Everything you need for brand intelligence
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Monitor your brand across the entire AI ecosystem with advanced analytics and real-time insights
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <feature.icon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to monitor your brand across 50+ AI models?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses using BrandGEO Monitor to track their brand perception and competitive positioning in the AI era.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                asChild
              >
                <Link href="/competitor-monitor">
                  Start Free Analysis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">BrandGEO Monitor</span>
            </div>
            
            {/* Open Source Badge */}
            <div className="flex items-center space-x-6">
              <a 
                href="https://github.com/sabyasm/BrandPulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Made with</span>
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-sm">by humans and AI</span>
                <span className="text-gray-400">|</span>
                <Github className="w-4 h-4 text-white" />
                <span className="text-sm font-medium">Open Source</span>
              </a>
              <div className="text-gray-400 text-sm">
                © 2025 BrandGEO Monitor. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
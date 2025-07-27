import { useState } from "react";
import { Flame, Menu, X, Coins, ChevronDown, Users, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import CompetitorPromptSection from "../brand-monitor/competitor-prompt-section";
import CompetitorAnalysisControls from "./competitor-analysis-controls";
import AnalysisProgress from "../brand-monitor/analysis-progress";
import CompetitorResults from "../brand-monitor/competitor-results";
import AnalysisHistorySidebar from "../brand-monitor/analysis-history-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import type { BrandAnalysis } from "@shared/schema";

export default function CompetitorMonitorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const [competitorPrompts, setCompetitorPrompts] = useState<string[]>([]);
  const isMobile = useIsMobile();
  
  // Fetch analyses data
  const { data: analyses } = useQuery<BrandAnalysis[]>({
    queryKey: ["/api/brand-monitor/analyses"],
  });
  
  const selectedAnalysis = analyses?.find(analysis => analysis.id === selectedAnalysisId);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
              <Link 
                href="/brand-monitor"
                className="text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 text-sm font-medium"
              >
                Brand Monitor
              </Link>
              <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-blue-700 font-medium text-sm">Competitor Monitor</span>
              </div>
              <a 
                href="https://github.com/sabyasm/BrandPulse" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 transition-colors flex items-center space-x-2 px-3 py-2 text-sm font-medium"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <AnalysisHistorySidebar
          isOpen={sidebarOpen}
          onToggle={setSidebarOpen}
          selectedAnalysisId={selectedAnalysisId}
          onSelectAnalysis={setSelectedAnalysisId}
          isMobile={isMobile}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {selectedAnalysisId && selectedAnalysis ? (
              <CompetitorResults analysis={selectedAnalysis} />
            ) : (
              <>
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
                    <Flame className="w-4 h-4 mr-2" />
                    AI-Powered Competitor Intelligence
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                    Monitor AI Competitor Recommendations
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Discover which brands AI models recommend in response to specific queries and understand competitive positioning across multiple AI providers.
                  </p>
                </div>

                {/* Analysis Configuration */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                  {/* Competitor Prompts Section */}
                  <div className="lg:col-span-2">
                    <CompetitorPromptSection 
                      onPromptsChange={setCompetitorPrompts}
                    />
                  </div>
                </div>

                {/* Analysis Controls */}
                <CompetitorAnalysisControls 
                  prompts={competitorPrompts}
                />

                {/* Progress Section */}
                <AnalysisProgress />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
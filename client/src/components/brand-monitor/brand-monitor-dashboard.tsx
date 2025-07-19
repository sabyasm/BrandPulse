import { useState } from "react";
import { Flame, Menu, X, Coins, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import UrlInputSection from "./url-input-section";
import CompanyInfoCard from "./company-info-card";
import IndustryPromptsSection from "./industry-prompts-section";
import AnalysisControls from "./analysis-controls";
import AnalysisProgress from "./analysis-progress";
import AnalysisResults from "./analysis-results";
import AnalysisHistorySidebar from "./analysis-history-sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function BrandMonitorDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Flame className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">FireGEO Monitor</h1>
              </div>
              
              {/* Navigation Pills */}
              <nav className="hidden lg:flex space-x-1">
                <Button variant="secondary" size="sm" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  Brand Monitor
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Analytics
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  Reports
                </Button>
              </nav>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Credits Display */}
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <Coins className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700 text-sm font-medium">47 credits</span>
              </div>

              {/* User Menu */}
              <div className="relative">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JD</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-gray-400" />
                </Button>
              </div>

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
            {selectedAnalysisId ? (
              <AnalysisResults analysisId={selectedAnalysisId} />
            ) : (
              <>
                {/* Hero Section */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100 text-violet-700 text-sm font-medium mb-4">
                    <Flame className="w-4 h-4 mr-2" />
                    AI-Powered Brand Intelligence
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                    Track Your Brand's AI Visibility
                  </h1>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Analyze how AI models rank your brand against competitors across multiple providers and optimize your digital presence.
                  </p>
                </div>

                <UrlInputSection />
                <CompanyInfoCard />
                <IndustryPromptsSection />
                <AnalysisControls />
                <AnalysisProgress />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

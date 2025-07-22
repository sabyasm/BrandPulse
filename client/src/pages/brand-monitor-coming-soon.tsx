import { Flame, Clock, Target, Star, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function BrandMonitorComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">BrandGEO Monitor</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>Go to Competitor Monitor</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-8">
            <Clock className="w-4 h-4 mr-2" />
            Coming Soon
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Brand Monitor
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Track your brand's AI visibility across multiple providers and optimize your digital presence. 
            We're putting the finishing touches on this powerful feature.
          </p>

          {/* Features Preview */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-dashed border-gray-200 bg-white/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Brand Visibility Tracking</h3>
                <p className="text-gray-600 text-sm">Monitor how AI models rank your brand against competitors</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-gray-200 bg-white/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Competitive Analysis</h3>
                <p className="text-gray-600 text-sm">Understand your position in AI-driven recommendations</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-dashed border-gray-200 bg-white/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Real-time Insights</h3>
                <p className="text-gray-600 text-sm">Get actionable insights to improve your brand presence</p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Meanwhile, Try Our Competitor Monitor
            </h2>
            <p className="text-gray-600 mb-6">
              Discover which brands AI models recommend and understand competitive positioning with our fully functional competitor analysis tool.
            </p>
            <Button 
              size="lg" 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Start Competitor Analysis
            </Button>
          </div>

          {/* Timeline */}
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Expected Launch: Q2 2025 • 
              <a href="/" className="text-blue-600 hover:text-blue-700 ml-1">
                Subscribe for updates
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
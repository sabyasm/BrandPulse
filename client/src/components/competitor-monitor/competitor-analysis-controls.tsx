import { useState } from "react";
import { Play, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useBrandAnalysis } from "@/hooks/use-brand-analysis";
import { AVAILABLE_MODELS } from "@/lib/openrouter";



interface CompetitorAnalysisControlsProps {
  prompts: string[];
}

export default function CompetitorAnalysisControls({ prompts }: CompetitorAnalysisControlsProps) {
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "deepseek/deepseek-chat-v3-0324",
    "openai/gpt-4o-mini"
  ]);
  
  const { startAnalysis, isStartingAnalysis } = useBrandAnalysis();

  const handleStartAnalysis = async () => {
    if (selectedProviders.length === 0) {
      alert("Please select at least one AI provider");
      return;
    }

    if (prompts.length === 0) {
      alert("Please add at least one prompt");
      return;
    }
    
    try {
      await startAnalysis.mutateAsync({
        companyId: 0, // Not needed for competitor analysis
        apiKey: "env", // Signal to use environment variable
        selectedProviders,
        selectedPrompts: prompts,
        webSearchEnabled,
        title: `Competitor Analysis - ${new Date().toLocaleDateString()}`,
        analysisType: "competitor",
      });
    } catch (error) {
      console.error("Failed to start competitor analysis:", error);
    }
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Play className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analysis Configuration</h2>
            <p className="text-sm text-gray-600">Configure AI providers and start your competitive analysis</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key Status */}
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-700">OpenRouter API Key</p>
              <p className="text-xs text-green-600">Connected via environment variable</p>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
              Ready
            </Badge>
          </div>

          {/* AI Provider Selection */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-4 block">
              AI Model Providers ({selectedProviders.length} selected)
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`relative rounded-xl border-2 transition-all duration-200 cursor-pointer group hover:shadow-lg ${
                    selectedProviders.includes(model.id)
                      ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => toggleProvider(model.id)}
                >
                  <div className="p-4">
                    {/* Selection Indicator */}
                    <div className={`absolute top-3 right-3 w-4 h-4 rounded-full border-2 transition-all ${
                      selectedProviders.includes(model.id)
                        ? "bg-blue-500 border-blue-500"
                        : "border-gray-300 group-hover:border-blue-400"
                    }`}>
                      {selectedProviders.includes(model.id) && (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Provider Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 p-2 ${
                      selectedProviders.includes(model.id)
                        ? "bg-blue-500"
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                      <img 
                        src={`https://www.google.com/s2/favicons?domain=${(() => {
                          const domainMap: Record<string, string> = {
                            "Google": "google.com",
                            "DeepSeek": "deepseek.com", 
                            "xAI": "x.ai",
                            "OpenAI": "openai.com",
                            "Anthropic": "anthropic.com",
                            "MoonshotAI": "moonshot.ai"
                          };
                          return domainMap[model.provider] || model.provider.toLowerCase() + ".com";
                        })()}&sz=64`}
                        alt={`${model.provider} icon`}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          // Fallback to a generic icon if favicon fails
                          const target = e.currentTarget as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      {/* Fallback icon */}
                      <div 
                        className={`w-6 h-6 rounded-full hidden ${
                          selectedProviders.includes(model.id) ? "bg-white" : "bg-gray-400"
                        }`}
                        style={{ display: 'none' }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-600">
                          {model.provider.charAt(0)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Model Info */}
                    <div>
                      <h3 className={`font-semibold text-sm mb-1 ${
                        selectedProviders.includes(model.id) ? "text-blue-900" : "text-gray-900"
                      }`}>
                        {model.name}
                      </h3>
                      <p className={`text-xs ${
                        selectedProviders.includes(model.id) ? "text-blue-700" : "text-gray-500"
                      }`}>
                        {model.provider}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <div className="flex items-center space-x-3">
              <Switch 
                id="web-search" 
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
              <div className="flex-1">
                <Label htmlFor="web-search" className="text-sm font-medium text-gray-700">
                  Enable Web Search
                </Label>
                <p className="text-xs text-gray-500">
                  Allow AI models to use web search for more comprehensive responses
                </p>
              </div>
              <Globe className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Analysis Summary */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Analysis Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Prompts:</span>
                <span className="ml-2 font-medium">{prompts.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Providers:</span>
                <span className="ml-2 font-medium">{selectedProviders.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Total Queries:</span>
                <span className="ml-2 font-medium">{prompts.length * selectedProviders.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Web Search:</span>
                <span className="ml-2 font-medium">{webSearchEnabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>

          {/* Start Analysis Button */}
          <Button 
            onClick={handleStartAnalysis}
            disabled={isStartingAnalysis || selectedProviders.length === 0 || prompts.length === 0}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-5 h-5 mr-2" />
            {isStartingAnalysis ? "Starting Analysis..." : "Start Competitor Analysis"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
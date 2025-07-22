import { useState } from "react";
import { Play, Globe, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AVAILABLE_MODELS } from "@/lib/openrouter";
import type { BrandAnalysis } from "@shared/schema";



interface CompetitorAnalysisControlsProps {
  prompts: string[];
}

export default function CompetitorAnalysisControls({ prompts }: CompetitorAnalysisControlsProps) {
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([
    "deepseek/deepseek-chat-v3-0324",
    "openai/gpt-4o-mini"
  ]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const startAnalysis = useMutation({
    mutationFn: async (data: {
      companyId: number;
      apiKey: string;
      selectedProviders: string[];
      selectedPrompts: string[];
      webSearchEnabled: boolean;
      title: string;
      analysisType?: string;
    }) => {
      const response = await apiRequest("POST", "/api/brand-monitor/analyze", data);
      return response.json() as Promise<BrandAnalysis>;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-monitor/analyses"] });
      toast({
        title: "Analysis started",
        description: `Competitor analysis has begun`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed to start",
        description: error.message || "Failed to start competitor analysis",
        variant: "destructive",
      });
    },
  });

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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {AVAILABLE_MODELS.map((model) => (
                <div
                  key={model.id}
                  className={`relative rounded-lg border transition-all duration-200 cursor-pointer group hover:shadow-md ${
                    selectedProviders.includes(model.id)
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                  }`}
                  onClick={() => toggleProvider(model.id)}
                >
                  <div className="p-3 flex flex-col items-center text-center">
                    {/* Provider Icon */}
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-2 p-1.5 ${
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
                        className="w-5 h-5 object-contain"
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
                        className={`w-5 h-5 rounded-full hidden ${
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
                      <h3 className={`font-medium text-xs leading-tight ${
                        selectedProviders.includes(model.id) ? "text-blue-900" : "text-gray-900"
                      }`}>
                        {model.name}
                      </h3>
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
            disabled={startAnalysis.isPending || selectedProviders.length === 0 || prompts.length === 0}
            size="lg"
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Play className="w-5 h-5 mr-2" />
            {startAnalysis.isPending ? "Starting Analysis..." : "Start Competitor Analysis"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
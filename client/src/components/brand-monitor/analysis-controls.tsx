import { useState } from "react";
import { Play, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useBrandAnalysis } from "@/hooks/use-brand-analysis";
import { AVAILABLE_MODELS } from "@/lib/openrouter";

interface AnalysisControlsProps {
  mode?: "brand" | "competitor";
  prompts?: string[];
}

export default function AnalysisControls({ mode = "brand", prompts = [] }: AnalysisControlsProps) {
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  
  const { startAnalysis, testApiKey, isStartingAnalysis, isTestingApiKey } = useBrandAnalysis();

  const handleStartAnalysis = async () => {
    if (!apiKey) {
      alert("Please provide an OpenRouter API key");
      return;
    }
    
    if (selectedProviders.length === 0) {
      alert("Please select at least one AI provider");
      return;
    }

    if (mode === "brand") {
      // Brand analysis logic would go here
      console.log("Starting brand analysis...");
    } else {
      if (prompts.length === 0) {
        alert("Please add at least one prompt");
        return;
      }
      
      try {
        await startAnalysis.mutateAsync({
          companyId: 0, // Not needed for competitor analysis
          apiKey,
          selectedProviders,
          selectedPrompts: prompts,
          webSearchEnabled,
          title: `Competitor Analysis - ${new Date().toLocaleDateString()}`,
          analysisType: "competitor",
        });
      } catch (error) {
        console.error("Failed to start competitor analysis:", error);
      }
    }
  };

  const handleTestApiKey = async () => {
    if (!apiKey) return;
    
    try {
      await testApiKey.mutateAsync({ apiKey });
    } catch (error) {
      console.error("Failed to test API key:", error);
    }
  };

  const toggleProvider = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  const estimatedCost = selectedProviders.length * prompts.length;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        {/* API Key Input */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2">OpenRouter API Key</Label>
          <div className="flex space-x-3">
            <Input
              type="password"
              placeholder="Enter your OpenRouter API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline"
              onClick={handleTestApiKey}
              disabled={!apiKey || isTestingApiKey}
            >
              <Key className="w-4 h-4 mr-2" />
              {isTestingApiKey ? "Testing..." : "Test"}
            </Button>
          </div>
        </div>

        {/* Provider Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3">Select AI Providers</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {AVAILABLE_MODELS.map((model) => (
              <Button
                key={model.id}
                variant={selectedProviders.includes(model.id) ? "default" : "outline"}
                size="sm"
                className="text-center"
                onClick={() => toggleProvider(model.id)}
              >
                {model.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Analyze</h3>
            <p className="text-sm text-gray-600">
              {mode === "competitor" 
                ? `${prompts.length} prompts selected • ${selectedProviders.length} AI providers • Estimated cost: ${estimatedCost} credits`
                : `3 prompts selected • ${selectedProviders.length} AI providers • Estimated cost: ${estimatedCost} credits`
              }
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Web Search Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="web-search"
                checked={webSearchEnabled}
                onCheckedChange={setWebSearchEnabled}
              />
              <Label htmlFor="web-search" className="text-sm text-gray-700">
                Web Search
              </Label>
            </div>

            <Button 
              onClick={handleStartAnalysis}
              disabled={!apiKey || selectedProviders.length === 0 || isStartingAnalysis || (mode === "competitor" && prompts.length === 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              {isStartingAnalysis ? "Starting..." : `Start ${mode === "competitor" ? "Competitor" : "Brand"} Analysis`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}



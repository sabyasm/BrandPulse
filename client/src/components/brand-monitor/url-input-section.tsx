import { useState } from "react";
import { Link, Search, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useBrandAnalysis } from "@/hooks/use-brand-analysis";
import { AVAILABLE_MODELS } from "@/lib/openrouter";

export default function UrlInputSection() {
  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  
  const { extractCompany, testApiKey, isExtracting, isTestingApiKey } = useBrandAnalysis();

  const handleExtractInfo = async () => {
    if (!url) return;
    
    try {
      await extractCompany.mutateAsync({ url });
    } catch (error) {
      console.error("Failed to extract company info:", error);
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

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Link className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Company Analysis</h2>
            <p className="text-sm text-gray-600">Enter your company URL to extract information and begin analysis</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">Company Website URL</Label>
            <div className="flex space-x-3">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleExtractInfo} 
                disabled={!url || isExtracting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                {isExtracting ? "Extracting..." : "Extract Info"}
              </Button>
            </div>
          </div>

          {/* OpenRouter API Key */}
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2">OpenRouter API Key</Label>
            <div className="flex space-x-3">
              <div className="relative flex-1">
                <Input
                  type="password"
                  placeholder="Enter OpenRouter API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <Key className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
              </div>
              <Button 
                variant="outline" 
                onClick={handleTestApiKey}
                disabled={!apiKey || isTestingApiKey}
              >
                {isTestingApiKey ? "Testing..." : "Test Key"}
              </Button>
            </div>
          </div>

          {/* AI Provider Selection */}
          {apiKey && (
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">
                AI Model Providers ({selectedProviders.length} selected)
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_MODELS.map((model) => (
                  <Button
                    key={model.id}
                    variant="outline"
                    size="sm"
                    className={`p-3 transition-colors ${
                      selectedProviders.includes(model.id)
                        ? "border-blue-500 bg-blue-100 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                    onClick={() => toggleProvider(model.id)}
                  >
                    <span className="text-sm font-medium">{model.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

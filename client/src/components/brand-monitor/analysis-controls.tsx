import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function AnalysisControls() {
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);

  const handleStartAnalysis = () => {
    // This will be implemented with the analysis hook
    console.log("Starting analysis...");
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Ready to Analyze</h3>
            <p className="text-sm text-gray-600">3 prompts selected • 4 AI providers • Estimated cost: 8 credits</p>
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

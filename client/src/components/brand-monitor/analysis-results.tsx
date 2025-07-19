import { useQuery } from "@tanstack/react-query";
import { Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ResultsTabs from "./results-tabs";
import { apiRequest } from "@/lib/queryClient";
import type { BrandAnalysis } from "@shared/schema";

interface AnalysisResultsProps {
  analysisId: number;
}

export default function AnalysisResults({ analysisId }: AnalysisResultsProps) {
  const { data: analysis, isLoading } = useQuery<BrandAnalysis>({
    queryKey: ["/api/brand-monitor/analyses", analysisId],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analysis || analysis.status !== "completed") {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-600">Analysis not found or not completed yet.</p>
        </CardContent>
      </Card>
    );
  }

  const handleExport = () => {
    // Export functionality would be implemented here
    console.log("Exporting results...");
  };

  const handleSave = () => {
    // Save functionality would be implemented here
    console.log("Saving analysis...");
  };

  return (
    <div className="space-y-8">
      {/* Results Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
              <p className="text-gray-600">
                Brand visibility analysis across {analysis.selectedProviders.length} AI providers
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Save Analysis
              </Button>
            </div>
          </div>

          <ResultsTabs analysis={analysis} />
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from "react";
import { ServerCog, Check, Clock, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface AnalysisProgressProps {
  analysisId?: number;
  onComplete?: () => void;
}

export default function AnalysisProgress({ analysisId, onComplete }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Mock progress simulation - in real app this would track actual analysis
  useEffect(() => {
    if (!analysisId) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.random() * 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          onComplete?.();
          return 100;
        }
        
        // Update current step based on progress
        if (newProgress > 75) setCurrentStep(3);
        else if (newProgress > 50) setCurrentStep(2);
        else if (newProgress > 25) setCurrentStep(1);
        
        return newProgress;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [analysisId, onComplete]);

  const progressSteps = [
    {
      label: "Company information extracted",
      status: currentStep > 0 ? "complete" : "pending",
    },
    {
      label: "Analyzing with AI providers",
      status: currentStep > 1 ? "complete" : currentStep === 1 ? "in_progress" : "pending",
    },
    {
      label: "Generating visibility scores",
      status: currentStep > 2 ? "complete" : currentStep === 2 ? "in_progress" : "pending",
    },
    {
      label: "Competitor analysis",
      status: currentStep > 3 ? "complete" : currentStep === 3 ? "in_progress" : "pending",
    },
  ];

  if (!analysisId) return null;

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <ServerCog className="w-5 h-5 text-blue-600 animate-spin" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analysis in Progress</h3>
            <p className="text-sm text-gray-600">Processing your brand analysis across multiple AI providers</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          {progressSteps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg border ${
                step.status === "complete"
                  ? "bg-emerald-50 border-emerald-200"
                  : step.status === "in_progress"
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              {step.status === "complete" ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : step.status === "in_progress" ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Clock className="w-4 h-4 text-gray-400" />
              )}
              <span
                className={`text-sm ${
                  step.status === "complete"
                    ? "text-emerald-800"
                    : step.status === "in_progress"
                    ? "text-blue-800"
                    : "text-gray-600"
                }`}
              >
                {step.label}
              </span>
              <span
                className={`ml-auto text-xs ${
                  step.status === "complete"
                    ? "text-emerald-600"
                    : step.status === "in_progress"
                    ? "text-blue-600"
                    : "text-gray-500"
                }`}
              >
                {step.status === "complete"
                  ? "Complete"
                  : step.status === "in_progress"
                  ? "In Progress"
                  : "Pending"}
              </span>
            </div>
          ))}
        </div>

        {/* Cancel Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="ghost" className="text-gray-600 hover:text-red-600">
            Cancel Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

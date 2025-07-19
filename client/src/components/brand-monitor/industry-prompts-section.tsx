import { useState } from "react";
import { Building, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { INDUSTRY_PROMPTS, type IndustryType } from "@/lib/industry-prompts";

export default function IndustryPromptsSection() {
  const [selectedIndustry, setSelectedIndustry] = useState<IndustryType | null>(null);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);

  const handleSelectIndustry = (industry: IndustryType) => {
    setSelectedIndustry(industry);
    // Auto-select all prompts for the industry
    setSelectedPrompts(INDUSTRY_PROMPTS[industry]);
  };

  const removePrompt = (prompt: string) => {
    setSelectedPrompts(prev => prev.filter(p => p !== prompt));
  };

  const industryConfig = [
    {
      key: "technology" as IndustryType,
      icon: "💻",
      name: "Technology",
      description: "SaaS, AI, Cloud, DevTools",
    },
    {
      key: "finance" as IndustryType,
      icon: "📈",
      name: "Finance",
      description: "FinTech, Banking, Investment",
    },
    {
      key: "healthcare" as IndustryType,
      icon: "❤️",
      name: "Healthcare",
      description: "MedTech, Digital Health, Pharma",
    },
  ];

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
            <Building className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Industry Analysis Prompts</h2>
            <p className="text-sm text-gray-600">Select industry-specific prompts for comprehensive brand analysis</p>
          </div>
        </div>

        {/* Industry Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {industryConfig.map((industry) => (
            <Button
              key={industry.key}
              variant="outline"
              className={`p-4 h-auto text-left transition-colors group ${
                selectedIndustry === industry.key
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
              onClick={() => handleSelectIndustry(industry.key)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-lg">{industry.icon}</span>
                <span className="font-medium text-gray-900">{industry.name}</span>
              </div>
              <p className="text-sm text-gray-600">{industry.description}</p>
            </Button>
          ))}
        </div>

        {/* Selected Prompts Preview */}
        {selectedPrompts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Selected Analysis Prompts ({selectedPrompts.length})
            </h4>
            <div className="space-y-2">
              {selectedPrompts.map((prompt, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm text-gray-700">"{prompt}"</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={() => removePrompt(prompt)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

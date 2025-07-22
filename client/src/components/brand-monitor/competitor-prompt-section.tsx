import { useState, useEffect } from "react";
import { Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CompetitorPromptSectionProps {
  onPromptsChange: (prompts: string[]) => void;
}

export default function CompetitorPromptSection({ onPromptsChange }: CompetitorPromptSectionProps) {
  const [customPrompts, setCustomPrompts] = useState<string[]>([
    "Which bank should I choose if I am a new immigrant in Canada with no Canadian history?"
  ]);
  const [newPrompt, setNewPrompt] = useState("");

  // Notify parent of initial prompts on component mount
  useEffect(() => {
    onPromptsChange(customPrompts);
  }, []); // Only run on mount

  const predefinedPrompts = [
    "Which bank should I choose if I am a new immigrant in Canada with no Canadian history?",
    "What are the best credit cards for someone with no credit history in the US?",
    "Which insurance company offers the best rates for young drivers?",
    "What are the top 3 cloud providers for small businesses?",
    "Which CRM software is best for a startup with 10 employees?",
    "What are the most reliable project management tools for remote teams?",
  ];

  const addCustomPrompt = () => {
    if (newPrompt.trim() && !customPrompts.includes(newPrompt.trim())) {
      const updated = [...customPrompts, newPrompt.trim()];
      setCustomPrompts(updated);
      onPromptsChange(updated);
      setNewPrompt("");
    }
  };

  const addPredefinedPrompt = (prompt: string) => {
    if (!customPrompts.includes(prompt)) {
      const updated = [...customPrompts, prompt];
      setCustomPrompts(updated);
      onPromptsChange(updated);
    }
  };

  const removePrompt = (index: number) => {
    const updated = customPrompts.filter((_, i) => i !== index);
    setCustomPrompts(updated);
    onPromptsChange(updated);
  };

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
            <Users className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Analysis Prompts</h2>
        </div>
        <p className="text-sm text-gray-600 ml-11">Add prompts to discover which brands AI models recommend</p>
      </div>

      {/* Add Custom Prompt */}
      <div className="mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="p-4">
            <div className="flex space-x-3">
              <Textarea
                placeholder="e.g., Which software development platform is best for a startup team?"
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                className="flex-1 min-h-[60px] border-0 bg-gray-50 resize-none focus:bg-white transition-colors"
              />
              <Button 
                onClick={addCustomPrompt}
                disabled={!newPrompt.trim()}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-sm px-4 h-auto py-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Predefined Prompts */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Templates</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          {predefinedPrompts.map((prompt, index) => (
            <button
              key={index}
              className={`text-left p-3 rounded-lg border transition-all duration-200 ${
                customPrompts.includes(prompt)
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : "border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm hover:bg-violet-50"
              }`}
              onClick={() => addPredefinedPrompt(prompt)}
              disabled={customPrompts.includes(prompt)}
            >
              <span className="text-sm text-gray-700 leading-relaxed">{prompt}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Prompts */}
      {customPrompts.length > 0 && (
        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-900">Selected Prompts</h4>
            <Badge variant="secondary" className="bg-violet-100 text-violet-700 border-violet-200">
              {customPrompts.length}
            </Badge>
          </div>
          <div className="space-y-2">
            {customPrompts.map((prompt, index) => (
              <div 
                key={index} 
                className="group flex items-start justify-between p-3 bg-white rounded-lg border border-white shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <span className="text-sm text-gray-700 flex-1 mr-3 leading-relaxed">{prompt}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  onClick={() => removePrompt(index)}
                >
                  <X className="w-3 h-3 text-gray-400 hover:text-red-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
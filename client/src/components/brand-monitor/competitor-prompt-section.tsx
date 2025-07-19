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
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Competitor Analysis Prompts</h2>
            <p className="text-sm text-gray-600">Add custom prompts to see which brands AI models recommend</p>
          </div>
        </div>

        {/* Add Custom Prompt */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-2">Add Custom Prompt</Label>
          <div className="flex space-x-3">
            <Textarea
              placeholder="e.g., Which software development platform is best for a startup team?"
              value={newPrompt}
              onChange={(e) => setNewPrompt(e.target.value)}
              className="flex-1 min-h-[80px]"
            />
            <Button 
              onClick={addCustomPrompt}
              disabled={!newPrompt.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </div>

        {/* Predefined Prompts */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-gray-700 mb-3">Quick Add Prompts</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {predefinedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="text-left h-auto p-3 justify-start"
                onClick={() => addPredefinedPrompt(prompt)}
                disabled={customPrompts.includes(prompt)}
              >
                <span className="text-sm text-gray-700 line-clamp-2">{prompt}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Selected Prompts */}
        {customPrompts.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Selected Prompts ({customPrompts.length})
            </h4>
            <div className="space-y-2">
              {customPrompts.map((prompt, index) => (
                <div key={index} className="flex items-start justify-between p-3 bg-white rounded border">
                  <span className="text-sm text-gray-700 flex-1 mr-3">{prompt}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500 flex-shrink-0"
                    onClick={() => removePrompt(index)}
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
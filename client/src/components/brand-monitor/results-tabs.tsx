import { useState } from "react";
import { Eye, Trophy, BarChart3, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { BrandAnalysis } from "@shared/schema";

interface ResultsTabsProps {
  analysis: BrandAnalysis;
}

export default function ResultsTabs({ analysis }: ResultsTabsProps) {
  const { results, overallScore, topProvider, improvementArea } = analysis;

  if (!results) return null;

  const { providerResponses, competitors, insights } = results;

  // Calculate provider scores
  const providerScores = analysis.selectedProviders.map(provider => {
    const responses = providerResponses.filter(r => r.provider.includes(provider));
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
    const avgScore = responses.length > 0 ? Math.round(totalScore / responses.length) : 0;
    
    return {
      provider,
      score: avgScore,
      responses: responses.length,
      mentions: responses.filter(r => r.brandMentioned).length,
    };
  });

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="comparison">Comparison</TabsTrigger>
        <TabsTrigger value="responses">AI Responses</TabsTrigger>
        <TabsTrigger value="competitors">Competitors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6 mt-6">
        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Overall Visibility</h3>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-600 mb-2">{overallScore}%</div>
              <p className="text-sm text-gray-600">Across all AI providers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Top Performer</h3>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">{topProvider}</div>
              <p className="text-sm text-gray-600">Best mention rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Needs Improvement</h3>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-amber-600 mb-2">{improvementArea}</div>
              <p className="text-sm text-gray-600">Room for optimization</p>
            </CardContent>
          </Card>
        </div>

        {/* Provider Performance Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Provider Performance Overview</h3>
            <div className="space-y-4">
              {providerScores.map((provider, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-24 text-sm font-medium text-gray-700">{provider.provider}</div>
                  <div className="flex-1">
                    <Progress value={provider.score} className="h-3" />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-12">{provider.score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="comparison" className="space-y-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Brand Mention Comparison Matrix</h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Prompt</th>
                    {analysis.selectedProviders.map(provider => (
                      <th key={provider} className="text-center py-3 px-4 font-medium text-gray-900">
                        {provider}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {analysis.selectedPrompts.map((prompt, promptIndex) => (
                    <tr key={promptIndex}>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-900 max-w-xs">{prompt}</div>
                      </td>
                      {analysis.selectedProviders.map(provider => {
                        const response = providerResponses.find(
                          r => r.prompt === prompt && r.provider.includes(provider)
                        );
                        
                        return (
                          <td key={provider} className="py-4 px-4 text-center">
                            {response?.brandMentioned ? (
                              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                {response.position ? `#${response.position} Mentioned` : "Mentioned"}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                                Not Mentioned
                              </Badge>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="responses" className="space-y-6 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {providerResponses.slice(0, 6).map((response, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{response.provider}</h4>
                  <Badge 
                    variant={response.brandMentioned ? "secondary" : "outline"}
                    className={response.brandMentioned ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}
                  >
                    {response.brandMentioned ? "Brand Mentioned" : "Not Mentioned"}
                  </Badge>
                </div>
                
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Prompt: "{response.prompt}"
                  </h5>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {response.response}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    {response.position ? `Position: #${response.position}` : "Position: Not mentioned"}
                  </span>
                  <span className="text-blue-600 font-medium">Score: {response.score}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="competitors" className="space-y-6 mt-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Identified Competitors</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitors.map((competitor, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {competitor.name.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                      <p className="text-xs text-gray-500">Direct Competitor</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mentions:</span>
                      <span className="font-medium">
                        {competitor.mentions}/{competitor.totalPrompts} ({Math.round((competitor.mentions / competitor.totalPrompts) * 100)}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg. Position:</span>
                      <span className="font-medium">#{competitor.averagePosition}</span>
                    </div>
                  </div>
                  
                  <Progress 
                    value={(competitor.mentions / competitor.totalPrompts) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Competitive Insights</h3>
            
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`rounded-lg p-4 border ${
                    insight.type === "opportunity"
                      ? "bg-blue-50 border-blue-200"
                      : insight.type === "gap"
                      ? "bg-amber-50 border-amber-200"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                      insight.type === "opportunity"
                        ? "bg-blue-100 text-blue-600"
                        : insight.type === "gap"
                        ? "bg-amber-100 text-amber-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {insight.type === "opportunity" ? "💡" : insight.type === "gap" ? "⚠️" : "✅"}
                    </div>
                    <div>
                      <h4 className={`font-medium mb-1 ${
                        insight.type === "opportunity"
                          ? "text-blue-900"
                          : insight.type === "gap"
                          ? "text-amber-900"
                          : "text-emerald-900"
                      }`}>
                        {insight.title}
                      </h4>
                      <p className={`text-sm ${
                        insight.type === "opportunity"
                          ? "text-blue-800"
                          : insight.type === "gap"
                          ? "text-amber-800"
                          : "text-emerald-800"
                      }`}>
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

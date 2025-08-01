import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, TrendingUp, Eye, Plus, Minus } from "lucide-react";
import type { BrandAnalysis } from "@shared/schema";
import EnhancedCompetitorResults from "./enhanced-competitor-results";
import { BrandLogoWithName } from "@/components/ui/brand-logo";

interface CompetitorResultsProps {
  analysis: BrandAnalysis;
}

export default function CompetitorResults({ analysis }: CompetitorResultsProps) {
  const { results } = analysis;
  
  if (!results?.competitorResults) return null;

  // Check if we have enhanced aggregated analysis
  if (results.aggregatedAnalysis) {
    return <EnhancedCompetitorResults analysis={analysis} />;
  }

  const { competitorResults } = results;
  
  // Check if we have Gemini-processed results
  const hasProcessedResults = (results as any)?.processedResults;
  const processedResults = hasProcessedResults ? (results as any).processedResults : null;

  // Aggregate brand mentions across all prompts and providers
  const brandMentions = new Map<string, { 
    count: number; 
    avgRanking: number; 
    providers: string[];
    contexts: string[];
  }>();

  competitorResults.forEach(result => {
    result.recommendedBrands.forEach(brand => {
      const key = brand.name.toLowerCase();
      const existing = brandMentions.get(key) || {
        count: 0,
        avgRanking: 0,
        providers: [],
        contexts: []
      };
      
      existing.count++;
      existing.avgRanking = ((existing.avgRanking * (existing.count - 1)) + brand.ranking) / existing.count;
      
      if (!existing.providers.includes(result.provider)) {
        existing.providers.push(result.provider);
      }
      
      existing.contexts.push(brand.reason);
      brandMentions.set(key, existing);
    });
  });

  // Sort brands by frequency and ranking
  const topBrands = Array.from(brandMentions.entries())
    .map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      ...data
    }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.avgRanking - b.avgRanking;
    });

  return (
    <div className="space-y-8">
      {/* Top Recommended Brands */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Crown className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Recommended Brands</h3>
              <p className="text-sm text-gray-600">Brands most frequently recommended across all AI providers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedResults ? (
              // Show Gemini-processed top brands
              processedResults.topRecommendedBrands.slice(0, 6).map((brand: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{brand.name}</h4>
                    <div className="flex items-center space-x-2">
                      {brand.sentiment === 'positive' ? (
                        <Plus className="w-4 h-4 text-green-600" />
                      ) : (
                        <Minus className="w-4 h-4 text-orange-600" />
                      )}
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        {brand.score}/10
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">{brand.reasoning}</p>
                </div>
              ))
            ) : (
              // Fallback to old extraction method with brand logos
              topBrands.slice(0, 6).map((brand, index) => {
                // Get brand info from the first mention of this brand
                const firstMention = competitorResults
                  .flatMap(result => result.recommendedBrands)
                  .find(b => b.name.toLowerCase() === brand.name.toLowerCase());
                const brandInfo = firstMention?.brandInfo;
                
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <BrandLogoWithName 
                        brandInfo={brandInfo}
                        brandName={brand.name}
                        size="sm"
                      />
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                        #{Math.round(brand.avgRanking)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mentions:</span>
                        <span className="font-medium">{brand.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Providers:</span>
                        <span className="font-medium">{brand.providers.length}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Tabs defaultValue="by-prompt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="by-prompt">Results by Prompt</TabsTrigger>
          <TabsTrigger value="by-provider">Results by Provider</TabsTrigger>
        </TabsList>

        <TabsContent value="by-prompt" className="space-y-6 mt-6">
          {processedResults ? (
            // Show Gemini-processed results by prompt
            processedResults.resultsByPrompt.map((promptData: any, promptIndex: number) => (
              <Card key={promptIndex}>
                <CardContent className="p-6">
                  <h4 className="font-medium text-gray-900 mb-4">"{promptData.prompt}"</h4>
                  
                  <div className="space-y-4">
                    {promptData.providers.map((provider: any, providerIndex: number) => (
                      <div key={providerIndex} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            {provider.provider}
                          </Badge>
                          <div className="flex items-center space-x-2">
                            {provider.sentiment === 'positive' ? (
                              <Plus className="w-4 h-4 text-green-600" />
                            ) : (
                              <Minus className="w-4 h-4 text-orange-600" />
                            )}
                            <span className="text-sm text-gray-500">Recommended</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">{provider.recommendedBrand}</span>
                                {provider.sentiment === 'positive' ? (
                                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                                    Positive
                                  </Badge>
                                ) : (
                                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                                    Caution
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{provider.reasoning}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            // Fallback to old method
            analysis.selectedPrompts.map((prompt, promptIndex) => {
              const promptResults = competitorResults.filter(r => r.prompt === prompt);
              
              return (
                <Card key={promptIndex}>
                  <CardContent className="p-6">
                    <h4 className="font-medium text-gray-900 mb-4">"{prompt}"</h4>
                    
                    <div className="space-y-4">
                      {promptResults.map((result, resultIndex) => (
                        <div key={resultIndex} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700">
                              {result.provider}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {result.recommendedBrands.length} recommendations
                            </span>
                          </div>
                          
                          {result.recommendedBrands.length > 0 ? (
                            <div className="space-y-2">
                              {result.recommendedBrands.map((brand, brandIndex) => (
                                <div key={brandIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                      #{brand.ranking}
                                    </Badge>
                                    <span className="font-medium text-gray-900">{brand.name}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No specific brand recommendations found</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="by-provider" className="space-y-6 mt-6">
          {analysis.selectedProviders.map((provider, providerIndex) => {
            const providerResults = competitorResults.filter(r => r.provider.includes(provider));
            
            return (
              <Card key={providerIndex}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">{provider}</h4>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {providerResults.length} responses
                    </Badge>
                  </div>
                  
                  <div className="space-y-4">
                    {providerResults.map((result, resultIndex) => (
                      <div key={resultIndex} className="border border-gray-200 rounded-lg p-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">
                          "{result.prompt}"
                        </h5>
                        
                        {result.recommendedBrands.length > 0 ? (
                          <div className="space-y-2">
                            {result.recommendedBrands.map((brand, brandIndex) => (
                              <div key={brandIndex} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                                    #{brand.ranking}
                                  </Badge>
                                  <span className="font-medium text-gray-900">{brand.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No specific brand recommendations found</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>
      </Tabs>
    </div>
  );
}
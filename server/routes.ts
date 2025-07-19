import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertBrandAnalysisSchema } from "@shared/schema";
import { z } from "zod";
import { processCompetitorResults } from "./gemini";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const AVAILABLE_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5", provider: "Google" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek v3", provider: "DeepSeek" },
  { id: "x-ai/grok-4", name: "Grok 4", provider: "xAI" },
  { id: "openai/gpt-4.1", name: "OpenAI GPT4.1", provider: "OpenAI" },
  { id: "anthropic/claude-sonnet-4", name: "Claude 4", provider: "Anthropic" },
  { id: "moonshotai/kimi-k2", name: "Kimi K2", provider: "MoonshotAI" },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7", provider: "Anthropic" },
];

function extractCompetitorRecommendations(response: string, prompt: string) {
  const recommendations: Array<{
    name: string;
    ranking: number;
    reason: string;
  }> = [];
  
  let currentRanking = 1;
  
  // Enhanced patterns to capture various types of brand mentions
  const rankingPatterns = [
    // Numbered lists: "1. Mailchimp", "2. Constant Contact"
    /(\d+)\.\s*\*?\*?([A-Z][a-zA-Z0-9\s&.-]{2,30}?)(?:\*\*)?[:\n]/gi,
    // Bold formatting: "**Mailchimp**", "**ActiveCampaign**"
    /\*\*([A-Z][a-zA-Z0-9\s&.-]{2,30}?)\*\*/gi,
    // Ordinal patterns: "First: Mailchimp", "1st: Salesforce"
    /(?:first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th)[:\s]+([A-Z][a-zA-Z0-9\s&.-]{2,30}?)(?:[:.]|$)/gi,
    // Recommendation patterns: "I recommend Mailchimp", "Consider ActiveCampaign"
    /(?:recommend[s]?|consider|suggest[s]?|use|try)\s+([A-Z][a-zA-Z0-9\s&.-]{2,30})(?:\s+(?:is|for|as))/gi,
    // Brand mentions with context: "Mailchimp is", "ActiveCampaign stands out"
    /([A-Z][a-zA-Z0-9\s&.-]{2,30})\s+(?:is|stands out|excels|offers|provides|features)/gi,
    // Common software patterns with brackets or colons
    /([A-Z][a-zA-Z0-9\s&.-]{2,30}):/gi,
  ];
  
  console.log(`Extracting recommendations from response: ${response.substring(0, 200)}...`);
  
  rankingPatterns.forEach((pattern, patternIndex) => {
    const matches = Array.from(response.matchAll(pattern));
    console.log(`Pattern ${patternIndex} found ${matches.length} matches`);
    
    for (const match of matches) {
      const name = (match[2] || match[1])?.trim();
      if (name && name.length > 2 && name.length < 50) {
        // Filter out common words and phrases that might be captured
        const commonWords = ['Why', 'What', 'How', 'The', 'This', 'That', 'These', 'Those', 'Here', 'There', 'When', 'Where', 'While', 'Although', 'However', 'Therefore', 'Moreover', 'Furthermore', 'Best for', 'Why it', 'standard', 'top choice', 'gement tools', 'sk management'];
        if (commonWords.some(word => name.toLowerCase().includes(word.toLowerCase()))) continue;
        
        // Check if already exists
        if (recommendations.find(r => r.name.toLowerCase() === name.toLowerCase())) continue;
        
        // Find context/reason in surrounding text
        const matchIndex = response.indexOf(match[0]);
        const contextStart = Math.max(0, matchIndex - 150);
        const contextEnd = Math.min(response.length, matchIndex + 300);
        const context = response.slice(contextStart, contextEnd).trim();
        
        recommendations.push({
          name: name,
          ranking: currentRanking++,
          reason: context
        });
        
        console.log(`Extracted brand: ${name}`);
      }
    }
  });
  
  console.log(`Total recommendations extracted: ${recommendations.length}`);
  return recommendations;
}

async function callOpenRouter(apiKey: string, model: string, prompt: string) {
  console.log(`Making OpenRouter API call to model: ${model} with prompt: ${prompt.substring(0, 50)}...`);
  
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "http://localhost:5000",
      "X-Title": "BrandGEO Monitor",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenRouter API error: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`OpenRouter API response received from ${model}:`, data.choices?.[0]?.message?.content?.substring(0, 100) + "...");
  return data.choices[0].message.content;
}

function extractCompanyInfoMock(url: string) {
  // Mock company extraction - in real app this would use Firecrawl
  const domain = new URL(url).hostname.replace("www.", "");
  const companyName = domain.split(".")[0];
  
  return {
    name: `${companyName.charAt(0).toUpperCase() + companyName.slice(1)} Solutions`,
    url,
    description: `Leading provider of innovative solutions in the ${companyName} industry.`,
    industry: "Technology",
    founded: "2018",
    employees: "100-500",
    logo: null,
  };
}

function analyzeBrandMention(response: string, brandName: string) {
  const lowerResponse = response.toLowerCase();
  const lowerBrand = brandName.toLowerCase();
  
  const mentioned = lowerResponse.includes(lowerBrand);
  let position = 0;
  
  if (mentioned) {
    // Simple position detection - count how many company names appear before our brand
    const sentences = response.split(/[.!?]/);
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].toLowerCase().includes(lowerBrand)) {
        // Count unique company names mentioned before this point
        const beforeText = sentences.slice(0, i).join(" ");
        const companyPattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*(?:\s+(?:Inc|Corp|LLC|Ltd|Solutions|Technologies|Systems))\b/g;
        const matches = beforeText.matchAll(companyPattern);
        const companiesBefore = Array.from(matches);
        position = companiesBefore.length + 1;
        break;
      }
    }
  }
  
  return { mentioned, position };
}

function calculateVisibilityScore(responses: any[]) {
  const totalResponses = responses.length;
  const mentionedResponses = responses.filter(r => r.brandMentioned).length;
  
  if (mentionedResponses === 0) return 0;
  
  const mentionRate = (mentionedResponses / totalResponses) * 100;
  const avgPosition = responses
    .filter(r => r.position > 0)
    .reduce((sum, r) => sum + (1 / r.position), 0) / mentionedResponses;
  
  // Score combines mention rate with position quality
  return Math.round(mentionRate * (1 + avgPosition / 5));
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get available models
  app.get("/api/brand-monitor/models", async (req, res) => {
    res.json(AVAILABLE_MODELS);
  });

  // Test OpenRouter API key
  app.post("/api/brand-monitor/test-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "API key is required" });
      }

      // Test with a simple prompt
      await callOpenRouter(apiKey, "openai/gpt-4", "Say 'API key works'");
      
      res.json({ valid: true });
    } catch (error: any) {
      res.status(400).json({ valid: false, error: error.message });
    }
  });

  // Extract company information
  app.post("/api/brand-monitor/extract-company", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Mock extraction - in real app would use Firecrawl
      const companyInfo = extractCompanyInfoMock(url);
      
      // Check if company already exists
      let company = await storage.getCompanyByUrl(url);
      if (!company) {
        company = await storage.createCompany(companyInfo);
      }
      
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Start brand analysis
  app.post("/api/brand-monitor/analyze", async (req, res) => {
    try {
      const { apiKey, companyId, analysisType } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "OpenRouter API key is required" });
      }

      const currentAnalysisType = analysisType || "brand";
      
      // For competitor analysis, we don't need a company
      if (currentAnalysisType === "competitor") {
        const data = {
          ...req.body,
          companyId: null, // No company needed for competitor analysis
        };
        delete data.apiKey; // Remove apiKey from data before validation
        
        const validatedData = insertBrandAnalysisSchema.parse(data);
        
        // Create analysis without company requirement
        const analysis = await storage.createBrandAnalysis(validatedData);

        // Start competitor analysis in background
        processCompetitorAnalysis(analysis.id, apiKey, validatedData.selectedProviders as string[], validatedData.selectedPrompts as string[]).catch(console.error);
        
        res.json(analysis);
        return;
      }

      // For brand analysis, we need a company
      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      const data = { ...req.body };
      delete data.apiKey; // Remove apiKey from data before validation
      const validatedData = insertBrandAnalysisSchema.parse(data);

      // Create brand analysis record
      const analysis = await storage.createBrandAnalysis({
        ...validatedData,
        companyId,
      });

      // Start brand analysis in background
      processBrandAnalysis(analysis.id, apiKey, company, validatedData.selectedProviders as string[], validatedData.selectedPrompts as string[]);
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get analysis by ID
  app.get("/api/brand-monitor/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getBrandAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all analyses for user
  app.get("/api/brand-monitor/analyses", async (req, res) => {
    try {
      const userId = 1; // Mock user ID
      const analyses = await storage.getBrandAnalysesByUser(userId);
      res.json(analyses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete analysis
  app.delete("/api/brand-monitor/analyses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBrandAnalysis(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  async function processBrandAnalysis(
    analysisId: number,
    apiKey: string,
    company: any,
    selectedProviders: string[],
    selectedPrompts: string[]
  ) {
    try {
      await storage.updateBrandAnalysis(analysisId, {
        status: "in_progress",
        progress: 0,
      });

      const providerResponses: Array<{
        provider: string;
        prompt: string;
        response: string;
        brandMentioned: boolean;
        position?: number;
        score: number;
      }> = [];
      const totalCalls = selectedProviders.length * selectedPrompts.length;
      let completedCalls = 0;

      for (const providerId of selectedProviders) {
        const model = AVAILABLE_MODELS.find(m => m.id === providerId);
        if (!model) continue;

        for (const prompt of selectedPrompts) {
          try {
            const response = await callOpenRouter(apiKey, providerId, prompt);
            const analysis = analyzeBrandMention(response, company.name);
            
            providerResponses.push({
              provider: model.name,
              prompt,
              response,
              brandMentioned: analysis.mentioned,
              position: analysis.position || undefined,
              score: analysis.mentioned ? (analysis.position ? Math.max(1, 6 - analysis.position) * 20 : 50) : 0,
            });

            completedCalls++;
            const progress = Math.round((completedCalls / totalCalls) * 100);
            
            await storage.updateBrandAnalysis(analysisId, {
              progress,
            });
          } catch (error) {
            console.error(`Error calling ${model.name}:`, error);
            // Continue with other providers
          }
        }
      }

      // Calculate overall metrics
      const overallScore = calculateVisibilityScore(providerResponses);
      const providerScores = selectedProviders.map(providerId => {
        const model = AVAILABLE_MODELS.find(m => m.id === providerId);
        const responses = providerResponses.filter(r => r.provider === model?.name);
        return {
          provider: model?.name || providerId,
          score: calculateVisibilityScore(responses),
        };
      });

      const topProvider = providerScores.reduce((top, current) => 
        current.score > top.score ? current : top
      ).provider;

      const improvementArea = providerScores.reduce((worst, current) => 
        current.score < worst.score ? current : worst
      ).provider;

      // Mock competitor analysis
      const competitors = [
        { name: "Amazon Web Services", mentions: 24, totalPrompts: 24, averagePosition: 1.2 },
        { name: "Microsoft Azure", mentions: 23, totalPrompts: 24, averagePosition: 1.8 },
        { name: "Google Cloud", mentions: 22, totalPrompts: 24, averagePosition: 2.1 },
      ];

      const insights = [
        {
          type: "opportunity" as const,
          title: "Strong DevOps Positioning",
          description: `${company.name} is well-positioned in DevOps automation discussions but could improve visibility in general cloud infrastructure conversations.`,
        },
        {
          type: "gap" as const,
          title: "Provider-Specific Gaps",
          description: `${improvementArea} shows lower brand recognition. Consider targeted content strategy for this platform.`,
        },
      ];

      // Complete analysis
      await storage.updateBrandAnalysis(analysisId, {
        status: "completed",
        progress: 100,
        overallScore,
        topProvider,
        improvementArea,
        results: {
          providerResponses,
          competitors,
          insights,
        },
      });

    } catch (error) {
      console.error("Analysis processing error:", error);
      await storage.updateBrandAnalysis(analysisId, {
        status: "failed",
      });
    }
  }

  async function processCompetitorAnalysis(
    analysisId: number,
    apiKey: string,
    selectedProviders: string[],
    selectedPrompts: string[]
  ) {
    console.log(`=== COMPETITOR ANALYSIS STARTED ===`);
    console.log(`Analysis ID: ${analysisId}`);
    console.log(`Providers: ${JSON.stringify(selectedProviders)}`);
    console.log(`Prompts: ${JSON.stringify(selectedPrompts)}`);
    console.log(`API Key present: ${!!apiKey}`);
    try {
      await storage.updateBrandAnalysis(analysisId, {
        status: "in_progress",
        progress: 0,
      });

      const competitorResults: Array<{
        prompt: string;
        provider: string;
        response: string;
        recommendedBrands: Array<{
          name: string;
          ranking: number;
          reason: string;
        }>;
      }> = [];
      
      const totalCalls = selectedProviders.length * selectedPrompts.length;
      let completedCalls = 0;

      for (const providerId of selectedProviders) {
        const model = AVAILABLE_MODELS.find(m => m.id === providerId);
        if (!model) continue;

        for (const prompt of selectedPrompts) {
          try {
            console.log(`Processing prompt "${prompt}" with provider ${model.name} (${providerId})`);
            const response = await callOpenRouter(apiKey, providerId, prompt);
            const recommendations = extractCompetitorRecommendations(response, prompt);
            
            console.log(`Extracted ${recommendations.length} recommendations from ${model.name}`);
            
            competitorResults.push({
              prompt,
              provider: model.name,
              response,
              recommendedBrands: recommendations,
            });

            completedCalls++;
            const progress = Math.round((completedCalls / totalCalls) * 100);
            
            console.log(`Progress: ${progress}% (${completedCalls}/${totalCalls})`);
            
            await storage.updateBrandAnalysis(analysisId, {
              progress,
              results: {
                providerResponses: [],
                competitors: [],
                insights: [],
                competitorResults: [...competitorResults],
              },
            });
          } catch (error) {
            console.error(`Error calling ${model.name} (${providerId}):`, error);
            // Add a placeholder result so progress continues
            competitorResults.push({
              prompt,
              provider: model.name,
              response: "Error: Failed to get response from this provider",
              recommendedBrands: [],
            });
            
            completedCalls++;
            const progress = Math.round((completedCalls / totalCalls) * 100);
            
            await storage.updateBrandAnalysis(analysisId, {
              progress,
              results: {
                providerResponses: [],
                competitors: [],
                insights: [],
                competitorResults: [...competitorResults],
              },
            });
          }
        }
      }

      // Process results with Gemini for clean brand extraction and formatting
      console.log(`Processing results with Gemini for clean brand extraction...`);
      
      try {
        const processedResults = await processCompetitorResults(
          competitorResults.map(result => ({
            prompt: result.prompt,
            provider: result.provider,
            response: result.response
          }))
        );

        console.log(`Gemini processing completed. Found ${processedResults.topRecommendedBrands.length} top brands`);

        // Update the competitor results with processed data
        const enhancedCompetitorResults = competitorResults.map(result => ({
          ...result,
          processedBrands: processedResults.resultsByPrompt
            .find(p => p.prompt === result.prompt)
            ?.providers.filter(prov => prov.provider === result.provider) || []
        }));

        // Complete analysis with processed results
        await storage.updateBrandAnalysis(analysisId, {
          status: "completed",
          progress: 100,
          results: {
            providerResponses: [],
            competitors: processedResults.topRecommendedBrands.map(brand => ({
              name: brand.name,
              mentions: brand.score,
              totalPrompts: selectedPrompts.length,
              averagePosition: brand.score / 2, // Convert score to position estimate
            })),
            insights: [
              {
                type: "opportunity" as const,
                title: "Top Recommended Brands",
                description: `Analysis shows ${processedResults.topRecommendedBrands[0]?.name || 'leading brands'} as the most frequently recommended across AI models.`,
              },
              {
                type: "gap" as const,
                title: "Provider Consistency",
                description: `Different AI models show varying preferences - consider this when targeting different AI-assisted decision makers.`,
              },
            ],
            competitorResults: enhancedCompetitorResults,
          },
        });
      } catch (geminiError) {
        console.error('Gemini processing failed, using basic results:', geminiError);
        
        // Fallback to basic processing if Gemini fails
        await storage.updateBrandAnalysis(analysisId, {
          status: "completed",
          progress: 100,
          results: {
            providerResponses: [],
            competitors: [],
            insights: [
              {
                type: "gap" as const,
                title: "Processing Issue",
                description: "Results processed with basic extraction. Enhanced analysis temporarily unavailable.",
              },
            ],
            competitorResults,
          },
        });
      }

    } catch (error) {
      console.error("Competitor analysis processing error:", error);
      await storage.updateBrandAnalysis(analysisId, {
        status: "failed",
      });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}

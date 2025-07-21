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

async function generateEnhancedPrompt(apiKey: string, originalPrompt: string): Promise<string> {
  console.log(`Generating enhanced prompt using GPT-4.1 for: ${originalPrompt}`);
  
  const enhancementPrompt = `
You are a prompt engineering expert. Transform the following user query into a comprehensive prompt that forces AI models to:
1. Rank order the top 5-7 brands/companies
2. Provide specific positives and negatives for each brand
3. Use a structured response format

Original prompt: "${originalPrompt}"

Create an enhanced prompt that instructs the AI to respond in this exact JSON structure:
{
  "brands": [
    {
      "name": "Brand Name",
      "ranking": 1,
      "positives": ["positive aspect 1", "positive aspect 2"],
      "negatives": ["negative aspect 1", "negative aspect 2"],
      "overallSentiment": "positive" | "neutral" | "negative"
    }
  ]
}

IMPORTANT: The enhanced prompt should:
1. Be specific to the industry/domain in the original question
2. Ask for 5-7 specific brand/company names (not generic categories)
3. Explicitly request positive and negative aspects for each brand
4. Request ranking from 1 (best) to 7 (worst) based on the specific criteria in the original question
5. Include instruction to respond ONLY with valid JSON, no additional text

The enhanced prompt should be comprehensive, specific to the domain/industry in the original question, and ensure the AI provides detailed reasoning for rankings. Return ONLY the enhanced prompt text, no additional explanation.`;

  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "http://localhost:5000",
      "X-Title": "BrandGEO Monitor",
    },
    body: JSON.stringify({
      model: "openai/gpt-4.1",
      messages: [{ role: "user", content: enhancementPrompt }],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    console.error(`Failed to generate enhanced prompt, using original`);
    return originalPrompt;
  }

  const data = await response.json();
  const enhancedPrompt = data.choices[0]?.message?.content;
  console.log(`Enhanced prompt generated: ${enhancedPrompt.substring(0, 100)}...`);
  return enhancedPrompt || originalPrompt;
}

async function callOpenRouterWithStructuredOutput(apiKey: string, model: string, prompt: string) {
  console.log(`Making structured OpenRouter API call to model: ${model}`);
  
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
      max_tokens: 1500,
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenRouter structured API error: ${response.status} ${response.statusText} - ${errorText}`);
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  try {
    // Clean the response to extract JSON (remove code blocks if present)
    let cleanedContent = content.trim();
    
    // Remove ```json and ``` code block markers
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Try to find JSON object in the response
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedContent = jsonMatch[0];
    }
    
    const parsedContent = JSON.parse(cleanedContent);
    console.log(`Structured response received from ${model}`);
    return parsedContent;
  } catch (parseError) {
    console.error(`Failed to parse structured response from ${model}:`, parseError);
    console.error(`Raw content:`, content);
    throw new Error(`Invalid JSON response from ${model}`);
  }
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
    console.log(`=== ENHANCED COMPETITOR ANALYSIS STARTED ===`);
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

      const structuredResponses: Array<{
        prompt: string;
        provider: string;
        structuredData: {
          brands: Array<{
            name: string;
            ranking: number;
            positives: string[];
            negatives: string[];
            overallSentiment: "positive" | "neutral" | "negative";
          }>;
        };
      }> = [];

      // Step 1: Generate enhanced prompts using GPT-4.1
      const enhancedPrompts: { [key: string]: string } = {};
      console.log(`Generating enhanced prompts using GPT-4.1...`);
      
      for (const prompt of selectedPrompts) {
        try {
          const enhancedPrompt = await generateEnhancedPrompt(apiKey, prompt);
          enhancedPrompts[prompt] = enhancedPrompt;
          console.log(`Enhanced prompt generated for: ${prompt.substring(0, 50)}...`);
        } catch (error) {
          console.error(`Failed to enhance prompt: ${prompt}`, error);
          enhancedPrompts[prompt] = prompt; // fallback to original
        }
      }

      const totalCalls = selectedProviders.length * selectedPrompts.length;
      let completedCalls = 0;

      // Step 2: Call each provider with enhanced prompts and structured output
      for (const providerId of selectedProviders) {
        const model = AVAILABLE_MODELS.find(m => m.id === providerId);
        if (!model) continue;

        for (const originalPrompt of selectedPrompts) {
          const enhancedPrompt = enhancedPrompts[originalPrompt];
          
          try {
            console.log(`Processing enhanced prompt with ${model.name} (${providerId})`);
            
            // Try structured output first
            let structuredData = null;
            try {
              structuredData = await callOpenRouterWithStructuredOutput(apiKey, providerId, enhancedPrompt);
              
              structuredResponses.push({
                prompt: originalPrompt,
                provider: model.name,
                structuredData
              });
              
              console.log(`Structured response received from ${model.name}`);
            } catch (structuredError) {
              console.log(`Structured output failed for ${model.name}, falling back to regular response`);
              
              // Fallback to regular response
              const response = await callOpenRouter(apiKey, providerId, enhancedPrompt);
              const recommendations = extractCompetitorRecommendations(response, originalPrompt);
              
              competitorResults.push({
                prompt: originalPrompt,
                provider: model.name,
                response,
                recommendedBrands: recommendations,
              });
            }

            completedCalls++;
            const progress = Math.round((completedCalls / totalCalls) * 80); // Reserve 20% for final processing
            
            console.log(`Progress: ${progress}% (${completedCalls}/${totalCalls})`);
            
            await storage.updateBrandAnalysis(analysisId, {
              progress,
              results: {
                providerResponses: [],
                competitors: [],
                insights: [],
                competitorResults: [...competitorResults],
                enhancedPrompt: Object.values(enhancedPrompts)[0], // Store first enhanced prompt as example
                structuredResponses: [...structuredResponses],
              },
            });
            
          } catch (error) {
            console.error(`Error calling ${model.name} (${providerId}):`, error);
            
            competitorResults.push({
              prompt: originalPrompt,
              provider: model.name,
              response: "Error: Failed to get response from this provider",
              recommendedBrands: [],
            });
            
            completedCalls++;
            const progress = Math.round((completedCalls / totalCalls) * 80);
            
            await storage.updateBrandAnalysis(analysisId, {
              progress,
              results: {
                providerResponses: [],
                competitors: [],
                insights: [],
                competitorResults: [...competitorResults],
                enhancedPrompt: Object.values(enhancedPrompts)[0],
                structuredResponses: [...structuredResponses],
              },
            });
          }
        }
      }

      // Step 3: Process results with Gemini 2.5 Pro as super aggregator
      console.log(`Processing results with Gemini 2.5 Pro super aggregator...`);
      await storage.updateBrandAnalysis(analysisId, { progress: 85 });
      
      try {
        const processedResults = await processCompetitorResults(
          competitorResults.map(result => ({
            prompt: result.prompt,
            provider: result.provider,
            response: result.response
          })),
          structuredResponses.length > 0 ? structuredResponses : undefined
        );

        console.log(`Gemini super aggregator completed. Found ${processedResults.topRecommendedBrands.length} top brands`);
        console.log(`Aggregated analysis has ${processedResults.aggregatedAnalysis.reportByBrand.length} brands and ${processedResults.aggregatedAnalysis.reportByProvider.length} providers`);

        // Complete analysis with enhanced structured results
        await storage.updateBrandAnalysis(analysisId, {
          status: "completed",
          progress: 100,
          results: {
            providerResponses: [],
            competitors: processedResults.topRecommendedBrands.map(brand => ({
              name: brand.name,
              mentions: brand.score,
              totalPrompts: selectedPrompts.length,
              averagePosition: 11 - brand.score, // Convert score to position (higher score = better position)
            })),
            insights: [
              {
                type: "opportunity" as const,
                title: "AI Provider Consensus",
                description: `${processedResults.topRecommendedBrands[0]?.name || 'Leading brands'} shows strong consensus across AI providers with enhanced analysis.`,
              },
              {
                type: "strength" as const,
                title: "Structured Analysis Complete",
                description: `Enhanced prompts and structured output provide deeper insights into brand positioning and competitive advantages.`,
              },
            ],
            competitorResults,
            enhancedPrompt: Object.values(enhancedPrompts)[0],
            structuredResponses,
            aggregatedAnalysis: processedResults.aggregatedAnalysis,
          },
        });

      } catch (geminiError) {
        console.error('Gemini super aggregator failed, creating basic aggregated analysis:', geminiError);
        
        // Create basic aggregated analysis from available data
        console.log(`Creating fallback analysis with ${competitorResults.length} competitor results and ${structuredResponses.length} structured responses`);
        const basicAggregatedAnalysis = createBasicAggregatedAnalysis(competitorResults, structuredResponses);
        console.log(`Fallback created: ${basicAggregatedAnalysis.topBrands.length} brands, ${basicAggregatedAnalysis.aggregatedAnalysis.reportByProvider.length} providers`);
        
        await storage.updateBrandAnalysis(analysisId, {
          status: "completed",
          progress: 100,
          results: {
            providerResponses: [],
            competitors: basicAggregatedAnalysis.topBrands,
            insights: [
              {
                type: "opportunity" as const,
                title: "Enhanced Analysis Completed",
                description: "Analysis completed with enhanced prompts and structured data processing. Some advanced features used fallback methods.",
              },
            ],
            competitorResults,
            enhancedPrompt: Object.values(enhancedPrompts)[0],
            structuredResponses,
            aggregatedAnalysis: basicAggregatedAnalysis.aggregatedAnalysis,
          },
        });
      }

    } catch (error) {
      console.error("Enhanced competitor analysis processing error:", error);
      await storage.updateBrandAnalysis(analysisId, {
        status: "failed",
      });
    }
  }

  function createBasicAggregatedAnalysis(
    competitorResults: Array<{
      prompt: string;
      provider: string;
      response: string;
      recommendedBrands: Array<{
        name: string;
        ranking: number;
        reason: string;
      }>;
    }>,
    structuredResponses: Array<{
      prompt: string;
      provider: string;
      structuredData: {
        brands: Array<{
          name: string;
          ranking: number;
          positives: string[];
          negatives: string[];
          overallSentiment: "positive" | "neutral" | "negative";
        }>;
      };
    }>
  ) {
    console.log(`=== FALLBACK ANALYSIS DEBUG ===`);
    console.log(`Structured responses count: ${structuredResponses.length}`);
    console.log(`Competitor results count: ${competitorResults.length}`);
    
    structuredResponses.forEach((response, index) => {
      console.log(`Structured response ${index}: provider=${response.provider}, brands=${response.structuredData?.brands?.length || 0}`);
      if (response.structuredData?.brands) {
        console.log(`Brands in response ${index}:`, response.structuredData.brands.map(b => b.name));
      }
    });

    // Aggregate brands from both structured and unstructured responses
    const brandMap = new Map<string, {
      name: string;
      totalScore: number;
      count: number;
      providerInsights: Array<{
        provider: string;
        ranking: number;
        positives: string[];
        negatives: string[];
      }>;
    }>();

    // Process structured responses first (higher quality)
    structuredResponses.forEach(response => {
      response.structuredData.brands.forEach(brand => {
        const key = brand.name.toLowerCase();
        const existing = brandMap.get(key) || {
          name: brand.name,
          totalScore: 0,
          count: 0,
          providerInsights: []
        };

        existing.totalScore += (8 - brand.ranking); // Convert ranking to score (1st = 7 points, 7th = 1 point)
        existing.count++;
        existing.providerInsights.push({
          provider: response.provider,
          ranking: brand.ranking,
          positives: brand.positives,
          negatives: brand.negatives
        });

        brandMap.set(key, existing);
      });
    });

    // Process unstructured responses as fallback
    competitorResults.forEach(result => {
      result.recommendedBrands.forEach(brand => {
        const key = brand.name.toLowerCase();
        if (!brandMap.has(key)) { // Only add if not already processed from structured data
          const existing = brandMap.get(key) || {
            name: brand.name,
            totalScore: 0,
            count: 0,
            providerInsights: []
          };

          existing.totalScore += (8 - brand.ranking);
          existing.count++;
          existing.providerInsights.push({
            provider: result.provider,
            ranking: brand.ranking,
            positives: [`Recommended by ${result.provider}`],
            negatives: []
          });

          brandMap.set(key, existing);
        }
      });
    });

    // Create sorted list of brands
    const sortedBrands = Array.from(brandMap.values())
      .map(brand => ({
        ...brand,
        averageScore: brand.totalScore / brand.count,
        overallRanking: Math.round(8 - (brand.totalScore / brand.count))
      }))
      .sort((a, b) => b.averageScore - a.averageScore);

    // Create report by provider
    const providerMap = new Map<string, Array<{
      name: string;
      ranking: number;
      positives: string[];
      negatives: string[];
    }>>();

    // Collect provider data
    [...structuredResponses, ...competitorResults].forEach(response => {
      const providerName = response.provider;
      if (!providerMap.has(providerName)) {
        providerMap.set(providerName, []);
      }

      if ('structuredData' in response) {
        // Structured response
        response.structuredData.brands.forEach(brand => {
          providerMap.get(providerName)!.push({
            name: brand.name,
            ranking: brand.ranking,
            positives: brand.positives,
            negatives: brand.negatives
          });
        });
      } else {
        // Unstructured response
        response.recommendedBrands.forEach(brand => {
          providerMap.get(providerName)!.push({
            name: brand.name,
            ranking: brand.ranking,
            positives: [`Recommended by ${providerName}`],
            negatives: []
          });
        });
      }
    });

    const aggregatedAnalysis = {
      reportByProvider: Array.from(providerMap.entries()).map(([provider, brands]) => ({
        provider,
        brandRankings: brands.sort((a, b) => a.ranking - b.ranking)
      })),
      reportByBrand: sortedBrands.slice(0, 10).map(brand => ({
        brandName: brand.name,
        overallRanking: brand.overallRanking,
        providerInsights: brand.providerInsights,
        aiProvidersThink: {
          positiveAspects: Array.from(new Set(brand.providerInsights.flatMap(p => p.positives))),
          negativeAspects: Array.from(new Set(brand.providerInsights.flatMap(p => p.negatives))),
          keyFeatures: [`Ranked by ${brand.count} providers`, `Average score: ${brand.averageScore.toFixed(1)}`]
        }
      }))
    };

    const topBrands = sortedBrands.slice(0, 5).map(brand => ({
      name: brand.name,
      mentions: brand.count,
      totalPrompts: competitorResults.length || structuredResponses.length || 1,
      averagePosition: brand.overallRanking
    }));

    console.log(`=== FALLBACK RESULTS ===`);
    console.log(`Brands found: ${sortedBrands.length}`);
    console.log(`Top brands: ${topBrands.length}`);
    console.log(`Providers in report: ${Array.from(providerMap.keys()).length}`);
    console.log(`Sorted brands:`, sortedBrands.map(b => b.name));

    return { aggregatedAnalysis, topBrands };
  }

  const httpServer = createServer(app);
  return httpServer;
}

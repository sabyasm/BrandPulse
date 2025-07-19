import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCompanySchema, insertBrandAnalysisSchema } from "@shared/schema";
import { z } from "zod";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

const AVAILABLE_MODELS = [
  { id: "openai/gpt-4", name: "OpenAI GPT-4", provider: "OpenAI" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "google/gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "perplexity/sonar-medium-online", name: "Perplexity Sonar", provider: "Perplexity" },
];

async function callOpenRouter(apiKey: string, model: string, prompt: string) {
  const response = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.BETTER_AUTH_URL || "http://localhost:5000",
      "X-Title": "FireGEO Brand Monitor",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }

  const data = await response.json();
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
        const companiesBefore = [...beforeText.matchAll(companyPattern)];
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
      const data = insertBrandAnalysisSchema.parse(req.body);
      const { apiKey, companyId } = req.body;
      
      if (!apiKey) {
        return res.status(400).json({ error: "OpenRouter API key is required" });
      }

      const company = await storage.getCompany(companyId);
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }

      // Create analysis record
      const analysis = await storage.createBrandAnalysis({
        ...data,
        userId: 1, // Mock user ID - in real app would get from session
        companyId,
      });

      // Start analysis in background
      processAnalysis(analysis.id, apiKey, company, data.selectedProviders, data.selectedPrompts);
      
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

  async function processAnalysis(
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

      const providerResponses = [];
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

  const httpServer = createServer(app);
  return httpServer;
}

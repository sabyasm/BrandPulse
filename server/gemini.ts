// Use Node.js built-in fetch (Node 18+)

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export async function generateAIRecommendation(topBrand: string, originalPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
  }

  const prompt = `Based on AI analysis across multiple providers, "${topBrand}" ranked as the #1 recommendation for: "${originalPrompt}"

Create a single, compelling one-line recommendation (max 25 words) that explains why ${topBrand} is the best choice. Make it actionable and confident.

Examples:
- "Choose Salesforce CRM for its powerful automation and seamless integration capabilities that scale with growing startups."
- "Select RBC for newcomers due to their comprehensive immigration banking packages and multilingual support services."

Your one-liner for ${topBrand}:`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 1,
            topP: 1,
            maxOutputTokens: 100,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('Failed to generate AI recommendation');
      return `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
    }

    const data = await response.json() as GeminiResponse;
    const recommendation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (recommendation) {
      console.log('AI recommendation generated successfully');
      return recommendation;
    }
    
    return `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
  } catch (error) {
    console.error('Error generating AI recommendation:', error);
    return `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
  }
}

interface ProcessedResults {
  topRecommendedBrands: Array<{
    name: string;
    score: number;
    reasoning: string;
    sentiment: 'positive' | 'negative';
  }>;
  resultsByPrompt: Array<{
    prompt: string;
    providers: Array<{
      provider: string;
      recommendedBrand: string;
      reasoning: string;
      sentiment: 'positive' | 'negative';
    }>;
  }>;
  aggregatedAnalysis: {
    reportByProvider: Array<{
      provider: string;
      brandRankings: Array<{
        name: string;
        ranking: number;
        positives: string[];
        negatives: string[];
      }>;
    }>;
    reportByBrand: Array<{
      brandName: string;
      overallRanking: number;
      providerInsights: Array<{
        provider: string;
        ranking: number;
        positives: string[];
        negatives: string[];
      }>;
      aiProvidersThink: {
        positiveAspects: string[];
        negativeAspects: string[];
        keyFeatures: string[];
      };
    }>;
  };
  aiRecommendation?: string;
}

export async function processCompetitorResults(
  competitorResults: Array<{
    prompt: string;
    provider: string;
    response: string;
  }>,
  structuredResponses?: Array<{
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
): Promise<ProcessedResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  // Use structured data if available, otherwise fall back to raw responses
  const dataSource = structuredResponses && structuredResponses.length > 0 ? structuredResponses : competitorResults;
  const isStructured = structuredResponses && structuredResponses.length > 0;

  const prompt = `
Analyze the following AI model responses about competitor recommendations and create comprehensive aggregated reports.

${isStructured ? 'Structured AI responses:' : 'Raw AI responses:'}
${isStructured 
  ? structuredResponses!.map(result => `
Prompt: "${result.prompt}"
AI Provider: ${result.provider}
Structured Data: ${JSON.stringify(result.structuredData)}
---
`).join('\n')
  : competitorResults.map(result => `
Prompt: "${result.prompt}"
AI Provider: ${result.provider}
Response: ${result.response}
---
`).join('\n')}

Create a comprehensive analysis with the following JSON structure:

{
  "topRecommendedBrands": [
    {
      "name": "Brand Name Only",
      "score": number (1-10 based on frequency and sentiment),
      "reasoning": "Why this brand ranks highly",
      "sentiment": "positive" | "negative"
    }
  ],
  "resultsByPrompt": [
    {
      "prompt": "Original prompt text",
      "providers": [
        {
          "provider": "AI Provider Name",
          "recommendedBrand": "Brand name",
          "reasoning": "Provider's reasoning",
          "sentiment": "positive" | "negative"
        }
      ]
    }
  ],
  "aggregatedAnalysis": {
    "reportByProvider": [
      {
        "provider": "AI Provider Name",
        "brandRankings": [
          {
            "name": "Brand Name",
            "ranking": number,
            "positives": ["positive point 1", "positive point 2"],
            "negatives": ["negative point 1", "negative point 2"]
          }
        ]
      }
    ],
    "reportByBrand": [
      {
        "brandName": "Brand Name",
        "overallRanking": number (average across all providers),
        "providerInsights": [
          {
            "provider": "AI Provider Name",
            "ranking": number,
            "positives": ["positive aspects from this provider"],
            "negatives": ["negative aspects from this provider"]
          }
        ],
        "aiProvidersThink": {
          "positiveAspects": ["consolidated positive points from all providers"],
          "negativeAspects": ["consolidated negative points from all providers"],
          "keyFeatures": ["key features mentioned across providers"]
        }
      }
    ]
  }
}

Rules:
1. Extract ONLY real brand/company names - no generic terms
2. **CRITICAL: Deduplicate brand names** - Different AI providers may return the same brand with different names:
   - "RBC Royal Bank" and "Royal Bank of Canada (RBC)" = Same bank, consolidate as "RBC (Royal Bank of Canada)"  
   - "Amazon Web Services" and "AWS" = Same service, consolidate as "AWS (Amazon Web Services)"
   - "Google Cloud Platform" and "GCP" = Same platform, consolidate as "Google Cloud Platform (GCP)"
   - When consolidating, use the most complete name with common abbreviation in parentheses
3. Create detailed positive/negative lists for each brand from each provider
4. Calculate overall rankings by averaging individual provider rankings AFTER deduplication
5. Consolidate insights across providers in the "aiProvidersThink" section
6. Focus on actionable business insights
7. Ensure all data is factual and extracted from the responses

Return ONLY valid JSON, no additional text.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as GeminiResponse;
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      throw new Error('No content received from Gemini API');
    }

    // Clean the response to extract JSON
    let cleanedContent = content.trim();
    
    // Remove code block markers if present
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }
    
    // Try to find and extract the main JSON object
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    let jsonString = jsonMatch[0];
    
    // Fix common JSON issues
    let parsedResult: ProcessedResults;
    
    try {
      // First attempt: parse as-is
      parsedResult = JSON.parse(jsonString) as ProcessedResults;
      console.log('Gemini JSON parsed successfully');
    } catch (firstError) {
      console.log('First JSON parse failed, attempting to fix common issues...');
      
      // Try to fix common JSON issues
      // Remove trailing commas
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1');
      
      // Fix incomplete strings by finding unmatched quotes
      const lines = jsonString.split('\n');
      let fixedLines = [];
      for (let line of lines) {
        // If line has unmatched quotes, try to close them
        const quotes = (line.match(/"/g) || []).length;
        if (quotes % 2 !== 0 && !line.trim().endsWith(',') && !line.trim().endsWith('}') && !line.trim().endsWith(']')) {
          line = line.trim() + '"';
        }
        fixedLines.push(line);
      }
      jsonString = fixedLines.join('\n');
      
      try {
        parsedResult = JSON.parse(jsonString) as ProcessedResults;
        console.log('Gemini JSON parsed successfully after fixes');
      } catch (secondError: any) {
        console.error('Failed to parse JSON even after fixes:', secondError);
        throw new Error(`Gemini returned malformed JSON: ${secondError.message}`);
      }
    }
    
    // Validate the structure
    if (!parsedResult.topRecommendedBrands || !parsedResult.resultsByPrompt) {
      throw new Error('Invalid response structure from Gemini');
    }

    // Generate AI recommendation for the top brand
    const topBrand = parsedResult.topRecommendedBrands[0]?.name;
    const originalPrompt = structuredResponses?.[0]?.prompt || competitorResults?.[0]?.prompt || '';
    
    if (topBrand && originalPrompt) {
      try {
        const aiRecommendation = await generateAIRecommendation(topBrand, originalPrompt);
        parsedResult.aiRecommendation = aiRecommendation;
      } catch (error) {
        console.error('Failed to generate AI recommendation:', error);
        parsedResult.aiRecommendation = `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
      }
    }

    return parsedResult;
  } catch (error) {
    console.error('Error processing competitor results with Gemini:', error);
    
    // Fallback: Use structured responses if available, otherwise basic extraction
    if (structuredResponses && structuredResponses.length > 0) {
      console.log('Using structured responses for fallback aggregation');
      
      // Extract all brands from structured responses
      const allBrands = new Map<string, { name: string; score: number; count: number; sentiment: string[] }>();
      const reportByProvider: any[] = [];
      const reportByBrand: any[] = [];
      
      // Process structured responses
      structuredResponses.forEach(response => {
        if (response.structuredData?.brands) {
          // Add to reportByProvider
          reportByProvider.push({
            provider: response.provider,
            brandRankings: response.structuredData.brands.map(brand => ({
              name: brand.name,
              ranking: brand.ranking,
              positives: brand.positives || [],
              negatives: brand.negatives || []
            }))
          });
          
          // Aggregate brand data
          response.structuredData.brands.forEach(brand => {
            const key = brand.name.toLowerCase();
            const existing = allBrands.get(key) || { 
              name: brand.name, 
              score: 0, 
              count: 0, 
              sentiment: [] 
            };
            existing.score += (8 - brand.ranking); // Higher ranking = more points
            existing.count++;
            existing.sentiment.push(brand.overallSentiment || 'positive');
            allBrands.set(key, existing);
          });
        }
      });
      
      // Create top brands list
      const topRecommendedBrands = Array.from(allBrands.values())
        .map(brand => ({
          name: brand.name,
          score: Math.round(brand.score / brand.count),
          reasoning: `Ranked by ${brand.count} AI provider(s)`,
          sentiment: brand.sentiment.includes('positive') ? 'positive' as const : 'negative' as const
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
      
      // Create reportByBrand with AI providers format and proper rankings
      const sortedBrands = Array.from(allBrands.values())
        .map(brand => ({
          ...brand,
          averageScore: brand.score / brand.count
        }))
        .sort((a, b) => b.averageScore - a.averageScore);

      sortedBrands.forEach((brand, index) => {
        const providerInsights = structuredResponses
          .filter(resp => resp.structuredData?.brands?.some(b => b.name.toLowerCase() === brand.name.toLowerCase()))
          .map(resp => {
            const brandData = resp.structuredData!.brands.find(b => b.name.toLowerCase() === brand.name.toLowerCase())!;
            return {
              provider: resp.provider,
              ranking: brandData.ranking,
              positives: brandData.positives || [],
              negatives: brandData.negatives || []
            };
          });
        
        if (providerInsights.length > 0) {
          reportByBrand.push({
            brandName: brand.name,
            overallRanking: index + 1, // Proper ranking: 1st, 2nd, 3rd, etc.
            providerInsights,
            aiProvidersThink: {
              positiveAspects: Array.from(new Set(providerInsights.flatMap(p => p.positives))),
              negativeAspects: Array.from(new Set(providerInsights.flatMap(p => p.negatives))),
              keyFeatures: [`Evaluated by ${brand.count} provider(s)`]
            }
          });
        }
      });
      
      // Generate AI recommendation for the top brand in fallback
      const topBrand = topRecommendedBrands[0]?.name;
      const originalPrompt = structuredResponses?.[0]?.prompt || '';
      let aiRecommendation = '';
      
      if (topBrand && originalPrompt) {
        try {
          aiRecommendation = await generateAIRecommendation(topBrand, originalPrompt);
        } catch (error) {
          console.error('Failed to generate AI recommendation in fallback:', error);
          aiRecommendation = `Based on comprehensive analysis, ${topBrand} emerges as the top recommendation.`;
        }
      }

      return {
        topRecommendedBrands,
        resultsByPrompt: structuredResponses.map(response => ({
          prompt: response.prompt,
          providers: response.structuredData?.brands?.map(brand => ({
            provider: response.provider,
            recommendedBrand: brand.name,
            reasoning: `Ranked #${brand.ranking}`,
            sentiment: brand.overallSentiment === 'positive' ? 'positive' as const : 'negative' as const
          })) || []
        })),
        aggregatedAnalysis: {
          reportByProvider,
          reportByBrand: reportByBrand.slice(0, 10)
        },
        aiRecommendation
      };
    }
    
    // Basic fallback for unstructured data
    const basicTopBrands = competitorResults
      .map(result => {
        const brandMatch = result.response.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
        const brand = brandMatch?.[0] || 'Unknown Brand';
        return {
          name: brand,
          score: 5,
          reasoning: 'Mentioned in AI response',
          sentiment: 'positive' as const
        };
      })
      .slice(0, 5);

    // Generate basic AI recommendation
    const basicTopBrand = basicTopBrands[0]?.name;
    const basicOriginalPrompt = competitorResults?.[0]?.prompt || '';
    let basicAiRecommendation = '';
    
    if (basicTopBrand && basicOriginalPrompt) {
      try {
        basicAiRecommendation = await generateAIRecommendation(basicTopBrand, basicOriginalPrompt);
      } catch (error) {
        console.error('Failed to generate basic AI recommendation:', error);
        basicAiRecommendation = `Based on analysis, ${basicTopBrand} emerges as a strong recommendation.`;
      }
    }

    return {
      topRecommendedBrands: basicTopBrands,
      resultsByPrompt: competitorResults.reduce((acc, result) => {
        const existingPrompt = acc.find(p => p.prompt === result.prompt);
        const brandMatch = result.response.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
        const brand = brandMatch?.[0] || 'Unknown Brand';
        
        const providerEntry = {
          provider: result.provider,
          recommendedBrand: brand,
          reasoning: 'Recommended by AI model',
          sentiment: 'positive' as const
        };

        if (existingPrompt) {
          existingPrompt.providers.push(providerEntry);
        } else {
          acc.push({
            prompt: result.prompt,
            providers: [providerEntry]
          });
        }
        return acc;
      }, [] as ProcessedResults['resultsByPrompt']),
      aggregatedAnalysis: {
        reportByProvider: [],
        reportByBrand: []
      },
      aiRecommendation: basicAiRecommendation
    };
  }
}
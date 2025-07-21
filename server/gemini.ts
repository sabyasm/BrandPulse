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
2. Combine similar brand names (AWS = Amazon Web Services)
3. Create detailed positive/negative lists for each brand from each provider
4. Calculate overall rankings by averaging individual provider rankings
5. Consolidate insights across providers in the "aiProvidersThink" section
6. Focus on actionable business insights
7. Ensure all data is factual and extracted from the responses

Return ONLY valid JSON, no additional text.
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
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

    return parsedResult;
  } catch (error) {
    console.error('Error processing competitor results with Gemini:', error);
    
    // Fallback: return a basic structure to prevent UI errors
    return {
      topRecommendedBrands: competitorResults
        .map(result => {
          // Simple brand extraction as fallback
          const brandMatch = result.response.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
          const brand = brandMatch?.[0] || 'Unknown Brand';
          return {
            name: brand,
            score: 5,
            reasoning: 'Mentioned in AI response',
            sentiment: 'positive' as const
          };
        })
        .slice(0, 5), // Top 5 only
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
      }
    };
  }
}
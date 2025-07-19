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
}

export async function processCompetitorResults(
  competitorResults: Array<{
    prompt: string;
    provider: string;
    response: string;
  }>
): Promise<ProcessedResults> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const prompt = `
Analyze the following AI model responses about competitor recommendations and extract clean, structured data.

Raw AI responses:
${competitorResults.map(result => `
Prompt: "${result.prompt}"
AI Provider: ${result.provider}
Response: ${result.response}
---
`).join('\n')}

Please provide a JSON response with the following structure:

{
  "topRecommendedBrands": [
    {
      "name": "Brand Name Only (e.g. 'AWS', 'Shopify', 'Salesforce')",
      "score": number (1-10 based on how often mentioned and positive sentiment),
      "reasoning": "Brief 1-2 sentence explanation why this brand is recommended",
      "sentiment": "positive" or "negative"
    }
  ],
  "resultsByPrompt": [
    {
      "prompt": "Original prompt text",
      "providers": [
        {
          "provider": "AI Provider Name",
          "recommendedBrand": "Clean brand name only",
          "reasoning": "1-2 sentences why this provider recommended this brand",
          "sentiment": "positive" or "negative"
        }
      ]
    }
  ]
}

Rules:
1. Extract ONLY real brand/company names (AWS, Google Cloud, Shopify, etc.) - NO generic terms
2. Combine similar brands (e.g. "AWS" and "Amazon Web Services" = "AWS")
3. Score based on frequency and positive sentiment across all responses
4. Keep reasoning concise and business-focused
5. Mark sentiment as positive (+) for recommendations, negative (-) for warnings/concerns
6. If a provider mentions multiple brands, create separate entries for each
7. Focus on the TOP brands that appear most frequently across responses

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
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const parsedResult = JSON.parse(jsonMatch[0]) as ProcessedResults;
    
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
      }, [] as ProcessedResults['resultsByPrompt'])
    };
  }
}
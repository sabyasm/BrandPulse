export const AVAILABLE_MODELS = [
  { id: "openai/gpt-4", name: "OpenAI GPT-4", provider: "OpenAI" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
  { id: "google/gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "perplexity/sonar-medium-online", name: "Perplexity Sonar", provider: "Perplexity" },
];

export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function testOpenRouterApiKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("/api/brand-monitor/test-api-key", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();
    return data.valid;
  } catch (error) {
    console.error("Failed to test API key:", error);
    return false;
  }
}

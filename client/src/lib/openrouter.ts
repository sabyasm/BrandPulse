export const AVAILABLE_MODELS = [
  { id: "openai/gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "anthropic/claude-3-sonnet", name: "Claude 3", provider: "Anthropic" },
  { id: "google/gemini-pro", name: "Gemini Pro", provider: "Google" },
  { id: "perplexity/sonar-medium-online", name: "Perplexity", provider: "Perplexity" },
];

export async function testOpenRouterKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error testing OpenRouter API key:", error);
    return false;
  }
}
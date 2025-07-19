export const AVAILABLE_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Gemini 2.5", provider: "Google" },
  { id: "deepseek/deepseek-chat-v3-0324", name: "DeepSeek v3", provider: "DeepSeek" },
  { id: "x-ai/grok-4", name: "Grok 4", provider: "xAI" },
  { id: "openai/gpt-4.1", name: "OpenAI GPT4.1", provider: "OpenAI" },
  { id: "anthropic/claude-sonnet-4", name: "Claude 4", provider: "Anthropic" },
  { id: "moonshotai/kimi-k2:free", name: "Kimi K2", provider: "MoonshotAI" },
  { id: "anthropic/claude-3.7-sonnet", name: "Claude 3.7", provider: "Anthropic" },
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
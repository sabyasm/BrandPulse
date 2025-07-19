export type IndustryType = "technology" | "finance" | "healthcare";

export const INDUSTRY_PROMPTS: Record<IndustryType, string[]> = {
  technology: [
    "Who are the leading cloud infrastructure providers?",
    "What are the best enterprise software solutions for digital transformation?",
    "Which companies offer the most reliable DevOps tools?",
    "What are the top SaaS platforms for business automation?",
    "Who provides the best AI/ML development platforms?",
  ],
  finance: [
    "Which fintech companies are leading digital banking innovation?",
    "What are the top payment processing solutions for businesses?",
    "Which companies provide the best financial analytics tools?",
    "Who offers the most secure blockchain and cryptocurrency solutions?",
    "What are the leading robo-advisory platforms?",
  ],
  healthcare: [
    "Which companies are leading in digital health innovation?",
    "What are the top telemedicine platforms?",
    "Which medical device companies are most innovative?",
    "Who provides the best healthcare analytics solutions?",
    "What are the leading electronic health record systems?",
  ],
};

export function getPromptsForIndustry(industry: IndustryType): string[] {
  return INDUSTRY_PROMPTS[industry] || [];
}

import { pgTable, text, serial, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  description: text("description"),
  industry: text("industry"),
  founded: text("founded"),
  employees: text("employees"),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandAnalyses = pgTable("brand_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  companyId: integer("company_id").references(() => companies.id),
  title: text("title").notNull(),
  analysisType: text("analysis_type").notNull().default("brand"), // brand, competitor
  status: text("status").notNull().default("pending"), // pending, in_progress, completed, failed
  selectedProviders: jsonb("selected_providers").$type<string[]>().notNull(),
  selectedPrompts: jsonb("selected_prompts").$type<string[]>().notNull(),
  webSearchEnabled: boolean("web_search_enabled").default(false),
  progress: integer("progress").default(0),
  overallScore: integer("overall_score"),
  topProvider: text("top_provider"),
  improvementArea: text("improvement_area"),
  results: jsonb("results").$type<{
    providerResponses: Array<{
      provider: string;
      prompt: string;
      response: string;
      brandMentioned: boolean;
      position?: number;
      score: number;
      mentionedBrands?: Array<{
        name: string;
        position: number;
        context: string;
      }>;
    }>;
    competitors: Array<{
      name: string;
      mentions: number;
      totalPrompts: number;
      averagePosition: number;
    }>;
    insights: Array<{
      type: "opportunity" | "gap" | "strength";
      title: string;
      description: string;
    }>;
    competitorResults?: Array<{
      prompt: string;
      provider: string;
      response: string;
      recommendedBrands: Array<{
        name: string;
        ranking: number;
        reason: string;
      }>;
    }>;
    enhancedPrompt?: string;
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
    }>;
    aggregatedAnalysis?: {
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
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export const insertBrandAnalysisSchema = createInsertSchema(brandAnalyses).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type BrandAnalysis = typeof brandAnalyses.$inferSelect;
export type InsertBrandAnalysis = z.infer<typeof insertBrandAnalysisSchema>;

import { users, companies, brandAnalyses, type User, type InsertUser, type Company, type InsertCompany, type BrandAnalysis, type InsertBrandAnalysis } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCompany(id: number): Promise<Company | undefined>;
  getCompanyByUrl(url: string): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  
  getBrandAnalysis(id: number): Promise<BrandAnalysis | undefined>;
  getBrandAnalysesByUser(userId: number): Promise<BrandAnalysis[]>;
  createBrandAnalysis(analysis: InsertBrandAnalysis): Promise<BrandAnalysis>;
  updateBrandAnalysis(id: number, updates: Partial<BrandAnalysis>): Promise<BrandAnalysis>;
  deleteBrandAnalysis(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private companies: Map<number, Company>;
  private brandAnalyses: Map<number, BrandAnalysis>;
  private currentUserId: number;
  private currentCompanyId: number;
  private currentAnalysisId: number;

  constructor() {
    this.users = new Map();
    this.companies = new Map();
    this.brandAnalyses = new Map();
    this.currentUserId = 1;
    this.currentCompanyId = 1;
    this.currentAnalysisId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.get(id);
  }

  async getCompanyByUrl(url: string): Promise<Company | undefined> {
    return Array.from(this.companies.values()).find(
      (company) => company.url === url,
    );
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const id = this.currentCompanyId++;
    const company: Company = {
      ...insertCompany,
      id,
      description: insertCompany.description || null,
      industry: insertCompany.industry || null,
      founded: insertCompany.founded || null,
      employees: insertCompany.employees || null,
      logo: insertCompany.logo || null,
      createdAt: new Date(),
    };
    this.companies.set(id, company);
    return company;
  }

  async getBrandAnalysis(id: number): Promise<BrandAnalysis | undefined> {
    return this.brandAnalyses.get(id);
  }

  async getBrandAnalysesByUser(userId: number): Promise<BrandAnalysis[]> {
    return Array.from(this.brandAnalyses.values())
      .filter((analysis) => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBrandAnalysis(insertAnalysis: InsertBrandAnalysis): Promise<BrandAnalysis> {
    const id = this.currentAnalysisId++;
    const now = new Date();
    const analysis: BrandAnalysis = {
      ...insertAnalysis,
      id,
      userId: 1, // Mock user ID for simplified storage
      status: insertAnalysis.status || "pending",
      progress: insertAnalysis.progress || 0,
      overallScore: insertAnalysis.overallScore || null,
      topProvider: insertAnalysis.topProvider || null,
      improvementArea: insertAnalysis.improvementArea || null,
      results: insertAnalysis.results || {
        providerResponses: [],
        competitors: [],
        insights: [],
      },
      createdAt: now,
      updatedAt: now,
    };
    this.brandAnalyses.set(id, analysis);
    return analysis;
  }

  async updateBrandAnalysis(id: number, updates: Partial<BrandAnalysis>): Promise<BrandAnalysis> {
    const existing = this.brandAnalyses.get(id);
    if (!existing) {
      throw new Error("Analysis not found");
    }
    
    const updated: BrandAnalysis = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.brandAnalyses.set(id, updated);
    return updated;
  }

  async deleteBrandAnalysis(id: number): Promise<void> {
    this.brandAnalyses.delete(id);
  }
}

export const storage = new MemStorage();

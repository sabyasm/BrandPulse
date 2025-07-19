import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Company, BrandAnalysis } from "@shared/schema";

export function useBrandAnalysis() {
  const [extractedCompany, setExtractedCompany] = useState<Company | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const extractCompany = useMutation({
    mutationFn: async ({ url }: { url: string }) => {
      const response = await apiRequest("POST", "/api/brand-monitor/extract-company", { url });
      return response.json() as Promise<Company>;
    },
    onSuccess: (company) => {
      setExtractedCompany(company);
      toast({
        title: "Company information extracted",
        description: `Successfully extracted information for ${company.name}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Extraction failed",
        description: error.message || "Failed to extract company information",
        variant: "destructive",
      });
    },
  });

  const testApiKey = useMutation({
    mutationFn: async ({ apiKey }: { apiKey: string }) => {
      const response = await apiRequest("POST", "/api/brand-monitor/test-api-key", { apiKey });
      return response.json() as Promise<{ valid: boolean }>;
    },
    onSuccess: (result) => {
      if (result.valid) {
        toast({
          title: "API key validated",
          description: "OpenRouter API key is working correctly",
        });
      } else {
        toast({
          title: "Invalid API key",
          description: "The provided OpenRouter API key is not valid",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Validation failed",
        description: error.message || "Failed to validate API key",
        variant: "destructive",
      });
    },
  });

  const startAnalysis = useMutation({
    mutationFn: async (data: {
      companyId: number;
      apiKey: string;
      selectedProviders: string[];
      selectedPrompts: string[];
      webSearchEnabled: boolean;
      title: string;
    }) => {
      const response = await apiRequest("POST", "/api/brand-monitor/analyze", data);
      return response.json() as Promise<BrandAnalysis>;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-monitor/analyses"] });
      toast({
        title: "Analysis started",
        description: `Brand analysis for ${analysis.title} has begun`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Analysis failed to start",
        description: error.message || "Failed to start brand analysis",
        variant: "destructive",
      });
    },
  });

  const deleteAnalysis = useMutation({
    mutationFn: async (analysisId: number) => {
      await apiRequest("DELETE", `/api/brand-monitor/analyses/${analysisId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/brand-monitor/analyses"] });
      toast({
        title: "Analysis deleted",
        description: "The analysis has been successfully deleted",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete analysis",
        variant: "destructive",
      });
    },
  });

  return {
    extractedCompany,
    extractCompany,
    testApiKey,
    startAnalysis,
    deleteAnalysis,
    isExtracting: extractCompany.isPending,
    isTestingApiKey: testApiKey.isPending,
    isStartingAnalysis: startAnalysis.isPending,
  };
}

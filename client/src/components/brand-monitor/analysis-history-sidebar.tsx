import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BrandAnalysis } from "@shared/schema";

interface AnalysisHistorySidebarProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  selectedAnalysisId: number | null;
  onSelectAnalysis: (id: number | null) => void;
  isMobile: boolean;
}

export default function AnalysisHistorySidebar({
  isOpen,
  onToggle,
  selectedAnalysisId,
  onSelectAnalysis,
  isMobile,
}: AnalysisHistorySidebarProps) {
  const { data: analyses = [], isLoading } = useQuery<BrandAnalysis[]>({
    queryKey: ["/api/brand-monitor/analyses"],
  });

  const handleNewAnalysis = () => {
    onSelectAnalysis(null);
    if (isMobile) {
      onToggle(false);
    }
  };

  const handleSelectAnalysis = (id: number) => {
    onSelectAnalysis(id);
    if (isMobile) {
      onToggle(false);
    }
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => onToggle(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside
        className={`${
          isMobile ? "fixed" : "sticky"
        } ${isMobile ? "top-0 h-screen" : "top-16 h-[calc(100vh-4rem)]"} w-80 bg-white border-r border-gray-200 z-50 flex flex-col ${
          isMobile && isOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : ""
        } transition-transform duration-300 ease-in-out lg:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Analysis History</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewAnalysis}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Analysis List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No analysis history yet</p>
              <p className="text-gray-400 text-xs mt-1">Start your first brand analysis</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className={`px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    selectedAnalysisId === analysis.id ? "bg-blue-50 border-r-2 border-blue-500" : ""
                  }`}
                  onClick={() => handleSelectAnalysis(analysis.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {analysis.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {analysis.selectedProviders.length} AI providers analyzed
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {format(new Date(analysis.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex flex-col items-end space-y-1">
                      <Badge
                        variant={
                          analysis.status === "completed"
                            ? "secondary"
                            : analysis.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                        className={
                          analysis.status === "completed"
                            ? "bg-emerald-100 text-emerald-700"
                            : analysis.status === "in_progress"
                            ? "bg-blue-100 text-blue-700"
                            : ""
                        }
                      >
                        {analysis.status === "completed"
                          ? "Complete"
                          : analysis.status === "in_progress"
                          ? "Running"
                          : analysis.status === "failed"
                          ? "Failed"
                          : "Pending"}
                      </Badge>
                      
                      {analysis.status === "completed" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Delete functionality would be implemented here
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

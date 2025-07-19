import { Card, CardContent } from "@/components/ui/card";
import { useBrandAnalysis } from "@/hooks/use-brand-analysis";

export default function CompanyInfoCard() {
  const { extractedCompany } = useBrandAnalysis();

  if (!extractedCompany) return null;

  const initials = extractedCompany.name
    .split(" ")
    .map(word => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          {/* Company Logo Placeholder */}
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
          
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{extractedCompany.name}</h3>
            <p className="text-gray-600 mb-4">{extractedCompany.description}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Industry</span>
                <p className="font-medium text-gray-900">{extractedCompany.industry}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Founded</span>
                <p className="font-medium text-gray-900">{extractedCompany.founded}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Employees</span>
                <p className="font-medium text-gray-900">{extractedCompany.employees}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

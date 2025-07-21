import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Euro } from "lucide-react"
import type { Submission } from "@/types/submission"

interface KeyMetricsCardProps {
  submission: Submission
}

/**
 * Key metrics display card
 * TODO: Add trend indicators and historical data
 */
export function KeyMetricsCard({ submission }: KeyMetricsCardProps) {
  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2 text-black">
          <TrendingUp className="h-5 w-5 text-[#D4AE36]" />
          Key Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Euro className="h-4 w-4" />
              Revenue:
            </span>
            <span className="font-medium text-black">{submission.details.keyMetrics.revenue}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-600">Customers:</span>
            <span className="font-medium text-black">{submission.details.keyMetrics.customers}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200">
            <span className="text-sm text-gray-600">Team Experience:</span>
            <span className="font-medium text-black">{submission.details.keyMetrics.teamExperience}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

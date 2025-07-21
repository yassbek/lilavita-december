import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Award, Building } from "lucide-react"
import type { Submission } from "@/types/submission"

interface StatsCardsProps {
  submissions: Submission[]
}

/**
 * Statistics cards component showing key metrics
 * TODO: Replace calculations with API calls to analytics endpoint
 */
export function StatsCards({ submissions }: StatsCardsProps) {
  // Calculate key metrics
  // TODO: Move these calculations to backend analytics service
  const totalSubmissions = submissions.length
  const avgMatchScore = Math.round(submissions.reduce((acc, sub) => acc + sub.matchScore, 0) / submissions.length)
  const highPotentialCount = submissions.filter((sub) => sub.matchScore >= 85).length
  const activeSectors = new Set(submissions.map((sub) => sub.sector)).size

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Total submissions card */}
      <Card className="border-2 border-gray-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">Total Submissions</CardTitle>
          <Users className="h-4 w-4 text-[#D4AE36]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{totalSubmissions}</div>
          <p className="text-xs text-gray-600">+12% from last month</p>
        </CardContent>
      </Card>

      {/* Average match score card */}
      <Card className="border-2 border-gray-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">Avg Match Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#D4AE36]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{avgMatchScore}%</div>
          <p className="text-xs text-gray-600">+5% from last month</p>
        </CardContent>
      </Card>

      {/* High potential startups card */}
      <Card className="border-2 border-gray-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">High Potential</CardTitle>
          <Award className="h-4 w-4 text-[#D4AE36]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{highPotentialCount}</div>
          <p className="text-xs text-gray-600">Score ≥ 85%</p>
        </CardContent>
      </Card>

      {/* Active sectors card */}
      <Card className="border-2 border-gray-200 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-black">Active Sectors</CardTitle>
          <Building className="h-4 w-4 text-[#D4AE36]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-black">{activeSectors}</div>
          <p className="text-xs text-gray-600">Different focus areas</p>
        </CardContent>
      </Card>
    </div>
  )
}

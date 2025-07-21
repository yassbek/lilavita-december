import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Submission } from "@/types/submission"

interface ReadinessScoresCardProps {
  submission: Submission
}

/**
 * Individual readiness scores breakdown
 * TODO: Add drill-down functionality for detailed assessment
 */
export function ReadinessScoresCard({ submission }: ReadinessScoresCardProps) {
  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-[#D4AE36]"
    if (score >= 70) return "text-gray-600"
    return "text-black"
  }

  const getScoreBg = (score: number): string => {
    if (score >= 85) return "bg-yellow-50 border-[#D4AE36]"
    if (score >= 70) return "bg-gray-50 border-gray-300"
    return "bg-red-50 border-red-200"
  }

  const getProgressColor = (score: number): string => {
    if (score >= 85) return "bg-[#D4AE36]"
    if (score >= 70) return "bg-gray-400"
    return "bg-black"
  }

  const scoreLabels = {
    teamCompetence: "Team Kompetenz",
    teamDynamics: "Team Dynamik",
    organization: "Organisation",
    leadership: "Führung",
    processes: "Prozesse",
    culture: "Kultur",
  }

  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-black">Readiness Scores</CardTitle>
        <CardDescription>Detailed breakdown of assessment areas</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-3">
        {Object.entries(submission.readinessScores).map(([key, score]) => (
          <div key={key} className={`p-3 border-2 ${getScoreBg(score)}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-black">{scoreLabels[key as keyof typeof scoreLabels]}</span>
              <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
            </div>
            <div className="w-full bg-white h-2 border border-gray-200">
              <div className={`h-2 ${getProgressColor(score)}`} style={{ width: `${score}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

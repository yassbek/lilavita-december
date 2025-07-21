import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"
import { Target } from "lucide-react"
import type { Submission } from "@/types/submission"

interface ReadinessRadarChartProps {
  submission: Submission
}

/**
 * Radar chart component showing readiness profile vs ideal
 * TODO: Make ideal profile configurable per sector
 */
export function ReadinessRadarChart({ submission }: ReadinessRadarChartProps) {
  // Transform readiness scores for radar chart
  // TODO: Fetch ideal profile values from configuration API
  const radarData = [
    {
      subject: "Team Kompetenz",
      score: submission.readinessScores.teamCompetence,
      ideal: 90,
    },
    {
      subject: "Team Dynamik",
      score: submission.readinessScores.teamDynamics,
      ideal: 90,
    },
    {
      subject: "Organisation",
      score: submission.readinessScores.organization,
      ideal: 90,
    },
    {
      subject: "Führung",
      score: submission.readinessScores.leadership,
      ideal: 90,
    },
    {
      subject: "Prozesse",
      score: submission.readinessScores.processes,
      ideal: 90,
    },
    {
      subject: "Kultur",
      score: submission.readinessScores.culture,
      ideal: 90,
    },
  ]

  const getScoreColor = (score: number): string => {
    if (score >= 85) return "text-[#D4AE36]"
    if (score >= 70) return "text-gray-600"
    return "text-black"
  }

  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2 text-black">
          <Target className="h-5 w-5 text-[#D4AE36]" />
          Readiness Profile vs. Ideal Profile
        </CardTitle>
        <CardDescription>Team & Organization readiness assessment based on Impact Factory framework</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#374151" }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
              <Radar
                name="Ideal Profile"
                dataKey="ideal"
                stroke="#e5e7eb"
                fill="#f3f4f6"
                fillOpacity={0.3}
                strokeWidth={2}
                strokeDasharray="5 5"
              />
              <Radar
                name="Current Score"
                dataKey="score"
                stroke="#D4AE36"
                fill="#D4AE36"
                fillOpacity={0.2}
                strokeWidth={3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score breakdown grid */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
          {radarData.map((item) => (
            <div key={item.subject} className="text-center p-3 bg-gray-50 border border-gray-200">
              <div className="text-sm font-medium text-gray-700">{item.subject}</div>
              <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
              <div className="text-xs text-gray-500">Gap: {item.ideal - item.score}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

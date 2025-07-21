"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users } from "lucide-react"
import type { Submission } from "@/types/submission"

interface SubmissionsGridProps {
  submissions: Submission[]
  onSubmissionSelect: (submission: Submission) => void
}

/**
 * Grid component displaying submission cards
 * TODO: Add pagination and virtual scrolling for large datasets
 */
export function SubmissionsGrid({ submissions, onSubmissionSelect }: SubmissionsGridProps) {
  // Helper functions for styling based on score
  const getScoreColor = (score: number): string => {
    if (score >= 85) return "bg-[#D4AE36]"
    if (score >= 70) return "bg-gray-400"
    return "bg-black"
  }

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 85) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  // Show empty state if no submissions match filters
  if (submissions.length === 0) {
    return (
      <Card className="text-center py-12 border-2 border-gray-200 shadow-none">
        <CardContent>
          <div className="text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-black">No submissions found</h3>
            <p>Try adjusting your filters to see more results.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {submissions.map((submission) => (
        <Card
          key={submission.id}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-gray-200 hover:border-[#D4AE36] shadow-none"
          onClick={() => onSubmissionSelect(submission)}
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg text-black">{submission.startupName}</CardTitle>
                <CardDescription className="text-sm text-gray-600">{submission.founderName}</CardDescription>
              </div>
              <Badge
                variant={getScoreBadgeVariant(submission.matchScore)}
                className="bg-[#D4AE36] text-black hover:bg-[#D4AE36]/80"
              >
                {submission.matchScore}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Sector badge */}
              <div>
                <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                  {submission.sector}
                </Badge>
              </div>

              {/* Key metrics */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Team Size:</span>
                  <span className="font-medium text-black">{submission.details.teamSize}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Stage:</span>
                  <span className="font-medium text-black">{submission.details.fundingStage}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-black">{submission.details.location}</span>
                </div>
              </div>

              {/* Readiness score bar */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Readiness Score</span>
                  <span className="text-sm font-bold text-black">{submission.matchScore}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2">
                  <div
                    className={`h-2 ${getScoreColor(submission.matchScore)}`}
                    style={{ width: `${submission.matchScore}%` }}
                  />
                </div>
              </div>

              {/* Submission date */}
              <div className="text-xs text-gray-500 pt-2">
                Submitted: {new Date(submission.submissionDate).toLocaleDateString("de-DE")}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft } from "lucide-react"
import type { Submission } from "@/types/submission"

interface SubmissionHeaderProps {
  submission: Submission
  onBack: () => void
}

/**
 * Header component for submission detail view
 * TODO: Add action buttons for status updates and notes
 */
export function SubmissionHeader({ submission, onBack }: SubmissionHeaderProps) {
  const getBadgeVariant = (score: number) => {
    if (score >= 85) return "default"
    if (score >= 70) return "secondary"
    return "destructive"
  }

  return (
    <div className="bg-black border-b-2 border-[#D4AE36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center gap-2 text-white hover:text-[#D4AE36] hover:bg-gray-800"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">{submission.startupName}</h1>
                <p className="text-gray-300 mt-1">Founded by {submission.founderName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge
                variant={getBadgeVariant(submission.matchScore)}
                className="text-lg px-4 py-2 bg-[#D4AE36] text-black hover:bg-[#D4AE36]/80"
              >
                {submission.matchScore}% Match
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"
import { SubmissionHeader } from "./submission-header"
import { BasicInfoCard } from "./basic-info-card"
import { KeyMetricsCard } from "./key-metrics-card"
import { ReadinessScoresCard } from "./readiness-scores-card"
import { ReadinessRadarChart } from "./readiness-radar-chart"
import { AIAnalysisCard } from "./ai-analysis-card"
import { NextStepsCard } from "./next-steps-card"
import type { Submission } from "@/types/submission"

interface SubmissionDetailProps {
  submission: Submission
  onBack: () => void
}

/**
 * Detailed view component for individual submissions
 * TODO: Add edit functionality and status update capabilities
 */
export function SubmissionDetail({ submission, onBack }: SubmissionDetailProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Detail view header */}
      <SubmissionHeader submission={submission} onBack={onBack} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Basic info and metrics */}
          <div className="lg:col-span-1 space-y-6">
            <BasicInfoCard submission={submission} />
            <KeyMetricsCard submission={submission} />
            <ReadinessScoresCard submission={submission} />
          </div>

          {/* Right column - Charts and analysis */}
          <div className="lg:col-span-2 space-y-6">
            <ReadinessRadarChart submission={submission} />
            <AIAnalysisCard submission={submission} />
            <NextStepsCard />
          </div>
        </div>
      </div>
    </div>
  )
}

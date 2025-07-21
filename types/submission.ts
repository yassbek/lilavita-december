export interface ReadinessScores {
  // Team readiness dimensions
  teamCompetence: number // Competencies & experience in founding team
  teamDynamics: number // Team dynamics & cohesion

  // Organization readiness dimensions
  organization: number // Structures & processes
  leadership: number // Leadership & decision making
  processes: number // Financial & business processes
  culture: number // Personnel & culture
}

export interface SubmissionDetails {
  teamSize: number
  fundingStage: string
  location: string
  description: string
  keyMetrics: {
    revenue: string
    customers: number
    teamExperience: string
  }
}

export interface Submission {
  id: string
  founderName: string
  startupName: string
  sector: string
  matchScore: number // Overall readiness score
  submissionDate: string
  status: string
  readinessScores: ReadinessScores
  details: SubmissionDetails
}

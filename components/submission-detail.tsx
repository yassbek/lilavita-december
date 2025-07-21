"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Building, Users, MapPin, Euro, TrendingUp, Target } from "lucide-react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts"

interface SubmissionDetailProps {
  submission: any
  onBack: () => void
}

export function SubmissionDetail({ submission, onBack }: SubmissionDetailProps) {
  const radarData = [
    {
      subject: "Technologie",
      score: submission.readinessScores.technology,
      ideal: 90,
    },
    {
      subject: "Team",
      score: submission.readinessScores.team,
      ideal: 90,
    },
    {
      subject: "Organisation",
      score: submission.readinessScores.organization,
      ideal: 90,
    },
    {
      subject: "Impact",
      score: submission.readinessScores.impact,
      ideal: 90,
    },
    {
      subject: "Markt",
      score: submission.readinessScores.market,
      ideal: 90,
    },
    {
      subject: "Finanzen",
      score: submission.readinessScores.finance,
      ideal: 90,
    },
  ]

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score) => {
    if (score >= 85) return "bg-green-50 border-green-200"
    if (score >= 70) return "bg-yellow-50 border-yellow-200"
    return "bg-red-50 border-red-200"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Dashboard
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{submission.startupName}</h1>
                  <p className="text-gray-600 mt-1">Founded by {submission.founderName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Badge
                  variant={
                    submission.matchScore >= 85 ? "default" : submission.matchScore >= 70 ? "secondary" : "destructive"
                  }
                  className="text-lg px-4 py-2"
                >
                  {submission.matchScore}% Match
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Basic Info & Metrics */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Startup Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sektor:</span>
                    <Badge variant="outline">{submission.sector}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Team Size:
                    </span>
                    <span className="font-medium">{submission.details.teamSize} Personen</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Standort:
                    </span>
                    <span className="font-medium">{submission.details.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Funding Stage:</span>
                    <span className="font-medium">{submission.details.fundingStage}</span>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Beschreibung</h4>
                  <p className="text-sm text-gray-600">{submission.details.description}</p>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      Revenue:
                    </span>
                    <span className="font-medium">{submission.details.keyMetrics.revenue}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Customers:</span>
                    <span className="font-medium">{submission.details.keyMetrics.customers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Team Experience:</span>
                    <span className="font-medium">{submission.details.keyMetrics.teamExperience}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Individual Scores */}
            <Card>
              <CardHeader>
                <CardTitle>Readiness Scores</CardTitle>
                <CardDescription>Detailed breakdown of assessment areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(submission.readinessScores).map(([key, score]) => (
                  <div key={key} className={`p-3 rounded-lg border ${getScoreBg(score)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">
                        {key === "technology"
                          ? "Technologie"
                          : key === "team"
                            ? "Team"
                            : key === "organization"
                              ? "Organisation"
                              : key === "impact"
                                ? "Impact"
                                : key === "market"
                                  ? "Markt"
                                  : key === "finance"
                                    ? "Finanzen"
                                    : key}
                      </span>
                      <span className={`font-bold ${getScoreColor(score)}`}>{score}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score >= 85 ? "bg-green-500" : score >= 70 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Radar Chart & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            {/* Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Readiness Profile vs. Ideal Profile
                </CardTitle>
                <CardDescription>
                  Spider web visualization showing how close the startup is to the ideal profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
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
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        strokeWidth={3}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {radarData.map((item) => (
                    <div key={item.subject} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-700">{item.subject}</div>
                      <div className={`text-lg font-bold ${getScoreColor(item.score)}`}>{item.score}%</div>
                      <div className="text-xs text-gray-500">Gap: {item.ideal - item.score}%</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Results */}
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis Results</CardTitle>
                <CardDescription>Detailed assessment and recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Strengths */}
                <div>
                  <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Stärken
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>
                        Starkes technisches Team mit nachgewiesener Expertise im {submission.sector.toLowerCase()}
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Klare Impact-Mission mit messbaren Zielen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Erste Kunden und Umsätze bereits generiert</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      <span>Gute Teamdynamik und klare Rollenverteilung</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Areas for Improvement */}
                <div>
                  <h4 className="font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Verbesserungsbereiche
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Finanzplanung und Controlling-Prozesse ausbauen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Skalierungsstrategien für Organisationsstrukturen entwickeln</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-yellow-500 mt-1">•</span>
                      <span>Marktanalyse und Wettbewerbspositionierung vertiefen</span>
                    </li>
                  </ul>
                </div>

                <Separator />

                {/* Recommendations */}
                <div>
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Empfehlungen
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Advisory Board mit Branchenexperten aufbauen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Pilotprojekte mit strategischen Partnern initiieren</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Funding-Strategie für nächste 12-18 Monate entwickeln</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>Impact Measurement Framework implementieren</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Nächste Schritte</CardTitle>
                <CardDescription>Empfohlene Maßnahmen für die Acceleration Phase</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h5 className="font-medium text-blue-900">Finanzplanung optimieren</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Detaillierte 18-Monats-Finanzplanung mit Meilensteinen erstellen
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h5 className="font-medium text-green-900">Marktvalidierung vertiefen</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Zusätzliche Kundengespräche und Marktanalyse durchführen
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h5 className="font-medium text-purple-900">Team erweitern</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        Sales/Marketing-Expertise ins Team holen oder als Advisor gewinnen
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

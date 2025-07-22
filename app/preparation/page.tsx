"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, Target, Users, Cog, ArrowRight, Info } from "lucide-react"

export default function PreparationPage() {
  const router = useRouter()
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [isReady, setIsReady] = useState(false)

  const readinessAreas = [
    {
      icon: Cog,
      title: "Technology Readiness",
      description: "Your product development and technical maturity",
      topics: [
        "Current development stage (MVP, prototype, market-ready)",
        "Technical challenges and how you've solved them",
        "Scalability of your technical solution",
        "Intellectual property and patents",
      ],
    },
    {
      icon: Users,
      title: "Team & Organization Readiness",
      description: "Your team composition and organizational structure",
      topics: [
        "Team composition and key competencies",
        "Previous experience and track record",
        "Role distribution and decision-making processes",
        "Company culture and values alignment",
      ],
    },
    {
      icon: Target,
      title: "Impact Readiness",
      description: "Your social and environmental impact goals",
      topics: [
        "Clear impact mission and theory of change",
        "Target beneficiaries and problem validation",
        "Impact measurement and KPIs",
        "Alignment with UN SDGs or similar frameworks",
      ],
    },
  ]

  const preparationChecklist = [
    "I have reviewed my company's mission and impact goals",
    "I can clearly explain our current product development stage",
    "I understand our team's key strengths and any gaps",
    "I have thought about our target market and beneficiaries",
    "I can discuss our business model and revenue streams",
    "I have considered our competitive advantages",
    "I am prepared to discuss challenges we've faced and overcome",
  ]

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [index]: checked }
    setCheckedItems(newCheckedItems)

    // Check if all items are checked
    const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
    setIsReady(allChecked)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interview Preparation</h1>
              <p className="text-gray-600">Get ready for your AI-powered conversation</p>
            </div>
            <Badge variant="outline" className="border-brand-gold text-yellow-800">
              Step 2 of 4
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-brand-gold" />
              <span>About the Interview</span>
            </CardTitle>
            <CardDescription>
              Our AI interviewer will assess your startup across three key readiness dimensions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Our application process is designed to understand your startup&apos;s readiness across three key dimensions: Technology, Team &amp; Organization, and Impact. The next step is an AI-powered conversation that will assess your startup&apos;s maturity and potential.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Interview Format</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Duration: 15-20 minutes</li>
                    <li>• Format: Video conversation with AI agent</li>
                    <li>• Language: German or English (your choice)</li>
                    <li>• Recording: Session will be recorded for evaluation</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Readiness Areas */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">What We&apos;ll Discuss</h2>
          <div className="grid gap-6">
            {readinessAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand-gold bg-opacity-20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-yellow-700" />
                      </div>
                      <span>{area.title}</span>
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {area.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-brand-gold rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm text-gray-700">{topic}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Preparation Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Preparation Checklist</CardTitle>
            <CardDescription>Review these points to ensure you&apos;re ready for the conversation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preparationChecklist.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <Checkbox
                    id={`checklist-${index}`}
                    checked={checkedItems[index] || false}
                    onCheckedChange={(checked) => handleCheckboxChange(index, checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor={`checklist-${index}`}
                    className={`text-sm cursor-pointer ${
                      checkedItems[index]
                        ? "text-gray-900 line-through [text-decoration-color:#D4AE36]"
                        : "text-gray-700"
                    }`}
                  >
                    {item.replace("'", "&apos;")}
                  </label>
                </div>
              ))}
            </div>

            {isReady && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-900">You&apos;re ready to proceed!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  All preparation items completed. You can now start your interview.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tips for Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">During the Interview</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Speak naturally and be authentic</li>
                  <li>• Provide specific examples when possible</li>
                  <li>• Don&apos;t worry about perfect answers</li>
                  <li>• Ask for clarification if needed</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Technical Setup</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ensure stable internet connection</li>
                  <li>• Use headphones for better audio quality</li>
                  <li>• Position camera at eye level</li>
                  <li>• Choose a quiet, well-lit environment</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You&apos;ll be prompted to allow camera and microphone access when you start the interview. Please ensure you&apos;re in a quiet environment with good lighting.
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/interview")}
            disabled={!isReady}
            className="bg-brand-gold hover:bg-yellow-500 text-black font-medium px-8 py-3"
            size="lg"
          >
            Start Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} size="lg">
            Back to Overview
          </Button>
        </div>
      </main>
    </div>
  )
}

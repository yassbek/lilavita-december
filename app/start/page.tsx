"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User, MessageSquare, Camera, Mic } from "lucide-react"

export default function StartPage() {
  const router = useRouter()
  const [userInfo] = useState({
    name: "Alex Schmidt",
    email: "alex.schmidt@example.com",
    company: "EcoTech Solutions",
    sector: "Klimaschutz & erneuerbare Energien",
  })

  const steps = [
    {
      id: 1,
      title: "Typeform Survey",
      description: "Basic information and company details",
      status: "completed",
      icon: CheckCircle,
    },
    {
      id: 2,
      title: "Interview Preparation",
      description: "Review guidelines and prepare for your conversation",
      status: "current",
      icon: User,
    },
    {
      id: 3,
      title: "Voice Agent Interview",
      description: "AI-powered conversation about your startup",
      status: "pending",
      icon: MessageSquare,
    },
    {
      id: 4,
      title: "Submission Complete",
      description: "Review and confirmation",
      status: "pending",
      icon: CheckCircle,
    },
  ]

  const getStepStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "current":
        return "bg-brand-gold bg-opacity-20 text-yellow-800 border-brand-gold"
      case "pending":
        return "bg-gray-100 text-gray-600 border-gray-200"
      default:
        return "bg-gray-100 text-gray-600 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Impact Factory</h1>
              <p className="text-gray-600">Accelerator Application Process</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{userInfo.name}</p>
              <p className="text-sm text-gray-600">{userInfo.company}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Welcome to the Impact Factory Application Process</CardTitle>
            <CardDescription>
              Thank you for your interest in joining our accelerator program. You&apos;re applying for the{" "}
              <Badge variant="outline" className="border-brand-gold text-yellow-800">
                {userInfo.sector}
              </Badge>{" "}
              track.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">
              Our application process is designed to understand your startup&apos;s readiness across three key dimensions: Technology, Team &amp; Organization, and Impact. The next step is an AI-powered conversation that will assess your startup&apos;s maturity and potential.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What to expect:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 15-20 minute conversation with our AI interviewer</li>
                <li>• Questions about your team, technology, and impact goals</li>
                <li>• Natural conversation - no need to prepare specific answers</li>
                <li>• Technical requirements: working camera and microphone</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Application Progress</CardTitle>
            <CardDescription>Track your progress through the application process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.id} className="flex items-start space-x-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStepStatus(step.status)}`}
                    >
                      {step.status === "completed" ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : step.status === "current" ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-medium ${step.status === "current" ? "text-gray-900" : step.status === "completed" ? "text-green-800" : "text-gray-500"}`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`text-sm ${step.status === "current" ? "text-gray-600" : step.status === "completed" ? "text-green-600" : "text-gray-400"}`}
                      >
                        {step.description}
                      </p>
                    </div>
                    {index < steps.length - 1 && <div className="absolute left-4 mt-8 w-0.5 h-8 bg-gray-200"></div>}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Technical Check */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Technical Requirements</span>
            </CardTitle>
            <CardDescription>Please ensure your device meets these requirements before proceeding</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Camera className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Camera Access</p>
                  <p className="text-sm text-green-700">Required for video interview</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Mic className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Microphone Access</p>
                  <p className="text-sm text-green-700">Required for voice conversation</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> You&apos;ll be prompted to allow camera and microphone access when you start the interview. Please ensure you&apos;re in a quiet environment with good lighting.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/preparation")}
            className="bg-brand-gold hover:bg-yellow-500 text-black font-medium px-8 py-3"
            size="lg"
          >
            Continue to Preparation
          </Button>
          <Button variant="outline" onClick={() => window.open("mailto:support@impactfactory.de", "_blank")} size="lg">
            Need Help?
          </Button>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Mail, Calendar } from "lucide-react"

export default function CompletionPage() {
  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    // Animate the success state
    const timer = setTimeout(() => {
      setShowSuccess(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const nextSteps = [
    {
      title: "Application Review",
      description: "Our team will review your interview and application materials",
      timeframe: "3-5 business days",
      icon: Clock,
    },
    {
      title: "Initial Feedback",
      description: "You'll receive initial feedback on your readiness assessment",
      timeframe: "1 week",
      icon: Mail,
    },
    {
      title: "Decision Notification",
      description: "Final decision on your accelerator application",
      timeframe: "2 weeks",
      icon: CheckCircle,
    },
    {
      title: "Program Start",
      description: "If accepted, your accelerator journey begins",
      timeframe: "Next cohort",
      icon: Calendar,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Application Complete</h1>
              <p className="text-gray-600">Thank you for your submission</p>
            </div>
            <Badge variant="outline" className="border-green-500 text-green-700">
              Step 4 of 4 - Complete
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-1000 ${
              showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-75"
            }`}
          >
            <CheckCircle
              className={`transition-all duration-1000 ${
                showSuccess ? "w-12 h-12 text-green-600" : "w-8 h-8 text-gray-400"
              }`}
            />
          </div>
          <h2
            className={`text-3xl font-bold mt-4 transition-all duration-1000 ${
              showSuccess ? "text-gray-900" : "text-gray-500"
            }`}
          >
            Submission Successful!
          </h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            Your Impact Factory accelerator application has been successfully submitted. Our team will review your interview and get back to you soon.
          </p>
        </div>

        {/* Summary Card by me */}
        <Card className="mb-8 border-green-200 bg-green-50">
          <CardHeader>s
            <CardTitle className="text-green-900">What Happens Next</CardTitle>
            <CardDescription className="text-green-700">Here&apos;s what you can expect in the coming weeks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {nextSteps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-green-900">{step.title}</h4>
                      <p className="text-sm text-green-700 mt-1">{step.description.replace("'", "&apos;")}</p>
                      <Badge variant="outline" className="mt-2 border-green-300 text-green-700 text-xs">
                        {step.timeframe}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Interview Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Interview Summary</CardTitle>
            <CardDescription>
              Your conversation has been recorded and will be analyzed across our readiness framework
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-medium text-blue-900">Technology Readiness</h4>
                <p className="text-sm text-blue-700 mt-1">Product development &amp; technical maturity</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-medium text-purple-900">Team & Organization</h4>
                <p className="text-sm text-purple-700 mt-1">Team composition &amp; organizational structure</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-medium text-green-900">Impact Readiness</h4>
                <p className="text-sm text-green-700 mt-1">Social &amp; environmental impact goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Stay Connected</CardTitle>
            <CardDescription>We&apos;ll keep you updated throughout the review process</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>📧 applications@impactfactory.de</p>
                  <p>📞 +49 (0) 30 1234 5678</p>
                  <p>🌐 www.impactfactory.de</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Follow Our Progress</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>LinkedIn: Impact Factory</p>
                  <p>Twitter: @ImpactFactoryDE</p>
                  <p>Newsletter: Monthly updates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.open("mailto:applications@impactfactory.de", "_blank")}
            className="bg-brand-gold hover:bg-yellow-500 text-black font-medium px-8 py-3"
            size="lg"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Us
          </Button>
          <Button variant="outline" onClick={() => router.push("/")} size="lg">
            Return to Dashboard
          </Button>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Application submitted on{" "}
            {new Date().toLocaleDateString("de-DE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </main>
    </div>
  )
}

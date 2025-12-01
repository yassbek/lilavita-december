"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Sparkles } from "lucide-react"

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToTraining = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`${path}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand/20 to-brand-accent/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-brand-light/30 to-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-violet-200/30 to-brand/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/lilavita-logo.png"
                  alt="Lilavita Logo"
                  width={180}
                  height={50}
                  className="h-12 w-auto"
                />
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lilavita Lernplattform</h1>
                <p className="text-xs text-gray-500">Apotheken-Coaching</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-brand" />
              <span>Interaktive Beratungssimulation</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 mr-2" />
            Praxisnahes Training für den HV
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Willkommen bei
            <span className="block bg-gradient-to-r from-brand via-brand-accent to-brand-light bg-clip-text text-transparent mt-2">
              Lilavita Lernplattform
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Perfektioniere deine Beratungskompetenz mit interaktiven KI-Simulationen.
            Trainiere realistische Kundengespräche und erhalte personalisiertes Feedback.
          </p>
        </div>

        {/* Training Module - Magnesium Only */}
        <div className="max-w-md mx-auto">
          <Card className="group relative overflow-hidden bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-500 border-2 border-brand/20 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:border-brand/40">
            {/* Top gradient bar */}
            <div className="h-2 bg-gradient-to-r from-brand via-brand-accent to-brand-light" />

            <div className="p-8">
              {/* Icon */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand to-brand-accent flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mx-auto">
                <Zap className="w-10 h-10 text-white" />
              </div>

              {/* Content */}
              <CardTitle className="text-2xl font-bold text-gray-900 mb-3 text-center">
                Magnesiumcitrat 130
              </CardTitle>
              <CardDescription className="text-gray-600 leading-relaxed mb-8 text-center">
                Beratung bei Muskelkrämpfen, Stress und erhöhtem Bedarf. Ideal für Sportler und bei Diuretika-Einnahme.
              </CardDescription>

              {/* Button */}
              <Button
                onClick={() => navigateToTraining("/preparation")}
                className="w-full bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl group/btn"
                size="lg"
              >
                <span>Simulation starten</span>
                <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Decorative corner */}
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-brand to-brand-accent opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700" />
          </Card>
        </div>

        {/* Bottom info section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span>KI-gestützt</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-accent" />
              <span>Direktes Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand-light" />
              <span>Praxisnah</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-500">
            <p>© 2024 Lilavita Lernplattform. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
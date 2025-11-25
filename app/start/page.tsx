"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Sun, Shield, Sparkles } from "lucide-react"

// Definieren der verfügbaren Schulungsmodule für die Lilavita Lernplattform
const trainingModules = [
  {
    title: "Magnesiumcitrat 130",
    description: "Beratung bei Muskelkrämpfen, Stress und erhöhtem Bedarf. Ideal für Sportler und bei Diuretika-Einnahme.",
    path: "/preparation",
    icon: Zap,
    gradient: "from-amber-400 to-orange-500",
    shadowColor: "shadow-orange-200",
    hoverShadow: "hover:shadow-orange-300/50",
  },
  {
    title: "Vitamin D",
    description: "Coaching zur Beratung von Patienten mit Vitamin-D-Mangel, besonders in den Wintermonaten und bei Risikogruppen.",
    path: "/preparation_distribution",
    icon: Sun,
    gradient: "from-yellow-400 to-amber-500",
    shadowColor: "shadow-amber-200",
    hoverShadow: "hover:shadow-amber-300/50",
  },
  {
    title: "Perenterol forte",
    description: "Training zur Empfehlung bei Durchfallerkrankungen und zur Wiederherstellung der Darmflora.",
    path: "/preparation_finance",
    icon: Shield,
    gradient: "from-emerald-400 to-teal-500",
    shadowColor: "shadow-teal-200",
    hoverShadow: "hover:shadow-teal-300/50",
  },
]

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const navigateToTraining = (path: string) => {
    const params = new URLSearchParams(searchParams.toString());
    router.push(`${path}?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-brand/20 to-purple-200/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-gradient-to-br from-teal-200/30 to-emerald-200/20 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative bg-white/70 backdrop-blur-md border-b border-white/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Image
                  src="/ratiopharm-logo.png"
                  alt="ratiopharm Logo"
                  width={140}
                  height={40}
                  className="h-10 w-auto"
                />
              </div>
              <div className="h-8 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Lernplattform</h1>
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
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 mr-2" />
            Praxisnahes Training für den HV
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
            Willkommen beim
            <span className="block bg-gradient-to-r from-brand via-purple-600 to-brand bg-clip-text text-transparent">
              Apotheken-Coaching
            </span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Perfektioniere deine Beratungskompetenz mit interaktiven Simulationen.
            Wähle ein Präparat und trainiere realistische Kundengespräche.
          </p>
        </div>

        {/* Training Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {trainingModules.map((module, index) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.title}
                className={`group relative overflow-hidden bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-500 border-0 shadow-lg ${module.shadowColor} ${module.hoverShadow} hover:shadow-2xl hover:-translate-y-2`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Top gradient bar */}
                <div className={`h-1.5 bg-gradient-to-r ${module.gradient}`} />

                <div className="p-6 sm:p-8">
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <CardTitle className="text-xl font-bold text-gray-900 mb-3">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 leading-relaxed mb-6 min-h-[4.5rem]">
                    {module.description}
                  </CardDescription>

                  {/* Button */}
                  <Button
                    onClick={() => navigateToTraining(module.path)}
                    className={`w-full bg-gradient-to-r ${module.gradient} hover:opacity-90 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg group/btn`}
                  >
                    <span>Simulation starten</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>

                {/* Decorative corner */}
                <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${module.gradient} opacity-10 rounded-full group-hover:scale-150 transition-transform duration-700`} />
              </Card>
            )
          })}
        </div>

        {/* Bottom info section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Interaktive Szenarien</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Direktes Feedback</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-brand" />
              <span>Praxisnah</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative mt-auto py-6 border-t border-gray-200/50 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-gray-500">
            <p>© 2024 ratiopharm GmbH. Alle Rechte vorbehalten.</p>
            <p className="mt-2 sm:mt-0">Powered by Lilavita</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
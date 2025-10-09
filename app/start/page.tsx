"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Droplet, Heart, Shield, Zap, Thermometer } from "lucide-react"

// Definieren der verfügbaren Schulungsmodule für die Lilavita Lernplattform
const trainingModules = [
  {
    title: "Magnesiumcitrat 130",
    description: "Beratung bei Muskelkrämpfen, Stress und erhöhtem Bedarf. Ideal für Sportler und bei Diuretika-Einnahme.",
    path: "/preparation",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    title: "D-Mannose + Cranberry",
    description: "Simulation zur Beratung bei Harnwegsinfekten. Unterscheidung zwischen Akutfall und Prophylaxe.",
    path: "/preparation_d-mannose",
    icon: Droplet,
    color: "text-red-500",
    bgColor: "bg-red-100",
  },
  {
    title: "Q10 Pro Statin",
    description: "Coaching zur Beratung von Patienten mit Statintherapie und möglichen Nebenwirkungen wie Muskelschmerzen.",
    path: "/preparation_q10",
    icon: Heart,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "Lysin + Zink",
    description: "Training zur Empfehlung bei wiederkehrendem Lippenherpes und zur allgemeinen Stärkung des Immunsystems.",
    path: "/preparation_lysin",
    icon: Shield,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    title: "Probiot aktiv",
    description: "Argumentationstraining zur Basisversorgung und zur Abgrenzung gegenüber Wettbewerbsprodukten.",
    path: "/preparation_probiot_aktiv",
    icon: ShieldCheck,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  {
    title: "Immun aktiv",
    description: "Empfehlung bei Infektanfälligkeit und Positionierung als hochwertige Alternative zu bekannten Marken.",
    path: "/preparation_immun",
    icon: Thermometer,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 bg-gradient-to-br from-brand to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Image
                src="/lilavita_logo.png"
                alt="Lilavita Logo"
                width={40}
                height={40}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Lilavita Lernplattform</h1>
              <p className="text-sm text-gray-600 mt-0.5">Wähle ein Modul, um eine Beratung zu simulieren</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Welcome Section */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Willkommen beim Apotheken-Coaching!
          </h2>
          <p className="text-lg text-gray-600">
            Starte deine Lernreise, indem du eine Beratungssimulation wählst.
            Jedes Modul trainiert praxisnah ein typisches Gespräch im HV.
          </p>
        </div>

        {/* Training Modules Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {trainingModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.title}
                className="group relative overflow-hidden bg-white hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 border border-gray-200/60 hover:border-brand/40"
              >
                <div className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 ${module.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-8 h-8 ${module.color}`} />
                    </div>
                    <div className="flex-grow min-w-0">
                      <CardTitle className="text-lg font-bold text-gray-900 mb-1.5 leading-tight">
                        {module.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 leading-relaxed">
                        {module.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigateToTraining(module.path)}
                    className="w-full bg-brand hover:bg-brand/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 group-hover:shadow-md"
                  >
                    Simulation starten
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
                {/* Decorative element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand/5 to-transparent rounded-bl-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500" />
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  )
}

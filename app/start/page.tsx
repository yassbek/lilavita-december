"use client"

import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Users, Target, DollarSign, BarChart2, TrendingUp, Lightbulb } from "lucide-react"

// Definieren der verfügbaren Schulungsmodule
const trainingModules = [
  {
    title: "Team & Reifegrad",
    description: "Analysiere die Stärken deines Teams und den Entwicklungsstand deines Startups.",
    path: "/preparation_team",
    icon: Users,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    title: "Impact & Wirkung",
    description: "Definiere und messe den gesellschaftlichen Mehrwert deines Vorhabens.",
    path: "/preparation_impact",
    icon: Target,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  {
    title: "Finanzierung",
    description: "Erhalte Einblicke in Finanzierungsstrategien und einen soliden Finanzplan.",
    path: "/preparation_finance",
    icon: DollarSign,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50",
  },
  {
    title: "Marketing",
    description: "Entwickle effektive Strategien, um deine Zielgruppe zu erreichen.",
    path: "/preparation_marketing",
    icon: BarChart2,
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    title: "Vertrieb",
    description: "Optimiere deine Vertriebsprozesse und steigere nachhaltig deinen Umsatz.",
    path: "/preparation_distribution",
    icon: TrendingUp,
    color: "text-red-500",
    bgColor: "bg-red-50",
  },
  {
    title: "Strategie & Vision",
    description: "Formuliere eine klare Strategie und eine überzeugende Vision für dein Startup.",
    path: "/preparation_strategy",
    icon: Lightbulb,
    color: "text-orange-500",
    bgColor: "bg-orange-50",
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-5">
            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
              <Image 
                src="/impactfactory_logo.png" 
                alt="Impact Factory Logo" 
                width={48} 
                height={48}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Impact Factory Schulungscenter</h1>
              <p className="text-gray-600">Wähle ein Modul, um dein Wissen zu vertiefen</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card className="mb-10 bg-white shadow-sm">
           <CardHeader>
             <CardTitle className="text-xl">Willkommen!</CardTitle>
             <CardDescription>
                Starte deine Lernreise, indem du eines der folgenden Module auswählst. Jedes Modul ist darauf ausgelegt, dir in einem Kernbereich deines Startups praxisnahes Wissen zu vermitteln.
             </CardDescription>
           </CardHeader>
        </Card>

        {/* Training Modules Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingModules.map((module) => {
                const Icon = module.icon;
                return (
                    <Card key={module.title} className="flex flex-col bg-white hover:border-brand transition-all duration-200 shadow-sm border-2 border-transparent">
                        <CardHeader>
                            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.bgColor} mb-4`}>
                                <Icon className={`w-6 h-6 ${module.color}`} />
                            </div>
                            <CardTitle className="text-lg font-semibold">{module.title}</CardTitle>
                            <CardDescription className="pt-1">{module.description}</CardDescription>
                        </CardHeader>
                        <CardFooter className="mt-auto pt-4"> 
                            <Button 
                                onClick={() => navigateToTraining(module.path)} 
                                className="w-full bg-brand hover:bg-brand/90 text-black font-semibold"
                            >
                                Modul starten
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </CardFooter>
                    </Card>
                )
            })}
        </div>
      </main>
    </div>
  )
}
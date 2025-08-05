"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, User, MessageSquare, Camera, Mic, Info, ArrowRight } from "lucide-react"

// Mapping-Objekt zur Übersetzung des Branchen-Schlüssels in einen Anzeigenamen
const SECTOR_MAP: { [key: string]: string } = {
  'kreislaufwirtschaft': 'Kreislaufwirtschaft',
  'gesundheit_pflege': 'Gesundheit & Pflege',
  'ernaehrung_landwirtschaft': 'Ernährung & Landwirtschaft',
  'klimaschutz_energien': 'Klimaschutz & Energien',
  'staedte_mobilitaet': 'Städte & Mobilität',
  'bildung_inklusion': 'Bildung & Inklusion'
};

export default function StartPage() {
  const router = useRouter()
  const searchParams = useSearchParams();

  const sectorKey = searchParams.get("branche");
  const sectorDisplayName = sectorKey ? SECTOR_MAP[sectorKey] || "Unbekannt" : "Unbekannt";

  const userInfo = {
    name: searchParams.get("name") || "Bewerber*in",
    company: searchParams.get("startup") || "Dein Startup",
    sector: sectorDisplayName,
  }

  const handleContinue = () => {
    const params = new URLSearchParams(searchParams);
    // ANPASSUNG: Leitet zur ersten Vorbereitungsseite (Impact) weiter
    router.push(`/preparation?${params.toString()}`);
  }

  // ANPASSUNG: Beschreibung für Schritt 3 präzisiert
  const steps = [
      { id: 1, title: "Online-Formular", description: "Grundlegende Informationen und Firmendetails.", status: "completed", icon: CheckCircle },
      { id: 2, title: "Start & Vorbereitung", description: "Du befindest dich gerade in diesem Schritt.", status: "current", icon: User },
      { id: 3, title: "KI-gestützte Interviews", description: "Vier kurze Gespräche zu Impact, Marketing, Finanzen & Vertrieb.", status: "pending", icon: MessageSquare },
      { id: 4, title: "Einreichung abgeschlossen", description: "Überprüfung und finale Bestätigung.", status: "pending", icon: CheckCircle },
  ]

  const getStepStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "current":
        return "bg-brand/20 text-amber-800 border-brand"
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
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
                <h1 className="text-2xl font-bold text-gray-900">Impact Factory</h1>
                <p className="text-gray-600">Bewerbungsprozess für den Accelerator</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">{userInfo.name}</p>
              <p className="text-sm text-gray-600">{userInfo.company}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Willkommen zum nächsten Schritt, {userInfo.name}!</CardTitle>
            <CardDescription>
              Vielen Dank für deine Bewerbung für den{" "}
              <Badge variant="outline" className="border-brand text-amber-800">
                {userInfo.sector}
              </Badge>{" "}
              Track. Wir freuen uns darauf, mehr über {userInfo.company} zu erfahren.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* ANPASSUNG: Detailliertere Erklärung des Prozesses */}
            <div className="text-gray-700 space-y-4">
              <p>
                Um ein umfassendes Bild von eurem Startup zu bekommen, haben wir einen mehrstufigen Interview-Prozess entwickelt. Anstatt eines langen Gesprächs führen wir vier kurze, thematisch fokussierte Interviews mit unserem KI-Agenten durch.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Die vier Interview-Themen sind:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li><b>Readiness:</b> Wie ausgereift ist euer Geschäftsmodell.</li>
                  <li><b>Impact:</b> Eure Wirkungslogik und wie ihr sie messt.</li>
                  <li><b>Marketing:</b> Eure Strategie zur Positionierung und Kundengewinnung.</li>
                  <li><b>Finanzen:</b> Euer Geschäftsmodell, Finanzplan und Kapitalbedarf.</li>
                  <li><b>Vertrieb:</b> Eure Pläne für Wachstum und Skalierung.</li>
                </ul>
                <p className="text-sm text-blue-800 mt-3">
                  Jedes Interview dauert nur ca. 15-20 Minuten. Du wirst für jedes Gespräch eine separate Vorbereitungsseite sehen.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* NEU: Cookie- und Fortschrittshinweis */}
        <Card className="mb-8 bg-sky-50 border-sky-200">
            <CardHeader className="flex flex-row items-center space-x-3">
                <Info className="w-6 h-6 text-sky-700" />
                <div>
                    <CardTitle className="text-sky-900">Wichtiger Hinweis zur Speicherung deines Fortschritts</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-sky-800">
                    Wir verwenden notwendige Cookies, um deinen Fortschritt im Bewerbungsprozess zu speichern. Dies ermöglicht es dir, die Bewerbung jederzeit zu unterbrechen und innerhalb von <strong>7 Tagen</strong> an derselben Stelle fortzusetzen. Nach Ablauf dieser Frist werden deine Daten aus Sicherheitsgründen zurückgesetzt.
                </p>
                <p className="text-sm text-sky-700 mt-2">
                    Mit dem Fortfahren stimmst du dieser Nutzung zu.
                </p>
            </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
            {/* Progress Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Bewerbungsfortschritt</CardTitle>
                <CardDescription>Du startest jetzt den zweiten von vier Schritten.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step) => {
                    const Icon = step.icon
                    return (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStepStatus(step.status)}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${step.status === "current" ? "text-gray-900" : step.status === "completed" ? "text-green-800" : "text-gray-500"}`}>
                            {step.title}
                          </h4>
                          <p className={`text-sm ${step.status === "current" ? "text-gray-600" : step.status === "completed" ? "text-green-600" : "text-gray-400"}`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Technical Check */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Technische Voraussetzungen</span>
                </CardTitle>
                <CardDescription>Bitte stelle sicher, dass dein Gerät diese Anforderungen erfüllt.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Camera className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Kamerazugriff</p>
                      <p className="text-sm text-green-700">Erforderlich</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Mic className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Mikrofonzugriff</p>
                      <p className="text-sm text-green-700">Erforderlich</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Hinweis:</strong> Du wirst beim Start des ersten Interviews aufgefordert, den Zugriff zu erlauben.
                  </p>
                </div>
              </CardContent>
            </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            onClick={handleContinue}
            className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-3"
            size="lg"
          >
            Weiter zum ersten Interview
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => window.open("mailto:support@impactfactory.de", "_blank")} size="lg">
            Benötigst du Hilfe?
          </Button>
        </div>
      </main>
    </div>
  )
}
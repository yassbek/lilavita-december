"use client"

import { useState } from "react"
// HINWEIS: 'next/navigation' wurde entfernt, da es in dieser Umgebung zu einem Kompilierungsfehler führt.
// Die Navigation wird stattdessen mit Standard-Browserfunktionen gehandhabt.
// import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
// The 'Pill' icon is added to better match the pharmacy theme.
import { CheckCircle, Lightbulb, Target, Users, ArrowRight, Info, Pill } from "lucide-react"

export default function PreparationPage() {
  // const router = useRouter() // Entfernt
  // const searchParams = useSearchParams(); // Entfernt
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
  const [isReady, setIsReady] = useState(false)

  // Adapted content for the pharmacy training module
  const trainingAreas = [
    {
      icon: CheckCircle,
      title: "Produktwissen & Wirkung",
      description: "Dein Wissen über das Produkt und seine Vorteile.",
      topics: [
        "Wirkung auf Muskeln, Nerven und Energie",
        "Vorteile der Citratform (Verfügbarkeit, Verträglichkeit)",
        "Argumente: Reinheit und Apothekenqualität",
      ],
    },
    {
      icon: Users,
      title: "Zielgruppen & Indikationen",
      description: "Für welche Kunden das Produkt ideal ist.",
      topics: [
        "Kunden mit nächtlichen Wadenkrämpfen",
        "Personen, die Diuretika einnehmen",
        "Erhöhter Bedarf bei Sport und Stress",
      ],
    },
    {
      icon: Target,
      title: "Argumentation & Einwandbehandlung",
      description: "Wie du im Gespräch überzeugend reagierst.",
      topics: [
        "Umgang mit Preis-Einwänden ('zu teuer')",
        "Abgrenzung zu Drogerie-Produkten",
        "Reaktion auf Skepsis ('Brauche ich das wirklich?')",
      ],
    },
  ]

  const preparationChecklist = [
    "Ich kenne die Hauptwirkungen von Magnesium auf Muskeln, Nerven und Energie.",
    "Ich kann die Vorteile der Citratform erklären (z.B. gute Verfügbarkeit).",
    "Ich kenne die wichtigsten Zielgruppen (z.B. bei Wadenkrämpfen, Diuretika-Einnahme).",
    "Ich bin vorbereitet, den Preisunterschied zu Drogerieprodukten zu begründen.",
    "Ich kann auf den Einwand 'Ich ernähre mich gesund, das reicht doch' reagieren.",
    "Ich habe eine klare Ein-Satz-Empfehlung für den Kunden parat.",
  ]

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newCheckedItems = { ...checkedItems, [index]: checked }
    setCheckedItems(newCheckedItems)
    const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
    setIsReady(allChecked)
  }

  const handleStartSimulation = () => {
    // const params = new URLSearchParams(searchParams); // Entfernt
    // The destination URL can be updated if needed, e.g., to /simulation
    // router.push(`/simulation?${params.toString()}`); // Ersetzt durch window.location
    window.location.href = "/interview";
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-5">
              <div className="w-16 h-16 bg-gradient-to-br from-brand to-brand-accent rounded-lg flex items-center justify-center shadow-md">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Beratungssimulation: Magnesiumcitrat 130</h1>
                <p className="text-gray-600">Bereite dich auf das Kundengespräch vor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Einleitung */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-brand" />
              {/* --- Anpassung: Titel --- */}
              <span>Über diese Simulation</span>
            </CardTitle>
            <CardDescription>
              {/* --- Anpassung: Beschreibung --- */}
              Diese Simulation trainiert dich für ein erfolgreiches Beratungsgespräch zu Magnesiumcitrat 130.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* --- Anpassung: Einleitungstext --- */}
            <p className="text-gray-700 mb-4">
              In dieser Simulation üben wir, die Vorteile von Magnesiumcitrat 130 aktiv zu kommunizieren, passende Kundengruppen zu erkennen und überzeugend auf typische Fragen und Einwände zu reagieren. Ziel ist es, dass du dich im HV-Alltag sicher fühlst, das Produkt proaktiv zu empfehlen.
            </p>

            <div className="bg-brand/10 border border-brand/20 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-brand mt-0.5" />
                <div>
                  {/* --- Anpassung: Format-Titel --- */}
                  <h4 className="font-medium text-brand mb-2">Format der Simulation</h4>
                  {/* --- Anpassung: Format-Details aus dem Lernmodul --- */}
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>• Dauer: 3-5 Minuten</li>
                    <li>• Format: Gesprächssimulation mit einem KI-Kunden</li>
                    <li>• Sprache: Deutsch</li>
                    <li>• Ziel: Das Gespräch wird zur Verbesserung deiner Beratungsfähigkeiten analysiert.</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Themenbereiche */}
        <div className="mb-8">
          {/* --- Anpassung: Titel --- */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">Schwerpunkte der Beratung</h2>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* --- Anpassung: Inhalte werden aus der neuen 'trainingAreas'-Variable geladen --- */}
            {trainingAreas.map((area, index) => {
              const Icon = area.icon
              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-brand/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-brand" />
                      </div>
                      <span>{area.title}</span>
                    </CardTitle>
                    <CardDescription>{area.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {area.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-brand rounded-full mt-2 flex-shrink-0"></div>
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

        {/* Vorbereitungs-Checkliste */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Vorbereitungs-Checkliste</CardTitle>
            {/* --- Anpassung: Beschreibung --- */}
            <CardDescription>Geh diese Punkte durch, um sicherzustellen, dass du bereit für das Kundengespräch bist.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* --- Anpassung: Inhalte werden aus der neuen 'preparationChecklist'-Variable geladen --- */}
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
                    className={`text-sm cursor-pointer ${checkedItems[index]
                      ? "text-gray-900 line-through decoration-brand"
                      : "text-gray-700"
                      }`}
                  >
                    {item}
                  </label>
                </div>
              ))}
            </div>

            {isReady && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-medium text-green-900">Du bist startklar!</p>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Alle Punkte der Checkliste sind erledigt. Du kannst jetzt deine Beratungssimulation starten.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            // --- Anpassung: Funktionsaufruf bleibt, da die Logik dieselbe ist ---
            onClick={handleStartSimulation}
            disabled={!isReady}
            // --- Anpassung: Markenfarbe wurde zu Brand Orange geändert ---
            className="bg-gradient-to-r from-brand to-brand-accent hover:from-brand-dark hover:to-brand text-white font-medium px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            {/* --- Anpassung: Button-Text --- */}
            Simulation starten
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="outline" onClick={() => window.location.href = "/"} size="lg">
            Zurück zur Übersicht
          </Button>
        </div>
      </main>
    </div>
  )
}

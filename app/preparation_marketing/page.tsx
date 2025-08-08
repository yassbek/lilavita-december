"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, Megaphone, BarChart, Gem, ArrowRight, Info } from "lucide-react"

export default function PreparationPage() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
    const [isReady, setIsReady] = useState(false)

    const readinessAreas = [
        {
            icon: Megaphone,
            title: "Purpose & Positionierung",
            description: "Die Basis eures Impact-Marketings: Euer 'Warum', eure Zielgruppe und eure einzigartige Geschichte.",
            topics: [
                "Kommunikation eurer Mission nach dem Golden Circle (Warum, Wie, Was)",
                "Definition eures Wertversprechens mit dem Value Proposition Canvas",
                "Markt-Segmentierung, Targeting und Positionierung (STP-Modell)",
                "Nutzung von Storytelling zur Schaffung einer emotionalen Markenbindung",
            ],
        },
        {
            icon: BarChart,
            title: "Wachstum & Kanäle",
            description: "Wie ihr datengetrieben experimentiert, um eure Zielgruppen effektiv zu erreichen und zu binden.",
            topics: [
                "Anwendung von Growth Hacking-Zyklen für schnelles, budgetschonendes Wachstum",
                "Analyse des Nutzer-Funnels mit Pirate Metrics (AARRR) zur Identifikation von Schwachstellen",
                "Aufbau von Kommunikations-Funnels nach dem AIDA-Prinzip (Attention, Interest, Desire, Action)",
                "Steuerung des Marketing-Budgets über Unit Economics (CAC vs. CLV)",
            ],
        },
        {
            icon: Gem,
            title: "Marketing-Mix & Analyse",
            description: "Der ganzheitliche Blick auf eure Marketing-Aktivitäten und strategische Chancen.",
            topics: [
                "Ganzheitliche Planung aller 7 Ps des Marketing-Mix (von Product bis Physical Evidence)",
                "Analyse des Wettbewerbs und Entwicklung einer Blue Ocean Strategy zur Schaffung neuer Märkte",
                "Standortbestimmung durch Diagnose-Tools (z.B. SWOT, Business Model Canvas, B Impact Assessment)",
                "Ableitung von strategischen Handlungsfeldern aus den Analyse-Ergebnissen",
            ],
        },
    ]

    const preparationChecklist = [
        "Ich kann unser 'Warum' klar formulieren und weiß, wie wir unsere Story erzählen.",
        "Ich habe eine klare Vorstellung unserer Zielsegmente und unserer Positionierung darin (STP).",
        "Ich bin bereit, über unsere Experimente zur Wachstumssteigerung (Growth Hacking) zu sprechen.",
        "Ich kenne die wichtigsten Stufen unseres Nutzer-Funnels (AARRR) und deren Kennzahlen.",
        "Ich kann erläutern, wie die 7 Ps in unserer Marketingstrategie zusammenspielen.",
        "Ich habe darüber nachgedacht, wo wir uns vom Wettbewerb abheben und neue Chancen (Blue Ocean) schaffen können.",
        "Ich habe eine Einschätzung, wo die Stärken und Schwächen unseres aktuellen Marketings liegen (z.B. via SWOT).",
    ]

    const introText = "In diesem Gespräch wollen wir verstehen, wie ihr eure Mission durch Marketing sichtbar macht und Wachstum erzielt. Das KI-gestützte Interview hilft uns, eure Marketingreife anhand bewährter Frameworks einzuschätzen und euren Unterstützungsbedarf zu identifizieren."

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const newCheckedItems = { ...checkedItems, [index]: checked }
        setCheckedItems(newCheckedItems)
        const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
        setIsReady(allChecked)
    }
    
    const handleStartInterview = () => {
        if (!applicationId) {
            console.error("Application ID fehlt in der URL. Kann das Interview nicht starten.");
            router.push("/");
            return;
        }
        router.push(`/interview_marketing?applicationId=${applicationId}&interviewType=marketing`);
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
                                <h1 className="text-2xl font-bold text-gray-900">Marketing-Vorbereitung</h1>
                                <p className="text-gray-600">Mach dich bereit für dein KI-Interview</p>
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
                            <span>Über das Interview</span>
                        </CardTitle>
                        <CardDescription>
                            Unser KI-Interviewer bewertet dein Startup in den Kernbereichen des Marketings.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 mb-4">
                            {introText}
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-blue-900 mb-2">Format des Interviews</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Dauer: 15-20 Minuten</li>
                                        <li>• Format: Videogespräch mit einem KI-Agenten</li>
                                        <li>• Sprache: Deutsch oder Englisch (deine Wahl)</li>
                                        <li>• Aufzeichnung: Das Gespräch wird zur Auswertung aufgezeichnet</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Themenbereiche */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Worüber wir sprechen</h2>
                    <div className="grid lg:grid-cols-3 gap-6">
                        {readinessAreas.map((area, index) => {
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
                        <CardDescription>Geh diese Punkte durch, um sicherzustellen, dass du startklar bist.</CardDescription>
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
                                    Alle Punkte der Checkliste sind erledigt. Du kannst jetzt dein Interview starten.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                
                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                    <Button
                        onClick={handleStartInterview}
                        disabled={!isReady}
                        className="bg-brand hover:bg-brand/90 text-black font-medium px-8 py-3 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        size="lg"
                    >
                        Interview starten
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button variant="outline" onClick={() => router.push("/")} size="lg">
                        Zurück zur Übersicht
                    </Button>
                </div>
            </main>
        </div>
    )
}
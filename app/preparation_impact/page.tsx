"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, Target, Users, Cog, ArrowRight, Info } from "lucide-react"

export default function PreparationPage() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId"); // Auslesen der ID
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
    const [isReady, setIsReady] = useState(false)

    // ... (restlicher Code für readinessAreas und preparationChecklist)
    const readinessAreas = [
        {
            icon: Cog,
            title: "Technologie-Reife",
            description: "Eure Produktentwicklung und technische Reife",
            topics: [
                "Aktueller Entwicklungsstand (MVP, Prototyp, marktreif)",
                "Technische Hürden und wie ihr sie gemeistert habt",
                "Skalierbarkeit eurer technischen Lösung",
                "Geistiges Eigentum und Patente",
            ],
        },
        {
            icon: Users,
            title: "Team & Organisation",
            description: "Eure Teamzusammensetzung und Organisationsstruktur",
            topics: [
                "Teamaufstellung und Kernkompetenzen",
                "Bisherige Erfahrung und Erfolge",
                "Rollenverteilung und wie ihr Entscheidungen trefft",
                "Unternehmenskultur und gemeinsame Werte",
            ],
        },
        {
            icon: Target,
            title: "Impact-Reife",
            description: "Eure sozialen und ökologischen Wirkungsziele",
            topics: [
                "Klare Impact-Mission und Wirkungslogik (Theory of Change)",
                "Zielgruppen und Validierung des Problems",
                "Wirkungsmessung und KPIs",
                "Bezug zu den UN SDGs oder ähnlichen Rahmenwerken",
            ],
        },
    ]

    const preparationChecklist = [
        "Ich habe unsere Mission und Wirkungsziele verinnerlicht",
        "Ich kann unseren aktuellen Entwicklungsstand klar erklären",
        "Ich kenne die Stärken und Schwächen unseres Teams",
        "Ich habe über unseren Zielmarkt und unsere Zielgruppen nachgedacht",
        "Ich kann unser Geschäftsmodell und unsere Einnahmequellen besprechen",
        "Ich habe mir unsere Wettbewerbsvorteile überlegt",
        "Ich bin bereit, über gemeisterte Herausforderungen zu sprechen",
    ]

    const handleCheckboxChange = (index: number, checked: boolean) => {
        const newCheckedItems = { ...checkedItems, [index]: checked }
        setCheckedItems(newCheckedItems)
        const allChecked = preparationChecklist.every((_, i) => newCheckedItems[i])
        setIsReady(allChecked)
    }
    
    const handleStartInterview = () => {
        // Sicherstellen, dass die applicationId vorhanden ist
        if (!applicationId) {
            console.error("Application ID fehlt in der URL. Kann das Interview nicht starten.");
            // Optional: Leite den Benutzer auf eine Fehler- oder Übersichtsseite um
            router.push("/");
            return;
        }

        // Korrigierte Weiterleitung:
        // Die Route ist jetzt dynamisch und übergibt sowohl die applicationId als auch den interviewType.
        // `interview_impact` ist der Name Ihrer neuen Interview-Seite, und `type=impact` ist der Parameter für die API.
        router.push(`/interview_impact?applicationId=${applicationId}&interviewType=impact`);
    }

    // ... (Restlicher JSX-Code bleibt unverändert)

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
                                <h1 className="text-2xl font-bold text-gray-900">Interview-Vorbereitung</h1>
                                <p className="text-gray-600">Mach dich bereit für dein KI-Interview</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-brand text-brand">
                            Schritt 2 von 4
                        </Badge>
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
                            Unser KI-Interviewer bewertet dein Startup in drei Kernbereichen.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 mb-4">
                            In unserem Bewerbungsprozess wollen wir verstehen, wie startklar dein Startup in den Bereichen Technologie, Team & Organisation und Impact ist. Das KI-gestützte Gespräch hilft uns dabei, eure Reife und euer Potenzial einzuschätzen.
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
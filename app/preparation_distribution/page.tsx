"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, Lightbulb, TrendingUp, Handshake, Briefcase, ArrowRight, Info } from "lucide-react" // Megaphone als neues Icon hinzugefügt, falls verfügbar, sonst Lightbulb

export default function PreparationPage() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({})
    const [isReady, setIsReady] = useState(false)

    // --- ANGEPASSTE TEXTE START ---

    const readinessAreas = [
        {
            icon: TrendingUp,
            title: "Wachstumsstrategie & Planung",
            description: "Eure Vision, Roadmap und die strategische Validierung eures Vorhabens.",
            topics: [
                "Wachstumsstrategie für 2-3 Jahre inkl. Produkt, Märkte & Partnerschaften",
                "Go-to-Market (GTM) Strategie und deren Validierung (z.B. durch MVPs, Piloten)",
                "Strategie zur Erschließung neuer Märkte und Kundensegmente",
                "Prozesse für Portfolio-Management und Product-Market-Fit Validierung",
            ],
        },
        {
            icon: Lightbulb, // Passendes Icon für Marketing & Ideen
            title: "Marketing & Positionierung",
            description: "Wie ihr euren Impact kommuniziert und gezielt Kunden gewinnt.",
            topics: [
                "Formulierung und Test der Customer Value Proposition (CVP)",
                "Impact Marketing-Strategie und Erfolgsmessung (z.B. Storytelling, SDGs)",
                "Nutzung von Multikanal-Marketing (Inbound, Outbound, Partner)",
                "Einsatz von Performance Marketing & Growth Hacking Methoden",
            ],
        },
        {
            icon: Briefcase,
            title: "Vertrieb & Organisation",
            description: "Euer Sales-Prozess, Verkaufsansätze und die organisatorische Skalierung.",
            topics: [
                "Aufbau des Sales Funnels (Lead → Kunde → Botschafter) und Definition der KPIs",
                "Analyse des Buying Centers und Stakeholder-Management",
                "Einsatz verschiedener Verkaufsansätze (z.B. Value-based, Consultative Selling)",
                "Skalierungspfad und Transformation vom projekt- zum produktbasierten Geschäft",
            ],
        },
        {
            icon: Handshake,
            title: "Netzwerk & Kooperationen",
            description: "Die Nutzung von Synergien im Ökosystem für gemeinsames Wachstum.",
            topics: [
                "Austausch mit anderen Startups und Peer-to-Peer-Learning",
                "Kooperationen mit strategischen Partnern (Unternehmen, NGOs, Gemeinden)",
                "Vernetzung im Impact-Ökosystem (z.B. Anthropia, Impact Hubs)",
                "Nutzung von Förderprogrammen und Stiftungen",
            ],
        },
    ]

    const preparationChecklist = [
        "Ich kann unsere Wachstumsstrategie, GTM-Pläne und den Prozess zur PMF-Validierung erläutern.",
        "Ich kann unsere Marketing-Aktivitäten von der CVP über Impact Storytelling bis zu Performance-Kampagnen beschreiben.",
        "Ich kenne unseren Sales Funnel, unsere Verkaufsansätze und die Pläne zur organisatorischen Skalierung.",
        "Ich kann über unsere Erfahrungen und Pläne bei Kooperationen und der Vernetzung im Impact-Ökosystem berichten.",
        "Ich habe die Herausforderungen und den Unterstützungsbedarf in den genannten Bereichen reflektiert.",
        "Ich bin bereit, unsere wichtigsten Wachstums- und Impact-KPIs zu diskutieren (z.B. MRR, CAC, CO₂-Reduktion).",
    ]

    const introText = "In diesem Gespräch wollen wir eure Strategien für Wachstum, Marketing und Vertrieb verstehen. Das KI-gestützte Interview hilft uns, eure Skalierungsreife zu bewerten und passgenaue Unterstützung anzubieten."

    // --- ANGEPASSTE TEXTE ENDE ---

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
        router.push(`/interview_distribution?applicationId=${applicationId}&interviewType=distribution`);
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
                                <h1 className="text-2xl font-bold text-gray-900">Distribution-Vorbereitung</h1>
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
                            Unser KI-Interviewer bewertet dein Startup in den Kernbereichen des Vertriebs und Wachstums.
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
                    <div className="grid lg:grid-cols-2 gap-6">
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
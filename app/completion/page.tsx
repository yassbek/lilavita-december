"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation" // useSearchParams importieren
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Mail, Calendar, Users, Cog, Target } from "lucide-react"

export default function CompletionPage() {
    const router = useRouter()
    const searchParams = useSearchParams(); // Hook verwenden, um Query-Parameter zu lesen
    const applicationId = searchParams.get("applicationId"); // application_id aus der URL holen
    
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        // Simple Animation für die Erfolgsanzeige
        const timer = setTimeout(() => {
            setShowSuccess(true)
        }, 300)

        return () => clearTimeout(timer)
    }, [])
    
    // Die Logik für den "Zurück zum Dashboard" Button muss angepasst werden,
    // um die application_id beizubehalten
    const handleNextStep = () => {
        if (applicationId) {
            router.push(`/preparation_impact?applicationId=${applicationId}`);
        } else {
            // Optional: Handle the case where applicationId is missing
            console.error("Application ID fehlt. Kann nicht zum nächsten Schritt leiten.");
            router.push("/preparation_impact"); // Fallback-Route
        }
    };

    const nextSteps = [
        { title: "Prüfung der Bewerbung", description: "Unser Team prüft dein Interview und deine Unterlagen.", timeframe: "3-5 Werktage", icon: Clock },
        { title: "Erstes Feedback", description: "Du erhältst eine erste Rückmeldung zu deinem Readiness Assessment.", timeframe: "ca. 1 Woche", icon: Mail },
        { title: "Entscheidung", description: "Finale Entscheidung über die Aufnahme in den Accelerator.", timeframe: "ca. 2 Wochen", icon: CheckCircle },
        { title: "Programmstart", description: "Bei einer Zusage beginnt deine Reise im Accelerator.", timeframe: "Nächster Jahrgang", icon: Calendar },
    ]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-5">
                            <div className="w-16 h-16 bg-brand rounded-lg flex items-center justify-center">
                                <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" width={48} height={48} />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Bewerbung Abgeschlossen</h1>
                                <p className="text-gray-600">Vielen Dank für deine Einreichung</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50 font-medium">
                            Schritt 4 von 4 - Abgeschlossen
                        </Badge>
                    </div>
                </div>
            </header>

            {/* Hauptinhalt */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Erfolgsanzeige */}
                <div className="text-center mb-12">
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full transition-all duration-700 ${showSuccess ? "bg-green-100 scale-100" : "bg-gray-100 scale-90"}`}>
                        <CheckCircle className={`transition-all duration-700 ${showSuccess ? "w-12 h-12 text-green-600" : "w-10 h-10 text-gray-400"}`} />
                    </div>
                    <h2 className={`text-3xl font-bold mt-4 transition-opacity duration-700 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
                        Erfolgreich eingereicht!
                    </h2>
                    <p className={`text-gray-600 mt-2 max-w-2xl mx-auto transition-opacity duration-700 delay-200 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
                        Deine Bewerbung für den Impact Factory Accelerator wurde erfolgreich übermittelt. Unser Team wird dein Interview prüfen und sich bald bei dir melden.
                    </p>
                </div>

                {/* Grid-Layout für die nächsten Schritte und Zusammenfassung */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Nächste Schritte (nimmt mehr Platz ein) */}
                    <Card className="lg:col-span-2 border-brand/50 bg-brand/5">
                        <CardHeader>
                            <CardTitle className="text-amber-900">Wie geht es weiter?</CardTitle>
                            <CardDescription className="text-amber-800">Das kannst du in den nächsten Wochen erwarten.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {nextSteps.map((step, index) => {
                                    const Icon = step.icon
                                    return (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
                                                <Icon className="w-5 h-5 text-brand" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-amber-900">{step.title}</h4>
                                                <p className="text-sm text-amber-800 mt-0.5">{step.description}</p>
                                                <Badge variant="outline" className="mt-2 border-brand/40 text-amber-800 text-xs">
                                                    {step.timeframe}
                                                </Badge>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Zusammenfassung des Interviews */}
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Interview-Zusammenfassung</CardTitle>
                                <CardDescription>Dein Gespräch wurde aufgezeichnet und wird nun analysiert.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-left p-3 bg-blue-50 rounded-lg flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center flex-shrink-0"><Cog className="w-5 h-5 text-blue-600" /></div>
                                    <div><h4 className="font-medium text-sm text-blue-900">Technologie-Reife</h4></div>
                                </div>
                                <div className="text-left p-3 bg-purple-50 rounded-lg flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center flex-shrink-0"><Users className="w-5 h-5 text-purple-600" /></div>
                                    <div><h4 className="font-medium text-sm text-purple-900">Team & Organisation</h4></div>
                                </div>
                                <div className="text-left p-3 bg-green-50 rounded-lg flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center flex-shrink-0"><Target className="w-5 h-5 text-green-600" /></div>
                                    <div><h4 className="font-medium text-sm text-green-900">Impact-Reife</h4></div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={handleNextStep} size="lg" className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-3">
                        Zur Vorbereitung des Impact-Interviews
                    </Button>
                    <Button variant="outline" onClick={() => window.open("mailto:applications@impactfactory.de", "_blank")} size="lg">
                        <Mail className="w-4 h-4 mr-2" />
                        Kontakt aufnehmen
                    </Button>
                </div>

                {/* Fußnote */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Bewerbung eingereicht am {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
            </main>
        </div>
    )
}
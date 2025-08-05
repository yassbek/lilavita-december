"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, ArrowRight, Target, Briefcase, Megaphone, DollarSign } from "lucide-react"

export default function CompletionPage() {
    const router = useRouter()
    const searchParams = useSearchParams();
    const applicationId = searchParams.get("applicationId");
    
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSuccess(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    // NEU: Status der Schritte aktualisiert
    const applicationSteps = [
        { title: "Impact-Reife", icon: Target, status: "completed", path: `/preparation_impact?applicationId=${applicationId}` },
        { title: "Marketing & Positionierung", icon: Megaphone, status: "completed", path: `/preparation_marketing?applicationId=${applicationId}` },
        { title: "Finanzierungs-Reife", icon: DollarSign, status: "next", path: `/preparation_finance?applicationId=${applicationId}` },
        { title: "Wachstum & Vertrieb", icon: Briefcase, status: "pending", path: `/preparation_distribution?applicationId=${applicationId}` }
    ]

    const completedSteps = applicationSteps.filter(s => s.status === 'completed');
    const lastCompletedStep = completedSteps.length > 0 ? completedSteps[completedSteps.length - 1] : null;
    const nextStep = applicationSteps.find(step => step.status === 'next');

    const goToNextStep = () => {
        if (nextStep) {
            router.push(nextStep.path);
        } else {
            // Wenn kein nächster Schritt da ist, ist der Prozess fertig
            router.push(`/completion_final?applicationId=${applicationId}`);
        }
    };

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
                                <h1 className="text-2xl font-bold text-gray-900">Nächster Meilenstein!</h1>
                                <p className="text-gray-600">Dein {lastCompletedStep?.title}-Interview ist abgeschlossen.</p>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-brand text-brand">
                            Schritt 3 von 5 abgeschlossen
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
                        {lastCompletedStep?.title}-Interview erfolgreich!
                    </h2>
                    <p className={`text-gray-600 mt-2 max-w-2xl mx-auto transition-opacity duration-700 delay-200 ${showSuccess ? "opacity-100" : "opacity-0"}`}>
                        Klasse, du bist auf einem super Weg! Bereite dich nun auf das Thema Finanzen vor.
                    </p>
                </div>

                {/* Grid-Layout */}
                <div className="grid lg:grid-cols-3 gap-8 mb-8">
                    {/* Prozess-Übersicht */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Dein Bewerbungsprozess</CardTitle>
                            <CardDescription>Dein aktueller Fortschritt im Überblick.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {applicationSteps.map((step, index) => {
                                    const isCompleted = step.status === 'completed';
                                    const isNext = step.status === 'next';
                                    const isPending = step.status === 'pending';
                                    
                                    let Icon = CheckCircle;
                                    if (isNext) Icon = ArrowRight;
                                    if (isPending) Icon = Clock;

                                    return (
                                        <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg ${isNext ? 'bg-brand/10' : ''}`}>
                                            <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center 
                                                ${isCompleted ? 'bg-green-100' : ''}
                                                ${isNext ? 'bg-brand' : ''}
                                                ${isPending ? 'bg-gray-100' : ''}`}>
                                                <Icon className={`w-5 h-5 
                                                    ${isCompleted ? 'text-green-600' : ''}
                                                    ${isNext ? 'text-black' : ''}
                                                    ${isPending ? 'text-gray-400' : ''}`} />
                                            </div>
                                            <div>
                                                <h4 className={`font-medium ${isPending ? 'text-gray-500' : 'text-gray-900'}`}>{step.title}</h4>
                                                <p className="text-sm text-gray-600 mt-0.5">
                                                    {isCompleted && "Erfolgreich abgeschlossen."}
                                                    {isNext && "Das ist dein nächster Schritt."}
                                                    {isPending && "Steht als nächstes an."}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Motivations-Karte */}
                    <div className="space-y-8">
                        <Card className="bg-blue-50 border-blue-200">
                            <CardHeader>
                                <CardTitle className="text-blue-900">Stark gemacht!</CardTitle>
                            </CardHeader>
                            <CardContent className="text-blue-800 space-y-4">
                               <p>
                                   Die Hälfte der Interviews ist geschafft! Jedes Gespräch liefert uns wertvolle Einblicke.
                               </p>
                               <p>
                                   Nimm dir kurz Zeit, um dich auf das nächste Thema vorzubereiten. Alle nötigen Informationen findest du auf der nächsten Seite.
                               </p>
                               <Button onClick={goToNextStep} size="lg" className="w-full bg-brand hover:bg-brand/90 text-black font-bold">
                                    Weiter zu "{nextStep?.title}"
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Fußnote */}
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        Interview abgeschlossen am {new Date().toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}
                    </p>
                </div>
            </main>
        </div>
    )
}
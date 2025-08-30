"use client"

import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle, User, MessageSquare, Mic, Info, ArrowRight, Loader2, UploadCloud, FileCheck2 } from "lucide-react"

// Korrekte Imports für das Directus SDK
import { createDirectus, staticToken, rest, uploadFiles } from '@directus/sdk';

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

  // State-Variablen
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLowSpeedAlert, setShowLowSpeedAlert] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Directus Client sicher mit statischem Token initialisieren.
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
  const directusToken = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

  if (!directusUrl || !directusToken) {
    throw new Error("Directus URL or Token is not set in your environment variables.");
  }

  const directus = createDirectus(directusUrl)
    .with(staticToken(directusToken))
    .with(rest());

  const sectorKey = searchParams.get("branche");
  const sectorDisplayName = sectorKey ? SECTOR_MAP[sectorKey] || "Unbekannt" : "Unbekannt";

  const userInfo = {
    name: searchParams.get("name") || "Bewerber*in",
    company: searchParams.get("startup") || "Dein Startup",
    sector: sectorDisplayName,
  }

  const navigateToNextPage = () => {
    const params = new URLSearchParams(searchParams);
    router.push(`/preparation?${params.toString()}`);
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // Background Upload und Analyse Funktion
  const startBackgroundUploadAndAnalysis = async (file: File) => {
    try {
      // Upload der Datei
      const formData = new FormData();
      formData.append('file', file);

      console.log("Starte Background-Upload...");
      const fileUploadResult = await directus.request(uploadFiles(formData));
      const fileId = fileUploadResult.id;
      console.log('Datei erfolgreich hochgeladen. File ID:', fileId);

      const applicantId = searchParams.get("applicationId");
      if (!applicantId) {
        throw new Error("Application-ID nicht in der URL gefunden!");
      }

      console.log(`Datei ${fileId} bereit für Application ${applicantId}`);
      
      // Starte KI-Analyse im Hintergrund
      console.log("Starte die KI-gestützte Zusammenfassung im Hintergrund...");
      fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileId, applicationId: applicantId }),
      }).then(response => {
        if (!response.ok) {
          console.warn("Die automatische Zusammenfassung ist fehlgeschlagen");
        } else {
          console.log("Zusammenfassung erfolgreich erstellt.");
        }
      }).catch(error => {
        console.warn("Fehler bei der Background-Analyse:", error);
      });

    } catch (error) {
      console.error("Fehler beim Background-Upload:", error);
    }
  };

  const handleUploadAndContinue = async () => {
    if (!selectedFile) {
      alert("Bitte wähle zuerst dein Pitchdeck aus.");
      return;
    }
    
    setIsLoading(true);

    try {
      // Speed-Test durchführen
      console.log("Starte Geschwindigkeitstest...");
      const fileUrl = '/speedtestfile.dat';
      const fileSizeInBytes = 5 * 1024 * 1024; // 5 MB

      const startTime = new Date().getTime();
      const response = await fetch(fileUrl + '?t=' + startTime);

      if (!response.ok) {
        throw new Error(`Testdatei nicht gefunden (Status: ${response.status}).`);
      }

      await response.blob();
      const endTime = new Date().getTime();
      const durationInSeconds = (endTime - startTime) / 1000;

      if (durationInSeconds < 0.1) {
        // Starte Background-Upload und navigiere sofort weiter
        startBackgroundUploadAndAnalysis(selectedFile);
        navigateToNextPage();
        return;
      }

      const bitsLoaded = fileSizeInBytes * 8;
      const speedMbps = (bitsLoaded / durationInSeconds) / 1024 / 1024;
      console.log(`Geschwindigkeit: ${speedMbps.toFixed(2)} Mbit/s`);

      // Starte Background-Upload unabhängig von der Geschwindigkeit
      startBackgroundUploadAndAnalysis(selectedFile);

      if (speedMbps < 20) {
        setShowLowSpeedAlert(true);
      } else {
        navigateToNextPage();
      }
    } catch (error) {
      console.error("Ein Fehler ist aufgetreten:", error);
      alert("Ein Fehler ist aufgetreten. Bitte überprüfe die Konsole für Details und versuche es erneut.");
    } finally {
      setIsLoading(false);
    }
  }

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
        </Card>

        {/* Pitchdeck Upload Card */}
        <Card className="mb-8 border-brand border-2">
            <CardHeader>
                <CardTitle>Schritt 1: Pitchdeck hochladen</CardTitle>
                <CardDescription>
                    Bitte lade dein aktuelles Pitchdeck hoch. Erlaubte Formate sind PDF. (max. 20 MB)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf"
                    />
                    
                    {!selectedFile ? (
                      <>
                        <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
                        <Button onClick={() => fileInputRef.current?.click()}>
                            Datei auswählen
                        </Button>
                        <p className="text-xs text-gray-500 mt-2">Noch keine Datei ausgewählt</p>
                      </>
                    ) : (
                      <>
                        <FileCheck2 className="w-12 h-12 text-green-500 mb-4" />
                        <p className="font-semibold text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-600">Größe: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button variant="link" className="text-brand p-0 h-auto mt-2" onClick={() => fileInputRef.current?.click()}>
                            Andere Datei auswählen
                        </Button>
                      </>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Cookie- und Fortschrittshinweis */}
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

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
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
                        <Mic className="w-5 h-5" />
                        <span>Technische Voraussetzungen</span>
                    </CardTitle>
                    <CardDescription>Bitte stelle sicher, dass dein Gerät diese Anforderungen erfüllt.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-center">
                        <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg w-fit">
                            <Mic className="w-6 h-6 text-green-600" />
                            <div>
                                <p className="font-medium text-green-900">Mikrofonzugriff</p>
                                <p className="text-sm text-green-700">Erforderlich</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                        <p className="text-sm text-yellow-800">
                            <strong>Hinweis:</strong> Du wirst beim Start des ersten Interviews aufgefordert, den Zugriff zu erlauben.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Hinweis zum Internet Speed-Test */}
            <Card className="bg-orange-50 border-orange-200">
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 text-orange-700" /> 
                        <span className="text-orange-900">Hinweis zur Verbindungsprüfung</span>
                    </CardTitle>
                    <CardDescription className="text-orange-800">
                        Für eine stabile Interview-Erfahrung.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-orange-800">
                        Bevor es losgeht, führen wir einen kurzen <strong>Internet-Speed-Test</strong> durch, wenn du auf &quot;Weiter zum ersten Interview&quot; klickst.
                    </p>
                    <p className="text-sm text-orange-800 mt-2">
                        Damit stellen wir sicher, dass deine Verbindung für ein reibungsloses Gespräch ausreicht.
                    </p>
                    <p className="text-sm text-orange-800 mt-2">
                        Bei einer instabilen Verbindung besteht die Gefahr, dass das Interview abbricht und jeglicher Fortschritt verloren geht. Daher empfehlen wir eine Verbindung von mindestens <strong>20 Mbit/s</strong>.
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
          <Button
            onClick={handleUploadAndContinue}
            disabled={!selectedFile || isLoading}
            className="bg-brand hover:bg-brand/90 text-black font-bold px-8 py-3"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Prüfe Verbindung...
              </>
            ) : (
              <>
                Weiter zum ersten Interview
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => window.open("mailto:support@impactfactory.de", "_blank")} size="lg">
            Benötigst du Hilfe?
          </Button>
        </div>
      </main>

      {/* AlertDialog für langsame Verbindung */}
      <AlertDialog open={showLowSpeedAlert} onOpenChange={setShowLowSpeedAlert}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Langsame Internetverbindung</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ihre Internetgeschwindigkeit liegt unter den empfohlenen 20 Mbit/s. Ein stabiles Interview kann nicht garantiert werden. Wenn Sie fortfahren, tun Sie dies auf eigene Gefahr. Es kann zu Abbrüchen kommen, die einen Neustart erfordern.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction onClick={navigateToNextPage}>
                        Trotzdem fortfahren
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
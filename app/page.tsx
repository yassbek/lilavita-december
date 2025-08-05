"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { Widget } from "@typeform/embed-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Cookies from 'js-cookie'; // Import für Cookies
import { v4 as uuidv4 } from 'uuid'; // Import für UUID-Generierung

function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-gray-800 text-xl flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text}...
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header className="absolute top-0 left-0 w-full p-6">
      <div className="container mx-auto">
        <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" height={40} width={160} className="h-8 md:h-10 w-auto" />
      </div>
    </header>
  );
}

function LandingPage({ onStartClick }: { onStartClick: () => void }) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF7] text-center p-4 relative">
      <PageHeader />
      <main className="flex flex-col items-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-5 text-gray-900 leading-tight">Bring deine <span className="text-[#D4AE36]">Impact-Idee</span><br />auf das nächste Level.</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          Du willst mit deinem Social Startup nachhaltige Wirkung erzielen? Unser Accelerator-Programm unterstützt dich mit Expertise, Netzwerk und Ressourcen. Starte jetzt deine Bewerbung und zeig uns dein Potenzial.
        </p>
        <Button
          size="lg"
          onClick={onStartClick}
          className="bg-[#D4AE36] hover:bg-[#c9a233] text-black font-bold py-4 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"
        >
          Bewerbung starten
        </Button>
      </main>
    </div>
  );
}

function AppView() {
  const [isLoading, setIsLoading] = useState(true); // Initial auf true setzen, da der Fortschritt geladen wird
  const [currentView, setCurrentView] = useState<'loading' | 'landing' | 'typeform'>('loading'); // Neuer Zustand 'loading'
  const typeformRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null); // applicationId im Zustand halten

  useEffect(() => {
    const initializeSessionAndRedirect = async () => {
      let currentApplicationId = Cookies.get('applicationId');

      if (!currentApplicationId) {
        // Wenn keine applicationId im Cookie gefunden wird, generiere eine neue
        currentApplicationId = uuidv4();
        // Speichere die ID im Cookie für 7 Tage
        Cookies.set('applicationId', currentApplicationId, { expires: 7, secure: process.env.NODE_ENV === 'production' });
        setApplicationId(currentApplicationId); // Setze die ID im Zustand
        setIsLoading(false); // Laden beendet, zeige Landing Page
        setCurrentView('landing');
      } else {
        setApplicationId(currentApplicationId); // Setze die ID im Zustand
        try {
          // API-Aufruf, um den aktuellen Fortschritt des Benutzers aus Directus abzurufen
          const response = await fetch(`/api/user-progress?applicationId=${currentApplicationId}`);
          
          if (!response.ok) {
            // Wenn der Fortschritt nicht gefunden wird (z.B. 404), ist es ein neuer Start
            if (response.status === 404) {
                console.warn(`ApplicationId ${currentApplicationId} nicht in Directus gefunden. Starte neue Bewerbung.`);
                setIsLoading(false);
                setCurrentView('landing');
                return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();

          let nextPath: string | null = null;

          // Bestimme den nächsten Pfad basierend auf dem Fortschritt
          if (data.progress && data.progress.current_interview_stage) {
            const stage = data.progress.current_interview_stage;
            switch (stage) {
                case 'team-reife':
                    nextPath = `/preparation_impact?applicationId=${currentApplicationId}`;
                    break;
                case 'impact':
                    nextPath = `/preparation_impact?applicationId=${currentApplicationId}`;
                    break;
                case 'finanzierung':
                    nextPath = `/preparation_finance?applicationId=${currentApplicationId}`;
                    break;
                case 'marketing':
                    nextPath = `/preparation_marketing?applicationId=${currentApplicationId}`;
                    break;
                case 'ditribution':
                    nextPath = `/preparation_ditribution?applicationId=${currentApplicationId}`;
                    break;   
                case 'completed':
                    nextPath = `/dashboard?applicationId=${currentApplicationId}`;
                    break;
                default:
                    // Fallback für unbekannten Status, zeige Landing Page
                    nextPath = null; // Bleibt auf Landing, wenn Stage unbekannt ist
            }
          }
          
          if (nextPath) {
            router.replace(nextPath); // replace, damit der Benutzer nicht zurücknavigieren kann
          } else {
            setIsLoading(false);
            setCurrentView('landing'); // Wenn kein Fortschritt oder unbekannter Status, zeige Landing
          }

        } catch (error) {
          console.error("Fehler beim Laden des Fortschritts oder der Initialisierung:", error);
          setIsLoading(false);
          setCurrentView('landing'); // Bei Fehlern immer Landing Page anzeigen
        }
      }
    };

    initializeSessionAndRedirect();
  }, [router]);

  const handleStartClick = () => {
    setCurrentView('typeform');
  };

  useEffect(() => {
    if (currentView === 'typeform' && typeformRef.current) {
      typeformRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentView]);

  const handleTypeformSubmit = async (payload: { responseId: string }) => {
    setIsLoading(true);

    try {
      // Wenn applicationId noch null ist (sollte nicht passieren, aber zur Sicherheit)
      if (!applicationId) {
        throw new Error("Application ID ist nach Typeform-Start noch nicht gesetzt.");
      }

      const apiResponse = await fetch(`/api/create-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Sende die generierte applicationId mit, damit Directus sie verwenden kann
        body: JSON.stringify({ responseId: payload.responseId, applicationId: applicationId })
      });

      if (!apiResponse.ok) {
        const errorText = await apiResponse.text();
        throw new Error(`Fehler bei der Kommunikation mit dem Server. Status: ${apiResponse.status}, Body: ${errorText}`);
      }

      const apiResponseData = await apiResponse.json();

      if (apiResponseData.status === 'qualified') {
        const newApplicationData = apiResponseData.data;
        // Stellen Sie sicher, dass die ID aus der API-Antwort verwendet wird,
        // falls Directus eine andere ID generiert hat oder die übermittelte ID verwendet hat.
        // In unserem Fall sollte es die gleiche sein, aber es ist gute Praxis.
        const finalApplicationId = newApplicationData.id.toString(); 
        
        // Aktualisiere das Cookie mit der finalen ID, falls es sich geändert hat (z.B. von UUID zu Integer)
        Cookies.set('applicationId', finalApplicationId, { expires: 7, secure: process.env.NODE_ENV === 'production' });

        const queryParams = new URLSearchParams({
          name: newApplicationData.name || '',
          startup: newApplicationData.startup || '',
          branche: newApplicationData.branche || '',
          applicationId: finalApplicationId, // Verwende die finale ID
        }).toString();
        
        // Nach erfolgreicher Typeform-Einreichung und Qualifizierung,
        // leite zum ersten Interview (Team-Reife) weiter.
        router.push(`/preparation?${queryParams}`);
      } else {
        router.push('/rejection');
      }

    } catch (error) {
      console.error("Fehler bei der Verarbeitung der Typeform-Antwort:", error);
      alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-[#FDFCF7]">
      {isLoading && <LoadingOverlay text="Lade deinen Fortschritt" />}
      {currentView === 'landing' && <LandingPage onStartClick={handleStartClick} />}

      {/* Zeige Typeform nur, wenn currentView 'typeform' ist */}
      <div ref={typeformRef} className={`w-full h-screen ${currentView === 'typeform' ? 'block' : 'hidden'}`}>
        <Widget
          id="yYh3nt7W"
          style={{ width: "100%", height: "100%" }}
          onSubmit={handleTypeformSubmit}
        />
      </div>
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-[#FDFCF7]"><p>Seite wird geladen...</p></div>}>
      <AppView />
    </Suspense>
  );
}

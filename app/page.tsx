"use client";

import { useState, Suspense, useRef, useEffect } from "react";
import { Widget } from "@typeform/embed-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

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
  const [isLoading, setIsLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'landing' | 'typeform'>('landing');
  const typeformRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

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
      const apiResponse = await fetch(`/api/create-application`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responseId: payload.responseId })
      });

      if (!apiResponse.ok) {
        // Dieser Check fängt jetzt echte Server-Fehler wie 404 oder 500 ab
        const errorText = await apiResponse.text();
        throw new Error(`Fehler bei der Kommunikation mit dem Server. Status: ${apiResponse.status}, Body: ${errorText}`);
      }

      const apiResponseData = await apiResponse.json();

      if (apiResponseData.status === 'qualified') {
        const newApplicationData = apiResponseData.data;
        const queryParams = new URLSearchParams({
          name: newApplicationData.name || '',
          startup: newApplicationData.startup || '', // KORRIGIERT
          branche: newApplicationData.branche || '',
          applicationId: newApplicationData.id.toString(),
        }).toString();
        router.push(`/start?${queryParams}`);
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
      {isLoading && <LoadingOverlay text="Analysiere Einreichung" />}
      {currentView === 'landing' && <LandingPage onStartClick={handleStartClick} />}

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
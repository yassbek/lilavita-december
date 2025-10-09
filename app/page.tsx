"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

// Zeigt eine Ladeanimation, während der Fortschritt geprüft und weitergeleitet wird.
function LoadingOverlay({ text }: { text: string }) {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-gray-800 text-xl flex items-center">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text}...
      </div>
    </div>
  );
}

function AppView() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeSessionAndRedirect = async () => {
      let currentApplicationId = Cookies.get('applicationId');

      if (!currentApplicationId) {
        // --- NEUER BENUTZER ---
        // Generiere eine neue ID, speichere sie im Cookie und leite direkt zu /start weiter.
        currentApplicationId = uuidv4();
        Cookies.set('applicationId', currentApplicationId, { expires: 7, secure: process.env.NODE_ENV === 'production' });
        
        // Direkte Weiterleitung zur Startseite des Bewerbungsprozesses.
        router.replace(`/start?applicationId=${currentApplicationId}`);
        
      } else {
        // --- WIEDERKEHRENDER BENUTZER ---
        // Prüfe den Fortschritt in der Datenbank.
        try {
          const response = await fetch(`/api/user-progress?applicationId=${currentApplicationId}`);
          
          if (!response.ok) {
            // Wenn der Benutzer im Cookie existiert, aber nicht in der DB (z.B. 404),
            // starte den Prozess neu bei /start.
            if (response.status === 404) {
              // HIER WURDE DIE ÄNDERUNG VORGENOMMEN
              console.warn(`Fortschritt für ApplicationId ${currentApplicationId} nicht gefunden. Leite zu /start weiter.`);
              router.replace(`/start?applicationId=${currentApplicationId}`);
            } else {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return;
          }
          
          const data = await response.json();
          let nextPath: string | null = null;

          // Leite den Benutzer basierend auf seinem gespeicherten Fortschritt weiter.
          if (data.progress && data.progress.current_interview_stage) {
            const stage = data.progress.current_interview_stage;
            switch (stage) {
              case 'team-reife':
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
                nextPath = `/preparation_distribution?applicationId=${currentApplicationId}`;
                break;
              case 'completed':
                nextPath = `/completion_distribution?applicationId=${currentApplicationId}`;
                break;
              default:
                // Fallback, wenn die Phase unbekannt ist.
                nextPath = `/start?applicationId=${currentApplicationId}`;
            }
          }
          
          if (nextPath) {
            router.replace(nextPath);
          } else {
            // Wenn kein Fortschritt gefunden wurde, starte bei /start.
            router.replace(`/start?applicationId=${currentApplicationId}`);
          }

        } catch (error) {
          console.error("Fehler beim Laden des Fortschritts:", error);
          // Bei einem Fehler zur Sicherheit auf die Startseite leiten.
          router.replace(`/start?applicationId=${currentApplicationId}`);
        }
      }
    };

    initializeSessionAndRedirect();
  }, [router]);

  // Die Komponente zeigt nur noch den Ladebildschirm an, bis die Weiterleitung abgeschlossen ist.
  return (
    <div className="relative w-full min-h-screen bg-[#FDFCF7]">
      {isLoading && <LoadingOverlay text="Lade deine Bewerbung" />}
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
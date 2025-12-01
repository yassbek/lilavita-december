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
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {text}...
      </div>
    </div>
  );
}

function AppView() {
  const [isLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeSessionAndRedirect = async () => {
      let currentApplicationId = Cookies.get('applicationId');

      if (!currentApplicationId) {
        // --- NEUER BENUTZER ---
        // Generiere eine neue ID, speichere sie im Cookie und leite direkt zu /start weiter.
        currentApplicationId = uuidv4();
        Cookies.set('applicationId', currentApplicationId, { expires: 7, secure: process.env.NODE_ENV === 'production' });

        // Direkte Weiterleitung zur Startseite
        router.replace(`/start?applicationId=${currentApplicationId}`);

      } else {
        // --- WIEDERKEHRENDER BENUTZER ---
        // Für Lilavita: Leite immer zur Startseite, da wir nur Magnesium haben
        router.replace(`/start?applicationId=${currentApplicationId}`);
      }
    };

    initializeSessionAndRedirect();
  }, [router]);

  // Die Komponente zeigt nur noch den Ladebildschirm an, bis die Weiterleitung abgeschlossen ist.
  return (
    <div className="relative w-full min-h-screen bg-purple-50">
      {isLoading && <LoadingOverlay text="Lade Lernplattform" />}
    </div>
  );
}

export default function MainPage() {
  return (
    <Suspense fallback={<div className="w-full h-screen flex items-center justify-center bg-purple-50"><p>Seite wird geladen...</p></div>}>
      <AppView />
    </Suspense>
  );
}
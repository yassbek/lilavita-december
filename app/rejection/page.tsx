"use client";

import Image from "next/image";

export default function RejectionPage() {

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-[#FDFCF7] text-center p-4 relative">
      <header className="absolute top-0 left-0 w-full p-6">
        <div className="container mx-auto">
          <Image src="/impactfactory_logo.png" alt="Impact Factory Logo" height={40} width={160} className="h-8 md:h-10 w-auto" />
        </div>
      </header>
      <main className="flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-5 text-gray-900 leading-tight">Vielen Dank für deine Bewerbung!</h1>
        <p className="text-lg text-gray-600 mb-10 max-w-2xl">
          Leider können wir dich für die aktuelle Runde unseres Accelerator-Programms nicht berücksichtigen, da noch nicht alle Kriterien erfüllt sind.
          <br /><br />
          Wir ermutigen dich aber, es wieder zu versuchen! Behalte unsere Kriterien im Auge und bewirb dich gerne für den nächsten Batch wieder. Wir freuen uns darauf, von den Fortschritten deines Startups zu hören.
        </p>
        
      </main>
    </div>
  );
}
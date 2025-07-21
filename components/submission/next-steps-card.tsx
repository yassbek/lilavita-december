import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

/**
 * Next steps recommendations component
 * TODO: Make recommendations dynamic based on assessment results
 */
export function NextStepsCard() {
  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-black">Nächste Schritte</CardTitle>
        <CardDescription>Empfohlene Maßnahmen für die Acceleration Phase</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border-2 border-[#D4AE36]">
            <div className="w-6 h-6 bg-[#D4AE36] text-black font-bold flex items-center justify-center text-sm">1</div>
            <div>
              <h5 className="font-medium text-black">Team-Readiness optimieren</h5>
              <p className="text-sm text-gray-700 mt-1">
                Advisory Board mit Branchenexperten aufbauen und Mentoring-Netzwerk aktivieren
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 border-2 border-gray-300">
            <div className="w-6 h-6 bg-gray-400 text-white font-bold flex items-center justify-center text-sm">2</div>
            <div>
              <h5 className="font-medium text-black">Organisationsstrukturen stärken</h5>
              <p className="text-sm text-gray-700 mt-1">
                Prozesse für Wachstum skalieren und Governance-Strukturen implementieren
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-red-50 border-2 border-red-200">
            <div className="w-6 h-6 bg-black text-white font-bold flex items-center justify-center text-sm">3</div>
            <div>
              <h5 className="font-medium text-black">Finanzplanung professionalisieren</h5>
              <p className="text-sm text-gray-700 mt-1">
                Detaillierte Finanzplanung und Controlling-Prozesse für die nächste Funding-Runde
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

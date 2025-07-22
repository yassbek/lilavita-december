import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { Submission } from "@/types/submission"

interface AIAnalysisCardProps {
  submission: Submission
}

/**
 * AI analysis results component
 * TODO: Connect to actual AI analysis service
 */
export function AIAnalysisCard() {
  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-black">AI Analysis Results</CardTitle>
        <CardDescription>Team & Organization readiness assessment based on Impact Factory framework</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* Strengths section */}
        <div>
          <h4 className="font-semibold text-[#D4AE36] mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-[#D4AE36]"></div>
            Stärken (Team & Organisation)
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-[#D4AE36] mt-1">•</span>
              <span>Komplettes Kernteam mit hoher Kompetenz in allen Schlüsselbereichen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AE36] mt-1">•</span>
              <span>Klare Rollenverteilung und effektive Zusammenarbeit im Team</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AE36] mt-1">•</span>
              <span>Etablierte Unternehmenskultur mit verankerten Werten</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#D4AE36] mt-1">•</span>
              <span>Strukturen und Prozesse für Wachstum bereits implementiert</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Areas for improvement */}
        <div>
          <h4 className="font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-gray-400"></div>
            Verbesserungsbereiche
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Finanz- und Geschäftsplanung professionalisieren</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Advisory Board und Mentoring-Netzwerk ausbauen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400 mt-1">•</span>
              <span>Skalierungsstrategien für Organisationsstrukturen entwickeln</span>
            </li>
          </ul>
        </div>

        <Separator />

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-black"></div>
            Empfehlungen
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-black mt-1">•</span>
              <span>Advisory Board mit Branchenexperten und erfahrenen Unternehmern aufbauen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black mt-1">•</span>
              <span>Detaillierte 18-Monats-Finanzplanung mit Meilensteinen erstellen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black mt-1">•</span>
              <span>Resilienz und Lernfähigkeit durch strukturierte Feedback-Prozesse stärken</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black mt-1">•</span>
              <span>Governance-Strukturen für die nächste Wachstumsphase vorbereiten</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

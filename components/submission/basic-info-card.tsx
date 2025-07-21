import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Building, Users, MapPin } from "lucide-react"
import type { Submission } from "@/types/submission"

interface BasicInfoCardProps {
  submission: Submission
}

/**
 * Basic information card component
 * TODO: Add edit functionality for admin users
 */
export function BasicInfoCard({ submission }: BasicInfoCardProps) {
  return (
    <Card className="border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2 text-black">
          <Building className="h-5 w-5 text-[#D4AE36]" />
          Startup Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Sektor:</span>
            <Badge variant="outline" className="border-gray-300 text-gray-700">
              {submission.sector}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <Users className="h-4 w-4" />
              Team Size:
            </span>
            <span className="font-medium text-black">{submission.details.teamSize} Personen</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              Standort:
            </span>
            <span className="font-medium text-black">{submission.details.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Funding Stage:</span>
            <span className="font-medium text-black">{submission.details.fundingStage}</span>
          </div>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium mb-2 text-black">Beschreibung</h4>
          <p className="text-sm text-gray-600">{submission.details.description}</p>
        </div>
      </CardContent>
    </Card>
  )
}

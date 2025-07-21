"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { SECTORS } from "@/data/constants"

interface FilterSectionProps {
  searchTerm: string
  selectedSector: string
  minMatchScore: string
  onSearchChange: (value: string) => void
  onSectorChange: (value: string) => void
  onScoreChange: (value: string) => void
  onClearFilters: () => void
}

/**
 * Filter controls component for submissions
 * TODO: Add date range filtering and advanced search options
 */
export function FilterSection({
  searchTerm,
  selectedSector,
  minMatchScore,
  onSearchChange,
  onSectorChange,
  onScoreChange,
  onClearFilters,
}: FilterSectionProps) {
  return (
    <Card className="mb-6 border-2 border-gray-200 shadow-none">
      <CardHeader className="bg-gray-50">
        <CardTitle className="flex items-center gap-2 text-black">
          <Filter className="h-5 w-5 text-[#D4AE36]" />
          Filter Submissions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or startup..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-[#D4AE36] shadow-none"
            />
          </div>

          {/* Sector filter */}
          <Select value={selectedSector} onValueChange={onSectorChange}>
            <SelectTrigger className="border-2 border-gray-200 focus:border-[#D4AE36] shadow-none">
              <SelectValue placeholder="Select sector" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Score filter */}
          <Input
            type="number"
            placeholder="Min match score"
            value={minMatchScore}
            onChange={(e) => onScoreChange(e.target.value)}
            min="0"
            max="100"
            className="border-2 border-gray-200 focus:border-[#D4AE36] shadow-none"
          />

          {/* Clear filters button */}
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="border-2 border-gray-200 hover:border-[#D4AE36] hover:bg-[#D4AE36] hover:text-black shadow-none bg-transparent"
          >
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

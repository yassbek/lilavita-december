import { Users } from "lucide-react"

interface DashboardHeaderProps {
  totalSubmissions: number
}

/**
 * Main dashboard header component
 * Displays Impact Factory branding and submission count
 * TODO: Add user authentication info and logout functionality
 */
export function DashboardHeader({ totalSubmissions }: DashboardHeaderProps) {
  return (
    <div className="bg-black border-b-2 border-[#D4AE36]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Impact Factory</h1>
              <p className="text-gray-300 mt-1">Voice Agent Interview Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <Users className="h-4 w-4" />
                <span>{totalSubmissions} Submissions</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

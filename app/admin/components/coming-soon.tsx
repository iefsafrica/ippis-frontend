import { AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ComingSoonProps {
  featureName: string
  description?: string
}

export function ComingSoon({ featureName, description }: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-3xl border-amber-200 shadow-md">
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-amber-700">Feature Coming Soon</CardTitle>
          </div>
          <CardDescription className="text-amber-600 font-medium">
            The {featureName} module is currently under development
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-700">
            {description ||
              `We're working hard to implement the ${featureName} functionality. This feature will be available in a future update. Thank you for your patience.`}
          </p>
          <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-100">
            <h3 className="font-medium text-amber-700 mb-2">What you can do now:</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Explore other available features in the sidebar</li>
              <li>Check back soon for updates</li>
              <li>Contact the system administrator if you need immediate access to this functionality</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

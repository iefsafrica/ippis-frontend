"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestEnvironmentVariables() {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>("Loading...")

  useEffect(() => {
    // Access the environment variable
    const url = process.env.NEXT_PUBLIC_API_BASE_URL || "Not set"
    setApiBaseUrl(url)
  }, [])

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Environment Variables Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">API Base URL:</h3>
              <code className="block bg-gray-100 p-2 rounded mt-1">{apiBaseUrl}</code>
            </div>

            <div className="mt-4">
              <h3 className="text-lg font-medium">Status:</h3>
              <p className={apiBaseUrl !== "Not set" ? "text-green-600" : "text-red-600"}>
                {apiBaseUrl !== "Not set"
                  ? "✅ Environment variable is correctly set"
                  : "❌ Environment variable is not set"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

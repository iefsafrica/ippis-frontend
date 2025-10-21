"use client"
import React, { ReactNode, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Loader2, Search, FileText, Clock, CheckCircle, AlertCircle } from "lucide-react"

type Status = "pending" | "under_review" | "approved" | "rejected" | string

interface ApplicationData {
  id: string
  name: string
  email: string
  status: Status
  submittedDate: string
  lastUpdated: string
  comments: string
  nextStep: string
}

export default function TrackApplicationPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [applicationFound, setApplicationFound] = useState(false)
  const [searchMethod, setSearchMethod] = useState<"id" | "email">("id")
  const [searchValue, setSearchValue] = useState("")
  const [applicationData, setApplicationData] = useState<ApplicationData | null>(null)

  const handleSearch = async () => {
    const trimmed = searchValue.trim()
    if (!trimmed) {
      toast({
        title: "Search value required",
        description: `Please enter a ${searchMethod === "id" ? "registration ID" : "email"} to search.`,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setApplicationFound(false)
    setApplicationData(null)

    try {
      const res = await fetch(`/api/track?${searchMethod}=${encodeURIComponent(trimmed)}`)

      if (!res.ok) {
        throw new Error("Application not found")
      }

      const data = await res.json()

      if (data.success && data.data) {
        setApplicationData({
          name: data.data.full_name,
          id: data.data.registration_id,
          email: data.data.email,
          submittedDate: data.data.created_at,
          lastUpdated: data.data.updated_at,
          status: data.data.status,
          comments: data.data.comments || "No comments yet.",
          nextStep: data.data.next_step || "Awaiting further updates.",
        })
        setApplicationFound(true)
      } else {
        setApplicationFound(false)
        toast({
          title: "No application found",
          description: "We couldn't find an application matching your search.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Search error:", error)
      setApplicationFound(false)
      toast({
        title: "Search error",
        description: "Unable to find application or network error occurred.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: Status): ReactNode => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" /> Pending
          </div>
        )
      case "under_review":
        return (
          <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
            <FileText className="h-3 w-3" /> Under Review
          </div>
        )
      case "approved":
        return (
          <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <CheckCircle className="h-3 w-3" /> Approved
          </div>
        )
      case "rejected":
        return (
          <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
            <AlertCircle className="h-3 w-3" /> Rejected
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" /> Unknown
          </div>
        )
    }
  }

  // Reset searchValue when switching tabs to avoid confusion
  const handleTabChange = (value: "id" | "email") => {
    setSearchMethod(value)
    setSearchValue("")
    setApplicationFound(false)
    setApplicationData(null)
  }

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="container max-w-4xl mx-auto">
        <div className="flex items-center justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={50}
              height={50}
              alt="Coat of Arms of Nigeria"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold">IPPIS</span>
          </Link>
        </div>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Track Your Application</CardTitle>
            <CardDescription className="text-center">
              Enter your registration ID or email to check the status of your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={searchMethod} className="w-full" onValueChange={handleTabChange}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="id">Search by Registration ID</TabsTrigger>
                <TabsTrigger value="email">Search by Email</TabsTrigger>
              </TabsList>

              <TabsContent value="id">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="registration-id">Registration ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="registration-id"
                        placeholder="e.g. IPPIS890949"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isLoading || searchValue.trim() === ""}
                        className="bg-green-700 hover:bg-green-800 whitespace-nowrap"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" /> Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="email">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="e.g. walpconsult@gmail.com"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                      />
                      <Button
                        onClick={handleSearch}
                        disabled={isLoading || searchValue.trim() === ""}
                        className="bg-green-700 hover:bg-green-800 whitespace-nowrap"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" /> Search
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {applicationFound && applicationData && (
              <div className="mt-8 space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{applicationData.name}</h3>
                    <p className="text-sm text-gray-500">ID: {applicationData.id}</p>
                  </div>
                  <div>{getStatusBadge(applicationData.status)}</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Email</p>
                    <p>{applicationData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Submitted Date</p>
                    <p>{new Date(applicationData.submittedDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p>{new Date(applicationData.lastUpdated).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Status</p>
                    <p>{applicationData.comments}</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
                  <p className="text-sm">{applicationData.nextStep}</p>
                </div>


                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                  <p className="text-sm font-medium">If you have any questions or need further assistance, please contact the IPPIS support team.</p>
                </div>
              </div>
            )}

            {!applicationFound && !isLoading && searchValue.trim() !== "" && (
              <p className="mt-8 text-center text-sm text-red-600">No application found matching your search.</p>
            )}
          </CardContent>
          <CardFooter className="justify-center">
            <Link href="/" className="inline-flex items-center gap-2 underline underline-offset-2 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

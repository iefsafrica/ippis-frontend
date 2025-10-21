"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ippisNumber: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.ippisNumber || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter your IPPIS number and password.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Login Failed",
      description: "This is a demo. The login functionality is not implemented yet.",
      variant: "destructive",
    })

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-red-50 py-12 px-4 flex flex-col items-center justify-center">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
          width={50}
          height={50}
          alt="Coat of Arms of Nigeria"
          className="h-12 w-auto"
        />
        <span className="text-2xl font-bold">IPPIS</span>
      </Link>

      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Employee Login</CardTitle>
          <CardDescription className="text-center">
            Enter your IPPIS number and password to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ippisNumber">IPPIS Number</Label>
              <Input
                id="ippisNumber"
                placeholder="Enter your IPPIS number"
                value={formData.ippisNumber}
                onChange={(e) => handleChange("ippisNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-green-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleChange("rememberMe", checked)}
              />
              <Label htmlFor="rememberMe" className="text-sm">
                Remember me for 30 days
              </Label>
            </div>
            <Button type="submit" className="w-full bg-green-700 hover:bg-green-800" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500">
            Don't have an account?{" "}
            <Link href="/register" className="text-green-700 hover:underline">
              Register here
            </Link>
          </div>
          <div className="text-xs text-center text-gray-500">
            By logging in, you agree to our{" "}
            <Link href="#" className="text-green-700 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-green-700 hover:underline">
              Privacy Policy
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Eye, EyeOff, AlertCircle, Lock, User, Info, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Cookies from "js-cookie"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCredentials, setShowCredentials] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // For demo purposes only - in production use actual authentication
      if (username === "admin" && password === "admin123") {
        // Set authentication cookie
        Cookies.set("ippis_token", "demo-token-value", { expires: 1 }) // 1 day

        // Store user in localStorage
        const user = {
          id: "1",
          username: "admin",
          role: "admin",
        }
        localStorage.setItem("ippis_user", JSON.stringify(user))

        // Redirect to admin dashboard
        router.push("/admin")
      } else {
        setError("Invalid username or password")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const fillCredentials = () => {
    setUsername("admin")
    setPassword("admin123")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23009639' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        ></div>
      </div>

      <div className="w-full max-w-md z-10">
        <div className="opacity-100 transform translate-y-0 transition-all duration-500">
          <Card className="shadow-2xl border-0 overflow-hidden backdrop-blur-sm bg-white/90">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-green-600 to-green-400"></div>

            <CardHeader className="space-y-1 pb-8">
              <div className="flex items-center justify-center mb-4 scale-100 transition-transform duration-300">
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-green-400 to-green-600 opacity-75 blur-sm"></div>
                  <div className="relative bg-white rounded-full p-2">
                    <Image
                      src="/images/ippis-logo.jpeg"
                      alt="IPPIS Logo"
                      width={120}
                      height={120}
                      className="mx-auto mb-4"
                    />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-800">IPPIS Admin Portal</CardTitle>
              <CardDescription className="text-center text-gray-600">
                Enter your credentials to access the admin dashboard
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {error && (
                  <div className="opacity-100 h-auto transition-all duration-300">
                    <Alert variant="destructive" className="border-red-300 bg-red-50 text-red-800">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Demo Credentials Card */}
                <div className="relative">
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      showCredentials ? "opacity-100 max-h-40" : "opacity-0 max-h-0"
                    }`}
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-medium text-blue-800 flex items-center gap-1">
                          <Info className="h-4 w-4" />
                          Demo Credentials
                        </h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-blue-700 hover:text-blue-800 hover:bg-blue-100 p-1"
                          onClick={fillCredentials}
                        >
                          Auto-fill
                        </Button>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-blue-700">
                            <span className="font-medium">Username:</span> admin
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard("admin", "username")}
                          >
                            {copied === "username" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-blue-600" />
                            )}
                          </Button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-blue-700">
                            <span className="font-medium">Password:</span> admin123
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard("admin123", "password")}
                          >
                            {copied === "password" ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5 text-blue-600" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-blue-600 mt-2">
                        These credentials are for demonstration purposes only.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-10 right-0 text-xs text-gray-500 hover:text-gray-700"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    {showCredentials ? "Hide credentials" : "Show demo credentials"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-green-600" />
                    Username
                  </label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-3 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-green-600" />
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pr-10 border-gray-300 focus:border-green-500 focus:ring-green-500 rounded-md shadow-sm"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <Link
                      href="/auth/forgot-password"
                      className="font-medium text-green-600 hover:text-green-500 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2.5 rounded-md shadow-sm transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Authenticating...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  Protected by Federal Government of Nigeria security protocols
                </p>
              </CardFooter>
            </form>

            <div className="px-6 pb-6 pt-2 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <span>&copy; {new Date().getFullYear()} IPPIS Nigeria.</span>
                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                <span>All rights reserved.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

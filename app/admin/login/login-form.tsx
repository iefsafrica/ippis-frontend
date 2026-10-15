"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, User, Lock, KeyRound, Loader2, ArrowLeft, RefreshCw, AlertCircle } from "lucide-react"
import Link from "next/link"
import { login, verifyOtp, requestOtp } from "@/lib/auth"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/admin"
  const isExpired = searchParams.get("expired") === "1"

  const [step, setStep] = useState<"credentials" | "otp">("credentials")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(
    isExpired ? "Your session has expired. Please sign in again." : null
  )

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setInfoMessage(null)

    try {
      const result = await login(username.trim(), password)

      if (result.success) {
        if (result.requiresOTP) {
          setStep("otp")
          setInfoMessage(result.message || "An OTP code has been sent to your registered email.")
          setResendCooldown(60)
        } else if (result.token) {
          router.push(redirectUrl)
        } else {
          router.push("/admin")
        }
      } else {
        setError(result.message || "Invalid username or password")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "An unexpected error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setError("Please enter the 6-digit OTP code")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await verifyOtp(username.trim(), otp.trim())

      if (result.success && result.token) {
        router.push(redirectUrl)
      } else {
        setError(result.message || "Invalid or expired OTP code")
      }
    } catch (err: any) {
      console.error("OTP verification error:", err)
      setError(err.message || "Failed to verify OTP code")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResendingOtp) return

    setIsResendingOtp(true)
    setError(null)

    try {
      const result = await requestOtp(username.trim())
      if (result.success) {
        setInfoMessage("A new OTP code has been sent to your registered email.")
        setResendCooldown(60)
      } else {
        setError(result.message || "Failed to resend OTP code")
      }
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP")
    } finally {
      setIsResendingOtp(false)
    }
  }

  if (step === "otp") {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4">
        {infoMessage && (
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <AlertDescription className="text-sm">{infoMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
            Verification Code (OTP)
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              className="pl-10 text-center tracking-widest text-lg font-mono font-semibold"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              autoFocus
              required
            />
          </div>
          <p className="text-xs text-gray-500">
            Check your inbox and spam folder for the one-time password.
          </p>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
          disabled={isLoading || otp.length < 6}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Code...
            </>
          ) : (
            "Verify & Sign In"
          )}
        </Button>

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => {
              setStep("credentials")
              setOtp("")
              setError(null)
              setInfoMessage(null)
            }}
            className="inline-flex items-center text-xs text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            Back to login
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendCooldown > 0 || isResendingOtp}
            className="inline-flex items-center text-xs text-green-600 hover:text-green-700 disabled:opacity-50"
          >
            {isResendingOtp ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Resending...
              </>
            ) : resendCooldown > 0 ? (
              `Resend code in ${resendCooldown}s`
            ) : (
              <>
                <RefreshCw className="mr-1 h-3 w-3" />
                Resend OTP
              </>
            )}
          </button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-4">
      {infoMessage && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800">
          <AlertDescription className="text-sm">{infoMessage}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
          Username or Email
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            name="username"
            type="text"
            placeholder="admin or admin@ippis.gov.ng"
            className="pl-10"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)}
          />
          <label
            htmlFor="remember"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Remember me
          </label>
        </div>
        <Link href="/admin/forgot-password" className="text-sm text-green-600 hover:text-green-700">
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing In...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  )
}

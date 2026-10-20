"use client";

import type React from "react";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  ShieldCheck,
  Check,
  X,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setVerifyingToken(false);
        setTokenValid(false);
        setTokenError("No password reset token was provided in the link. Please use the link sent to your email.");
        return;
      }

      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ippis-backend.onrender.com";
        const res = await fetch(`${backendUrl}/api/admin/auth/reset-password?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));

        if (res.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email || "");
          setFullName(data.fullName || "IPPIS User");
        } else {
          setTokenValid(false);
          setTokenError(data.error || "This password reset link is invalid or has expired. Please request a new link.");
        }
      } catch (err: any) {
        console.error("Token verification error:", err);
        setTokenValid(false);
        setTokenError("Failed to verify reset token. Please check your network connection and try again.");
      } finally {
        setVerifyingToken(false);
      }
    }

    verify();
  }, [token]);

  // Validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isFormValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!isFormValid) {
      setSubmitError("Please ensure your new password satisfies all security requirements.");
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ippis-backend.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsSuccess(true);
      } else {
        setSubmitError(data.error || "Failed to update password. Please try again.");
      }
    } catch (err: any) {
      console.error("Password reset error:", err);
      setSubmitError("Network communication error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-emerald-50/50 via-slate-50 to-emerald-100/30 items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-xl border-slate-200/90 rounded-2xl overflow-hidden bg-white">
        <div className="h-2 bg-gradient-to-r from-[#005a36] via-[#008751] to-[#046c43]" />

        <CardHeader className="space-y-1.5 text-center pb-4 pt-6">
          <div className="flex items-center justify-center mb-1">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={52}
              height={52}
              alt="Coat of Arms of Nigeria"
              className="h-13 w-auto drop-shadow-sm"
            />
          </div>
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#008751] px-3 py-1 rounded-full text-xs font-semibold mx-auto">
            <ShieldCheck className="w-3.5 h-3.5" /> IPPIS Credential Security
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Set New Password</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Create a secure, permanent password for your employee account
          </CardDescription>
        </CardHeader>

        {verifyingToken ? (
          <CardContent className="p-10 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#008751] mx-auto" />
            <p className="text-xs text-slate-600 font-medium">Verifying password reset security token...</p>
          </CardContent>
        ) : !tokenValid ? (
          <CardContent className="space-y-4 pt-2">
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-red-900">Link Invalid or Expired</p>
                <AlertDescription className="text-xs text-red-800 leading-relaxed">
                  {tokenError || "This password reset link is invalid or has expired. For your security, reset links are valid for 60 minutes."}
                </AlertDescription>
              </div>
            </Alert>
            <div className="pt-2 space-y-2">
              <Link
                href="/admin/forgot-password"
                className="w-full inline-flex items-center justify-center bg-[#008751] hover:bg-[#007043] text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
              >
                Request a New Reset Link
              </Link>
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium py-2 px-4 rounded-lg text-xs transition-colors"
              >
                Return to Login
              </Link>
            </div>
          </CardContent>
        ) : isSuccess ? (
          <CardContent className="space-y-4 pt-2 text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Password Reset Complete!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your IPPIS password has been successfully updated. A confirmation email has been dispatched to your address.
              </p>
            </div>
            <div className="pt-3">
              <Button
                onClick={() => router.push("/login")}
                className="w-full bg-[#008751] hover:bg-[#007043] text-white font-semibold h-10 text-xs rounded-lg shadow-sm"
              >
                Sign In With New Password <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2 text-xs">
              {submitError && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 text-xs py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {userEmail && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600">
                  <p className="text-[11px] text-slate-400">Resetting credentials for:</p>
                  <p className="font-semibold text-slate-900 text-xs">{fullName} ({userEmail})</p>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-10 pr-10 text-xs rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 block">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-10 pr-10 text-xs rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements Checklist */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px]">
                <p className="font-semibold text-slate-700 text-xs mb-1">Password Requirements:</p>
                <div className={`flex items-center gap-1.5 ${hasMinLength ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least 8 characters long</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  {hasUppercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  {hasLowercase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least one lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>At least one number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${passwordsMatch ? "text-emerald-700 font-medium" : "text-slate-500"}`}>
                  {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Both passwords match</span>
                </div>
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full bg-[#008751] hover:bg-[#007043] text-white font-semibold h-10 text-xs rounded-lg shadow-sm mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating Password...
                  </>
                ) : (
                  "Reset Password & Activate"
                )}
              </Button>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 py-3 text-center flex items-center justify-center">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Cancel and return to Sign In
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-[#008751]" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

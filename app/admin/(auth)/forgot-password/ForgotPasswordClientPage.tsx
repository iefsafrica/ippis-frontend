"use client";

import type React from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle, Mail, Loader2, ShieldCheck, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ForgotPasswordClientPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ippis-backend.onrender.com";
      const res = await fetch(`${backendUrl}/api/admin/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setSuccess(true);
        setSuccessMessage(
          data.message ||
            "Password reset instructions have been sent to your email address."
        );
      } else {
        setError(data.error || "Unable to process password reset request. Please check the email and try again.");
      }
    } catch (err: any) {
      console.error("Forgot password request failed:", err);
      setError("Network communication error. Please try again or contact support.");
    } finally {
      setIsLoading(false);
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
            <ShieldCheck className="w-3.5 h-3.5" /> IPPIS Account Recovery
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Reset Your Password</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            For both active employees and pending applicants registered on IPPIS
          </CardDescription>
        </CardHeader>

        {success ? (
          <CardContent className="space-y-4 pt-2">
            <Alert className="border-emerald-300 bg-emerald-50 text-emerald-950 p-4 rounded-xl">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm text-emerald-900">Reset Instructions Sent!</p>
                <AlertDescription className="text-xs text-emerald-800 leading-relaxed">
                  {successMessage}
                </AlertDescription>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Please check your inbox (and spam or junk folder) for an email from IPPIS Security. The reset link is valid for 60 minutes.
                </p>
              </div>
            </Alert>

            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center bg-[#008751] hover:bg-[#007043] text-white font-semibold py-2.5 px-4 rounded-lg text-xs transition-colors shadow-sm"
              >
                Return to Sign In Portal
              </Link>
              <button
                type="button"
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 py-1"
              >
                Send to a different email address
              </button>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2 text-xs">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-900 text-xs py-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-600 leading-relaxed">
                <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                  <KeyRound className="w-3.5 h-3.5 text-[#008751]" /> Active & Pending Employee Access
                </p>
                <p className="text-[11px]">
                  Enter your registered official or personal email address. A secure, single-use password reset link will be sent directly to your inbox.
                </p>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-medium text-slate-700 block">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                    className="h-10 pl-9 text-xs rounded-lg"
                    placeholder="e.g. employee@ministry.gov.ng"
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#008751] hover:bg-[#007043] text-white font-semibold h-10 text-xs rounded-lg shadow-sm mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  "Send Password Reset Link"
                )}
              </Button>
            </CardContent>

            <CardFooter className="bg-slate-50 border-t border-slate-100 py-3.5 text-center flex items-center justify-between">
              <Link
                href="/login"
                className="text-xs text-[#008751] hover:underline font-semibold inline-flex items-center"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back to Sign In
              </Link>
              <Link
                href="/register"
                className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
              >
                Need to Register?
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

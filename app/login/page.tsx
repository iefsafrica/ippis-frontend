"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Eye,
  EyeOff,
  ShieldCheck,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Clock,
  Calendar,
  Wallet,
  FileCheck2,
  CheckCircle2,
  Briefcase,
  HelpCircle,
  Lock,
  User,
  Fingerprint,
  Building2,
  Sparkles,
  PhoneCall,
  ChevronRight,
  Info
} from "lucide-react";
import { login } from "@/lib/auth";

export default function EmployeeLoginPage() {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [authMode, setAuthMode] = useState<"ippis" | "nin">("ippis");

  // Live digital clock for attendance demonstration
  const [currentTime, setCurrentTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-NG", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Form states
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    nin: "",
    otp: "",
    rememberMe: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (authMode === "ippis") {
      if (!formData.identifier.trim() || !formData.password) {
        setError("Please enter your IPPIS Staff Number / Email and Password.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await login(formData.identifier.trim(), formData.password);

        if (result.success) {
          toast({
            title: "Sign-In Successful",
            description: "Welcome to IPPIS Employee Self-Service Dashboard.",
          });
          router.push("/admin");
        } else {
          setError(
            result.message ||
              "Invalid credentials. Please verify your IPPIS Number and password."
          );
        }
      } catch (err: any) {
        setError(err.message || "Network communication error. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // NIN Login flow
      if (!formData.nin.trim() || formData.nin.trim().length !== 11) {
        setError("Please enter a valid 11-digit National Identity Number (NIN).");
        return;
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setError("NIN OTP authentication service is ready. Use your standard IPPIS credentials for direct dashboard entry.");
      }, 1200);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F9F8] flex flex-col justify-between selection:bg-[#008751] selection:text-white">
      {/* Top Government Navigation Header */}
      <header className="border-b border-emerald-950/10 bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={48}
              height={48}
              alt="Coat of Arms of Nigeria"
              className="h-11 w-auto drop-shadow-sm group-hover:scale-105 transition-transform"
            />
            <div className="leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-[#005a36] tracking-tight">IPPIS</span>
                <span className="text-[10px] font-bold uppercase bg-[#008751]/10 text-[#008751] px-1.5 py-0.5 rounded tracking-wide">
                  ESS Portal
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block">
                Federal Republic of Nigeria
              </span>
            </div>
          </Link>

          {/* Quick Support & Status Header */}
          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1 rounded-full border border-emerald-200/60 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#008751] animate-pulse" />
              <span>Federal Portal Status: All Systems Operational</span>
            </div>

            <Link
              href="/admin/login"
              className="text-slate-600 hover:text-[#008751] font-medium transition-colors hidden sm:inline-flex items-center gap-1"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>MDA Admin Portal</span>
            </Link>

            <Link
              href="/register"
              className="bg-[#008751] hover:bg-[#006e42] text-white font-semibold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow"
            >
              New Employee Registration
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
          {/* LEFT COLUMN: Features Showcase & ESS Overview */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-50 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-full text-xs font-semibold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#008751]" />
                <span>Employee Self-Service (ESS) Suite</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                Your Federal Public Service Career,{" "}
                <span className="text-[#008751] underline decoration-[#008751]/30 decoration-wavy">
                  In One Place.
                </span>
              </h1>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
                The centralized digital workspace for Nigerian Civil Servants. Clock in,
                download verified monthly payslips, request leave, and track career milestones in real time.
              </p>
            </div>

            {/* Live Interactive Feature Cards (Showcasing the 8 Essential Dashboard Pillars) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {/* Feature 1: Attendance & Shift Tracking */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#008751]/40 transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#008751] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50/80 text-emerald-700 border-emerald-200 font-mono">
                    {currentTime || "08:14:22 AM"}
                  </Badge>
                </div>
                <h2 className="text-xs font-bold text-slate-900">Attendance & Timesheets</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Geofenced biometric clock in/out, shift roster & overtime logs.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span className="flex items-center gap-1 text-[#008751]">
                    <CheckCircle2 className="w-3 h-3" /> Shift Active
                  </span>
                  <span className="text-slate-400">Regular: 08:00 - 16:00</span>
                </div>
              </div>

              {/* Feature 2: Payroll & Payslips */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#008751]/40 transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-1.5 py-0.5 rounded">
                    Monthly E-Payslip
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900">Payroll & Payslips</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Instant salary breakdown, verified pension, NHF, & tax deductions.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span className="text-slate-700 font-semibold">Direct Deposit OAGF</span>
                  <span className="text-blue-600 font-bold">PDF Ready</span>
                </div>
              </div>

              {/* Feature 3: Leave Management */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#008751]/40 transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-medium px-1.5 py-0.5 rounded">
                    21 Days Balance
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900">Leave Management</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Apply for annual, casual, maternity or sick leave with auto approval flow.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span className="text-slate-500">Public Holidays Sync</span>
                  <span className="text-emerald-700 font-medium">Instant Tracking</span>
                </div>
              </div>

              {/* Feature 4: Tasks & Service Records */}
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-[#008751]/40 transition-all hover:shadow-md group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] bg-purple-50 text-purple-800 border border-purple-200 font-medium px-1.5 py-0.5 rounded">
                    Projects & Tasks
                  </span>
                </div>
                <h2 className="text-xs font-bold text-slate-900">Projects & Digital Records</h2>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Review assigned assignments, contracts, and verified appointment letters.
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                  <span className="text-slate-500">Next-of-Kin Management</span>
                  <span className="text-purple-700 font-medium">Verified File</span>
                </div>
              </div>
            </div>

            {/* Official Compliance Statement */}
            <div className="bg-[#EBF7F1] border border-emerald-200/80 rounded-2xl p-4 flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#008751] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-emerald-950 leading-relaxed">
                <p className="font-bold text-emerald-900">
                  Official Federal Civil Service Security Protocols
                </p>
                <p className="text-emerald-800/90 text-[11px] mt-0.5">
                  End-to-end 256-bit encrypted data custody in accordance with the
                  Office of the Head of the Civil Service of the Federation (OHCSF) and Nigeria Data Protection Act (NDPA).
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: State-of-the-Art Authentication Form */}
          <div className="lg:col-span-5 w-full">
            <Card className="border border-slate-200/90 shadow-2xl rounded-3xl overflow-hidden bg-white relative">
              {/* Top Accent Gradient Bar */}
              <div className="h-2.5 bg-gradient-to-r from-[#005a36] via-[#008751] to-[#04a060]" />

              <CardHeader className="space-y-2 pb-4 pt-6 px-6 sm:px-8">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#008751] px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <Lock className="w-3.5 h-3.5" /> Secure Employee Sign-In
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">v2.4 ESS</span>
                </div>

                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">
                  Sign In to Your Dashboard
                </CardTitle>

                <CardDescription className="text-xs text-slate-500 leading-relaxed">
                  Enter your assigned Federal IPPIS credentials to access your personnel, attendance, and payroll records.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-6 sm:px-8">
                {/* Dual Auth Mode Tabs */}
                <Tabs
                  value={authMode}
                  onValueChange={(val) => {
                    setAuthMode(val as any);
                    setError(null);
                  }}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 bg-slate-100/90 p-1 rounded-xl h-10">
                    <TabsTrigger
                      value="ippis"
                      className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-xs gap-1.5"
                    >
                      <User className="w-3.5 h-3.5" />
                      IPPIS Number
                    </TabsTrigger>
                    <TabsTrigger
                      value="nin"
                      className="text-xs font-semibold rounded-lg data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-xs gap-1.5"
                    >
                      <Fingerprint className="w-3.5 h-3.5" />
                      NIN Fast-Track
                    </TabsTrigger>
                  </TabsList>

                  {/* Mode 1: Standard IPPIS Credentials */}
                  <TabsContent value="ippis" className="pt-3 m-0 space-y-4">
                    {error && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 py-2.5 text-xs rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* IPPIS ID / Email Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="identifier" className="text-xs font-bold text-slate-700">
                            IPPIS Number or Official Email
                          </Label>
                          <span className="text-[10px] text-slate-400 font-medium">e.g. IPPIS-104928</span>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <User className="w-4 h-4" />
                          </div>
                          <Input
                            id="identifier"
                            type="text"
                            required
                            autoComplete="username"
                            placeholder="e.g. employee@ministry.gov.ng"
                            value={formData.identifier}
                            onChange={(e) => handleChange("identifier", e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-11 pl-10 text-xs rounded-xl border-slate-200 focus-visible:ring-[#008751] focus-visible:border-[#008751] bg-slate-50/50 hover:bg-white transition-all font-medium"
                          />
                        </div>
                      </div>

                      {/* Password Input */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="password" className="text-xs font-bold text-slate-700">
                            Password
                          </Label>
                          <Link
                            href="/admin/forgot-password"
                            className="text-[11px] text-[#008751] hover:text-[#006e42] hover:underline font-semibold"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Lock className="w-4 h-4" />
                          </div>
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="h-11 pl-10 pr-10 text-xs rounded-xl border-slate-200 focus-visible:ring-[#008751] focus-visible:border-[#008751] bg-slate-50/50 hover:bg-white transition-all font-medium"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>

                        {capsLockActive && (
                          <p className="text-[10px] text-amber-700 flex items-center gap-1 font-medium mt-1">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            Caps Lock is ON
                          </p>
                        )}
                      </div>

                      {/* Remember Me Checkbox */}
                      <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="rememberMe"
                            checked={formData.rememberMe}
                            onCheckedChange={(checked) => handleChange("rememberMe", checked)}
                            className="data-[state=checked]:bg-[#008751] data-[state=checked]:border-[#008751]"
                          />
                          <label
                            htmlFor="rememberMe"
                            className="text-xs text-slate-600 font-medium leading-none cursor-pointer select-none"
                          >
                            Remember my IPPIS ID
                          </label>
                        </div>
                      </div>

                      {/* Submit CTA Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#008751] hover:bg-[#006e42] text-white font-bold h-11 text-xs rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                          </>
                        ) : (
                          <>
                            Sign In to Employee Portal
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Mode 2: NIN Biometric Fast-Track */}
                  <TabsContent value="nin" className="pt-3 m-0 space-y-4">
                    {error && (
                      <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 py-2.5 text-xs rounded-xl">
                        <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                        <p className="font-semibold text-slate-800 mb-0.5 flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4 text-[#008751]" /> National Identity Fast-Track
                        </p>
                        Verify your identity with your 11-digit NIN. An OTP will be dispatched to your registered phone number.
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="nin" className="text-xs font-bold text-slate-700">
                          11-Digit National Identity Number (NIN)
                        </Label>
                        <div className="relative">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                            <Fingerprint className="w-4 h-4" />
                          </div>
                          <Input
                            id="nin"
                            type="text"
                            maxLength={11}
                            placeholder="Enter 11-digit NIN"
                            value={formData.nin}
                            onChange={(e) => handleChange("nin", e.target.value.replace(/\D/g, ""))}
                            className="h-11 pl-10 text-xs rounded-xl font-mono tracking-wider"
                          />
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#008751] hover:bg-[#006e42] text-white font-bold h-11 text-xs rounded-xl shadow-md transition-all gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying NIN with NIMC...
                          </>
                        ) : (
                          <>
                            Send Verification OTP
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* First-Time Employee Notice */}
                <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl p-3.5 text-xs text-amber-950">
                  <div className="flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-amber-950 text-xs">First-Time Employee Sign-In?</p>
                      <p className="text-[11px] text-amber-900/90 mt-0.5 leading-relaxed">
                        If your appointment was newly approved, enter the provisional password dispatched to your MDA email.
                        You will be prompted to set your personal password immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer with Quick Links */}
              <CardFooter className="bg-slate-50/90 border-t border-slate-100 p-4 sm:px-8 flex flex-col gap-2.5 text-center">
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#008751] font-semibold">
                  <Link href="/register" className="hover:underline flex items-center gap-1">
                    <span>New Applicant Registration</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href="/admin/login" className="hover:underline flex items-center gap-1">
                    <span>MDA Admin Sign-In</span>
                  </Link>
                  <span className="text-slate-300">•</span>
                  <Link href="/track" className="hover:underline flex items-center gap-1">
                    <span>Track Verification</span>
                  </Link>
                </div>

                <p className="text-[10px] text-slate-400">
                  Office of the Accountant-General of the Federation (OAGF) • Federal Ministry of Finance
                </p>
              </CardFooter>
            </Card>

            {/* Quick Help Desk Floating Card */}
            <div className="mt-4 flex items-center justify-between px-4 py-2.5 bg-white border border-slate-200/80 rounded-2xl shadow-xs text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-[#008751]" />
                <span>Experiencing login difficulties?</span>
              </span>
              <a
                href="mailto:support@ippis.gov.ng"
                className="text-[#008751] font-bold hover:underline flex items-center gap-1"
              >
                IPPIS Helpdesk <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#008751]" />
            <span>
              © {new Date().getFullYear()} Integrated Personnel and Payroll Information System (IPPIS). All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <Link href="#" className="hover:text-slate-900">Privacy Policy</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-900">Terms of Service</Link>
            <span>•</span>
            <Link href="#" className="hover:text-slate-900">Civil Service Guidelines</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

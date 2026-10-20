"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, ShieldCheck, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.identifier.trim() || !formData.password) {
      setError("Please enter your official IPPIS email/number and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await login(formData.identifier.trim(), formData.password);

      if (result.success) {
        toast({
          title: "Sign-In Successful",
          description: "Welcome to IPPIS Employee Self-Service.",
        });
        router.push("/admin");
      } else {
        setError(result.message || "Invalid credentials. Please verify your username and password.");
      }
    } catch (err: any) {
      setError(err.message || "Network communication error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/50 via-slate-50 to-emerald-100/30 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <Link href="/" className="flex items-center gap-3 mb-6 transition-transform hover:scale-105">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
          width={56}
          height={56}
          alt="Coat of Arms of Nigeria"
          className="h-14 w-auto drop-shadow-sm"
        />
        <div className="text-left">
          <span className="text-2xl font-extrabold text-[#005a36] tracking-tight block">IPPIS</span>
          <span className="text-[11px] font-medium text-slate-500 tracking-wider uppercase block">Federal Republic of Nigeria</span>
        </div>
      </Link>

      <Card className="w-full max-w-md border-slate-200/90 shadow-xl rounded-2xl overflow-hidden bg-white">
        <div className="h-2 bg-gradient-to-r from-[#005a36] via-[#008751] to-[#046c43]" />
        
        <CardHeader className="space-y-1.5 text-center pb-4 pt-6">
          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#008751] px-3 py-1 rounded-full text-xs font-semibold mx-auto mb-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Official Employee Portal
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Sign In to Your Account</CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Approved employees and registered applicants can access their portal using their credentials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 py-2.5 text-xs">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-3 text-xs text-amber-900">
            <p className="font-semibold flex items-center gap-1.5 text-amber-950 mb-0.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-700" /> First-Time Employee Sign-In Notice
            </p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              If your employment was recently approved, use the temporary password sent to your official email. You can update your password upon signing in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <Label htmlFor="identifier" className="text-xs font-medium text-slate-700">
                Email Address or Username
              </Label>
              <Input
                id="identifier"
                type="text"
                required
                autoComplete="username"
                placeholder="e.g. employee@ministry.gov.ng"
                value={formData.identifier}
                onChange={(e) => handleChange("identifier", e.target.value)}
                className="h-10 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-medium text-slate-700">
                  Password
                </Label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] text-[#008751] hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="h-10 text-xs pr-10 rounded-lg"
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

            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={(checked) => handleChange("rememberMe", checked)}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-slate-600 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Remember me on this trusted device
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#008751] hover:bg-[#007043] text-white font-semibold h-10 text-xs rounded-lg shadow-sm mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Sign In to Dashboard <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 py-3.5 text-center flex flex-col gap-1">
          <p className="text-[11px] text-slate-500">
            Integrated Personnel and Payroll Information System • Office of the Accountant-General
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#008751] font-medium justify-center pt-1">
            <Link href="/register" className="hover:underline">Submit New Registration</Link>
            <span>•</span>
            <Link href="/admin/login" className="hover:underline">Administrative Login</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

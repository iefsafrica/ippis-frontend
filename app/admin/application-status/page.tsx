"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Loader2,
  FileText,
  User,
  Building2,
  Briefcase,
  Calendar,
  Mail,
  RefreshCw,
  LogOut,
  ShieldCheck,
  Phone,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TimelineStep {
  step: string;
  status: "completed" | "active" | "pending" | "failed";
  date: string | null;
  description?: string;
}

interface ApplicationData {
  success: boolean;
  applicationStatus: "pending" | "approved" | "rejected" | "under_review" | "not_found";
  stage?: string;
  registrationId?: string;
  employeeId?: string;
  name?: string;
  email?: string;
  position?: string;
  department?: string;
  mda?: string;
  submittedAt?: string;
  joinDate?: string;
  message?: string;
  timeline?: TimelineStep[];
}

export default function ApplicationStatusPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || localStorage.getItem("ippis_auth_token") : null;
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://ippis-backend.onrender.com";

      const res = await fetch(`${backendUrl}/api/admin/application-status`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok && res.status !== 404) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to load application status:", err);
      setError(err.message || "Failed to load application status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStatus();
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Approved & Enrolled
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Application Not Approved
          </Badge>
        );
      case "under_review":
      case "pending":
      default:
        return (
          <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4" /> Under Review / In Verification
          </Badge>
        );
    }
  };

  const defaultTimeline: TimelineStep[] = [
    {
      step: "Application Submitted",
      status: "completed",
      date: data?.submittedAt || "Received",
      description: "Application and supporting bio-data successfully received by IPPIS central intake system.",
    },
    {
      step: "Identity & Document Verification",
      status: data?.applicationStatus === "approved" ? "completed" : "active",
      date: null,
      description: "Verification of NIN, BVN, educational certificates and appointment particulars.",
    },
    {
      step: "MDA HR Review & Screening",
      status: data?.applicationStatus === "approved" ? "completed" : "pending",
      date: null,
      description: "Human resource establishment screening and credential validation.",
    },
    {
      step: "Final Approval & IPPIS Enrolment",
      status: data?.applicationStatus === "approved" ? "completed" : data?.applicationStatus === "rejected" ? "failed" : "pending",
      date: data?.joinDate || null,
      description: "Official approval by authorized officer and issuance of IPPIS Employee ID.",
    },
  ];

  const timelineToUse = data?.timeline && data.timeline.length > 0 ? data.timeline : defaultTimeline;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-[#005a36] via-[#008751] to-[#046c43] rounded-2xl shadow-lg p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase">
                <ShieldCheck className="w-3.5 h-3.5" /> Federal Republic of Nigeria • IPPIS
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Applicant Application Portal
              </h1>
              <p className="text-emerald-100 text-sm max-w-xl">
                Track real-time status of your federal civil service application and recruitment clearance.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh Status"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-300/30 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <Card className="p-12 text-center border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-[#008751] mx-auto mb-3" />
            <p className="text-sm text-slate-600 font-medium">Retrieving your application records...</p>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50/50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-semibold text-red-900 text-sm">Unable to Load Application Status</h3>
                <p className="text-xs text-red-700">{error}</p>
                <Button size="sm" variant="outline" onClick={handleRefresh} className="mt-2 text-xs">
                  Try Again
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <>
            {/* Status Highlight Banner */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Current Review Status
                    </span>
                    {getStatusBadge(data?.applicationStatus)}
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {data?.applicationStatus === "approved"
                      ? "Congratulations! Your Application has been Approved."
                      : data?.applicationStatus === "rejected"
                      ? "Application Review Concluded"
                      : "Your Application is Under Active Review"}
                  </h2>
                  <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                    {data?.message ||
                      "Your credentials and submission have been placed in the review queue. Authorized MDA review officers will process your registration and you will receive email updates."}
                  </p>
                </div>

                {data?.registrationId && (
                  <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 md:min-w-[240px] text-center md:text-right">
                    <p className="text-xs text-slate-500 font-medium">Registration Tracking ID</p>
                    <p className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                      {data.registrationId}
                    </p>
                    {data?.submittedAt && (
                      <p className="text-xs text-slate-400 mt-1">
                        Submitted: {new Date(data.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Application Details Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-slate-200 shadow-sm md:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#008751]" /> Applicant Profile
                  </CardTitle>
                  <CardDescription className="text-xs">Bio-data associated with this account</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3.5 text-sm">
                  <div>
                    <p className="text-xs font-medium text-slate-400">Full Name</p>
                    <p className="font-semibold text-slate-800">{data?.name || user?.name || "Applicant"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Email Address</p>
                    <p className="font-semibold text-slate-800 break-all">{data?.email || user?.email || "N/A"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Applied Position</p>
                    <p className="font-semibold text-slate-800">{data?.position || "Administrative / Professional Officer"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Designated MDA / Department</p>
                    <p className="font-semibold text-slate-800">{data?.department || "Federal Civil Service"}</p>
                  </div>
                  {data?.employeeId && (
                    <>
                      <Separator />
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
                        <p className="text-xs font-medium text-emerald-700">Official IPPIS Employee ID</p>
                        <p className="font-mono font-bold text-emerald-900 text-base">{data.employeeId}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Multi-step Application Timeline */}
              <Card className="border-slate-200 shadow-sm md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#008751]" /> Clearance & Verification Pipeline
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Stage-by-stage progression of your recruitment application
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {timelineToUse.map((step, idx) => {
                      const isCompleted = step.status === "completed";
                      const isActive = step.status === "active";
                      const isFailed = step.status === "failed";

                      return (
                        <div key={idx} className="relative flex items-start gap-4">
                          <div
                            className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                              isCompleted
                                ? "bg-emerald-600 text-white"
                                : isActive
                                ? "bg-amber-500 text-white animate-pulse"
                                : isFailed
                                ? "bg-red-600 text-white"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : isFailed ? (
                              <XCircle className="w-3.5 h-3.5" />
                            ) : (
                              <span className="text-[10px] font-bold">{idx + 1}</span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-semibold text-slate-900">{step.step}</h4>
                              {isCompleted && (
                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 py-0">
                                  Done
                                </Badge>
                              )}
                              {isActive && (
                                <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 py-0 animate-pulse">
                                  In Progress
                                </Badge>
                              )}
                              {step.date && (
                                <span className="text-xs text-slate-400">
                                  • {new Date(step.date).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {step.description ||
                                (isCompleted
                                  ? "Successfully verified and recorded."
                                  : isActive
                                  ? "Currently undergoing verification by the credential committee."
                                  : "Awaiting preceding verification clearances.")}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Verification Notice Card */}
            <Card className="border-emerald-100 bg-emerald-50/40 p-5 rounded-xl">
              <div className="flex items-start gap-3.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-emerald-900 text-sm">
                    Official Notice on Recruitment & Enrolment
                  </p>
                  <p>
                    The Integrated Personnel and Payroll Information System (IPPIS) ensures that all recruitment into the Federal Public Service conforms to Civil Service Rules and establishment quotas.
                  </p>
                  <p className="text-slate-600 mt-1">
                    Once your verification is finalized by the designated MDA and the Office of the Head of Service, your status will update automatically and login credentials to the Employee Self-Service dashboard will be generated.
                  </p>
                </div>
              </div>
            </Card>

            {/* Help & Support Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white border border-slate-200 rounded-xl text-xs text-slate-600 gap-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-slate-400" />
                <span>Need assistance with your application? Contact IPPIS Support Desk</span>
              </div>
              <div className="flex items-center gap-4 text-slate-700 font-medium">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> support@ippis.gov.ng
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> +234 9 462 0000
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  User,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Bell,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Briefcase,
  Building2,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Send,
  Download,
  Printer,
  ChevronRight,
  Plus,
  RefreshCw,
  LogOut,
  CalendarDays,
  Target,
  FileCheck2,
  MessageSquare,
  AlertTriangle,
  Award,
  BookOpen,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function EmployeeDashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [currentTime, setCurrentTime] = useState("");
  const [clockStatus, setClockStatus] = useState<"clocked_in" | "clocked_out">("clocked_in");
  const [clockInTime, setClockInTime] = useState("08:14 AM");
  const [clockOutTime, setClockOutTime] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: "success" | "info" | "error"; text: string } | null>(null);

  // Modals state
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [regularizeModalOpen, setRegularizeModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [payslipModalOpen, setPayslipModalOpen] = useState(false);

  // Form states
  const [leaveForm, setLeaveForm] = useState({ type: "Annual Leave", start: "", end: "", reason: "" });
  const [regularizeForm, setRegularizeForm] = useState({ date: "", punchType: "Clock In", reason: "" });
  const [profileForm, setProfileForm] = useState({ phone: "0803 123 4567", address: "Plot 12, Gwarinpa Estate, Abuja", nokName: "Mrs. Amina Bello", nokPhone: "0809 987 6543", nokRelation: "Spouse" });
  const [ticketForm, setTicketForm] = useState({ category: "HR Enquiry", subject: "", description: "", priority: "Normal" });

  // Real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const showNotification = (text: string, type: "success" | "info" | "error" = "success") => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleClockToggle = async () => {
    setActionLoading(true);
    try {
      const nowStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
      if (clockStatus === "clocked_in") {
        setClockStatus("clocked_out");
        setClockOutTime(nowStr);
        showNotification(`Clocked Out successfully at ${nowStr}. Have a great evening!`, "info");
      } else {
        setClockStatus("clocked_in");
        setClockInTime(nowStr);
        setClockOutTime(null);
        showNotification(`Clocked In successfully at ${nowStr}. Have a productive day!`, "success");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    setLeaveModalOpen(false);
    showNotification(`Leave application for ${leaveForm.type} submitted to your department supervisor.`, "success");
  };

  const handleRegularize = (e: React.FormEvent) => {
    e.preventDefault();
    setRegularizeModalOpen(false);
    showNotification("Attendance regularisation request submitted for HR approval.", "success");
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileModalOpen(false);
    showNotification("Profile update request submitted to HR for statutory record verification.", "success");
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketModalOpen(false);
    showNotification("Support ticket created (#TKT-9912) and assigned to Helpdesk.", "success");
  };

  const employeeName = user?.name || "Dr. Ibrahim Aliyu";
  const staffId = user?.username?.includes("@") ? "IPPIS-STAFF-18420" : user?.username || "IPPIS-STAFF-18420";
  const departmentName = "Department of Human Resources Management";
  const mdaName = "Federal Ministry of Finance, Budget & National Planning";
  const positionTitle = "Chief Administrative Officer";
  const reportingManager = "Engr. Abubakar S. Bello (Director, HR & Personnel)";

  return (
    <div className="space-y-6 pb-12">
      {/* Toast alert banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm transition-all animate-in fade-in ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : feedbackMessage.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <p className="text-sm font-medium">{feedbackMessage.text}</p>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Welcome Header Card */}
      <div className="bg-gradient-to-r from-[#005a36] via-[#008751] to-[#046c43] rounded-2xl shadow-md p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> Employee Self-Service
              </span>
              <Badge className="bg-emerald-400/25 hover:bg-emerald-400/30 text-white border-emerald-300/30 text-xs">
                Permanent & Pensionable
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Welcome back, {employeeName}
            </h1>
            <p className="text-emerald-100 text-sm max-w-2xl leading-relaxed">
              {positionTitle} • {departmentName} • {mdaName}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-200 pt-1">
              <span>Employee ID: <strong className="font-mono text-white">{staffId}</strong></span>
              <span>•</span>
              <span>Cadre: <strong className="text-white">Admin Officer Cadre (GL 12 / Step 4)</strong></span>
            </div>
          </div>

          {/* Clock In / Out Quick Widget */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-5 flex flex-col items-center md:items-end justify-center min-w-[240px]">
            <div className="flex items-center gap-2 text-emerald-100 text-xs font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              <span>Official Time:</span>
              <span className="font-mono font-bold text-white text-sm">{currentTime || "--:--:--"}</span>
            </div>
            <p className="text-[11px] text-emerald-200 mb-3">
              Today: {clockStatus === "clocked_in" ? `Clocked In (${clockInTime})` : clockOutTime ? `Clocked Out (${clockOutTime})` : "Not Clocked In"}
            </p>
            <Button
              onClick={handleClockToggle}
              disabled={actionLoading}
              className={`w-full font-semibold shadow-sm text-xs py-2 h-9 ${
                clockStatus === "clocked_in"
                  ? "bg-amber-400 hover:bg-amber-500 text-slate-900"
                  : "bg-white hover:bg-emerald-50 text-[#005a36]"
              }`}
            >
              {actionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              ) : (
                <Clock className="w-3.5 h-3.5 mr-1.5" />
              )}
              {clockStatus === "clocked_in" ? "Clock Out for Today" : "Clock In Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-slate-100/90 p-1 rounded-xl h-auto flex flex-nowrap min-w-max border border-slate-200/80">
            <TabsTrigger value="overview" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Overview
            </TabsTrigger>
            <TabsTrigger value="profile" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              My Profile
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Attendance & Clocking
            </TabsTrigger>
            <TabsTrigger value="leaves" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Leave Management
            </TabsTrigger>
            <TabsTrigger value="payroll" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Payroll & Payslips
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Goals & Performance
            </TabsTrigger>
            <TabsTrigger value="announcements" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Policies & Announcements
            </TabsTrigger>
            <TabsTrigger value="helpdesk" className="text-xs px-3.5 py-2 font-medium data-[state=active]:bg-white data-[state=active]:text-[#008751] data-[state=active]:shadow-sm">
              Helpdesk & Tickets
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ===================== TAB 1: OVERVIEW ===================== */}
        <TabsContent value="overview" className="space-y-6">
          {/* 4 Stat Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Today's Attendance</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      {clockStatus === "clocked_in" ? "Present (Clocked In)" : "Clocked Out"}
                    </h3>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                      Shift: 08:00 AM - 04:00 PM
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008751] flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Leave Balance</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      18 <span className="text-xs font-normal text-slate-500">of 30 Days</span>
                    </h3>
                    <p className="text-[11px] text-amber-600 font-medium mt-0.5">
                      1 pending request for review
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Latest Payslip</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      ₦346,850.00
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Period: October 2026 (Ready)
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#008751] flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Assigned Tasks</p>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      3 Active <span className="text-xs font-normal text-slate-500">Tasks</span>
                    </h3>
                    <p className="text-[11px] text-red-600 font-medium mt-0.5">
                      1 approaching deadline (Oct 28)
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Briefcase className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions & Approaching Deadlines */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Action Hub */}
            <Card className="border-slate-200 shadow-sm lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-xs">
                  Instant self-service requests & operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <Button
                  variant="outline"
                  onClick={() => setLeaveModalOpen(true)}
                  className="w-full justify-start text-xs h-10 text-slate-700 hover:text-[#008751] hover:border-[#008751]/30 hover:bg-[#008751]/5"
                >
                  <Calendar className="w-4 h-4 mr-2 text-[#008751]" />
                  Apply for Time Off / Leave
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPayslipModalOpen(true)}
                  className="w-full justify-start text-xs h-10 text-slate-700 hover:text-[#008751] hover:border-[#008751]/30 hover:bg-[#008751]/5"
                >
                  <FileText className="w-4 h-4 mr-2 text-emerald-600" />
                  View & Download October Payslip
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setRegularizeModalOpen(true)}
                  className="w-full justify-start text-xs h-10 text-slate-700 hover:text-[#008751] hover:border-[#008751]/30 hover:bg-[#008751]/5"
                >
                  <Clock className="w-4 h-4 mr-2 text-amber-600" />
                  Request Attendance Regularisation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setTicketModalOpen(true)}
                  className="w-full justify-start text-xs h-10 text-slate-700 hover:text-[#008751] hover:border-[#008751]/30 hover:bg-[#008751]/5"
                >
                  <HelpCircle className="w-4 h-4 mr-2 text-blue-600" />
                  Submit Support / HR Enquiry Ticket
                </Button>
              </CardContent>
            </Card>

            {/* Approaching Tasks & Deadlines */}
            <Card className="border-slate-200 shadow-sm lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Assigned Tasks & Deadlines
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current work plan and statutory compliance items
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("performance")}
                  className="text-xs text-[#008751] hover:text-[#008751] hover:bg-emerald-50"
                >
                  View All Tasks <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3.5 rounded-xl border border-red-100 bg-red-50/40 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-600 text-white text-[10px] py-0">High Priority</Badge>
                      <h4 className="text-xs font-semibold text-slate-900">
                        Q4 Personnel Records Audit & Verification Cross-Check
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      Cross-verify departmental nominal roll with IPPIS biometric clearance records.
                    </p>
                    <p className="text-[11px] text-red-700 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: 28 October 2026 (in 8 days)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">75%</span>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-amber-700 bg-amber-50 text-[10px] py-0 border-amber-200">Medium</Badge>
                      <h4 className="text-xs font-semibold text-slate-900">
                        Departmental Training Needs Assessment Submission
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600">
                      Identify skills gap and submit capacity development recommendations for 2027 budget.
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due: 05 November 2026
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-800">40%</span>
                    <p className="text-[10px] text-slate-400">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Official Notices & Announcements Preview */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#008751]" /> Official Notices & Circulars
                </CardTitle>
                <CardDescription className="text-xs">
                  Directives from the Office of the Head of the Civil Service of the Federation (OHCSF)
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveTab("announcements")}
                className="text-xs text-[#008751] hover:text-[#008751] hover:bg-emerald-50"
              >
                Read All Circulars <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-xl border border-slate-200/80 bg-white hover:border-emerald-200 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    Circular on 2026 Public Service Annual Biometric Verification Exercise
                  </span>
                  <span className="text-[11px] text-slate-400">18 Oct 2026</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All officers across Federal Ministries, Departments and Agencies are hereby directed to ensure their biometric and service records on IPPIS are verified and up to date before the close of the financial year.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 2: EMPLOYEE PROFILE ===================== */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Identity Card */}
            <Card className="border-slate-200 shadow-sm md:col-span-1">
              <CardHeader className="text-center pb-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#005a36] to-emerald-500 text-white font-bold text-2xl flex items-center justify-center mx-auto shadow-md mb-2">
                  {employeeName.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">{employeeName}</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-mono">{staffId}</CardDescription>
                <div className="pt-2">
                  <Badge className="bg-emerald-600 text-white text-xs">Confirmed Officer</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-xs pt-2">
                <Separator />
                <div className="flex justify-between">
                  <span className="text-slate-500">Cadre:</span>
                  <span className="font-semibold text-slate-800">Administrative Officer</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Grade Level / Step:</span>
                  <span className="font-semibold text-slate-800">GL 12 / Step 04</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date of First Appt:</span>
                  <span className="font-semibold text-slate-800">15 Jan 2018</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date of Confirmation:</span>
                  <span className="font-semibold text-slate-800">15 Jan 2020</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reporting Manager:</span>
                  <span className="font-semibold text-slate-800 text-right">{reportingManager}</span>
                </div>
                <Separator />
                <Button
                  onClick={() => setProfileModalOpen(true)}
                  className="w-full bg-[#008751] hover:bg-[#007043] text-white text-xs"
                >
                  Request Profile Changes for HR Approval
                </Button>
              </CardContent>
            </Card>

            {/* Profile Information Tables */}
            <div className="md:col-span-2 space-y-6">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Official Employment Particulars
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Institutional assignments and administrative details
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Ministry / Agency (MDA)</span>
                    <span className="font-semibold text-slate-800 text-sm">{mdaName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Department</span>
                    <span className="font-semibold text-slate-800 text-sm">{departmentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Sub-Unit / Division</span>
                    <span className="font-semibold text-slate-800 text-sm">Staff Records & Personnel Audit Division</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Duty Station / Location</span>
                    <span className="font-semibold text-slate-800 text-sm">Central Headquarters, Abuja, FCT</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold text-slate-900">
                      Contact & Next-of-Kin Details
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Permitted personal details (manageable through HR verification)
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setProfileModalOpen(true)}
                    className="text-xs text-[#008751] border-[#008751]/30"
                  >
                    Edit Details
                  </Button>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-medium">Official Email</span>
                    <span className="font-semibold text-slate-800 text-sm">{user?.email || "i.aliyu@finance.gov.ng"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Mobile Phone</span>
                    <span className="font-semibold text-slate-800 text-sm">{profileForm.phone}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 block font-medium">Residential Address</span>
                    <span className="font-semibold text-slate-800 text-sm">{profileForm.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Next-of-Kin Full Name</span>
                    <span className="font-semibold text-slate-800 text-sm">{profileForm.nokName} ({profileForm.nokRelation})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Next-of-Kin Phone</span>
                    <span className="font-semibold text-slate-800 text-sm">{profileForm.nokPhone}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ===================== TAB 3: ATTENDANCE & CLOCKING ===================== */}
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#008751]" /> Biometric Clocking Station
                </CardTitle>
                <CardDescription className="text-xs">
                  Daily attendance punch & regularisation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">Current System Time</p>
                  <p className="text-2xl font-mono font-bold text-slate-900 mt-1">{currentTime || "--:--:--"}</p>
                  <Badge className={`mt-2 ${clockStatus === "clocked_in" ? "bg-emerald-600" : "bg-amber-600"} text-white text-[11px]`}>
                    Status: {clockStatus === "clocked_in" ? "Clocked In" : "Clocked Out"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button
                    onClick={handleClockToggle}
                    disabled={actionLoading}
                    className={`w-full text-xs font-semibold h-10 ${
                      clockStatus === "clocked_in"
                        ? "bg-amber-500 hover:bg-amber-600 text-slate-950"
                        : "bg-[#008751] hover:bg-[#007043] text-white"
                    }`}
                  >
                    {clockStatus === "clocked_in" ? "Clock Out for Today" : "Clock In Now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRegularizeModalOpen(true)}
                    className="w-full text-xs text-slate-700 h-10"
                  >
                    Dispute Missed Punch / Regularise
                  </Button>
                </div>

                <Separator />
                <div className="text-xs space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Assigned Shift:</span>
                    <strong className="text-slate-800">Standard Public Service (8am - 4pm)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Core Working Hours:</span>
                    <strong className="text-slate-800">40 Hours / Week</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Attendance Rate (Oct):</span>
                    <strong className="text-emerald-700 font-bold">98.2%</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Logs Table */}
            <Card className="border-slate-200 shadow-sm md:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Attendance Timesheet Logs
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Official daily arrival, departure, and verified working duration
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => showNotification("Timesheet exported to CSV successfully.")}
                  className="text-xs text-slate-600"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Export Log
                </Button>
              </CardHeader>
              <CardContent>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Clock In</th>
                        <th className="py-2.5 px-3">Clock Out</th>
                        <th className="py-2.5 px-3">Hours</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">Today (20 Oct 2026)</td>
                        <td className="py-2.5 px-3 font-mono">{clockInTime}</td>
                        <td className="py-2.5 px-3 font-mono">{clockOutTime || "--:--"}</td>
                        <td className="py-2.5 px-3">Active</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">On Time</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">19 Oct 2026</td>
                        <td className="py-2.5 px-3 font-mono">07:58 AM</td>
                        <td className="py-2.5 px-3 font-mono">04:12 PM</td>
                        <td className="py-2.5 px-3">8h 14m</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">On Time</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">18 Oct 2026</td>
                        <td className="py-2.5 px-3 font-mono">08:19 AM</td>
                        <td className="py-2.5 px-3 font-mono">04:30 PM</td>
                        <td className="py-2.5 px-3">8h 11m</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">Late (19m)</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">17 Oct 2026</td>
                        <td className="py-2.5 px-3 font-mono">07:50 AM</td>
                        <td className="py-2.5 px-3 font-mono">04:05 PM</td>
                        <td className="py-2.5 px-3">8h 15m</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">On Time</Badge>
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">16 Oct 2026</td>
                        <td className="py-2.5 px-3 font-mono">08:00 AM</td>
                        <td className="py-2.5 px-3 font-mono">04:00 PM</td>
                        <td className="py-2.5 px-3">8h 00m</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">On Time</Badge>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== TAB 4: LEAVE MANAGEMENT ===================== */}
        <TabsContent value="leaves" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Leave Entitlements & Records</h2>
              <p className="text-xs text-slate-500">View balances, submit time off requests, and review approvals</p>
            </div>
            <Button
              onClick={() => setLeaveModalOpen(true)}
              className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Apply for Leave
            </Button>
          </div>

          {/* Leave Balances Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-emerald-800">Annual Statutory Leave</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">18</span>
                  <span className="text-xs text-slate-500">days remaining</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#008751] h-full rounded-full" style={{ width: "60%" }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">12 used of 30 total annual allocation</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-blue-800">Casual Leave</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">5</span>
                  <span className="text-xs text-slate-500">days remaining</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: "71%" }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">2 used of 7 total annual casual days</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-amber-800">Sick / Medical Leave</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">14</span>
                  <span className="text-xs text-slate-500">days remaining</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: "100%" }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">0 used of 14 statutory days</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-purple-800">Maternity / Paternity</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-extrabold text-slate-900">84</span>
                  <span className="text-xs text-slate-500">days entitlement</span>
                </div>
                <div className="mt-3 w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full" style={{ width: "100%" }} />
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Statutory family leave entitlement</p>
              </CardContent>
            </Card>
          </div>

          {/* Pending & Historical Leave Table */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Leave Applications & Requests
              </CardTitle>
              <CardDescription className="text-xs">
                Active requests undergoing departmental review and historical records
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Request ID</th>
                      <th className="py-2.5 px-3">Leave Type</th>
                      <th className="py-2.5 px-3">Duration</th>
                      <th className="py-2.5 px-3">Date Range</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">LR-2026-088</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Annual Leave</td>
                      <td className="py-3 px-3">10 Work Days</td>
                      <td className="py-3 px-3 text-slate-600">10 Nov 2026 - 21 Nov 2026</td>
                      <td className="py-3 px-3">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-[10px]">
                          Pending HR Review
                        </Badge>
                      </td>
                      <td className="py-3 px-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => showNotification("Pending leave request cancelled.")}
                          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-7 px-2"
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">LR-2026-031</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Casual Leave</td>
                      <td className="py-3 px-3">2 Work Days</td>
                      <td className="py-3 px-3 text-slate-600">04 Aug 2026 - 06 Aug 2026</td>
                      <td className="py-3 px-3">
                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-[10px]">
                          Approved
                        </Badge>
                      </td>
                      <td className="py-3 px-3 text-slate-400">Completed</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 5: PAYROLL & PAYSLIPS ===================== */}
        <TabsContent value="payroll" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Payroll, Payslips & Compensation</h2>
              <p className="text-xs text-slate-500">Official monthly salary statements, tax contributions, and pension records</p>
            </div>
            <Button
              onClick={() => setPayslipModalOpen(true)}
              className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold shadow-sm"
            >
              <Printer className="w-4 h-4 mr-1.5" /> View Printable Payslip
            </Button>
          </div>

          {/* Latest Payslip Highlight Card */}
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50/40 via-white to-slate-50 shadow-sm p-6 rounded-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Latest Salary Disbursement • October 2026
                </span>
                <h3 className="text-2xl font-extrabold text-slate-900 font-mono">
                  ₦346,850.00 <span className="text-xs font-normal text-slate-500 font-sans">Net Take-Home Pay</span>
                </h3>
                <p className="text-xs text-slate-600">
                  Direct Credit via CBN Interbank to: <strong>Zenith Bank Plc (******8921)</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setPayslipModalOpen(true)}
                  className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" /> Statement Breakdown
                </Button>
                <Button
                  onClick={() => showNotification("Payslip PDF downloaded to your device.")}
                  className="bg-[#008751] hover:bg-[#007043] text-white text-xs"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
                </Button>
              </div>
            </div>
          </Card>

          {/* Breakdown Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Earnings Breakdown */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Gross Earnings Breakdown</span>
                  <Badge className="bg-emerald-600 text-white font-mono">₦418,200.00</Badge>
                </CardTitle>
                <CardDescription className="text-xs">CONPSS Grade Level 12 / Step 4</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Consolidated Basic Salary</span>
                  <strong className="font-mono text-slate-900">₦224,500.00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Rent & Housing Allowance</span>
                  <strong className="font-mono text-slate-900">₦86,200.00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Transport & Mobility Allowance</span>
                  <strong className="font-mono text-slate-900">₦48,000.00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Utility & Domestic Allowance</span>
                  <strong className="font-mono text-slate-900">₦32,500.00</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Peculiar Civil Service Allowance</span>
                  <strong className="font-mono text-slate-900">₦27,000.00</strong>
                </div>
              </CardContent>
            </Card>

            {/* Deductions Breakdown */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                  <span>Statutory Deductions Breakdown</span>
                  <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200 font-mono">
                    -₦71,350.00
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">Tax, Pension & Statutory Levies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Pay-As-You-Earn (PAYE) State Tax</span>
                  <strong className="font-mono text-red-600">₦41,820.00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">Contributory Pension (8% Employee)</span>
                  <strong className="font-mono text-red-600">₦21,450.00</strong>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-600">National Housing Fund (NHF - 2.5%)</span>
                  <strong className="font-mono text-red-600">₦5,612.50</strong>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-600">Staff Welfare Association</span>
                  <strong className="font-mono text-red-600">₦2,467.50</strong>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Historical Salary Statements Table */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Payslip History (Last 4 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Period</th>
                      <th className="py-2.5 px-3">Gross Earnings</th>
                      <th className="py-2.5 px-3">Deductions</th>
                      <th className="py-2.5 px-3">Net Pay</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {["October 2026", "September 2026", "August 2026", "July 2026"].map((m, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-medium text-slate-900">{m}</td>
                        <td className="py-2.5 px-3 font-mono">₦418,200.00</td>
                        <td className="py-2.5 px-3 font-mono text-red-600">-₦71,350.00</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">₦346,850.00</td>
                        <td className="py-2.5 px-3">
                          <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Disbursed</Badge>
                        </td>
                        <td className="py-2.5 px-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPayslipModalOpen(true)}
                            className="text-xs text-[#008751] hover:text-[#008751] h-7 px-2"
                          >
                            <Download className="w-3 h-3 mr-1" /> View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===================== TAB 6: PERFORMANCE & GOALS ===================== */}
        <TabsContent value="performance" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Performance, Objectives & Appraisal</h2>
              <p className="text-xs text-slate-500">Track assigned objectives, annual KPIs, and appraisal cycles</p>
            </div>
            <Button
              onClick={() => showNotification("Self-assessment draft saved successfully.")}
              className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold"
            >
              Submit Annual Self-Assessment
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Current Appraisal Cycle
                </CardTitle>
                <CardDescription className="text-xs">Federal Public Service 2026 Cycle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-xs">
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase">Cycle Stage</span>
                  <h4 className="text-sm font-bold text-emerald-950 mt-0.5">Self-Appraisal Phase Open</h4>
                  <p className="text-emerald-700 text-[11px] mt-1">Deadline: 30 November 2026</p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Reporting Officer</span>
                  <span className="font-semibold text-slate-800 text-sm">{reportingManager}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Last Appraisal Rating (2025)</span>
                  <div className="flex items-center gap-1.5 font-bold text-amber-600">
                    <Award className="w-4 h-4" /> 4.7 / 5.0 (Exceeds Expectations)
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* KPIs & Goals List */}
            <Card className="border-slate-200 shadow-sm md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Assigned KPIs & Performance Objectives
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      1. Timeliness of Inter-MDA Correspondence & File Clearance
                    </h4>
                    <span className="text-xs font-bold text-[#008751]">96% achieved</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#008751] h-full rounded-full" style={{ width: "96%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Target: 95% within 48-hour SLA standard</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      2. Nominal Roll & IPPIS Record Reconciliation
                    </h4>
                    <span className="text-xs font-bold text-blue-600">85% achieved</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Target: 100% reconciled by end of Q4</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      3. Public Service Capacity Building & Mandatory Training Hours
                    </h4>
                    <span className="text-xs font-bold text-amber-600">34 of 40 hrs</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: "85%" }} />
                  </div>
                  <p className="text-[11px] text-slate-500">Target: 40 certified training hours per annum</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== TAB 7: POLICIES & ANNOUNCEMENTS ===================== */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Federal Public Service Circulars & Announcements
                </CardTitle>
                <CardDescription className="text-xs">
                  Official memos issued by the Head of Civil Service and Federal Ministry of Finance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Circular Ref: HCSF/SPO/004/2026 • 2026 Annual Staff Biometric Audit
                    </span>
                    <span className="text-[11px] text-slate-400">18 Oct 2026</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Notice is hereby given to all officers regarding the routine annual IPPIS verification exercise. All employees must ensure their primary identity documents (NIN, BVN, and appointment letters) are updated in their self-service profile.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showNotification("Circular downloaded.")}
                    className="text-xs h-7 text-[#008751]"
                  >
                    <Download className="w-3 h-3 mr-1" /> Download Circular (PDF)
                  </Button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200/90 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      Circular Ref: PENCOM/CIR/2026/09 • Guidelines on Voluntary Pension Contributions
                    </span>
                    <span className="text-[11px] text-slate-400">05 Oct 2026</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Revised operational directives on additional voluntary contributions under the Contributory Pension Scheme (CPS), including tax deductibility rules and RSA integration.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => showNotification("Circular downloaded.")}
                    className="text-xs h-7 text-[#008751]"
                  >
                    <Download className="w-3 h-3 mr-1" /> Download Circular (PDF)
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Policies & Handbooks
                </CardTitle>
                <CardDescription className="text-xs">Statutory documents for reference</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#008751]" />
                    <span className="text-xs font-medium text-slate-800">Public Service Rules (PSR)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showNotification("Handbook download started.")}
                    className="h-7 w-7 p-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#008751]" />
                    <span className="text-xs font-medium text-slate-800">IPPIS Self-Service Manual</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showNotification("Manual download started.")}
                    className="h-7 w-7 p-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#008751]" />
                    <span className="text-xs font-medium text-slate-800">Code of Conduct for Public Officers</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showNotification("Code of conduct download started.")}
                    className="h-7 w-7 p-0"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===================== TAB 8: HELPDESK & SUPPORT ===================== */}
        <TabsContent value="helpdesk" className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Employee Helpdesk & Support Tickets</h2>
              <p className="text-xs text-slate-500">Submit HR enquiries, payroll disputes, IT issues or administrative requests</p>
            </div>
            <Button
              onClick={() => setTicketModalOpen(true)}
              className="bg-[#008751] hover:bg-[#007043] text-white text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1.5" /> Submit New Request
            </Button>
          </div>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Your Support Tickets & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Subject</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Date Logged</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">TKT-8902</td>
                      <td className="py-3 px-3">HR Enquiry</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Confirmation of Next-of-Kin Update</td>
                      <td className="py-3 px-3">Normal</td>
                      <td className="py-3 px-3 text-slate-500">04 Oct 2026</td>
                      <td className="py-3 px-3">
                        <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Resolved</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-mono font-medium text-slate-900">TKT-9411</td>
                      <td className="py-3 px-3">Payroll Query</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">Cooperative Deduction Adjustment Verification</td>
                      <td className="py-3 px-3">High</td>
                      <td className="py-3 px-3 text-slate-500">12 Oct 2026</td>
                      <td className="py-3 px-3">
                        <Badge className="bg-blue-100 text-blue-800 text-[10px]">In Progress</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ===================== MODAL 1: APPLY LEAVE ===================== */}
      <Dialog open={leaveModalOpen} onOpenChange={setLeaveModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Apply for Time Off / Leave</DialogTitle>
            <DialogDescription className="text-xs">
              Your application will be routed to your department director and HR establishment unit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Leave Type</Label>
              <Select
                value={leaveForm.type}
                onValueChange={(val) => setLeaveForm({ ...leaveForm, type: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Annual Leave">Annual Leave (18 days remaining)</SelectItem>
                  <SelectItem value="Casual Leave">Casual Leave (5 days remaining)</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave (14 days remaining)</SelectItem>
                  <SelectItem value="Compassionate Leave">Compassionate Leave</SelectItem>
                  <SelectItem value="Maternity / Paternity">Maternity / Paternity Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Commencement Date</Label>
                <Input
                  type="date"
                  required
                  value={leaveForm.start}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Resumption Date</Label>
                <Input
                  type="date"
                  required
                  value={leaveForm.end}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Handover / Relief Officer</Label>
              <Input
                placeholder="Name & Staff ID of relief officer"
                defaultValue="Mr. Chinedu Eze (IPPIS-STAFF-19102)"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason / Operational Justification</Label>
              <Textarea
                rows={3}
                required
                placeholder="Brief description of leave justification..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Submit Leave Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 2: ATTENDANCE REGULARIZATION ===================== */}
      <Dialog open={regularizeModalOpen} onOpenChange={setRegularizeModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Attendance Regularisation</DialogTitle>
            <DialogDescription className="text-xs">
              Dispute a missed biometric punch or report official off-site assignment.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegularize} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Incident Date</Label>
              <Input
                type="date"
                required
                value={regularizeForm.date}
                onChange={(e) => setRegularizeForm({ ...regularizeForm, date: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Punch Type Disputed</Label>
              <Select
                value={regularizeForm.punchType}
                onValueChange={(val) => setRegularizeForm({ ...regularizeForm, punchType: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Clock In">Missed Clock In Punch</SelectItem>
                  <SelectItem value="Clock Out">Missed Clock Out Punch</SelectItem>
                  <SelectItem value="Both">Official Assignment / Duty Outside Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Reason for Discrepancy</Label>
              <Textarea
                rows={3}
                required
                placeholder="State official reason (e.g. system device offline, official meeting at Ministry headquarters)..."
                value={regularizeForm.reason}
                onChange={(e) => setRegularizeForm({ ...regularizeForm, reason: e.target.value })}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRegularizeModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Submit Regularisation Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 3: PROFILE UPDATE REQUEST ===================== */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Request Profile Update</DialogTitle>
            <DialogDescription className="text-xs">
              Personal changes will be submitted to HR records for statutory audit and verification.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleProfileSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Primary Telephone</Label>
              <Input
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Residential Address</Label>
              <Input
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <Separator />
            <p className="font-semibold text-slate-800 text-xs">Emergency Contact / Next-of-Kin</p>
            <div className="space-y-1">
              <Label className="text-xs">Full Name</Label>
              <Input
                value={profileForm.nokName}
                onChange={(e) => setProfileForm({ ...profileForm, nokName: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Relationship</Label>
                <Input
                  value={profileForm.nokRelation}
                  onChange={(e) => setProfileForm({ ...profileForm, nokRelation: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Emergency Phone</Label>
                <Input
                  value={profileForm.nokPhone}
                  onChange={(e) => setProfileForm({ ...profileForm, nokPhone: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setProfileModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Submit Changes for Approval
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 4: SUPPORT TICKET ===================== */}
      <Dialog open={ticketModalOpen} onOpenChange={setTicketModalOpen}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">Submit Support Request</DialogTitle>
            <DialogDescription className="text-xs">
              Log an internal ticket for HR enquiries, IT technical support or facility assistance.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTicketSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">Request Category</Label>
              <Select
                value={ticketForm.category}
                onValueChange={(val) => setTicketForm({ ...ticketForm, category: val })}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HR Enquiry">Human Resources Enquiry</SelectItem>
                  <SelectItem value="Payroll Query">Payroll & Compensation Query</SelectItem>
                  <SelectItem value="IT Support">IT Technical Support</SelectItem>
                  <SelectItem value="Facility Issue">Facility & Office Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Subject / Title</Label>
              <Input
                required
                placeholder="Brief summary of request..."
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Details & Narrative</Label>
              <Textarea
                rows={3}
                required
                placeholder="Provide detailed explanation..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setTicketModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-[#008751] hover:bg-[#007043] text-white">
                Submit Ticket
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ===================== MODAL 5: PRINTABLE PAYSLIP ===================== */}
      <Dialog open={payslipModalOpen} onOpenChange={setPayslipModalOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900">
              Official IPPIS Salary Payslip
            </DialogTitle>
            <DialogDescription className="text-xs">
              Federal Republic of Nigeria • Integrated Personnel and Payroll Information System
            </DialogDescription>
          </DialogHeader>
          <div className="border border-slate-300 rounded-xl p-5 space-y-4 bg-white text-xs">
            {/* Payslip Header */}
            <div className="text-center border-b pb-3 space-y-0.5">
              <p className="font-bold text-sm tracking-wide uppercase text-slate-900">Federal Republic of Nigeria</p>
              <p className="font-semibold text-xs text-[#008751]">OFFICE OF THE ACCOUNTANT-GENERAL OF THE FEDERATION</p>
              <p className="text-[11px] text-slate-500">Integrated Personnel and Payroll Information System (IPPIS)</p>
              <p className="text-xs font-bold text-slate-800 pt-1">PAYSLIP STATEMENT FOR OCTOBER 2026</p>
            </div>

            {/* Officer Details */}
            <div className="grid grid-cols-2 gap-2 text-[11px] border-b pb-3">
              <div><span className="text-slate-500">Staff Name:</span> <strong>{employeeName}</strong></div>
              <div><span className="text-slate-500">Employee ID:</span> <strong className="font-mono">{staffId}</strong></div>
              <div><span className="text-slate-500">MDA:</span> <strong>{mdaName}</strong></div>
              <div><span className="text-slate-500">Grade / Step:</span> <strong>GL 12 / Step 04</strong></div>
              <div><span className="text-slate-500">Bank:</span> <strong>Zenith Bank Plc (******8921)</strong></div>
              <div><span className="text-slate-500">PFA / RSA:</span> <strong>ARM Pension (PEN10098234710)</strong></div>
            </div>

            {/* Earnings & Deductions Tables */}
            <div className="grid grid-cols-2 gap-4 text-[11px]">
              <div>
                <p className="font-bold text-slate-900 border-b pb-1 text-xs">EARNINGS</p>
                <div className="space-y-1 pt-1.5 text-slate-700">
                  <div className="flex justify-between"><span>Basic Salary (CONPSS):</span> <span className="font-mono">₦224,500.00</span></div>
                  <div className="flex justify-between"><span>Housing Allowance:</span> <span className="font-mono">₦86,200.00</span></div>
                  <div className="flex justify-between"><span>Transport Allowance:</span> <span className="font-mono">₦48,000.00</span></div>
                  <div className="flex justify-between"><span>Utility Allowance:</span> <span className="font-mono">₦32,500.00</span></div>
                  <div className="flex justify-between"><span>Peculiar Allowance:</span> <span className="font-mono">₦27,000.00</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-slate-900 pt-1">
                    <span>Total Gross:</span> <span className="font-mono">₦418,200.00</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-900 border-b pb-1 text-xs">DEDUCTIONS</p>
                <div className="space-y-1 pt-1.5 text-slate-700">
                  <div className="flex justify-between"><span>PAYE Tax:</span> <span className="font-mono text-red-600">₦41,820.00</span></div>
                  <div className="flex justify-between"><span>Pension (8% CPS):</span> <span className="font-mono text-red-600">₦21,450.00</span></div>
                  <div className="flex justify-between"><span>NHF Contribution:</span> <span className="font-mono text-red-600">₦5,612.50</span></div>
                  <div className="flex justify-between"><span>Staff Welfare:</span> <span className="font-mono text-red-600">₦2,467.50</span></div>
                  <Separator />
                  <div className="flex justify-between font-bold text-red-700 pt-1">
                    <span>Total Deductions:</span> <span className="font-mono">-₦71,350.00</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay Highlight */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-900">NET TAKE-HOME PAY</p>
                <p className="text-[10px] text-emerald-700">Direct Credit via Central Bank of Nigeria settlement</p>
              </div>
              <p className="text-xl font-mono font-extrabold text-emerald-950">₦346,850.00</p>
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                window.print();
              }}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Print Statement
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                setPayslipModalOpen(false);
                showNotification("Payslip downloaded successfully.");
              }}
              className="bg-[#008751] hover:bg-[#007043] text-white text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

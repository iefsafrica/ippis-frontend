"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Upload,
  FileText,
  BarChart3,
  Settings,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Server,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  FileBarChart,
  UserPlus,
  GraduationCap,
  CalendarClock,
  FolderKanban,
  LifeBuoy,
  Wallet,
  Package,
  FolderOpen,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

export function AdminSidebar() {
  // ...existing code...
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Remove all: employeeList, coreHROpen, performanceOpen, etc.
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile } = useMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState(false);
  const [coreHROpen, setCoreHROpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [timesheetsOpen, setTimesheetsOpen] = useState(false);
  const [hrReportsOpen, setHrReportsOpen] = useState(false);
  const [recruitmentOpen, setRecruitmentOpen] = useState(false);
  const [trainingOpen, setTrainingOpen] = useState(false);
  const [eventsMeetingsOpen, setEventsMeetingsOpen] = useState(false);
  const [projectManagementOpen, setProjectManagementOpen] = useState(false);
  const [payrollOpen, setPayrollOpen] = useState(false);
  const [financeOpen, setFinanceOpen] = useState(false);
  const [assetsOpen, setAssetsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [fileManagerOpen, setFileManagerOpen] = useState(false);
  const [supportTicketsOpen, setSupportTicketsOpen] = useState(false);

  // Update active section based on pathname
  useEffect(() => {
    if (pathname?.startsWith("/admin/employees")) {
      setEmployeeList(true);
      setActiveSection("employee-list");
    } else if (pathname?.startsWith("/admin/core-hr")) {
      setCoreHROpen(true);
      setActiveSection("core-hr");
    } else if (pathname?.startsWith("/admin/performance")) {
      setPerformanceOpen(true);
      setActiveSection("performance");
    } else if (pathname?.startsWith("/admin/timesheets")) {
      setTimesheetsOpen(true);
      setActiveSection("timesheets");
    } else if (pathname?.startsWith("/admin/hr-reports")) {
      setHrReportsOpen(true);
      setActiveSection("hr-reports");
    } else if (pathname?.startsWith("/admin/recruitment")) {
      setRecruitmentOpen(true);
      setActiveSection("recruitment");
    } else if (pathname?.startsWith("/admin/training")) {
      setTrainingOpen(true);
      setActiveSection("training");
    } else if (pathname?.startsWith("/admin/events-meetings")) {
      setEventsMeetingsOpen(true);
      setActiveSection("events-meetings");
    } else if (pathname?.startsWith("/admin/project-management")) {
      setProjectManagementOpen(true);
      setActiveSection("project-management");
    } else if (pathname?.startsWith("/admin/payroll")) {
      setPayrollOpen(true);
      setActiveSection("payroll");
    } else if (pathname?.startsWith("/admin/finance")) {
      setFinanceOpen(true);
      setActiveSection("finance");
    } else if (pathname?.startsWith("/admin/assets")) {
      setAssetsOpen(true);
      setActiveSection("assets");
    } else if (pathname?.startsWith("/admin/file-manager")) {
      setFileManagerOpen(true);
      setActiveSection("file-manager");
    } else if (pathname?.startsWith("/admin/support-tickets")) {
      setSupportTicketsOpen(true);
      setActiveSection("support-tickets");
    } else if (pathname?.startsWith("/admin/organization")) {
      setActiveSection("organization");
    } else {
      setActiveSection("");
    }
  }, [pathname]);

  useEffect(() => {
    const handleToggle = () => setMobileSidebarOpen((prev) => !prev);
    if (typeof window !== "undefined") {
      window.addEventListener("admin-sidebar-toggle", handleToggle as EventListener);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("admin-sidebar-toggle", handleToggle as EventListener);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      setMobileSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Define which features are implemented and which are coming soon
  const comingSoonFeatures = [
    "/admin/recruitment",
    "/admin/training",
    "/admin/events-meetings",
    "/admin/payroll",
    "/admin/project-management",
    "/admin/finance",
    "/admin/assets",
    "/admin/file-manager",
  ];

  const isComingSoon = (path: string) => comingSoonFeatures.includes(path);

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Employees List",
      href: "/admin/employees",
      icon: Users,
      isDropdown: true,
      toggleOnly: true,
      isOpen: openDropdown === "employee-list", // for Employees List
      section: "employee-list",
      toggle: () =>
        setOpenDropdown(
          openDropdown === "employee-list" ? null : "employee-list"
        ),
      subItems: [
        {
          title: "Pending Employee",
          href: "/admin/pending",
        },
        {
          title: "Employee",
          href: "/admin/employees",
        },
        {
          title: "Import Employees",
          href: "/admin/import",
        },
        {
          title: "Documents",
          href: "/admin/documents",
        },
        {
          title: "Reports",
          href: "/admin/reports",
        },
      ],
    },
    {
      title: "Core HR",
      icon: Users,
      isDropdown: true,
      isOpen: openDropdown === "core-hr",
      section: "core-hr",
      toggle: () =>
        setOpenDropdown(openDropdown === "core-hr" ? null : "core-hr"),
      subItems: [
        {
          title: "Promotions",
          href: "/admin/core-hr/promotions",
        },
        {
          title: "Award",
          href: "/admin/core-hr/award",
        },
        {
          title: "Travel",
          href: "/admin/core-hr/travel",
        },
        {
          title: "Transfer",
          href: "/admin/core-hr/transfer",
        },
        {
          title: "Resignations",
          href: "/admin/core-hr/resignations",
        },
        {
          title: "Complaints",
          href: "/admin/core-hr/complaints",
        },
        {
          title: "Warnings",
          href: "/admin/core-hr/warnings",
        },
        {
          title: "Terminations",
          href: "/admin/core-hr/terminations",
        },
      ],
    },
    {
      title: "Performance",
      icon: TrendingUp,
      isDropdown: true,
      href: "/admin/performance",
      isOpen: openDropdown === "performance", // for performance
      section: "performance",
      toggle: () =>
        setOpenDropdown(openDropdown === "performance" ? null : "performance"),
      subItems: [
        {
          title: "Goal Type",
          href: "/admin/performance/goal-type",
        },
        {
          title: "Goal Tracking",
          href: "/admin/performance/goal-tracking",
        },
        {
          title: "Indicator",
          href: "/admin/performance/indicator",
        },
        {
          title: "Appraisal",
          href: "/admin/performance/appraisal",
        },
      ],
    },
    {
      title: "Organization",
      icon: Building2,
      isDropdown: true,
      href: "/admin/organization",
      isOpen: openDropdown === "organization",
      section: "organization",
      toggle: () =>
        setOpenDropdown(openDropdown === "organization" ? null : "organization"),
      subItems: [
        {
          title: "Company",
          href: "/admin/organization/company",
        },
        {
          title: "Department",
          href: "/admin/organization/department",
        },
        {
          title: "Location",
          href: "/admin/organization/location",
        },
        {
          title: "Designation",
          href: "/admin/organization/designation",
        },
        {
          title: "Announcements",
          href: "/admin/organization/announcements",
        },
        {
          title: "Company Policy",
          href: "/admin/organization/company-policy",
        },
      ],
      comingSoon: false,
    },
    {
      title: "Timesheets",
      icon: Clock,
      isDropdown: true,
      href: "/admin/timesheets",
      isOpen: openDropdown === "timesheets", // for performance
      section: "timesheets",
      toggle: () =>
        setOpenDropdown(openDropdown === "timesheets" ? null : "timesheets"),
      subItems: [
        {
          title: "Attendances",
          href: "/admin/timesheets/attendances",
        },
        {
          title: "Date wise Attendances",
          href: "/admin/timesheets/date-wise-attendances",
        },
        {
          title: "Monthly Attendances",
          href: "/admin/timesheets/monthly-attendances",
        },
        {
          title: "Update Attendances",
          href: "/admin/timesheets/update-attendances",
        },
        {
          title: "Import Attendances",
          href: "/admin/timesheets/import-attendances",
        },
        {
          title: "Office Shift",
          href: "/admin/timesheets/office-shift",
        },
        {
          title: "Manage Holiday",
          href: "/admin/timesheets/manage-holiday",
        },
        {
          title: "Manage Leaves",
          href: "/admin/timesheets/manage-leaves",
        },
      ],
    },
    {
      title: "HR Calendar",
      href: "/admin/hr-calendar",
      icon: Calendar,
    },
    {
      title: "HR Reports",
      icon: FileBarChart,
      isDropdown: true,
      href: "/admin/hr-reports",
      isOpen: openDropdown === "hr-reports", // for performance
      section: "hr-reports",
      toggle: () =>
        setOpenDropdown(openDropdown === "hr-reports" ? null : "hr-reports"),
      subItems: [
        {
          title: "Attendance Report",
          href: "/admin/hr-reports/attendance",
        },
        {
          title: "Training Report",
          href: "/admin/hr-reports/training",
        },
        {
          title: "Project Report",
          href: "/admin/hr-reports/project",
        },
        {
          title: "Task Report",
          href: "/admin/hr-reports/task",
        },
        {
          title: "Employees Report",
          href: "/admin/hr-reports/employees",
        },
        {
          title: "Account Report",
          href: "/admin/hr-reports/account",
        },
        {
          title: "Expense Report",
          href: "/admin/hr-reports/expense",
        },
        {
          title: "Deposit Report",
          href: "/admin/hr-reports/deposit",
        },
        {
          title: "Transaction Report",
          href: "/admin/hr-reports/transaction",
        },
        {
          title: "Pension Report",
          href: "/admin/hr-reports/pension",
        },
      ],
    },
    {
      title: "Recruitment",
      icon: UserPlus,
      isDropdown: true,
      isOpen: openDropdown === "recruitment", // for performance
      section: "recruitment",
      toggle: () =>
        setOpenDropdown(openDropdown === "recruitment" ? null : "recruitment"),
      subItems: [
        {
          title: "Job Post",
          href: "/admin/recruitment/job-post",
        },
        {
          title: "Job Candidates",
          href: "/admin/recruitment/job-candidates",
        },
        {
          title: "Job Interview",
          href: "/admin/recruitment/job-interview",
        },
        {
          title: "CMS",
          href: "/admin/recruitment/cms",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Training",
      icon: GraduationCap,
      isDropdown: true,
      href: "training",
      isOpen: openDropdown === "training", // for performance
      section: "training",
      toggle: () =>
        setOpenDropdown(openDropdown === "training" ? null : "training"),
      subItems: [
        {
          title: "Training List",
          href: "/admin/training/list",
        },
        {
          title: "Training Type",
          href: "/admin/training/type",
        },
        {
          title: "Trainers",
          href: "/admin/training/trainers",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Events & Meetings",
      icon: CalendarClock,
      isDropdown: true,
      href: "/admin/events-meetings",
      isOpen: openDropdown === "event-meetings", // for performance
      section: "event-meetings",
      toggle: () =>
        setOpenDropdown(
          openDropdown === "event-meetings" ? null : "event-meetings"
        ),
      subItems: [
        {
          title: "Events",
          href: "/admin/events-meetings/events",
        },
        {
          title: "Meetings",
          href: "/admin/events-meetings/meetings",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Payroll",
      icon: DollarSign,
      isDropdown: true,
      href: "/admin/payroll",
      isOpen: openDropdown === "payroll",
      section: "payroll",
      toggle: () =>
        setOpenDropdown(openDropdown === "payroll" ? null : "payroll"),
      subItems: [
        {
          title: "New Payment",
          href: "/admin/payroll/new-payment",
        },
        {
          title: "Payment History",
          href: "/admin/payroll/payment-history",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Project Management",
      icon: FolderKanban,
      isDropdown: true,
      href: "/admin/project-management",
      isOpen: openDropdown === "project-managment", // for performance
      section: "project-managment",
      toggle: () =>
        setOpenDropdown(
          openDropdown === "project-managment" ? null : "project-managment"
        ),
      subItems: [
        {
          title: "Projects",
          href: "/admin/project-management/projects",
        },
        {
          title: "Tasks",
          href: "/admin/project-management/tasks",
        },
        {
          title: "Client",
          href: "/admin/project-management/client",
        },
        {
          title: "Invoice",
          href: "/admin/project-management/invoice",
        },
        {
          title: "Tax Type",
          href: "/admin/project-management/tax-type",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Support Tickets",
      icon: LifeBuoy,
      isDropdown: true,
      href: "/admin/support-tickets",
      isOpen: openDropdown === "support-tickets", // for performance
      section: "support-tickets",
      toggle: () =>
        setOpenDropdown(
          openDropdown === "support-tickets" ? null : "support-tickets"
        ),
      subItems: [
        {
          title: "All Tickets",
          href: "/admin/support-tickets",
        },
        {
          title: "My Tickets",
          href: "/admin/support-tickets/my-tickets",
        },
        {
          title: "Knowledge Base",
          href: "/admin/support-tickets/knowledge-base",
        },
        {
          title: "Reports",
          href: "/admin/support-tickets/reports",
        },
      ],
      comingSoon: false,
    },
    {
      title: "Finance",
      icon: Wallet,
      isDropdown: true,
      isOpen: openDropdown === "finance", // for performance
      section: "finance",
      toggle: () =>
        setOpenDropdown(openDropdown === "finance" ? null : "finance"),
      subItems: [
        {
          title: "Accounts List",
          href: "/admin/finance/accounts-list",
        },
        {
          title: "Account Balances",
          href: "/admin/finance/account-balances",
        },
        {
          title: "Payee",
          href: "/admin/finance/payee",
        },
        {
          title: "Payer",
          href: "/admin/finance/payer",
        },
        {
          title: "Deposit",
          href: "/admin/finance/deposit",
        },
        {
          title: "Expense",
          href: "/admin/finance/expense",
        },
        {
          title: "Transaction",
          href: "/admin/finance/transaction",
        },
        {
          title: "Transfer",
          href: "/admin/finance/transfer",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Assets",
      icon: Package,
      isDropdown: true,
      href: "/admin/assets",
      isOpen: openDropdown === "assets", // for performance
      section: "assets",
      toggle: () =>
        setOpenDropdown(openDropdown === "assets" ? null : "assets"),
      subItems: [
        {
          title: "Category",
          href: "/admin/assets/category",
        },
        {
          title: "Assets",
          href: "/admin/assets/list",
        },
      ],
      comingSoon: true,
    },
    {
      title: "File Manager",
      icon: FolderOpen,
      isDropdown: true,
      href: "/admin/file-manager",
      isOpen: openDropdown === "file-manager", // for performance
      section: "file-manager",
      toggle: () =>
        setOpenDropdown(openDropdown === "file-manager" ? null : "file-manager"),
      subItems: [
        {
          title: "File Manager",
          href: "/admin/file-manager/dashboard",
        },
        {
          title: "Official Documents",
          href: "/admin/file-manager/official-documents",
        },
        {
          title: "File Configuration",
          href: "/admin/file-manager/configuration",
        },
      ],
      comingSoon: true,
    },
    {
      title: "Diagnostics",
      href: "/admin/diagnostics",
      icon: Database,
    },

    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Backup Database",
      href: "/admin/backup",
      icon: Database,
    },
  ];

  const setupItems = [
    {
      title: "Database Setup",
      href: "/admin/setup?tab=database",
      icon: Database,
    },
    {
      title: "Users Setup",
      href: "/admin/setup?tab=users",
      icon: Users,
    },
    {
      title: "Permissions Setup",
      href: "/admin/setup?tab=permissions",
      icon: Shield,
    },
    {
      title: "System Setup",
      href: "/admin/setup?tab=system",
      icon: Server,
    },
  ];

  const sidebarContent = (
    <div className="flex-1 min-h-0 py-5 flex flex-col bg-white">
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 space-y-0.5 pr-1">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = item.isDropdown
              ? item.subItems?.some((subItem) => pathname === subItem.href) ||
                activeSection === item.section
              : pathname === item.href;

            return (
              <div key={item.title}>
                <Tooltip delayDuration={collapsed ? 100 : 1000000}>
                  <TooltipTrigger asChild>
                    {item.isDropdown ? (  
                      <button
                        onClick={item.toggle}
                        className={cn(
                          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-[#008751]/10 text-[#008751] font-semibold"
                            : "text-gray-700 hover:bg-[#008751]/5 hover:text-[#008751]"
                        )}
                      >
                        {item.toggleOnly ? (
                          <>
                            <div className="flex items-center w-full">
                              <item.icon
                                className={cn(
                                  "h-5 w-5",
                                  isActive ? "text-[#008751]" : "text-gray-500"
                                )}
                              />
                              {!collapsed && (
                                <span className="ml-3">{item.title}</span>
                              )}
                            </div>

                            {!collapsed &&
                              (item.isOpen ? (
                                <ChevronUp
                                  className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-[#008751]" : "text-gray-500"
                                  )}
                                />
                              ) : (
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-[#008751]" : "text-gray-500"
                                  )}
                                />
                              ))}
                          </>
                        ) : (
                          <Link
                            href={item.href ?? ""}
                            className="w-full flex items-center justify-between"
                          >
                            <div className="flex items-center w-full">
                              <item.icon
                                className={cn(
                                  "h-5 w-5",
                                  isActive ? "text-[#008751]" : "text-gray-500"
                                )}
                              />
                              {!collapsed && (
                                <span className="ml-3">{item.title}</span>
                              )}
                            </div>

                            {!collapsed &&
                              (item.isOpen ? (
                                <ChevronUp
                                  className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-[#008751]" : "text-gray-500"
                                  )}
                                />
                              ) : (
                                <ChevronDown
                                  className={cn(
                                    "h-4 w-4",
                                    isActive ? "text-[#008751]" : "text-gray-500"
                                  )}
                                />
                              ))}
                          </Link>
                        )}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-[#008751]/10 text-[#008751] font-semibold"
                            : "text-gray-700 hover:bg-gray-100 hover:text-[#008751]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-[#008751]" : "text-gray-500"
                          )}
                        />
                        {!collapsed && (
                          <div className="ml-3 flex items-center justify-between w-full">
                            <span>{item.title}</span>
                            {item.comingSoon && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
                              >
                                Soon
                              </Badge>
                            )}
                          </div>
                        )}
                      </Link>
                    )}
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      <div className="flex items-center">
                        {item.title}
                        {item.comingSoon && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
                          >
                            Soon
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Render sub-items if this is a dropdown and it's open */}
                {item.isDropdown && item.isOpen && !collapsed && (
                  <div className="ml-9 mt-1 space-y-1 border-l-2 border-gray-100 pl-2">
                    {item.subItems?.map((subItem) => {
                      const isSubItemActive = pathname === subItem.href;
                      const isSubItemComingSoon = isComingSoon(subItem.href);

                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={cn(
                            "flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all",
                            isSubItemActive
                              ? "bg-[#008751]/5 text-[#008751] font-semibold"
                              : "text-gray-600 hover:bg-[#008751]/5 hover:text-[#008751]"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span>{subItem.title}</span>
                            {isSubItemComingSoon && (
                              <Badge
                                variant="outline"
                                className="ml-2 text-xs bg-amber-50 text-amber-700 border-amber-200"
                              >
                                Soon
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Setup Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3
              className={cn(
                "px-3 text-xs font-bold text-[#008751]/70 uppercase tracking-wider",
                collapsed ? "text-center" : ""
              )}
            >
              {!collapsed && "System Setup"}
            </h3>
            <div className="mt-2 space-y-1">
              {setupItems.map((item) => {
                const isActive =
                  pathname === "/admin/setup" &&
                  item.href.includes(
                    new URL(item.href, "http://localhost").searchParams.get(
                      "tab"
                    ) || ""
                  );
                return (
                  <Tooltip
                    key={item.href}
                    delayDuration={collapsed ? 100 : 1000000}
                  >
                    <TooltipTrigger asChild>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all",
                          isActive
                            ? "bg-[#008751]/10 text-[#008751] font-semibold"
                            : "text-gray-700 hover:bg-[#008751]/10 hover:text-[#008751]"
                        )}
                      >
                        <item.icon
                          className={cn(
                            "h-5 w-5",
                            isActive ? "text-[#008751]" : "text-gray-500"
                          )}
                        />
                        {!collapsed && (
                          <span className="ml-3">{item.title}</span>
                        )}
                      </Link>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right">{item.title}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </TooltipProvider>
      </nav>

      <div className="px-3 space-y-1 mt-4 pt-3 border-t border-gray-100">
        <TooltipProvider delayDuration={0}>
          <Tooltip delayDuration={collapsed ? 100 : 1000000}>
            <TooltipTrigger asChild>
              <Link
                href="/admin/logout"
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <LogOut className="h-5 w-5 text-gray-500" />
                {!collapsed && <span className="ml-3">Logout</span>}
              </Link>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
          <SheetContent side="left" className="p-0 w-[85vw] max-w-[320px]">
            <div className="flex flex-col h-full bg-white overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-start">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#008751] flex items-center justify-center">
                  <Image
                    src="/images/ippis-logo.jpeg"
                    alt="IPPIS Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="ml-2 font-bold text-lg text-gray-900">
                  IPPIS Admin
                </span>
              </div>
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <aside
          className={cn(
            "bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out hidden md:flex sticky top-0 h-screen",
            collapsed ? "w-[70px]" : "w-[260px]"
          )}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div
              className={cn(
                "flex items-center",
                collapsed ? "justify-center w-full" : "justify-start"
              )}
            >
              <div className="relative h-8 w-8 overflow-hidden rounded-full bg-[#008751] flex items-center justify-center">
                <Image
                  src="/images/ippis-logo.jpeg"
                  alt="IPPIS Logo"
                  fill
                  className="object-contain"
                />
              </div>
              {!collapsed && (
                <span className="ml-2 font-bold text-lg text-gray-900">
                  IPPIS Admin
                </span>
              )}
            </div>
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-[#008751] hover:bg-[#008751]/5"
                onClick={() => setCollapsed(true)}
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {collapsed && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mt-2 text-gray-500 hover:text-[#008751] hover:bg-[#008751]/5"
                onClick={() => setCollapsed(false)}
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
          {sidebarContent}
        </aside>
      )}
    </>
  );
}

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
import { useAuth } from "@/lib/auth-context";

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { isMobile } = useMobile();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const [activeSection, setActiveSection] = useState("");

  const getSectionFromPath = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("/admin/employees")) return "employee-list";
    if (path.startsWith("/admin/core-hr")) return "core-hr";
    if (path.startsWith("/admin/performance")) return "performance";
    if (path.startsWith("/admin/organization")) return "organization";
    if (path.startsWith("/admin/timesheets")) return "timesheets";
    if (path.startsWith("/admin/hr-calendar")) return "hr-calendar";
    if (path.startsWith("/admin/hr-reports")) return "hr-reports";
    if (path.startsWith("/admin/recruitment")) return "recruitment";
    if (path.startsWith("/admin/training")) return "training";
    if (path.startsWith("/admin/events-meetings")) return "event-meetings";
    if (path.startsWith("/admin/project-management")) return "project-managment";
    if (path.startsWith("/admin/payroll")) return "payroll";
    if (path.startsWith("/admin/finance")) return "finance";
    if (path.startsWith("/admin/assets")) return "assets";
    if (path.startsWith("/admin/file-manager")) return "file-manager";
    if (path.startsWith("/admin/support-tickets")) return "support-tickets";
    return null;
  };

  const toggleDropdown = (section: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isDropdownOpen = (section?: string) => !!(section && openDropdowns[section]);

  useEffect(() => {
    const section = getSectionFromPath(pathname);
    setActiveSection(section ?? "");
    if (section) {
      setOpenDropdowns((prev) =>
        prev[section]
          ? prev
          : {
              ...prev,
              [section]: true,
            }
      );
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

  // All features are now unlocked with executive analytics dashboards
  const { user, canAccessModule } = useAuth();

  const isSuper =
    user?.role?.toLowerCase().includes("super") ||
    user?.role_key?.toLowerCase().includes("super");

  // Filter modules strictly according to the user's assigned role and permissions
  const visibleNavItems = navItems.filter((item) => {
    if (item.href === "/admin") return true; // Dashboard is always accessible
    if (isSuper) return true; // Super Administrator sees all modules
    return (
      canAccessModule(item.title) ||
      (item.section ? canAccessModule(item.section) : false) ||
      (item.href ? canAccessModule(item.href) : false)
    );
  });

  // All features are now unlocked with executive analytics dashboards
  const comingSoonFeatures: string[] = [];

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
      isOpen: isDropdownOpen("employee-list"),
      section: "employee-list",
      toggle: () => toggleDropdown("employee-list"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/employees?tab=analytics",
        },
        {
          title: "Employee",
          href: "/admin/employees",
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
      isOpen: isDropdownOpen("core-hr"),
      section: "core-hr",
      toggle: () => toggleDropdown("core-hr"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/core-hr",
        },
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
      toggleOnly: true,
      isOpen: isDropdownOpen("performance"),
      section: "performance",
      toggle: () => toggleDropdown("performance"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/performance",
        },
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
      toggleOnly: true,
      isOpen: isDropdownOpen("organization"),
      section: "organization",
      toggle: () => toggleDropdown("organization"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/organization",
        },
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
      toggleOnly: true,
      isOpen: isDropdownOpen("timesheets"),
      section: "timesheets",
      toggle: () => toggleDropdown("timesheets"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/timesheets",
        },
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
      icon: Calendar,
      isDropdown: true,
      isOpen: isDropdownOpen("hr-calendar"),
      section: "hr-calendar",
      toggle: () => toggleDropdown("hr-calendar"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/hr-calendar/analytics",
        },
        {
          title: "Calendar View",
          href: "/admin/hr-calendar",
        },
        {
          title: "Events Table",
          href: "/admin/hr-calendar/events",
        },
        {
          title: "Leaves Table",
          href: "/admin/hr-calendar/leaves",
        },
        {
          title: "Projects Table",
          href: "/admin/hr-calendar/projects",
        },
      ],
    },
    {
      title: "HR Reports",
      icon: FileBarChart,
      isDropdown: true,
      isOpen: isDropdownOpen("hr-reports"),
      toggleOnly: true,
      section: "hr-reports",
      toggle: () => toggleDropdown("hr-reports"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/hr-reports",
        },
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
      isOpen: isDropdownOpen("recruitment"),
      section: "recruitment",
      toggle: () => toggleDropdown("recruitment"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/recruitment",
        },
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
      comingSoon: false,
    },
    {
      title: "Training",
      icon: GraduationCap,
      isDropdown: true,
      toggleOnly: true,
      isOpen: isDropdownOpen("training"),
      section: "training",
      toggle: () => toggleDropdown("training"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/training",
        },
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
      comingSoon: false,
    },
    {
      title: "Events & Meetings",
      icon: CalendarClock,
      isDropdown: true,
      toggleOnly: true,
      isOpen: isDropdownOpen("event-meetings"),
      section: "event-meetings",
      toggle: () => toggleDropdown("event-meetings"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/events-meetings",
        },
        {
          title: "Events",
          href: "/admin/events-meetings/events",
        },
        {
          title: "Meetings",
          href: "/admin/events-meetings/meetings",
        },
      ],
      comingSoon: false,
    },
    {
      title: "Payroll",
      icon: DollarSign,
      isDropdown: true,
      isOpen: isDropdownOpen("payroll"),
      section: "payroll",
      toggle: () => toggleDropdown("payroll"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/payroll",
        },
        {
          title: "New Payment",
          href: "/admin/payroll/new-payment",
        },
        {
          title: "Payment History",
          href: "/admin/payroll/payment-history",
        },
      ],
      comingSoon: false,
    },
    {
      title: "Project Management",
      icon: FolderKanban,
      isDropdown: true,
      isOpen: isDropdownOpen("project-managment"),
      section: "project-managment",
      toggle: () => toggleDropdown("project-managment"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/project-management",
        },
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
      comingSoon: false,
    },
    {
      title: "Support Tickets",
      icon: LifeBuoy,
      isDropdown: true,
      isOpen: isDropdownOpen("support-tickets"),
      section: "support-tickets",
      toggle: () => toggleDropdown("support-tickets"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/support-tickets/analytics",
        },
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
      isOpen: isDropdownOpen("finance"),
      section: "finance",
      toggle: () => toggleDropdown("finance"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/finance",
        },
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
      comingSoon: false,
    },
    {
      title: "Assets",
      icon: Package,
      isDropdown: true,
      isOpen: isDropdownOpen("assets"),
      section: "assets",
      toggle: () => toggleDropdown("assets"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/assets",
        },
        {
          title: "Category",
          href: "/admin/assets/category",
        },
        {
          title: "Assets",
          href: "/admin/assets/list",
        },
      ],
      comingSoon: false,
    },
    {
      title: "File Manager",
      icon: FolderOpen,
      isDropdown: true,
      isOpen: isDropdownOpen("file-manager"),
      section: "file-manager",
      toggle: () => toggleDropdown("file-manager"),
      subItems: [
        {
          title: "Analytics Dashboard",
          href: "/admin/file-manager",
        },
        {
          title: "File Manager Workspace",
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
      comingSoon: false,
    },
    // {
    //   title: "Diagnostics",
    //   href: "/admin/diagnostics",
    //   icon: Database,
    // },

    {
      title: "User Management",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Roles",
      href: "/admin/roles",
      icon: UserCog,
    },
    {
      title: "Permissions",
      href: "/admin/permissions",
      icon: Shield,
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

  const sidebarContent = (
    <div className="flex-1 min-h-0 py-5 flex flex-col bg-white">
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 space-y-0.5 pr-1">
        <TooltipProvider delayDuration={0}>
          {visibleNavItems.map((item) => {
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
                        href={item.href!}
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

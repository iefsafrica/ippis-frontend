"use client";

import type React from "react";
import { Suspense, useEffect, useState } from "react";
import DashboardContent from "./dashboard-content";
import ApplicationStatusPage from "./application-status/page";
import EmployeeDashboardContent from "./employee-dashboard/employee-dashboard-content";
import AdminLoading from "./loading";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import Providers from "../providers";

function ErrorBoundaryComponent({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.log("Admin error caught:", event.error);
      setHasError(true);
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <h3 className="text-lg font-bold text-red-700 mb-2">Dashboard Error</h3>
        <p className="text-red-600 mb-4">
          There was an error loading the dashboard. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-semibold"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return <>{children}</>;
}

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return <AdminLoading />;
  }

  if (!user) {
    return null;
  }

  const roleLower = (user.role || "").toLowerCase();
  const roleKeyLower = (user.role_key || "").toLowerCase();

  const isSuper =
    roleLower.includes("super") ||
    roleKeyLower.includes("super");

  // Check if applicant
  const isApplicant =
    !isSuper &&
    (roleLower === "applicant" ||
      roleKeyLower === "applicant" ||
      roleLower.includes("applicant") ||
      (user.accessible_modules &&
        user.accessible_modules.some((m) => m.toLowerCase().includes("application")) &&
        !user.accessible_modules.some((m) => m.toLowerCase().includes("employees"))));

  // Check if pure employee (self-service without administrative oversight)
  const isPureEmployee =
    !isSuper &&
    !isApplicant &&
    (roleLower === "employee" ||
      roleKeyLower === "employee" ||
      roleLower === "selfservice" ||
      roleKeyLower === "self_service" ||
      roleLower.includes("employee")) &&
    !roleLower.includes("admin") &&
    !roleLower.includes("super") &&
    !roleLower.includes("hr") &&
    !roleLower.includes("payroll") &&
    !roleLower.includes("finance") &&
    !roleLower.includes("auditor") &&
    !roleLower.includes("director") &&
    !roleLower.includes("head");

  return (
    <Providers>
      <ErrorBoundaryComponent>
        <Suspense fallback={<AdminLoading />}>
          {isApplicant ? (
            <ApplicationStatusPage />
          ) : isPureEmployee ? (
            <EmployeeDashboardContent />
          ) : (
            <DashboardContent />
          )}
        </Suspense>
      </ErrorBoundaryComponent>
    </Providers>
  );
}

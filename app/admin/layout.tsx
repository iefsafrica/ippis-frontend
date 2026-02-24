

"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-context";
import { AdminSidebar } from "./components/admin-sidebar";
import { AdminHeader } from "./components/admin-header";
import { Suspense } from "react";
import AdminLoading from "./loading";
import GlobalPatch from "./global-patch";
import { Toaster } from "@/components/ui/toaster";
import Head from "next/head";
import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/forgot-password" ||
    pathname?.includes("(auth)") ||
    false;

  if (isAuthPage) {
    return (
      <>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </Head>
        <GlobalPatch />
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <SessionProvider>
      <AuthProvider>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </Head>
        <div className="h-screen bg-gray-50 flex overflow-hidden">
          <GlobalPatch />
          <AdminSidebar />
          <div className="flex-1 flex min-w-0 flex-col min-h-0">
            <AdminHeader />
            <main className="flex-1 min-h-0 min-w-0 overflow-y-auto bg-white pt-4 sm:px-4 sm:pt-6 lg:px-6 lg:pt-6">
              <Suspense fallback={<AdminLoading />}>
                {React.Children.map(children, (child, index) =>
                  React.isValidElement(child)
                    ? React.cloneElement(child, { key: index })
                    : child
                )}
              </Suspense>
            </main>
          </div>
        </div>
        <Toaster />
      </AuthProvider>
    </SessionProvider>
  );
}

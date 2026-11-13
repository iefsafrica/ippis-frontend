

"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/lib/auth-context";
import { AdminSidebar } from "./components/admin-sidebar";
import { AdminHeader } from "./components/admin-header";
import { Suspense } from "react";
import AdminLoading from "./loading";
import GlobalPatch from "./global-patch";
import Head from "next/head";
import React from "react";
import Providers from "../providers";

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
      </>
    );
  }

  return (
    <Providers>
      <AuthProvider>
        <Head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-icon.png" />
        </Head>
        <div className="h-screen bg-[#ECEEF0] flex overflow-hidden">
          <GlobalPatch />
          <AdminSidebar />
          <div className="flex-1 flex min-w-0 flex-col min-h-0">
            <Suspense fallback={<AdminLoading />}>
              <AdminHeader />
            </Suspense>
            <main className="flex-1 min-h-0 min-w-0 overflow-y-auto custom-scrollbar bg-[#ECEEF0] px-3 pb-8 pt-2 sm:px-6 lg:px-8">
              <Suspense fallback={<AdminLoading />}>
                {children}
              </Suspense>
            </main>
          </div>
        </div>
      </AuthProvider>
    </Providers>
  );
}

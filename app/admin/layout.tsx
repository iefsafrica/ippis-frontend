// // "use client"

// // import { usePathname } from "next/navigation"
// // import type React from "react"
// // import { AuthProvider } from "@/lib/auth-context"
// // import { AdminSidebar } from "./components/admin-sidebar"
// // import { AdminHeader } from "./components/admin-header"
// // import { Suspense } from "react"
// // import AdminLoading from "./loading"
// // import GlobalPatch from "./global-patch"
// // import { Toaster } from "@/components/ui/toaster"
// // import Head from "next/head"

// // export default function AdminLayout({
// //   children,
// // }: {
// //   children: React.ReactNode
// // }) {
// //   const pathname = usePathname()

// //   // Check if the current URL is an auth page
// //   const isAuthPage =
// //     pathname === "/admin/login" || pathname === "/admin/forgot-password" || pathname?.includes("(auth)") || false

// //   // If it's an auth page, just render the children without the admin layout
// //   if (isAuthPage) {
// //     return (
// //       <>
// //         <Head>
// //           <link rel="icon" href="/favicon.ico" sizes="any" />
// //           <link rel="apple-touch-icon" href="/apple-icon.png" />
// //         </Head>
// //         <GlobalPatch />
// //         {children}
// //         <Toaster />
// //       </>
// //     )
// //   }

// //   // Otherwise, render the full admin layout with sidebar
// //   return (
// //     <AuthProvider>
// //       <Head>
// //         <link rel="icon" href="/favicon.ico" sizes="any" />
// //         <link rel="apple-touch-icon" href="/apple-icon.png" />
// //       </Head>
// //       <div className="min-h-screen bg-gray-50 flex">
// //         {/* Apply global patches to fix initialization errors */}
// //         <GlobalPatch />

// //         <AdminSidebar />
// //         <div className="flex-1 flex flex-col">
// //           <AdminHeader />
// //           <main className="flex-1 p-6 overflow-y-auto bg-white">
// //             <Suspense fallback={<AdminLoading />}>{children}</Suspense>
// //           </main>
// //         </div>
// //       </div>
// //       <Toaster />
// //     </AuthProvider>
// //   )
// // }


// "use client";

// import { usePathname } from "next/navigation";
// import { AuthProvider } from "@/lib/auth-context";
// import { AdminSidebar } from "./components/admin-sidebar";
// import { AdminHeader } from "./components/admin-header";
// import { Suspense } from "react";
// import AdminLoading from "./loading";
// import GlobalPatch from "./global-patch";
// import { Toaster } from "@/components/ui/toaster";
// import Head from "next/head";
// import React from "react";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const pathname = usePathname();

//   const isAuthPage =
//     pathname === "/admin/login" ||
//     pathname === "/admin/forgot-password" ||
//     pathname?.includes("(auth)") ||
//     false;

//   if (isAuthPage) {
//     return (
//       <>
//         <Head>
//           <link rel="icon" href="/favicon.ico" sizes="any" />
//           <link rel="apple-touch-icon" href="/apple-icon.png" />
//         </Head>
//         <GlobalPatch />
//         {children}
//         <Toaster />
//       </>
//     );
//   }

//   return (
//     <AuthProvider>
//       <Head>
//         <link rel="icon" href="/favicon.ico" sizes="any" />
//         <link rel="apple-touch-icon" href="/apple-icon.png" />
//       </Head>
//       <div className="min-h-screen bg-gray-50 flex">
//         <GlobalPatch />
//         <AdminSidebar />
//         <div className="flex-1 flex flex-col">
//           <AdminHeader />
//           <main className="flex-1 p-6 overflow-y-auto bg-white">
//             <Suspense fallback={<AdminLoading />}>
//               {React.Children.map(children, (child, index) =>
//                 React.isValidElement(child)
//                   ? React.cloneElement(child, { key: index })
//                   : child
//               )}
//             </Suspense>
//           </main>
//         </div>
//       </div>
//       <Toaster />
//     </AuthProvider>
    
//   );
// }


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
        <div className="min-h-screen bg-gray-50 flex">
          <GlobalPatch />
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <AdminHeader />
            <main className="flex-1 p-6 overflow-y-auto bg-white">
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



import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import ClientErrorHandler from "./client-error-handler"
import Image from "next/image"
import GlobalErrorHandler from "./global-error-handler"
import Script from "next/script"


import Providers from "./providers"


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    template: "%s | IPPIS Nigeria",
    default: "IPPIS - Integrated Personnel and Payroll Information System",
  },
  description:
    "The official website of Nigeria's Integrated Personnel and Payroll Information System (IPPIS)",
  keywords: [
    "IPPIS",
    "Nigeria",
    "payroll",
    "government",
    "personnel management",
    "civil service",
  ],
  authors: [{ name: "Federal Government of Nigeria" }],
  creator: "Federal Government of Nigeria",
  publisher: "Federal Government of Nigeria",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  other: {
    serviceworker: "false",
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* CRITICAL: Prevent service worker registration */}
        <Script id="prevent-sw" strategy="beforeInteractive">{`
          try {
            window.addEventListener('error', function(event) {
              if (event.message && (
                event.message.includes('ServiceWorker') || 
                event.message.includes('service worker') ||
                event.message.includes('Failed to register') ||
                event.message.includes('navigator.serviceWorker is null')
              )) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Service worker error intercepted');
                return true;
              }
            }, true);

            window.addEventListener('unhandledrejection', function(event) {
              if (event.reason && event.reason.message && (
                event.reason.message.includes('ServiceWorker') || 
                event.reason.message.includes('service worker') ||
                event.reason.message.includes('Failed to register') ||
                event.reason.message.includes('navigator.serviceWorker is null')
              )) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Service worker promise rejection intercepted');
                return true;
              }
            }, true);

            if (typeof navigator !== 'undefined' && !navigator.serviceWorker) {
              var mockServiceWorker = {
                register: () => Promise.resolve({
                  scope: '/',
                  update: () => Promise.resolve(),
                  unregister: () => Promise.resolve(true),
                  active: null,
                  installing: null,
                  waiting: null,
                  addEventListener: () => {},
                  removeEventListener: () => {}
                }),
                getRegistration: () => Promise.resolve(null),
                getRegistrations: () => Promise.resolve([]),
                startMessages: () => {},
                controller: null,
                ready: Promise.resolve({
                  scope: '/',
                  update: () => Promise.resolve(),
                  unregister: () => Promise.resolve(true),
                  active: null,
                  installing: null,
                  waiting: null,
                  addEventListener: () => {},
                  removeEventListener: () => {}
                })
              };
              try {
                Object.defineProperty(navigator, 'serviceWorker', {
                  value: mockServiceWorker,
                  configurable: true,
                  enumerable: true,
                  writable: false
                });
              } catch (e) {
                console.log('Failed to define serviceWorker property');
              }
            }
          } catch (e) {
            console.log('Error in service worker prevention script');
          }
        `}</Script>
      </head>
      <body className={inter.className}>
        {/* ✅ Wrap everything with React Query Provider */}
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <GlobalErrorHandler />
            <ClientErrorHandler />
            {children}
            <footer className="bg-white border-t border-gray-200 py-4">
              <div className="container mx-auto flex items-center justify-center">
                <Image
                  src="/images/ippis-logo.jpeg"
                  alt="IPPIS Logo"
                  width={60}
                  height={60}
                  className="mr-3"
                  priority
                />
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} IPPIS Nigeria. All rights reserved.
                </p>
              </div>
            </footer>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}

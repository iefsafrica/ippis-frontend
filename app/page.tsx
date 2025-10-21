import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import MobileNav from "./mobile-nav"
import NewsSection from "./news-section"
import TimelineSection from "./timeline-section"
import FaqSection from "./faq-section"
import Script from "next/script"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Critical script to prevent service worker registration on the home page */}
      <Script id="prevent-sw-home" strategy="beforeInteractive">{`
        // Completely remove serviceWorker API on home page
        if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
          Object.defineProperty(navigator, 'serviceWorker', {
            value: null,
            configurable: true,
            enumerable: true,
            writable: false
          });
        }
      `}</Script>
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2">
                <Image
                  src="/images/ippis-logo.jpeg"
                  alt="IPPIS Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-gray-900 hover:text-primary">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-900 hover:text-primary">
              Features
            </Link>
            <Link href="#benefits" className="text-sm font-medium text-gray-900 hover:text-primary">
              Benefits
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-gray-900 hover:text-primary">
              Testimonials
            </Link>
            <Link href="#contact" className="text-sm font-medium text-gray-900 hover:text-primary">
              Contact
            </Link>
          </nav>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="outline" className="text-gray-900 border-gray-300 hover:bg-gray-100">
                Log in
              </Button>
            </Link>
            <Link href="/portal">
              <Button className="bg-green-600 hover:bg-green-700 text-white">Employee Portal</Button>
            </Link>
          </div>
          <MobileNav />
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-red-50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-gray-900">
                    Integrated Personnel and Payroll Information System
                  </h1>
                  <p className="max-w-[600px] text-gray-700 md:text-xl">
                    A centralized database system for managing government employee information and payroll processing.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button className="bg-green-600 hover:bg-green-700 text-white">Register Now</Button>
                  </Link>
                  <Link href="/track">
                    <Button variant="outline" className="text-gray-900 border-gray-300 hover:bg-gray-100">
                      Track Application
                    </Button>
                  </Link>
                </div>
              </div>
              <Image
                src="/nigerian-coat-of-arms-symbolism.png"
                alt="Nigerian Coat of Arms"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">Features</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Comprehensive HR Management</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  IPPIS offers a suite of features designed to streamline personnel and payroll management for
                  government agencies.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Centralized Database</h3>
                    <p className="text-muted-foreground">
                      Maintain a single source of truth for all employee information across government agencies.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Automated Payroll</h3>
                    <p className="text-muted-foreground">
                      Process salaries, deductions, and third-party payments with accuracy and efficiency.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Biometric Verification</h3>
                    <p className="text-muted-foreground">
                      Ensure the integrity of the system with biometric authentication and verification.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Document Management</h3>
                    <p className="text-muted-foreground">
                      Securely store and manage employee documents and credentials in a digital format.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Reporting & Analytics</h3>
                    <p className="text-muted-foreground">
                      Generate comprehensive reports and insights for informed decision-making.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold">Self-Service Portal</h3>
                    <p className="text-muted-foreground">
                      Empower employees to access their information and perform basic HR functions independently.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="benefits" className="w-full py-12 md:py-24 lg:py-32 bg-red-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">Benefits</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Why Choose IPPIS?</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  IPPIS offers numerous advantages for government agencies, employees, and the nation as a whole.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Transparency & Accountability</h3>
                    <p className="text-muted-foreground">
                      Eliminates ghost workers and ensures that only verified employees receive salaries, reducing fraud
                      and saving government resources.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Efficiency & Accuracy</h3>
                    <p className="text-muted-foreground">
                      Automates payroll processing, reducing errors and ensuring timely payment of salaries to
                      government employees.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Cost Reduction</h3>
                    <p className="text-muted-foreground">
                      Significantly reduces the cost of payroll administration and eliminates wastage through duplicate
                      payments and fraud.
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Data-Driven Decision Making</h3>
                    <p className="text-muted-foreground">
                      Provides accurate workforce data to support strategic planning and resource allocation across
                      government agencies.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <TimelineSection />
        <NewsSection />
        <FaqSection />

        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">Contact</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Get in Touch</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Have questions about IPPIS? Our support team is here to help.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">IPPIS Help Desk</h3>
                    <p className="text-muted-foreground">
                      For technical support and general inquiries about the IPPIS platform.
                    </p>
                    <div className="pt-4">
                      <p>
                        <strong>Email:</strong> helpdesk@ippis.gov.ng
                      </p>
                      <p>
                        <strong>Phone:</strong> +234 (0) 700-IPPIS-HELP
                      </p>
                      <p>
                        <strong>Hours:</strong> Monday - Friday, 8:00 AM - 5:00 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Office of the Accountant-General</h3>
                    <p className="text-muted-foreground">
                      For policy-related inquiries and official correspondence regarding IPPIS.
                    </p>
                    <div className="pt-4">
                      <p>
                        <strong>Address:</strong> Treasury House, Abuja, Nigeria
                      </p>
                      <p>
                        <strong>Email:</strong> info@oagf.gov.ng
                      </p>
                      <p>
                        <strong>Phone:</strong> +234 (0) 9-461-1015
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-red-50">
        <div className="container flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-10 overflow-hidden rounded-md mr-2">
                <Image
                  src="/images/ippis-logo.jpeg"
                  alt="IPPIS Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-900">IPPIS</span>
            </Link>
            <p className="text-sm text-gray-700">
              © 2023 Office of the Accountant-General of the Federation. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <Link href="/privacy-policy" className="text-sm text-gray-700 hover:text-primary hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm text-gray-700 hover:text-primary hover:underline">
              Terms of Service
            </Link>
            <Link href="/accessibility" className="text-sm text-gray-700 hover:text-primary hover:underline">
              Accessibility
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)}>
        <Menu className="h-6 w-6" />
        <span className="sr-only">Open menu</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" className="flex items-center" onClick={() => setIsOpen(false)}>
                <div className="relative w-10 h-10 overflow-hidden rounded-md mr-2 flex-shrink-0 border border-gray-200">
                  <Image src="/images/ippis-logo.jpeg" alt="IPPIS Logo" fill className="object-contain" priority />
                </div>
                <span className="text-xl font-bold text-gray-900">IPPIS</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>
            <div className="flex-1 overflow-auto py-4">
              <nav className="flex flex-col space-y-4 px-4">
                <Link
                  href="/"
                  className="text-lg font-medium py-2 border-b border-gray-100 text-gray-900 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="#features"
                  className="text-lg font-medium py-2 border-b border-gray-100 text-gray-900 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#benefits"
                  className="text-lg font-medium py-2 border-b border-gray-100 text-gray-900 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Benefits
                </Link>
                <Link
                  href="#testimonials"
                  className="text-lg font-medium py-2 border-b border-gray-100 text-gray-900 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Testimonials
                </Link>
                <Link
                  href="#contact"
                  className="text-lg font-medium py-2 border-b border-gray-100 text-gray-900 hover:text-green-600"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex flex-col space-y-4">
                <Link href="/auth/login" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full font-medium">
                    Log in
                  </Button>
                </Link>
                <Link href="/portal" className="w-full" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-green-600 hover:bg-green-700 font-medium">Employee Portal</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

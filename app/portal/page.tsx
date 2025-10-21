import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, LogIn } from "lucide-react"

export default function PortalPage() {
  return (
    <div className="min-h-screen bg-red-50 py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center mb-12">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Coat_of_arms_of_Nigeria.svg-IFrFqiae8fXtNsVx4Ip0AeHFPjj7Mp.png"
              width={50}
              height={50}
              alt="Coat of Arms of Nigeria"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold">IPPIS Portal</span>
          </Link>

          <h1 className="text-3xl font-bold text-center mb-4">Welcome to the IPPIS Employee Portal</h1>
          <p className="text-lg text-center text-gray-600 max-w-2xl mb-12">
            Access your personnel and payroll information or register as a new employee in the Integrated Personnel and
            Payroll Information System.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <Card className="border-red-200 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-green-700">New Employee Registration</CardTitle>
                <CardDescription>
                  Complete the multi-step form to register as a new employee in the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-green-700 hover:bg-green-800">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Register Now
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-red-200 hover:border-green-500 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-xl text-green-700">Existing Employee Login</CardTitle>
                <CardDescription>
                  Access your payroll information, update your details, and view your payment history.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Link href="/login">
                  <Button size="lg" className="bg-green-700 hover:bg-green-800">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-md max-w-2xl">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">Important Notice</h3>
            <p className="text-sm text-yellow-700">
              For security reasons, please ensure you're accessing this portal from a secure connection. If you
              encounter any issues during registration or login, please contact the IPPIS support desk at
              support@ippis.gov.ng or call +234 (0) 1234 5678.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-auto py-6 border-t bg-white">
        <div className="container mx-auto text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Integrated Personnel and Payroll Information System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

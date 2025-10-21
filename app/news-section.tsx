import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays } from "lucide-react"

export default function NewsSection() {
  return (
    <section id="news" className="w-full py-12 md:py-24 lg:py-32 hidden">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">News & Updates</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Latest IPPIS Announcements</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              Stay informed about the latest developments, updates, and announcements related to the IPPIS platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <CalendarDays className="mr-1 h-3 w-3" />
                <time dateTime="2023-11-15">November 15, 2023</time>
              </div>
              <CardTitle>System Maintenance Notice</CardTitle>
              <CardDescription>
                Scheduled maintenance will be performed on the IPPIS platform this weekend.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The IPPIS platform will undergo scheduled maintenance from Saturday, 18th November at 10:00 PM to
                Sunday, 19th November at 2:00 AM. During this time, the system will be unavailable.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-green-700 text-green-700 hover:bg-green-50">
                Read More
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <CalendarDays className="mr-1 h-3 w-3" />
                <time dateTime="2023-11-10">November 10, 2023</time>
              </div>
              <CardTitle>New Feature: Document Upload</CardTitle>
              <CardDescription>IPPIS now supports direct document uploads for verification purposes.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                We're pleased to announce that employees can now upload supporting documents directly through the IPPIS
                portal. This feature streamlines the verification process for various HR functions.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-green-700 text-green-700 hover:bg-green-50">
                Read More
              </Button>
            </CardFooter>
          </Card>
          <Card className="border-red-200">
            <CardHeader>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <CalendarDays className="mr-1 h-3 w-3" />
                <time dateTime="2023-11-05">November 5, 2023</time>
              </div>
              <CardTitle>Payroll Processing Dates</CardTitle>
              <CardDescription>Important dates for the November 2023 payroll cycle.</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The November 2023 payroll processing will commence on the 20th. All MDAs are required to complete their
                payroll verification by the 15th to ensure timely processing of salaries.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full border-green-700 text-green-700 hover:bg-green-50">
                Read More
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="border-green-700 text-green-700 hover:bg-green-50">
            View All News & Updates
          </Button>
        </div>
      </div>
    </section>
  )
}

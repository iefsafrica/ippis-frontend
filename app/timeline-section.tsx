import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Clock, ArrowRight } from "lucide-react"

export default function TimelineSection() {
  return (
    <section id="timeline" className="w-full py-12 md:py-24 lg:py-32 hidden">
      <div className="container px-4 md:px-6 hidden">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm text-green-700">Implementation</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">IPPIS Implementation Timeline</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl">
              The phased approach to implementing IPPIS across government agencies and departments.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-5xl mt-12">
          <div className="space-y-8">
            <div className="relative">
              <div className="absolute left-0 top-0 ml-8 h-full w-0.5 bg-red-200 hidden md:block"></div>

              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle>Phase 1: Core Ministries (Completed)</CardTitle>
                    <CardDescription>2007 - 2012</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Initial implementation across core federal ministries, establishing the foundation of the IPPIS
                      platform and processes. This phase successfully enrolled over 50,000 federal employees.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle>Phase 2: Departments and Agencies (Completed)</CardTitle>
                    <CardDescription>2013 - 2018</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Expansion to federal departments, agencies, and commissions. This phase integrated an additional
                      300,000+ employees into the system and refined the platform based on feedback from Phase 1.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                </div>
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle>Phase 3: Educational Institutions (Completed)</CardTitle>
                    <CardDescription>2019 - 2021</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Integration of federal universities, polytechnics, and colleges of education. This phase brought
                      academic staff and non-academic staff into the IPPIS platform, standardizing payroll processes
                      across educational institutions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
                    <Clock className="h-8 w-8" />
                  </div>
                </div>
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle>Phase 4: Security Agencies (In Progress)</CardTitle>
                    <CardDescription>2022 - 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Current implementation phase focusing on integrating security agencies, military personnel, and
                      paramilitary organizations with specialized payroll requirements and security considerations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-6 md:gap-12">
                <div className="flex items-center justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700">
                    <ArrowRight className="h-8 w-8" />
                  </div>
                </div>
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle>Phase 5: State Integration (Planned)</CardTitle>
                    <CardDescription>2025 - 2027</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      Future phase to provide optional integration for interested state governments, allowing states to
                      leverage the IPPIS infrastructure while maintaining administrative autonomy over their civil
                      service.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

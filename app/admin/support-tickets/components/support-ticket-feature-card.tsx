"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { SupportTicketFeature } from "./support-ticket-features"

export function SupportTicketFeatureCard({ feature }: { feature: SupportTicketFeature }) {
  return (
    <Card className="border">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-center gap-3">
          <div className={`${feature.iconBg} ${feature.iconColor} rounded-lg p-3`}>{feature.icon}</div>
          <CardTitle className="text-lg">{feature.title}</CardTitle>
        </div>
        <CardDescription className="text-sm text-muted-foreground">{feature.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0" />
      <CardFooter className="pt-0">
        <Button variant="outline" className="w-full" asChild>
          <Link href={feature.href} className="text-sm font-medium">
            {feature.actionLabel}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

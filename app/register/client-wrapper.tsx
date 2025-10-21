"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Client component will be loaded only on the client side
const RegisterForm = dynamic(() => import("./register-form"), {
  ssr: false,
  loading: () => <RegisterFormSkeleton />,
})

function RegisterFormSkeleton() {
  return (
    <div className="text-center p-8">
      <div className="h-8 w-8 bg-green-100 rounded-full animate-spin mx-auto mb-4"></div>
      <p>Loading registration form...</p>
    </div>
  )
}

export default function ClientWrapper() {
  return (
    <Suspense fallback={<RegisterFormSkeleton />}>
      <RegisterForm />
    </Suspense>
  )
}

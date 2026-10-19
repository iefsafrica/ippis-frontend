export const dynamic = "force-dynamic"

import ClientWrapper from "./client-wrapper"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white py-4 px-2.5 sm:py-8 sm:px-4">
      <div className="container max-w-5xl mx-auto px-0 sm:px-4">
        {/* Removed the logo and header from here since it's already in the RegisterForm component */}
        <ClientWrapper />
      </div>
    </div>
  )
}

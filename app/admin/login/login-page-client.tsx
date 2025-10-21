"use client"

import Image from "next/image"
import LoginForm from "./login-form"

export default function LoginPageClient() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 flex flex-col items-center">
          <div className="relative h-16 w-16 mb-2">
            <Image
              src="/nigerian-coat-of-arms-symbolism.png"
              alt="Nigerian Coat of Arms"
              fill
              className="object-contain"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900">IPPIS Admin Portal</h1>
          <p className="text-sm text-center text-gray-600 mt-1">Enter your credentials to access the admin dashboard</p>
          <button
            className="text-xs text-green-600 hover:text-green-700 mt-1"
            onClick={() => {
              // Fill in demo credentials
              const usernameInput = document.querySelector('input[name="username"]') as HTMLInputElement
              const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement
              if (usernameInput && passwordInput) {
                usernameInput.value = "admin"
                passwordInput.value = "admin123"
              }
            }}
          >
            Show demo credentials
          </button>
        </div>

        <LoginForm />

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Protected by Federal Government of Nigeria security protocols</p>
          <p className="mt-2">© 2023 IPPIS Nigeria. - All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

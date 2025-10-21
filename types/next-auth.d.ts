import NextAuth from "next-auth"
import type { AdminUser } from "@/types/admin"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      role: AdminUser["role"]
    } & DefaultSession["user"]
  }

  interface User {
    id: number
    role: AdminUser["role"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number
    role: AdminUser["role"]
  }
}

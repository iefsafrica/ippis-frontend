import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { neon } from "@neondatabase/serverless"
import { compareSync } from "bcrypt-ts"

// Database connection
const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        try {
          // Query the database for the user
          const result = await sql`
            SELECT id, username, password, role, email
            FROM admin_users
            WHERE username = ${credentials.username}
            LIMIT 1
          `

          if (result.length === 0) {
            return null
          }

          const user = result[0]

          // Verify password
          const isValidPassword = compareSync(credentials.password, user.password)

          if (!isValidPassword) {
            return null
          }

          // Return the user object without the password
          return {
            id: user.id,
            name: user.username,
            email: user.email,
            role: user.role,
          }
        } catch (error) {
          console.error("Authentication error:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  secret: process.env.JWT_SECRET,
  debug: process.env.NODE_ENV === "development",
}

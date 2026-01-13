// import NextAuth from "next-auth"
// import CredentialsProvider from "next-auth/providers/credentials"

// const handler = NextAuth({
//   providers: [
//     CredentialsProvider({
//       name: 'Credentials',
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" }
//       },
//       async authorize(credentials, req) {
//         // TODO: Replace with your actual backend authentication logic
//         // For now, this allows login if any details are provided
//         const user = { id: "1", name: "Admin User", email: "admin@ippis.gov.ng" }
//         return user
//       }
//     })
//   ],
//   secret: process.env.NEXTAUTH_SECRET || "your-development-secret",
//   pages: {
//     signIn: '/auth/login',
//   }
// })

// export { handler as GET, handler as POST }
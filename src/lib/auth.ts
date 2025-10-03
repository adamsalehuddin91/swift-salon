import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials')
          return null
        }

        console.log('🔍 Login attempt for:', credentials.email)

        // Try to find user in User table first (admins)
        let user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        // If not found in User table, try Customer table
        if (!user) {
          console.log('   Not found in User table, checking Customer table...')
          const customer = await prisma.customer.findFirst({
            where: {
              email: credentials.email
            }
          })

          if (customer) {
            console.log('   ✅ Found in Customer table')
            // Convert customer to user format for consistency
            user = {
              id: customer.id,
              email: customer.email,
              name: customer.name,
              password: customer.password || null,
              role: 'CUSTOMER'
            } as any
          } else {
            console.log('   ❌ Not found in Customer table either')
          }
        } else {
          console.log('   ✅ Found in User table, role:', user.role)
        }

        if (!user || !user.password) {
          console.log('❌ No user found or no password set')
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log('🔐 Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          return null
        }

        console.log('✅ Login successful for:', user.email, 'Role:', user.role)

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
}
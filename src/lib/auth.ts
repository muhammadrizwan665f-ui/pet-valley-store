import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getPrisma } from "./prisma";
import { rateLimit } from "./rateLimit";

/**
 * Auth architecture
 * -----------------
 * - Single User table with a `role` enum (CUSTOMER | STAFF | ADMIN).
 * - Credentials provider verifies email + bcrypt-hashed password server-side.
 * - JWT session strategy; role is embedded in the token/session so
 *   middleware.ts can gate /admin/* without a DB round trip on every request.
 * - No credentials or secrets ever live in client code — this file only
 *   runs on the server (API route / server components).
 */

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Throttle by email to slow down credential-stuffing / brute force.
        const { allowed } = rateLimit(`login:${credentials.email.toLowerCase()}`, 10, 15 * 60 * 1000);
        if (!allowed) return null;

        const prisma = await getPrisma();
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: [user.firstName, user.lastName].filter(Boolean).join(" "),
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.sub = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.sub;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET, // required env var, never hardcoded
};

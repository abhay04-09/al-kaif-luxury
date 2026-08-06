import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8).max(128)
});

const otpLoginSchema = z.object({
  phone: z.string().trim().regex(/^\+[1-9]\d{7,14}$/),
  code: z.string().regex(/^\d{6}$/)
});

const googleIsConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // Credentials login requires JWT sessions in NextAuth v4.
  session: {
    strategy: "jwt"
  },

  pages: {
    signIn: "/login"
  },

  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const passwordMatches = await compare(
          parsed.data.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    }),

    CredentialsProvider({
      id: "otp",
      name: "Mobile OTP",
      credentials: {
        phone: { label: "Mobile number", type: "tel" },
        code: { label: "OTP", type: "text" }
      },

      async authorize(credentials) {
        const parsed = otpLoginSchema.safeParse(credentials);

        if (!parsed.success || !(await verifyOtp(parsed.data.phone, parsed.data.code))) {
          return null;
        }

        const user = await prisma.user.upsert({
          where: { phone: parsed.data.phone },
          update: {},
          create: { phone: parsed.data.phone }
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    }),

    ...(googleIsConfigured
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
          })
        ]
      : [])
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const databaseUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true }
        });

        token.id = user.id;
        token.role = databaseUser?.role ?? "CUSTOMER";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
        session.user.role = token.role ?? "CUSTOMER";
      }

      return session;
    }
  }
};

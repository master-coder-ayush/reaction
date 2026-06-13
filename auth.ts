import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      name?: string | null;
      email?: string | null;
    };
  }
  interface User {
    username: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string;
    username: string;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        identifier: {}, // email or username
        password: {},
      },
      authorize: async (credentials) => {
        const identifier =
          typeof credentials?.identifier === "string"
            ? credentials.identifier.trim()
            : "";
        const password =
          typeof credentials?.password === "string" ? credentials.password : "";

        if (!identifier || !password) return null;

        const lookup = identifier.toLowerCase();

        // Rate limit: 10 login attempts per identifier per 10 minutes
        // (Sprint 8 §8.10). Throttles credential-stuffing without a store.
        if (!rateLimit(`login:${lookup}`, 10, 10 * 60 * 1000)) {
          return null;
        }
        const [user] = await db
          .select()
          .from(users)
          .where(or(eq(users.email, lookup), eq(users.username, lookup)))
          .limit(1);

        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: String(user.id),
          username: user.username,
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.id as string;
        token.username = user.username;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId;
        session.user.username = token.username;
      }
      return session;
    },
  },
});

import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js configuration.
 *
 * This module is imported by `middleware.ts` (Edge runtime) and therefore must
 * NOT import Prisma, bcrypt, or any Node-only dependency. The Credentials
 * provider — which needs both — is added in `auth.ts` (Node runtime).
 *
 * `Role` is a type-only import, fully erased at build time, so it is safe here.
 */
export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/admin/login",
  },
  session: {
    // Credentials sign-in requires JWT sessions (no adapter round-trip).
    strategy: "jwt",
  },
  callbacks: {
    // Runs in middleware for every matched request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = Boolean(auth?.user);
      const { pathname } = nextUrl;

      if (pathname === "/admin/login") {
        // Already signed in? Skip the login screen.
        if (isLoggedIn) {
          return Response.redirect(new URL("/admin", nextUrl));
        }
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return isLoggedIn; // false → redirect to signIn page
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        if (user.id) token.id = user.id;
        if ("role" in user && user.role) token.role = user.role as Role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (typeof token.id === "string") session.user.id = token.id;
        if (token.role) session.user.role = token.role as Role;
      }
      return session;
    },
  },
  providers: [], // real providers are attached in auth.ts
} satisfies NextAuthConfig;

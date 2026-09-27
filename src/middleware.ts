import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Edge-safe middleware instance. Uses only the base config (no Prisma), so it
// can run at the edge. The `authorized` callback in authConfig decides access.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/admin/:path*"],
};

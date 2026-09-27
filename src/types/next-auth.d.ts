import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Augment Auth.js types so `role` and `id` are first-class on the user,
 * session, and JWT throughout the app.
 */
declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

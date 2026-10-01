"use server";

import { signOut } from "@/auth";

/** Server action: end the admin session and return to the login screen. */
export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

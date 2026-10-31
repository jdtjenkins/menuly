"use server";

import { signIn, signOut } from "../../lib/auth/server";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/food" });
}

export async function signOutOfMenuly() {
  await signOut({ redirectTo: "/food" });
}

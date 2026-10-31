import "server-only";

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { createAuthCallbacks } from "./callbacks";
import { findOrCreateGoogleAccount } from "./accounts";
import { getDatabaseClient } from "../db/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google(
    process.env.MENULY_TEST_OIDC_ISSUER === "http://127.0.0.1:3101"
      ? { issuer: process.env.MENULY_TEST_OIDC_ISSUER }
      : {},
  )],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  callbacks: createAuthCallbacks((subject) => findOrCreateGoogleAccount(getDatabaseClient(), subject)),
  pages: { error: "/food" },
});

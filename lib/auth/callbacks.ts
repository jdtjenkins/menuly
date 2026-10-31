import type { NextAuthConfig } from "next-auth";
export function createAuthCallbacks(findGoogleAccount: (subject: string) => Promise<string>): NonNullable<NextAuthConfig["callbacks"]> {
  return {
  async jwt({ token, account }) {
    if (account) {
      if (account.provider !== "google" || !account.providerAccountId) return {};
      const userId = await findGoogleAccount(account.providerAccountId);
      return { userId };
    }
    return typeof token.userId === "string" ? { userId: token.userId } : {};
  },
  async session({ session, token }) {
    return {
      expires: session.expires,
      user: { id: typeof token.userId === "string" ? token.userId : "" },
    };
  },
  async redirect({ url, baseUrl }) {
    const target = new URL(url, baseUrl);
    return target.origin === baseUrl ? target.href : `${baseUrl}/food`;
  },
  };
}

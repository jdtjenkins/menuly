import { connection } from "next/server";
import { getCurrentAccount } from "../lib/auth/current-account";
import { signInWithGoogle, signOutOfMenuly } from "./food/actions";

export async function NavigationAuth() {
  await connection();
  if (await getCurrentAccount()) {
    return (
      <form action={signOutOfMenuly}>
        <button type="submit" className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border border-base-300 bg-base-100 px-4 text-sm font-semibold transition-colors hover:bg-base-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          Sign out
        </button>
      </form>
    );
  }

  return (
    <form action={signInWithGoogle}>
      <button
        type="submit"
        className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-xl border border-[#dadce0] bg-white px-4 text-sm font-semibold text-[#3c4043] shadow-sm transition-[background-color,border-color,box-shadow] hover:border-[#4285f4] hover:bg-[#e8f0fe] hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className="size-5 shrink-0">
          <path fill="#4285F4" d="M22.56 12.25c0-.81-.07-1.42-.23-2.04H12V14h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-7.84Z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.87 0-5.3-1.94-6.16-4.55H2.15v2.84A11 11 0 0 0 12 23Z" />
          <path fill="#FBBC05" d="M5.84 14.08A6.7 6.7 0 0 1 5.49 12c0-.72.13-1.42.35-2.08V7.08H2.15A11 11 0 0 0 1 12c0 1.78.43 3.46 1.15 4.92l3.69-2.84Z" />
          <path fill="#EA4335" d="M12 5.38c1.57 0 2.97.54 4.08 1.6l3.06-3.06C17.45 2.22 14.96 1 12 1a11 11 0 0 0-9.85 6.08l3.69 2.84C6.7 7.32 9.13 5.38 12 5.38Z" />
        </svg>
        Sign in with Google
      </button>
    </form>
  );
}

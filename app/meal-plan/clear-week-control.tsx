"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearWeekAction } from "./actions";

export function ClearWeekControl() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function clear() {
    setPending(true);
    setError("");
    try {
      const cleared = await clearWeekAction();
      if (!cleared) { setError("Could not clear your week. Try again."); return; }
      setConfirming(false);
      router.refresh();
    } catch {
      setError("Could not clear your week. Try again.");
    } finally { setPending(false); }
  }

  return <div className="flex flex-wrap items-center gap-2">
    {!confirming ? <button type="button" className="btn btn-outline btn-error btn-sm" onClick={() => { setError(""); setConfirming(true); }}>Clear Week</button> : <>
      <p className="text-sm">Remove all planned cards and reset your shopping checks?</p>
      <button type="button" className="btn btn-ghost btn-sm" disabled={pending} onClick={() => { setConfirming(false); setError(""); }}>Cancel</button>
      <button type="button" className="btn btn-error btn-sm" disabled={pending} onClick={() => void clear()}>Confirm Clear Week</button>
    </>}
    {pending && <span role="status" className="text-sm">Clearing…</span>}
    {error && <span role="alert" className="text-sm text-error">{error}</span>}
  </div>;
}

"use client";

import { useState } from "react";
import { archivePersonalFoodAction } from "./actions";

export function ArchiveFoodControl({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  if (!confirming) return <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirming(true)} aria-label={`Archive ${name}`}>Archive food</button>;
  return <div role="group" aria-label={`Archive ${name}`} className="flex flex-wrap items-center gap-2">
    <p className="w-full text-sm">Archive {name}? It will be removed from My foods.</p>
    <form action={archivePersonalFoodAction.bind(null, id)}><button type="submit" className="btn btn-error btn-sm">Confirm archive</button></form>
    <button type="button" className="btn btn-outline btn-sm" onClick={() => setConfirming(false)}>Cancel</button>
  </div>;
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CheckedShoppingItem } from "../../lib/shopping/checklist-repository";
import { setShoppingCheckedAction } from "./actions";

export function ShoppingCheckControl({ item, amount }: { item: CheckedShoppingItem; amount: string }) {
  const router = useRouter();
  const [checked, setChecked] = useState(item.checked);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function change(next: boolean) {
    setChecked(next);
    setPending(true);
    setError("");
    try {
      const saved = await setShoppingCheckedAction(item.source, item.foodId, next);
      if (!saved) {
        setChecked(item.checked);
        setError("This item is no longer in your plan.");
        router.refresh();
      } else router.refresh();
    } catch {
      setChecked(item.checked);
      setError("Could not save this item. Try again.");
    } finally { setPending(false); }
  }

  return <>
    <label className="flex min-w-0 cursor-pointer items-center gap-3">
      <input type="checkbox" className="checkbox checkbox-primary checkbox-sm shrink-0" checked={checked} disabled={pending}
        onChange={(event) => void change(event.target.checked)} aria-label={`Bought ${item.name} (${item.source})`} />
      <span className="min-w-0 flex-1 break-words"><span className="font-medium">{item.name}</span> <span className="text-xs text-base-content/65">({item.source})</span></span>
      <span className="shrink-0 tabular-nums">{amount} {item.unit}</span>
    </label>
    {pending && <p role="status" className="mt-1 text-xs text-base-content/70">Saving…</p>}
    {error && <p role="alert" className="mt-1 text-xs text-error">{error}</p>}
  </>;
}

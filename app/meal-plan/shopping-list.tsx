import { formatShoppingAmount } from "../../lib/shopping/calculation";
import type { CheckedShoppingItem } from "../../lib/shopping/checklist-repository";
import { ShoppingCheckControl } from "./shopping-check-control";

export function ShoppingList({ items }: { items: readonly CheckedShoppingItem[] }) {
  return <section aria-label="Shopping list" className="surface-panel p-4 sm:p-5">
    <h2 className="text-lg font-semibold">Shopping list</h2>
    {items.length === 0 ? <p className="mt-2 text-sm text-base-content/75">Add a meal to your plan to see what you need to buy.</p> :
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <li key={`${item.source}:${item.foodId}:${item.amount}:${item.checked}`} className="surface-row min-w-0 px-3 py-2">
          <ShoppingCheckControl item={item} amount={formatShoppingAmount(item.amount)} />
        </li>)}
      </ul>}
  </section>;
}

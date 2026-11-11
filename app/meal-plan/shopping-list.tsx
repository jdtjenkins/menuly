import { formatShoppingAmount, type ShoppingItem } from "../../lib/shopping/calculation";

export function ShoppingList({ items }: { items: readonly ShoppingItem[] }) {
  return <section aria-label="Shopping list" className="surface-panel p-4 sm:p-5">
    <h2 className="text-lg font-semibold">Shopping list</h2>
    {items.length === 0 ? <p className="mt-2 text-sm text-base-content/75">Add a meal to your plan to see what you need to buy.</p> :
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => <li key={`${item.source}:${item.foodId}`} className="surface-row flex min-w-0 items-center justify-between gap-3 px-3 py-2">
          <span className="min-w-0 break-words"><span className="font-medium">{item.name}</span> <span className="text-xs text-base-content/65">({item.source})</span></span>
          <span className="shrink-0 tabular-nums">{formatShoppingAmount(item.amount)} {item.unit}</span>
        </li>)}
      </ul>}
  </section>;
}

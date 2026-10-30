type AreaEmptyStateProps = {
  title: string;
  intro: string;
  emptyTitle: string;
  emptyDescription: string;
};

export function AreaEmptyState({
  title,
  intro,
  emptyTitle,
  emptyDescription,
}: AreaEmptyStateProps) {
  return (
    <div className="space-y-8">
      <div className="max-w-2xl space-y-3">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Your kitchen, organised</p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        <p className="text-lg text-base-content/75">{intro}</p>
      </div>
      <section className="card border border-base-300 bg-base-100 shadow-sm" aria-labelledby="empty-state-title">
        <div className="card-body gap-3 p-7 sm:p-10">
          <div aria-hidden="true" className="flex size-12 items-center justify-center rounded-2xl bg-secondary/20 text-2xl text-secondary-content">✦</div>
          <h2 id="empty-state-title" className="card-title text-2xl">{emptyTitle}</h2>
          <p className="max-w-xl text-base-content/75">{emptyDescription}</p>
        </div>
      </section>
    </div>
  );
}

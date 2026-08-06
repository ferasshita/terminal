export const Panel = ({ title, children, right }: { title?: string; children: React.ReactNode; right?: React.ReactNode }) => (
  <section className="rounded-md border border-slate-800 bg-slate-950/70 p-3">
    {title ? (
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {right}
      </header>
    ) : null}
    {children}
  </section>
);

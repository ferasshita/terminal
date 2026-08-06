export const EmptyState = ({ label = 'No data available' }: { label?: string }) => (
  <div className="flex min-h-24 items-center justify-center rounded border border-dashed border-slate-700 text-xs text-slate-500">
    {label}
  </div>
);

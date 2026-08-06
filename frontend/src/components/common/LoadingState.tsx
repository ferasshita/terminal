export const LoadingState = ({ label = 'Loading...' }: { label?: string }) => (
  <div className="flex min-h-24 items-center justify-center text-xs text-slate-400">{label}</div>
);

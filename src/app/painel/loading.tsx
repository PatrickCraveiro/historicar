export default function Loading() {
  return (
    <div className="animate-pulse space-y-4" aria-label="Carregando">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-200" />
      <div className="h-24 rounded-2xl bg-slate-200" />
    </div>
  );
}

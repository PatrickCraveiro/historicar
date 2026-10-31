export default function Loading() {
  return (
    <div className="min-h-dvh animate-pulse bg-slate-100" aria-label="Carregando">
      <div className="h-36 bg-slate-900" />
      <div className="mx-auto -mt-14 max-w-2xl space-y-4 px-4">
        <div className="h-44 rounded-2xl bg-white" />
        <div className="h-32 rounded-2xl bg-white" />
        <div className="h-32 rounded-2xl bg-white" />
      </div>
    </div>
  );
}

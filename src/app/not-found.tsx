import { QrIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <div className="max-w-sm text-center">
        <span className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-slate-200 text-slate-500">
          <QrIcon className="size-6" />
        </span>
        <h1 className="text-xl font-bold text-slate-900">Não encontrado</h1>
        <p className="mt-2 text-slate-500">
          Este endereço não existe ou o veículo foi removido do sistema.
        </p>
      </div>
    </main>
  );
}

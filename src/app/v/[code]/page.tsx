import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { BellIcon, CalendarIcon, GaugeIcon, WrenchIcon } from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { card } from "@/components/ui";
import { SHOP_NAME } from "@/lib/config";
import { getCarByCode, getNextService, getRecords, toRecordView } from "@/lib/data";
import { carTitle, formatDate, formatKm, nextServiceText, todayISO, vehicleTypeLabel } from "@/lib/format";
import { PublicHistory } from "./public-history";

// Página que o QR code abre. Busca os dados no banco a cada acesso, por isso o
// QR nunca precisa mudar. Não mostra dados do dono nem quem fez cada serviço.
export default async function PublicCarPage({ params }: PageProps<"/v/[code]">) {
  const { code } = await params;
  // Sempre gerada na hora do acesso (nunca pré-renderizada): os dados mudam a
  // cada anotação, e o driver do Mongo usa a data atual internamente.
  await connection();
  const car = await getCarByCode(code);
  if (!car) notFound();

  const records = await getRecords(car._id);
  const nextService = getNextService(records);
  const lastKm = records.find((r) => r.km != null)?.km;
  const overdue = nextService?.date != null && nextService.date < todayISO();

  return (
    <div className="min-h-dvh bg-slate-100">
      <header className="bg-slate-900 pb-20 pt-6 text-white">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white">
            <WrenchIcon className="size-5" />
          </span>
          <div>
            <p className="font-bold">{SHOP_NAME}</p>
            <p className="text-sm text-slate-400">Histórico de manutenção</p>
          </div>
        </div>
      </header>

      <main className="mx-auto -mt-14 max-w-2xl space-y-6 px-4 pb-12">
        <section className={`${card} p-5 sm:p-6`}>
          <div className="flex flex-wrap items-center gap-4">
            <PlateBadge plate={car.plate} size="lg" />
            <div>
              <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">{carTitle(car)}</h1>
              <p className="text-slate-500">{[vehicleTypeLabel(car), car.color].filter(Boolean).join(" · ")}</p>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5 text-center">
            <Stat icon={<WrenchIcon className="size-4" />} label="Serviços" value={String(records.length)} />
            <Stat
              icon={<CalendarIcon className="size-4" />}
              label="Último serviço"
              value={records[0] ? formatDate(records[0].date) : "—"}
            />
            <Stat icon={<GaugeIcon className="size-4" />} label="Última km" value={lastKm != null ? formatKm(lastKm) : "—"} />
          </dl>
        </section>

        {nextService && (
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              overdue ? "border-red-200 bg-red-50 text-red-800" : "border-blue-200 bg-blue-50 text-blue-800"
            }`}
          >
            <BellIcon className="size-5 shrink-0" />
            <p>
              <span className="font-semibold">{overdue ? "Revisão vencida:" : "Próxima revisão:"}</span>{" "}
              {nextServiceText(nextService)}
            </p>
          </div>
        )}

        <PublicHistory records={records.map((record) => toRecordView(record))} pdfHref={`/v/${code}/pdf`} />

        <footer className="pt-4 text-center text-xs text-slate-400">
          Informações registradas por {SHOP_NAME}.
        </footer>
      </main>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-center justify-center gap-1 text-xs text-slate-500">
        {icon}
        <span className="truncate">{label}</span>
      </dt>
      <dd className="mt-1 truncate font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

import type { ReactNode } from "react";
import { formatDate, formatKm, nextServiceText } from "@/lib/format";
import type { RecordView } from "@/lib/types";
import { BellIcon, CalendarIcon, CheckIcon, GaugeIcon } from "./icons";
import { card } from "./ui";

/**
 * Lista de anotações em formato de linha do tempo, na ordem recebida.
 * A bolinha laranja marca o serviço mais recente (`latestId`), seja qual for a ordem.
 */
export function RecordTimeline({
  records,
  latestId = records[0]?.id,
  renderFooter,
}: {
  records: RecordView[];
  latestId?: string;
  renderFooter?: (record: RecordView) => ReactNode;
}) {
  return (
    <ol className="relative ml-2 space-y-4 border-l-2 border-slate-200 pl-6">
      {records.map((record) => (
        <li key={record.id} className="relative">
          <span
            className={`absolute -left-[33px] top-5 size-4 rounded-full border-4 border-white ring-1 ring-slate-200 ${
              record.id === latestId ? "bg-blue-700" : "bg-slate-400"
            }`}
          />
          <RecordCard record={record} footer={renderFooter?.(record)} />
        </li>
      ))}
    </ol>
  );
}

function RecordCard({ record, footer }: { record: RecordView; footer?: ReactNode }) {
  const hasNext = record.nextServiceKm != null || record.nextServiceDate;
  return (
    <article className={`${card} p-4 sm:p-5`}>
      <header className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 font-semibold text-slate-900">
          <CalendarIcon className="size-4 text-slate-400" />
          {formatDate(record.date)}
        </span>
        {record.km != null && (
          <span className="flex items-center gap-1.5 text-sm text-slate-600">
            <GaugeIcon className="size-4 text-slate-400" />
            {formatKm(record.km)}
          </span>
        )}
      </header>

      {record.title && <h3 className="mt-2 font-medium text-slate-800">{record.title}</h3>}

      <ul className="mt-3 space-y-1.5">
        {record.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-slate-700">
            <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      {record.notes && (
        <p className="mt-3 whitespace-pre-line rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          {record.notes}
        </p>
      )}

      {hasNext && (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-blue-700">
          <BellIcon className="size-4" />
          Próxima revisão: {nextServiceText({ km: record.nextServiceKm, date: record.nextServiceDate })}
        </p>
      )}

      {footer}
    </article>
  );
}

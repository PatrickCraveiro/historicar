"use client";

import { useState, type ReactNode } from "react";
import { RecordTimeline } from "@/components/record-timeline";
import { DEFAULT_ORDER, SortToggle, sortRecords, type SortOrder } from "@/components/sort-toggle";
import type { RecordView } from "@/lib/types";

/**
 * Histórico do automóvel no painel, com o botão de inverter a ordem por data.
 * Os rodapés (autor, Editar/Excluir) vêm prontos do servidor, um por anotação.
 */
export function CarHistory({
  records,
  footers,
  empty,
}: {
  records: RecordView[];
  footers: Record<string, ReactNode>;
  empty: ReactNode;
}) {
  const [order, setOrder] = useState<SortOrder>(DEFAULT_ORDER);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Histórico <span className="font-normal text-slate-400">({records.length})</span>
        </h2>
        {records.length > 1 && <SortToggle order={order} onChange={setOrder} />}
      </div>

      {records.length === 0 ? (
        empty
      ) : (
        <RecordTimeline
          records={sortRecords(records, order)}
          latestId={records[0].id}
          renderFooter={(record) => footers[record.id]}
        />
      )}
    </section>
  );
}

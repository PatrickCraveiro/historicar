"use client";

import { useState } from "react";
import { DownloadIcon, SearchIcon } from "@/components/icons";
import { RecordTimeline } from "@/components/record-timeline";
import { DEFAULT_ORDER, SortToggle, sortRecords, type SortOrder } from "@/components/sort-toggle";
import { btnPrimary, card, inputClass } from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { RecordView } from "@/lib/types";

/** Ignora maiúsculas e acentos: "oleo" encontra "Óleo". */
function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function searchableText(record: RecordView) {
  return normalize(
    [record.title, ...record.items, record.notes, formatDate(record.date), record.km].filter(Boolean).join(" "),
  );
}

export function PublicHistory({ records, pdfHref }: { records: RecordView[]; pdfHref: string }) {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<SortOrder>(DEFAULT_ORDER);
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const filtered = terms.length
    ? records.filter((record) => {
        const text = searchableText(record);
        return terms.every((term) => text.includes(term));
      })
    : records;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">
          Histórico <span className="font-normal text-slate-400">({records.length})</span>
        </h2>
        <a href={pdfHref} target="_blank" className={btnPrimary}>
          <DownloadIcon /> Baixar PDF
        </a>
      </div>

      {records.length > 1 && (
        <div className="flex justify-end gap-2">
          {records.length > 2 && (
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar: óleo, freio, 2025…"
                className={`${inputClass} pl-9`}
                aria-label="Pesquisar no histórico"
              />
            </div>
          )}
          <SortToggle order={order} onChange={setOrder} />
        </div>
      )}

      {records.length === 0 ? (
        <div className={`${card} p-8 text-center text-slate-500`}>Nenhum serviço registrado ainda.</div>
      ) : filtered.length === 0 ? (
        <div className={`${card} p-8 text-center text-slate-500`}>
          Nada encontrado para &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <>
          {terms.length > 0 && (
            <p className="text-sm text-slate-500">
              {filtered.length} de {records.length} {records.length === 1 ? "serviço" : "serviços"}
            </p>
          )}
          <RecordTimeline records={sortRecords(filtered, order)} latestId={records[0].id} />
        </>
      )}
    </section>
  );
}

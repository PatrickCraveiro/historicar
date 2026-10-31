"use client";

import { ArrowUpDownIcon } from "./icons";
import { btnSecondary } from "./ui";

export type SortOrder = "desc" | "asc";

/** O histórico começa pelo serviço mais antigo, contando a vida do automóvel em ordem. */
export const DEFAULT_ORDER: SortOrder = "asc";

/** Alterna a ordem do histórico: mais recentes primeiro ou mais antigos primeiro. */
export function SortToggle({ order, onChange }: { order: SortOrder; onChange: (order: SortOrder) => void }) {
  const label = order === "desc" ? "Mais recentes" : "Mais antigos";
  return (
    <button
      type="button"
      onClick={() => onChange(order === "desc" ? "asc" : "desc")}
      aria-label={`Ordem: ${label.toLowerCase()} primeiro. Toque para inverter.`}
      title="Inverter a ordem"
      className={`${btnSecondary} shrink-0 px-3`}
    >
      <ArrowUpDownIcon className="size-4 text-slate-500" />
      {label}
    </button>
  );
}

/** Os registros chegam do mais recente para o mais antigo; "asc" só inverte. */
export function sortRecords<T>(records: T[], order: SortOrder): T[] {
  return order === "desc" ? records : [...records].reverse();
}

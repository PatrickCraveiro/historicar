"use client";

import Link from "next/link";
import { useActionState } from "react";
import { formatKm } from "@/lib/format";
import type { FormState } from "@/lib/types";
import { FormMessage, SubmitButton, fieldValue } from "./form-bits";
import { ItemsInput } from "./items-input";
import { btnSecondary, card, inputClass, labelClass } from "./ui";

export interface RecordFormValues {
  date?: string;
  km?: number;
  title?: string;
  items?: string[];
  notes?: string;
  nextServiceKm?: number;
  nextServiceDate?: string;
}

export function RecordForm({
  action,
  initial,
  lastKm,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  initial?: RecordFormValues;
  /** Última quilometragem registrada, mostrada como dica. */
  lastKm?: number;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const value = (name: keyof RecordFormValues) => fieldValue(state, initial as Record<string, unknown>, name);

  return (
    <form action={formAction} className="space-y-6">
      <section className={`${card} space-y-4 p-5`}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="date" className={labelClass}>Data do serviço *</label>
            <input id="date" name="date" type="date" required defaultValue={value("date")} className={inputClass} />
          </div>
          <div>
            <label htmlFor="km" className={labelClass}>Quilometragem</label>
            <input
              id="km"
              name="km"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={value("km")}
              placeholder={lastKm != null ? `Última: ${formatKm(lastKm)}` : "Ex.: 45000"}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label htmlFor="title" className={labelClass}>Título (opcional)</label>
          <input
            id="title"
            name="title"
            maxLength={100}
            defaultValue={value("title")}
            placeholder="Ex.: Revisão dos 40.000 km"
            className={inputClass}
          />
        </div>
      </section>

      <section className={`${card} space-y-3 p-5`}>
        <div>
          <h2 className="font-semibold text-slate-900">O que foi feito *</h2>
          <p className="text-sm text-slate-500">Digite e aperte Enter, ou toque nas sugestões.</p>
        </div>
        <ItemsInput defaultItems={initial?.items} />
      </section>

      <section className={`${card} space-y-4 p-5`}>
        <div>
          <label htmlFor="notes" className={labelClass}>Observações</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={value("notes")}
            placeholder="Peças usadas, marca do óleo, recomendações…"
            className={inputClass}
          />
        </div>
        <div>
          <p className={labelClass}>Próxima revisão (opcional)</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="nextServiceKm"
              type="number"
              min={0}
              inputMode="numeric"
              defaultValue={value("nextServiceKm")}
              placeholder="Com quantos km"
              aria-label="Próxima revisão em km"
              className={inputClass}
            />
            <input
              name="nextServiceDate"
              type="date"
              defaultValue={value("nextServiceDate")}
              aria-label="Data da próxima revisão"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <FormMessage state={state} />

      <div className="flex flex-wrap justify-end gap-2">
        <Link href={cancelHref} className={btnSecondary}>Cancelar</Link>
        <SubmitButton>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}

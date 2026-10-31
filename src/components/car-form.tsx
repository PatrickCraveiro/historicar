"use client";

import { useActionState } from "react";
import { VEHICLE_TYPES, VEHICLE_TYPE_LABEL, type FormState, type VehicleType } from "@/lib/types";
import { AppLink } from "./app-link";
import { FormActions, FormMessage, SubmitButton, fieldValue } from "./form-bits";
import { btnSecondary, card, inputClass, labelClass } from "./ui";

export interface CarFormValues {
  type?: VehicleType;
  plate?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  notes?: string;
}

export function CarForm({
  action,
  initial,
  submitLabel,
  cancelHref,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  initial?: CarFormValues;
  submitLabel: string;
  cancelHref: string;
}) {
  const [state, formAction] = useActionState(action, undefined);
  const value = (name: keyof CarFormValues) => fieldValue(state, initial as Record<string, unknown>, name);

  return (
    <form action={formAction} className="space-y-6">
      <section className={`${card} space-y-4 p-5`}>
        <h2 className="font-semibold text-slate-900">Veículo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="type" className={labelClass}>Tipo *</label>
            {/* key: recria o select com o valor enviado; sem isso, ao dar erro ele voltaria para "Carro" */}
            <select
              key={value("type") || "carro"}
              id="type"
              name="type"
              required
              defaultValue={value("type") || "carro"}
              className={inputClass}
            >
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {VEHICLE_TYPE_LABEL[type]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="plate" className={labelClass}>Placa *</label>
            <input
              id="plate"
              name="plate"
              required
              maxLength={8}
              defaultValue={value("plate")}
              placeholder="ABC1D23"
              autoCapitalize="characters"
              className={`${inputClass} font-mono uppercase tracking-wider`}
            />
          </div>
          <div>
            <label htmlFor="brand" className={labelClass}>Marca *</label>
            <input id="brand" name="brand" required maxLength={40} defaultValue={value("brand")} placeholder="Volkswagen" className={inputClass} />
          </div>
          <div>
            <label htmlFor="model" className={labelClass}>Modelo *</label>
            <input id="model" name="model" required maxLength={60} defaultValue={value("model")} placeholder="Gol 1.0" className={inputClass} />
          </div>
          <div>
            <label htmlFor="year" className={labelClass}>Ano</label>
            <input
              id="year"
              name="year"
              inputMode="numeric"
              pattern="[0-9]{4}"
              maxLength={4}
              autoComplete="off"
              defaultValue={value("year")}
              placeholder="2018"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="color" className={labelClass}>Cor</label>
            <input id="color" name="color" maxLength={30} defaultValue={value("color")} placeholder="Prata" className={inputClass} />
          </div>
        </div>
      </section>

      <section className={`${card} space-y-4 p-5`}>
        <div>
          <h2 className="font-semibold text-slate-900">Dono e observações</h2>
          <p className="text-sm text-slate-500">Só aparece aqui no painel. Não vai para a página do QR code.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="ownerName" className={labelClass}>Nome do dono</label>
            <input id="ownerName" name="ownerName" maxLength={80} defaultValue={value("ownerName")} className={inputClass} />
          </div>
          <div>
            <label htmlFor="ownerPhone" className={labelClass}>Telefone</label>
            <input id="ownerPhone" name="ownerPhone" type="tel" maxLength={30} defaultValue={value("ownerPhone")} className={inputClass} />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className={labelClass}>Observações internas</label>
          <textarea id="notes" name="notes" rows={3} maxLength={1000} defaultValue={value("notes")} className={inputClass} />
        </div>
      </section>

      <FormMessage state={state} />

      <FormActions>
        <AppLink href={cancelHref} spinner className={btnSecondary}>Cancelar</AppLink>
        <SubmitButton>{submitLabel}</SubmitButton>
      </FormActions>
    </form>
  );
}

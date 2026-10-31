"use client";

import { useState } from "react";
import { PlusIcon, XIcon } from "./icons";
import { btnSecondary, inputClass } from "./ui";

const SUGGESTIONS = [
  "Troca de óleo",
  "Filtro de óleo",
  "Filtro de ar",
  "Filtro de combustível",
  "Filtro de cabine",
  "Pastilhas de freio",
  "Discos de freio",
  "Fluido de freio",
  "Alinhamento",
  "Balanceamento",
  "Correia dentada",
  "Velas",
  "Bateria",
  "Pneus",
  "Líquido de arrefecimento",
  "Amortecedores",
  "Embreagem",
];

/**
 * Lista editável dos serviços realizados. Cada item vira um campo "items"
 * no formulário; o texto digitado e ainda não adicionado também é enviado.
 */
export function ItemsInput({ defaultItems = [] }: { defaultItems?: string[] }) {
  const [items, setItems] = useState<string[]>(defaultItems);
  const [draft, setDraft] = useState("");

  function add(text: string) {
    const value = text.trim();
    if (!value) return;
    setItems((current) => [...current, value]);
    setDraft("");
  }

  const used = new Set(items.map((item) => item.toLowerCase()));
  const suggestions = SUGGESTIONS.filter((s) => !used.has(s.toLowerCase()));

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex gap-2">
              <input
                name="items"
                value={item}
                maxLength={120}
                onChange={(e) =>
                  setItems((current) => current.map((v, i) => (i === index ? e.target.value : v)))
                }
                className={inputClass}
                aria-label={`Serviço ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
                className="rounded-lg px-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remover ${item}`}
              >
                <XIcon className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <input
          name="items"
          value={draft}
          maxLength={120}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(draft);
            }
          }}
          placeholder={items.length ? "Adicionar outro serviço…" : "Ex.: Troca de óleo 5W30"}
          className={inputClass}
          aria-label="Novo serviço"
        />
        <button type="button" onClick={() => add(draft)} className={btnSecondary}>
          <PlusIcon />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-1.5">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => add(suggestion)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 transition active:scale-95 sm:px-2.5 sm:py-1 sm:text-xs hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

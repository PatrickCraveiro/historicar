"use client";

import { useLayoutEffect, useRef, useState, type ComponentProps } from "react";

const MAX_DIGITS = 7; // até 9.999.999 km; o limite real é validado no servidor

/** "130000" -> "130.000" */
function formatKm(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
}

type KmInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "type"> & {
  defaultValue?: string;
};

/**
 * Campo de quilometragem com ponto de milhar enquanto digita ("130.000").
 * Mantém o cursor no lugar certo e, ao apagar um ponto, apaga o dígito antes dele.
 */
export function KmInput({ defaultValue = "", ...props }: KmInputProps) {
  const [value, setValue] = useState(() => formatKm(onlyDigits(defaultValue)));
  const ref = useRef<HTMLInputElement>(null);
  const nextCaret = useRef<number | null>(null);

  // Depois de reformatar, devolve o cursor para depois do mesmo dígito.
  useLayoutEffect(() => {
    if (nextCaret.current != null && ref.current && ref.current === document.activeElement) {
      ref.current.setSelectionRange(nextCaret.current, nextCaret.current);
    }
    nextCaret.current = null;
  });

  return (
    <input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) => {
        const raw = e.target.value;
        const caret = e.target.selectionStart ?? raw.length;
        let digits = onlyDigits(raw);
        let digitsBeforeCaret = onlyDigits(raw.slice(0, caret)).length;

        // Apagou só o ponto: apaga também o dígito que vinha antes dele.
        if (digits === onlyDigits(value) && raw.length < value.length && digitsBeforeCaret > 0) {
          digits = digits.slice(0, digitsBeforeCaret - 1) + digits.slice(digitsBeforeCaret);
          digitsBeforeCaret -= 1;
        }

        const formatted = formatKm(digits);
        let position = 0;
        for (let seen = 0; position < formatted.length && seen < digitsBeforeCaret; position++) {
          if (formatted[position] !== ".") seen++;
        }
        nextCaret.current = position;
        setValue(formatted);
      }}
    />
  );
}

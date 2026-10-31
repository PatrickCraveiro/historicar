"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/lib/types";
import { Spinner } from "./spinner";
import { btnPrimary } from "./ui";

export function SubmitButton({
  children,
  pendingText = "Salvando…",
  className = btnPrimary,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} className={className}>
      {pending ? (
        <>
          <Spinner /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Botão de envio que pede confirmação antes (para excluir). */
export function ConfirmButton({
  children,
  message,
  pendingText = "Excluindo…",
  className,
}: {
  children: ReactNode;
  message: string;
  pendingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {pending ? (
        <>
          <Spinner /> {pendingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/** Botões do fim do formulário. No celular ficam presos no rodapé da tela. */
export function FormActions({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex gap-2 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur *:flex-1 sm:static sm:mx-0 sm:justify-end sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none sm:*:flex-none">
      {children}
    </div>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state?.error) {
    return (
      <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {state.error}
      </p>
    );
  }
  if (state?.success) {
    return (
      <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        {state.success}
      </p>
    );
  }
  return null;
}

/** Valor a mostrar no campo: o que foi digitado (se deu erro) ou o valor inicial. */
export function fieldValue(
  state: FormState,
  initial: Record<string, unknown> | undefined,
  name: string,
): string {
  const typed = state?.values?.[name];
  if (typeof typed === "string") return typed;
  const value = initial?.[name];
  return value == null ? "" : String(value);
}

"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, fieldValue } from "@/components/form-bits";
import { btnSecondary, inputClass, labelClass } from "@/components/ui";
import type { FormState } from "@/lib/types";
import { createUser } from "../actions";

export function CreateUserForm() {
  const [state, formAction] = useActionState(createUser, undefined);
  const value = (name: string) => fieldValue(state, undefined, name);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Nome</label>
          <input id="name" name="name" required maxLength={80} defaultValue={value("name")} className={inputClass} />
        </div>
        <div>
          <label htmlFor="username" className={labelClass}>Usuário (para entrar)</label>
          <input
            id="username"
            name="username"
            required
            minLength={3}
            maxLength={30}
            autoCapitalize="none"
            defaultValue={value("username")}
            placeholder="joao"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="password" className={labelClass}>Senha</label>
          <input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" className={inputClass} />
        </div>
        <div>
          <label htmlFor="role" className={labelClass}>Tipo</label>
          <select id="role" name="role" defaultValue={value("role") || "mechanic"} className={inputClass}>
            <option value="mechanic">Mecânico (só cria anotações)</option>
            <option value="master">Mecânico mestre (pode tudo)</option>
          </select>
        </div>
      </div>
      <FormMessage state={state} />
      <div className="flex justify-end">
        <SubmitButton pendingText="Criando…">Criar usuário</SubmitButton>
      </div>
    </form>
  );
}

export function ResetPasswordForm({
  action,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
}) {
  const [state, formAction] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="password"
        type="password"
        required
        minLength={6}
        placeholder="Nova senha"
        autoComplete="new-password"
        aria-label="Nova senha"
        className={`${inputClass} w-36 py-1 text-sm`}
      />
      <SubmitButton pendingText="…" className={`${btnSecondary} px-3 py-1`}>
        Trocar senha
      </SubmitButton>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
      {state?.success && <span className="text-xs text-emerald-600">{state.success}</span>}
    </form>
  );
}

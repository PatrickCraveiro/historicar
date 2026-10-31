"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, fieldValue } from "@/components/form-bits";
import { btnPrimary, inputClass, labelClass } from "@/components/ui";
import { login } from "./actions";

export function LoginForm() {
  const [state, formAction] = useActionState(login, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="username" className={labelClass}>Usuário</label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          autoCapitalize="none"
          defaultValue={fieldValue(state, undefined, "username")}
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>Senha</label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <FormMessage state={state} />
      <SubmitButton pendingText="Entrando…" className={`${btnPrimary} w-full`}>
        Entrar
      </SubmitButton>
    </form>
  );
}

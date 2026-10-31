"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton, fieldValue } from "@/components/form-bits";
import { inputClass, labelClass } from "@/components/ui";
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
          {/* key: recria o select com o valor enviado; sem isso, ao dar erro ele voltaria ao padrão */}
          <select key={value("role") || "mechanic"} id="role" name="role" defaultValue={value("role") || "mechanic"} className={inputClass}>
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

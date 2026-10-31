"use client";

import { useActionState } from "react";
import { FormMessage, SubmitButton } from "@/components/form-bits";
import { inputClass, labelClass } from "@/components/ui";
import { changeOwnPassword } from "../actions";

export function PasswordForm() {
  const [state, formAction] = useActionState(changeOwnPassword, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className={labelClass}>Senha atual</label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="newPassword" className={labelClass}>Nova senha</label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className={labelClass}>Repita a nova senha</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          className={inputClass}
        />
      </div>
      <FormMessage state={state} />
      <div className="flex justify-end">
        <SubmitButton>Trocar senha</SubmitButton>
      </div>
    </form>
  );
}

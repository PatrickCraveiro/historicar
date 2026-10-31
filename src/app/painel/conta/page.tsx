import type { Metadata } from "next";
import { card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "./password-form";

export const metadata: Metadata = { title: "Minha senha" };

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <div className="mx-auto max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Minha senha</h1>
        <p className="text-slate-500">
          {user.name}, você entra no painel com o usuário <strong className="text-slate-700">{user.username}</strong>.
        </p>
      </div>
      <section className={`${card} p-5`}>
        <PasswordForm />
      </section>
    </div>
  );
}

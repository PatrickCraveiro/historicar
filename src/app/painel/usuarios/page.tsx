import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SubmitButton } from "@/components/form-bits";
import { btnGhost, card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { can } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/types";
import { resetPassword, setUserActive } from "../actions";
import { CreateUserForm, ResetPasswordForm } from "./user-forms";

export const metadata: Metadata = { title: "Usuários" };

export default async function UsersPage() {
  const user = await requireUser();
  if (!can.manageUsers(user)) redirect("/painel");

  const { users } = await getCollections();
  const list = await users
    .find({}, { projection: { passwordHash: 0 } })
    .sort({ active: -1, name: 1 })
    .toArray();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Usuários</h1>

      <ul className={`${card} divide-y divide-slate-100`}>
        {list.map((u) => {
          const id = u._id.toHexString();
          const isMe = id === user.id;
          return (
            <li key={id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${u.active ? "" : "opacity-60"}`}>
              <div>
                <p className="font-medium text-slate-900">
                  {u.name} {isMe && <span className="text-xs font-normal text-slate-400">(você)</span>}
                </p>
                <p className="text-sm text-slate-500">
                  {u.username} · {ROLE_LABEL[u.role]}
                  {!u.active && " · desativado"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ResetPasswordForm action={resetPassword.bind(null, id)} />
                {!isMe && (
                  <form action={setUserActive.bind(null, id, !u.active)}>
                    <SubmitButton pendingText="…" className={btnGhost}>
                      {u.active ? "Desativar" : "Reativar"}
                    </SubmitButton>
                  </form>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section className={`${card} space-y-4 p-5`}>
        <h2 className="font-semibold text-slate-900">Novo usuário</h2>
        <CreateUserForm />
      </section>
    </div>
  );
}

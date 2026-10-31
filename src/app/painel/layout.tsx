import Link from "next/link";
import { Suspense } from "react";
import { WrenchIcon } from "@/components/icons";
import { getCurrentUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import { can } from "@/lib/permissions";
import { ROLE_LABEL } from "@/lib/types";
import { logout } from "./actions";

export default function PainelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/painel" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="flex size-8 items-center justify-center rounded-lg bg-slate-900 text-orange-400">
              <WrenchIcon />
            </span>
            <span className="truncate">{SHOP_NAME}</span>
          </Link>
          <Suspense fallback={null}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}

async function UserMenu() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <nav className="flex items-center gap-1 text-sm sm:gap-3">
      <Link href="/painel" className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
        Carros
      </Link>
      {can.manageUsers(user) && (
        <Link href="/painel/usuarios" className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          Usuários
        </Link>
      )}
      <span className="hidden text-right leading-tight md:block">
        <span className="block font-medium text-slate-800">{user.name}</span>
        <span className="block text-xs text-slate-500">{ROLE_LABEL[user.role]}</span>
      </span>
      <form action={logout}>
        <button type="submit" className="rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          Sair
        </button>
      </form>
    </nav>
  );
}

import { Suspense } from "react";
import { AppLink } from "@/components/app-link";
import { WrenchIcon } from "@/components/icons";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import { can } from "@/lib/permissions";

export default function PainelLayout({ children }: LayoutProps<"/painel">) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-2 sm:py-3">
          <AppLink href="/painel" className="flex min-h-11 min-w-0 items-center gap-2 font-semibold text-slate-900 sm:min-h-0">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-orange-400">
              <WrenchIcon />
            </span>
            <span className="truncate">{SHOP_NAME}</span>
          </AppLink>
          <Suspense fallback={null}>
            <UserNav />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}

async function UserNav() {
  const user = await getCurrentUser();
  if (!user) return null;

  // No celular, "Carros" e "Usuários" ficam dentro do menu do avatar.
  const linkClass = "hidden rounded-md px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex";
  return (
    <nav className="flex shrink-0 items-center gap-2 text-sm">
      <AppLink href="/painel" className={linkClass}>
        Carros
      </AppLink>
      {can.manageUsers(user) && (
        <AppLink href="/painel/usuarios" className={linkClass}>
          Usuários
        </AppLink>
      )}
      <UserMenu name={user.name} canManageUsers={can.manageUsers(user)} />
    </nav>
  );
}

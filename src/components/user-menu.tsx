"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { logout } from "@/app/painel/actions";
import { AppLink } from "./app-link";
import { CarIcon, ChevronDownIcon, KeyIcon, LogOutIcon, UsersIcon } from "./icons";
import { Spinner } from "./spinner";

/**
 * Avatar com a inicial; ao clicar, abre o menu com "Minha senha" e "Sair".
 * No celular, o menu também traz "Carros" e "Usuários", que saem do cabeçalho.
 */
export function UserMenu({ name, canManageUsers }: { name: string; canManageUsers: boolean }) {
  const pathname = usePathname();
  // Guarda em qual página o menu foi aberto: ao mudar de página ele fecha sozinho,
  // e o link continua na tela mostrando o carregamento até a página nova abrir.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenOn(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenOn(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const firstName = name.trim().split(/\s+/)[0];
  const itemClass =
    "flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-slate-700 hover:bg-slate-50 sm:py-2";
  // Clicar no link da página atual não navega, então fecha o menu na mão.
  const closeIfCurrent = (href: string) => () => pathname === href && setOpenOn(null);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpenOn(open ? null : pathname)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu de ${name}`}
        className="flex min-h-11 items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100 sm:min-h-0"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700">
          {firstName.charAt(0).toUpperCase()}
        </span>
        <span className="hidden text-sm font-medium text-slate-700 sm:inline">{firstName}</span>
        <ChevronDownIcon className="size-4 text-slate-400" />
      </button>

      {open && (
        <div
          role="menu"
          className="menu-in absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <p className="truncate border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-900">{name}</p>
          <div className="border-b border-slate-100 sm:hidden">
            <AppLink href="/painel" role="menuitem" onClick={closeIfCurrent("/painel")} className={itemClass}>
              <CarIcon className="size-4 text-slate-400" /> Carros
            </AppLink>
            {canManageUsers && (
              <AppLink
                href="/painel/usuarios"
                role="menuitem"
                onClick={closeIfCurrent("/painel/usuarios")}
                className={itemClass}
              >
                <UsersIcon className="size-4 text-slate-400" /> Usuários
              </AppLink>
            )}
          </div>
          <AppLink
            href="/painel/conta"
            role="menuitem"
            onClick={closeIfCurrent("/painel/conta")}
            className={itemClass}
          >
            <KeyIcon className="size-4 text-slate-400" /> Minha senha
          </AppLink>
          <form action={logout}>
            <LogoutButton className={itemClass} />
          </form>
        </div>
      )}
    </div>
  );
}

function LogoutButton({ className }: { className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" role="menuitem" disabled={pending} className={className}>
      {pending ? <Spinner className="size-4 text-slate-400" /> : <LogOutIcon className="size-4 text-slate-400" />}
      {pending ? "Saindo…" : "Sair"}
    </button>
  );
}

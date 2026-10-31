"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/painel/actions";
import { ChevronDownIcon, KeyIcon, LogOutIcon } from "./icons";

/** Avatar com a inicial; ao clicar, abre o menu com "Minha senha" e "Sair". */
export function UserMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
    "flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu de ${name}`}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-slate-100"
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
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
        >
          <p className="truncate border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-900">{name}</p>
          <Link href="/painel/conta" role="menuitem" onClick={() => setOpen(false)} className={itemClass}>
            <KeyIcon className="size-4 text-slate-400" /> Minha senha
          </Link>
          <form action={logout}>
            <button type="submit" role="menuitem" className={itemClass}>
              <LogOutIcon className="size-4 text-slate-400" /> Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

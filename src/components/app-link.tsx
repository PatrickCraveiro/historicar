"use client";

import Link, { useLinkStatus } from "next/link";
import type { ComponentProps } from "react";
import { Spinner } from "./spinner";

type AppLinkProps = ComponentProps<typeof Link> & {
  /** Troca o conteúdo por um spinner enquanto a página abre. Use em links com cara de botão. */
  spinner?: boolean;
};

/**
 * Link do app: enquanto a próxima página não abre, mostra a barra de progresso
 * no topo da tela (e, opcionalmente, um spinner dentro do próprio link).
 */
export function AppLink({ children, spinner = false, className = "", ...props }: AppLinkProps) {
  return (
    <Link {...props} className={spinner ? `relative ${className}` : className}>
      {children}
      <PendingIndicator spinner={spinner} />
    </Link>
  );
}

function PendingIndicator({ spinner }: { spinner: boolean }) {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <>
      <span aria-hidden="true" className="nav-progress" />
      {spinner && (
        // Cobre o conteúdo com a mesma cor de fundo do botão: sem mudar o tamanho dele.
        <span aria-hidden="true" className="link-spinner absolute inset-0 flex items-center justify-center rounded-[inherit] bg-inherit">
          <Spinner />
        </span>
      )}
    </>
  );
}

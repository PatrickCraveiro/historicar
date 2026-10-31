import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session-token";

// Checagem rápida: sem sessão válida, nem renderiza o painel e manda pro login.
// A checagem de verdade (usuário ativo, papel) acontece em cada página e ação.
export async function proxy(request: NextRequest) {
  const userId = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/painel/:path*"],
};

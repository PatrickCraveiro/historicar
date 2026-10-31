import "server-only";
import { headers } from "next/headers";

/**
 * Endereço base que vai dentro do QR code. Vem de APP_URL, que precisa ser o
 * endereço DEFINITIVO do site: se ele mudar, os QRs já impressos param de abrir.
 * Sem APP_URL, usa o endereço da requisição atual (bom só para testar).
 */
export async function getPublicBaseUrl(): Promise<{ url: string; fromEnv: boolean }> {
  const fromEnv = process.env.APP_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) return { url: fromEnv, fromEnv: true };

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return { url: `${proto}://${host}`, fromEnv: false };
}

export function carPublicUrl(baseUrl: string, publicCode: string) {
  return `${baseUrl}/v/${publicCode}`;
}

import type { MetadataRoute } from "next";
import { SHOP_NAME } from "@/lib/config";

// Permite "Adicionar à tela inicial" no celular: o painel abre em tela cheia,
// com ícone próprio, como um aplicativo.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `Historicar · ${SHOP_NAME}`,
    short_name: "Historicar",
    description: "Histórico de manutenção dos automóveis da oficina",
    lang: "pt-BR",
    start_url: "/painel",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafc",
    theme_color: "#0f172a",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

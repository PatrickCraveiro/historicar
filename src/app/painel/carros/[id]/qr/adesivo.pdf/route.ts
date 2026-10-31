import { getCurrentUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import { getCarById } from "@/lib/data";
import { carTitle, formatPlate } from "@/lib/format";
import { carPublicUrl, getPublicBaseUrl } from "@/lib/public-url";
import { stickerPdf } from "@/lib/sticker";

// Adesivo em tamanho real numa folha A4, pronto para imprimir e recortar.
export async function GET(_request: Request, ctx: RouteContext<"/painel/carros/[id]/qr/adesivo.pdf">) {
  if (!(await getCurrentUser())) return new Response("Não autorizado", { status: 401 });
  const { id } = await ctx.params;
  const car = await getCarById(id);
  if (!car) return new Response("Automóvel não encontrado", { status: 404 });

  const base = await getPublicBaseUrl();
  const pdf = await stickerPdf({
    url: carPublicUrl(base.url, car.publicCode),
    shopName: SHOP_NAME,
    carLabel: `${carTitle(car)} · ${formatPlate(car.plate)}`,
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="adesivo-${car.plate}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}

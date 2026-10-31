import { getCurrentUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
import { getCarById } from "@/lib/data";
import { carPublicUrl, getPublicBaseUrl } from "@/lib/public-url";
import { stickerPng } from "@/lib/sticker";

// Adesivo em PNG (~300 dpi). Com ?download=1, o navegador baixa o arquivo.
export async function GET(request: Request, ctx: RouteContext<"/painel/carros/[id]/qr/adesivo.png">) {
  if (!(await getCurrentUser())) return new Response("Não autorizado", { status: 401 });
  const { id } = await ctx.params;
  const car = await getCarById(id);
  if (!car) return new Response("Automóvel não encontrado", { status: 404 });

  const base = await getPublicBaseUrl();
  const download = new URL(request.url).searchParams.has("download");
  return stickerPng({
    url: carPublicUrl(base.url, car.publicCode),
    shopName: SHOP_NAME,
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="adesivo-${car.plate}.png"`,
    },
  });
}

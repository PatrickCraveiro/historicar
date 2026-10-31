import type { NextRequest } from "next/server";
import { connection } from "next/server";
import { SHOP_NAME } from "@/lib/config";
import { getCarByCode, getNextService, getRecords } from "@/lib/data";
import { todayISO } from "@/lib/format";
import { buildCarPdf } from "@/lib/pdf";
import { carPublicUrl, getPublicBaseUrl } from "@/lib/public-url";

// PDF gerado na hora com os dados atuais do banco.
export async function GET(_request: NextRequest, ctx: RouteContext<"/v/[code]/pdf">) {
  const { code } = await ctx.params;
  await connection();

  const car = await getCarByCode(code);
  if (!car) return new Response("Veículo não encontrado", { status: 404 });

  const records = await getRecords(car._id);
  const base = await getPublicBaseUrl();
  const pdf = await buildCarPdf({
    shopName: SHOP_NAME,
    car,
    records,
    nextService: getNextService(records),
    url: carPublicUrl(base.url, car.publicCode),
    generatedOn: todayISO(),
  });

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="historico-${car.plate}.pdf"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}

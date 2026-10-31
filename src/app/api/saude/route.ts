import { connection } from "next/server";
import { getCollections } from "@/lib/db";

// Chamada uma vez por dia pela Vercel (vercel.json > crons) para manter o banco
// ativo: o Atlas gratuito pausa o cluster depois de 30 dias sem nenhuma conexão.
// A Vercel envia "Authorization: Bearer <CRON_SECRET>" quando essa variável existe.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Não autorizado", { status: 401 });
  }

  await connection();
  const { cars } = await getCollections();
  await cars.estimatedDocumentCount();
  return Response.json({ ok: true });
}

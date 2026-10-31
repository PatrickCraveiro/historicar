import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AppLink } from "@/components/app-link";
import { ArrowLeftIcon, DownloadIcon, PrinterIcon } from "@/components/icons";
import { btnAccent, btnGhost, btnSecondary } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCarById } from "@/lib/data";
import { carTitle } from "@/lib/format";
import { carPublicUrl, getPublicBaseUrl } from "@/lib/public-url";

export const metadata: Metadata = { title: "QR code" };

export default async function QrPage({ params }: PageProps<"/painel/carros/[id]/qr">) {
  await requireUser();
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  const base = await getPublicBaseUrl();
  const url = carPublicUrl(base.url, car.publicCode);
  const sticker = `/painel/carros/${id}/qr/adesivo`;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <AppLink href={`/painel/carros/${id}`} className={btnGhost}>
          <ArrowLeftIcon /> Voltar
        </AppLink>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Adesivo com QR code</h1>
          <p className="text-slate-500">{carTitle(car)}</p>
        </div>

        {!base.fromEnv && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Atenção:</strong> a variável <code className="font-mono">APP_URL</code> não está configurada,
            então o QR está usando o endereço atual (<code className="font-mono">{base.url}</code>). Configure o
            endereço definitivo antes de imprimir adesivos de verdade.
          </div>
        )}

        <p className="text-sm text-slate-600">
          Este QR code é fixo: pode adicionar ou editar anotações à vontade que ele continua abrindo o histórico
          atualizado.
        </p>
      </div>

      {/* A prévia é o próprio PNG: o que aparece aqui é o que sai na impressão. */}
      <div className="flex justify-center">
        <Image
          src={`${sticker}.png`}
          alt={`Adesivo com o QR code do ${carTitle(car)}`}
          width={840}
          height={984}
          unoptimized
          priority
          className="h-auto w-64 drop-shadow-md"
        />
      </div>

      <div className="grid gap-2 sm:flex sm:flex-wrap sm:justify-center">
        <a href={`${sticker}.pdf`} target="_blank" className={btnAccent}>
          <PrinterIcon /> Imprimir adesivo (PDF)
        </a>
        <a href={`${sticker}.png?download=1`} download={`adesivo-${car.plate}.png`} className={btnSecondary}>
          <DownloadIcon /> Baixar adesivo (PNG)
        </a>
      </div>

      <p className="text-center text-sm text-slate-500">
        Tamanho do adesivo: 7 × 8,2 cm. Na hora de imprimir o PDF, escolha <strong>tamanho real (100%)</strong>.
      </p>
      <p className="break-all text-center font-mono text-xs text-slate-400">{url}</p>
    </div>
  );
}

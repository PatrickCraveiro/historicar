import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ArrowLeftIcon, DownloadIcon, WrenchIcon } from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { PrintButton } from "@/components/print-button";
import { btnGhost, btnSecondary, card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { SHOP_NAME } from "@/lib/config";
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
  // Nível "M" de correção: aguenta um pouco de sujeira/desgaste no adesivo.
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 0 });
  const png = await QRCode.toDataURL(url, { errorCorrectionLevel: "M", margin: 2, width: 1024 });

  return (
    <div className="space-y-6">
      <div className="space-y-4 print:hidden">
        <Link href={`/painel/carros/${id}`} className={btnGhost}>
          <ArrowLeftIcon /> Voltar
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR code</h1>
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

      <div className="flex justify-center">
        <div
          className={`${card} flex w-72 flex-col items-center gap-3 p-5 text-center print:w-[7cm] print:rounded-xl print:border-2 print:border-slate-900 print:p-4 print:shadow-none`}
        >
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <WrenchIcon className="size-4 text-orange-500" />
            <span>{SHOP_NAME}</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Histórico de manutenção</p>
          <div className="w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="text-xs text-slate-600">Aponte a câmera do celular</p>
          <PlateBadge plate={car.plate} size="sm" />
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 print:hidden">
        <PrintButton />
        <a href={png} download={`qrcode-${car.plate}.png`} className={btnSecondary}>
          <DownloadIcon /> Baixar imagem (PNG)
        </a>
      </div>

      <p className="break-all text-center font-mono text-xs text-slate-400 print:hidden">{url}</p>
    </div>
  );
}

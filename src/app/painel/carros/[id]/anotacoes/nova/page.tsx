import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { AppLink } from "@/components/app-link";
import { ArrowLeftIcon } from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { RecordForm } from "@/components/record-form";
import { btnGhost } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCarById, getRecords } from "@/lib/data";
import { carTitle, todayISO } from "@/lib/format";
import { createRecord } from "../../../../actions";

export const metadata: Metadata = { title: "Nova anotação" };

export default async function NewRecordPage({ params }: PageProps<"/painel/carros/[id]/anotacoes/nova">) {
  await requireUser();
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  const records = await getRecords(car._id);
  const lastKm = records.find((r) => r.km != null)?.km;

  await connection(); // a data de hoje é calculada a cada acesso
  const today = todayISO();

  return (
    <div className="space-y-4">
      <AppLink href={`/painel/carros/${id}`} className={btnGhost}>
        <ArrowLeftIcon /> Voltar
      </AppLink>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Nova anotação</h1>
        <PlateBadge plate={car.plate} size="sm" />
        <span className="text-slate-500">{carTitle(car)}</span>
      </div>
      <RecordForm
        action={createRecord.bind(null, id)}
        initial={{ date: today }}
        lastKm={lastKm}
        submitLabel="Salvar anotação"
        cancelHref={`/painel/carros/${id}`}
      />
    </div>
  );
}

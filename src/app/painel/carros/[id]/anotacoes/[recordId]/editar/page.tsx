import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftIcon } from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { RecordForm } from "@/components/record-form";
import { btnGhost } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCarById, getRecord } from "@/lib/data";
import { carTitle } from "@/lib/format";
import { can } from "@/lib/permissions";
import { updateRecord } from "../../../../../actions";

export const metadata: Metadata = { title: "Editar anotação" };

export default async function EditRecordPage({
  params,
}: PageProps<"/painel/carros/[id]/anotacoes/[recordId]/editar">) {
  const user = await requireUser();
  const { id, recordId } = await params;
  if (!can.editRecord(user)) redirect(`/painel/carros/${id}`);

  const car = await getCarById(id);
  const record = car && (await getRecord(car._id, recordId));
  if (!car || !record) notFound();

  return (
    <div className="space-y-4">
      <Link href={`/painel/carros/${id}`} className={btnGhost}>
        <ArrowLeftIcon /> Voltar
      </Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Editar anotação</h1>
        <PlateBadge plate={car.plate} size="sm" />
        <span className="text-slate-500">{carTitle(car)}</span>
      </div>
      <p className="text-sm text-slate-500">
        Registrada por {record.createdBy.name}
        {record.updatedBy && ` · última edição por ${record.updatedBy.name}`}
      </p>
      <RecordForm
        action={updateRecord.bind(null, id, recordId)}
        initial={{
          date: record.date,
          km: record.km,
          title: record.title,
          items: record.items,
          notes: record.notes,
          nextServiceKm: record.nextServiceKm,
          nextServiceDate: record.nextServiceDate,
        }}
        submitLabel="Salvar alterações"
        cancelHref={`/painel/carros/${id}`}
      />
    </div>
  );
}

import { notFound } from "next/navigation";
import { AppLink } from "@/components/app-link";
import { ConfirmButton } from "@/components/form-bits";
import {
  ArrowLeftIcon,
  BellIcon,
  ExternalIcon,
  PencilIcon,
  PlusIcon,
  QrIcon,
  TrashIcon,
} from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { btnAccent, btnGhost, btnSecondary, card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCarById, getNextService, getRecords, toRecordView } from "@/lib/data";
import { carTitle, nextServiceText } from "@/lib/format";
import { can } from "@/lib/permissions";
import type { RecordView } from "@/lib/types";
import { deleteRecord } from "../../actions";
import { CarHistory } from "./car-history";

export default async function CarPage({ params }: PageProps<"/painel/carros/[id]">) {
  const user = await requireUser();
  const { id } = await params;
  const car = await getCarById(id);
  if (!car) notFound();

  const records = await getRecords(car._id);
  const views = records.map((record) => toRecordView(record, { withAuthor: true }));
  const nextService = getNextService(records);
  const canEdit = can.editRecord(user);
  const canDelete = can.deleteRecord(user);

  return (
    <div className="space-y-6">
      <AppLink href="/painel" className={btnGhost}>
        <ArrowLeftIcon /> Carros
      </AppLink>

      <section className={`${card} space-y-4 p-5`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <PlateBadge plate={car.plate} />
            <h1 className="text-2xl font-bold text-slate-900">{carTitle(car)}</h1>
            {car.color && <p className="text-slate-500">{car.color}</p>}
          </div>
          {can.editCar(user) && (
            <AppLink href={`/painel/carros/${id}/editar`} spinner className={btnSecondary}>
              <PencilIcon /> Editar
            </AppLink>
          )}
        </div>

        {(car.ownerName || car.ownerPhone || car.notes) && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Interno (não aparece no QR)
            </p>
            {(car.ownerName || car.ownerPhone) && (
              <p className="text-slate-700">
                {[car.ownerName, car.ownerPhone].filter(Boolean).join(" · ")}
              </p>
            )}
            {car.notes && <p className="mt-1 whitespace-pre-line text-slate-600">{car.notes}</p>}
          </div>
        )}

        {/* No celular os botões ficam empilhados, em largura total. */}
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
          <AppLink href={`/painel/carros/${id}/anotacoes/nova`} spinner className={btnAccent}>
            <PlusIcon /> Nova anotação
          </AppLink>
          <AppLink href={`/painel/carros/${id}/qr`} spinner className={btnSecondary}>
            <QrIcon /> QR code
          </AppLink>
          <a href={`/v/${car.publicCode}`} target="_blank" className={btnSecondary}>
            <ExternalIcon /> Página pública
          </a>
        </div>
      </section>

      {nextService && (
        <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-orange-800">
          <BellIcon className="size-5 shrink-0" />
          <p>
            <span className="font-semibold">Próxima revisão:</span> {nextServiceText(nextService)}
          </p>
        </div>
      )}

      <CarHistory
        records={views}
        footers={Object.fromEntries(views.map((record) => [record.id, renderFooter(record)]))}
        empty={
          <div className={`${card} p-8 text-center text-slate-500`}>
            Nenhuma anotação ainda. Clique em <strong>Nova anotação</strong> para registrar o primeiro serviço.
          </div>
        }
      />
    </div>
  );

  // Rodapé de cada anotação: quem registrou e, conforme a permissão, Editar/Excluir.
  function renderFooter(record: RecordView) {
    return (
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Por {record.createdByName}
          {record.updatedByName && ` · editado por ${record.updatedByName}`}
        </span>
        {(canEdit || canDelete) && (
          <span className="flex gap-1">
            {canEdit && (
              <AppLink href={`/painel/carros/${id}/anotacoes/${record.id}/editar`} className={btnGhost}>
                <PencilIcon className="size-3.5" /> Editar
              </AppLink>
            )}
            {canDelete && (
              <form action={deleteRecord.bind(null, id, record.id)}>
                <ConfirmButton
                  message="Excluir esta anotação? Não dá para desfazer."
                  className={`${btnGhost} hover:bg-red-50 hover:text-red-600`}
                >
                  <TrashIcon className="size-3.5" /> Excluir
                </ConfirmButton>
              </form>
            )}
          </span>
        )}
      </footer>
    );
  }
}

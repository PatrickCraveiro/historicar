import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AppLink } from "@/components/app-link";
import { CarForm } from "@/components/car-form";
import { ConfirmButton } from "@/components/form-bits";
import { ArrowLeftIcon, TrashIcon } from "@/components/icons";
import { btnDanger, btnGhost, card } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getCarById } from "@/lib/data";
import { can } from "@/lib/permissions";
import { deleteCar, updateCar } from "../../../actions";

export const metadata: Metadata = { title: "Editar automóvel" };

export default async function EditCarPage({ params }: PageProps<"/painel/carros/[id]/editar">) {
  const user = await requireUser();
  const { id } = await params;
  if (!can.editCar(user)) redirect(`/painel/carros/${id}`);

  const car = await getCarById(id);
  if (!car) notFound();

  return (
    <div className="space-y-4">
      <AppLink href={`/painel/carros/${id}`} className={btnGhost}>
        <ArrowLeftIcon /> Voltar
      </AppLink>
      <h1 className="text-2xl font-bold text-slate-900">Editar automóvel</h1>

      <CarForm
        action={updateCar.bind(null, id)}
        initial={{
          type: car.type,
          plate: car.plate,
          brand: car.brand,
          model: car.model,
          year: car.year,
          color: car.color,
          ownerName: car.ownerName,
          ownerPhone: car.ownerPhone,
          notes: car.notes,
        }}
        submitLabel="Salvar alterações"
        cancelHref={`/painel/carros/${id}`}
      />

      {can.deleteCar(user) && (
        <section className={`${card} mt-10 flex flex-wrap items-center justify-between gap-4 border-red-200 p-5`}>
          <div>
            <h2 className="font-semibold text-red-700">Excluir automóvel</h2>
            <p className="text-sm text-slate-500">
              Apaga o automóvel e todo o histórico. O QR code colado nele deixa de funcionar.
            </p>
          </div>
          <form action={deleteCar.bind(null, id)}>
            <ConfirmButton
              message="Excluir este automóvel e TODAS as anotações? O QR code vai parar de funcionar. Não dá para desfazer."
              className={btnDanger}
            >
              <TrashIcon /> Excluir automóvel
            </ConfirmButton>
          </form>
        </section>
      )}
    </div>
  );
}

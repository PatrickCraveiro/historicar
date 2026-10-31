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

export const metadata: Metadata = { title: "Editar carro" };

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
      <h1 className="text-2xl font-bold text-slate-900">Editar carro</h1>

      <CarForm
        action={updateCar.bind(null, id)}
        initial={{
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
            <h2 className="font-semibold text-red-700">Excluir carro</h2>
            <p className="text-sm text-slate-500">
              Apaga o carro e todo o histórico. O QR code colado no carro deixa de funcionar.
            </p>
          </div>
          <form action={deleteCar.bind(null, id)}>
            <ConfirmButton
              message="Excluir este carro e TODAS as anotações? O QR code vai parar de funcionar. Não dá para desfazer."
              className={btnDanger}
            >
              <TrashIcon /> Excluir carro
            </ConfirmButton>
          </form>
        </section>
      )}
    </div>
  );
}

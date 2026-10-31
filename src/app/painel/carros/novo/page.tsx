import type { Metadata } from "next";
import Link from "next/link";
import { CarForm } from "@/components/car-form";
import { ArrowLeftIcon } from "@/components/icons";
import { btnGhost } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createCar } from "../../actions";

export const metadata: Metadata = { title: "Novo carro" };

export default async function NewCarPage() {
  await requireUser();

  return (
    <div className="space-y-4">
      <Link href="/painel" className={btnGhost}>
        <ArrowLeftIcon /> Carros
      </Link>
      <h1 className="text-2xl font-bold text-slate-900">Novo carro</h1>
      <CarForm action={createCar} submitLabel="Cadastrar carro" cancelHref="/painel" />
    </div>
  );
}

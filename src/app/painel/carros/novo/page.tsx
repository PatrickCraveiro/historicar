import type { Metadata } from "next";
import { AppLink } from "@/components/app-link";
import { CarForm } from "@/components/car-form";
import { ArrowLeftIcon } from "@/components/icons";
import { btnGhost } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createCar } from "../../actions";

export const metadata: Metadata = { title: "Novo automóvel" };

export default async function NewCarPage() {
  await requireUser();

  return (
    <div className="space-y-4">
      <AppLink href="/painel" className={btnGhost}>
        <ArrowLeftIcon /> Automóveis
      </AppLink>
      <h1 className="text-2xl font-bold text-slate-900">Novo automóvel</h1>
      <CarForm action={createCar} submitLabel="Cadastrar automóvel" cancelHref="/painel" />
    </div>
  );
}

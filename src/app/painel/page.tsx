import type { Metadata } from "next";
import Form from "next/form";
import { AppLink } from "@/components/app-link";
import { SubmitButton } from "@/components/form-bits";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { PlateBadge } from "@/components/plate-badge";
import { btnAccent, btnSecondary, card, inputClass } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { listCars } from "@/lib/data";
import { carTitle, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Carros" };

export default async function CarsPage({ searchParams }: PageProps<"/painel">) {
  await requireUser();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const cars = await listCars(query);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Carros</h1>
        <AppLink href="/painel/carros/novo" spinner className={btnAccent}>
          <PlusIcon /> Novo carro
        </AppLink>
      </div>

      <Form action="/painel" className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Buscar por placa, modelo, marca ou dono"
            className={`${inputClass} pl-9`}
            aria-label="Buscar carro"
          />
        </div>
        <SubmitButton pendingText="Buscando…" className={btnSecondary}>
          Buscar
        </SubmitButton>
      </Form>

      {cars.length === 0 ? (
        <div className={`${card} p-10 text-center text-slate-500`}>
          {query ? (
            <>Nenhum carro encontrado para &ldquo;{query}&rdquo;.</>
          ) : (
            <>Nenhum carro cadastrado ainda. Clique em <strong>Novo carro</strong> para começar.</>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cars.map((car) => (
            <li key={car._id.toHexString()}>
              <AppLink
                href={`/painel/carros/${car._id.toHexString()}`}
                className={`${card} flex items-center gap-4 p-4 transition hover:border-orange-300 hover:shadow-md`}
              >
                <PlateBadge plate={car.plate} size="sm" />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{carTitle(car)}</p>
                  <p className="truncate text-sm text-slate-500">
                    {car.lastRecordDate ? `Último serviço: ${formatDate(car.lastRecordDate)}` : "Sem anotações"}
                    {car.ownerName ? ` · ${car.ownerName}` : ""}
                  </p>
                </div>
              </AppLink>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Funções puras de formatação, usadas tanto no servidor quanto no navegador.
import { VEHICLE_TYPE_LABEL, type VehicleType } from "./types";

export const TIMEZONE = "America/Sao_Paulo";

/** Data de hoje no fuso de Brasília, no formato YYYY-MM-DD. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIMEZONE }).format(new Date());
}

/** "2026-10-31" -> "31/10/2026" */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** 45000 -> "45.000 km" */
export function formatKm(km: number | undefined): string {
  if (km == null) return "";
  return `${km.toLocaleString("pt-BR")} km`;
}

/** Remove tudo que não for letra ou número e deixa maiúsculo. */
export function normalizePlate(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** Placa antiga (ABC1234) ou Mercosul (ABC1D23). */
export function isValidPlate(plate: string): boolean {
  return /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate);
}

/** "ABC1234" -> "ABC-1234"; placa Mercosul fica como está. */
export function formatPlate(plate: string): string {
  if (/^[A-Z]{3}[0-9]{4}$/.test(plate)) return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  return plate;
}

export function carTitle(car: { brand: string; model: string; year?: number }): string {
  return [car.brand, car.model, car.year].filter(Boolean).join(" ");
}

/** { km: 50000, date: "2027-04-15" } -> "50.000 km ou 15/04/2027" */
export function nextServiceText(next: { km?: number; date?: string }): string {
  return [next.km != null ? formatKm(next.km) : "", formatDate(next.date)]
    .filter(Boolean)
    .join(" ou ");
}

/** "Moto", "Caminhão"... Cadastros antigos, sem tipo, contam como carro. */
export function vehicleTypeLabel(car: { type?: VehicleType }): string {
  return VEHICLE_TYPE_LABEL[car.type ?? "carro"];
}

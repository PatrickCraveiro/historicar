import "server-only";
import { MongoServerError } from "mongodb";
import { isValidPlate, normalizePlate } from "./format";
import { VEHICLE_TYPES, type CarDoc, type RecordDoc, type VehicleType } from "./types";

/** Erro de validação: a mensagem é mostrada para o usuário no formulário. */
export class ValidationError extends Error {}

export function text(fd: FormData, name: string, max = 200): string {
  return String(fd.get(name) ?? "").trim().slice(0, max);
}

function required(fd: FormData, name: string, label: string, max?: number): string {
  const value = text(fd, name, max);
  if (!value) throw new ValidationError(`Preencha o campo "${label}".`);
  return value;
}

function optionalText(fd: FormData, name: string, max?: number): string | undefined {
  return text(fd, name, max) || undefined;
}

function optionalInt(fd: FormData, name: string, label: string, min: number, max: number) {
  const raw = text(fd, name).replace(/\./g, "");
  if (!raw) return undefined;
  const value = Number(raw);
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new ValidationError(`"${label}" precisa ser um número entre ${min} e ${max}.`);
  }
  return value;
}

function isValidISODate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
}

function optionalDate(fd: FormData, name: string, label: string): string | undefined {
  const value = text(fd, name, 10);
  if (!value) return undefined;
  if (!isValidISODate(value)) throw new ValidationError(`"${label}" não é uma data válida.`);
  return value;
}

/** Valores digitados, para devolver ao formulário quando der erro. */
export function formValues(fd: FormData): Record<string, string | string[]> {
  const values: Record<string, string | string[]> = {};
  for (const key of new Set(fd.keys())) {
    if (key.startsWith("$") || key.toLowerCase().includes("password")) continue;
    const all = fd.getAll(key).map(String);
    values[key] = key === "items" ? all : all[0];
  }
  return values;
}

export type CarInput = Pick<
  CarDoc,
  "type" | "plate" | "brand" | "model" | "year" | "color" | "ownerName" | "ownerPhone" | "notes"
>;

export function parseCarForm(fd: FormData): CarInput {
  const type = text(fd, "type") as VehicleType;
  if (!VEHICLE_TYPES.includes(type)) throw new ValidationError("Escolha o tipo de veículo.");

  const plate = normalizePlate(required(fd, "plate", "Placa", 10));
  if (!isValidPlate(plate)) {
    throw new ValidationError("Placa inválida. Use o formato ABC-1234 ou ABC1D23.");
  }
  return {
    type,
    plate,
    brand: required(fd, "brand", "Marca", 40),
    model: required(fd, "model", "Modelo", 60),
    year: optionalInt(fd, "year", "Ano", 1900, 2100),
    color: optionalText(fd, "color", 30),
    ownerName: optionalText(fd, "ownerName", 80),
    ownerPhone: optionalText(fd, "ownerPhone", 30),
    notes: optionalText(fd, "notes", 1000),
  };
}

export type RecordInput = Pick<
  RecordDoc,
  "date" | "km" | "title" | "items" | "notes" | "nextServiceKm" | "nextServiceDate"
>;

export function parseRecordForm(fd: FormData): RecordInput {
  const date = optionalDate(fd, "date", "Data do serviço");
  if (!date) throw new ValidationError('Preencha o campo "Data do serviço".');

  const items = fd
    .getAll("items")
    .map((item) => String(item).trim().slice(0, 120))
    .filter(Boolean)
    .slice(0, 50);
  if (items.length === 0) throw new ValidationError("Adicione pelo menos um serviço realizado.");

  return {
    date,
    km: optionalInt(fd, "km", "Quilometragem", 0, 3_000_000),
    title: optionalText(fd, "title", 100),
    items,
    notes: optionalText(fd, "notes", 2000),
    nextServiceKm: optionalInt(fd, "nextServiceKm", "Próxima revisão (km)", 0, 3_000_000),
    nextServiceDate: optionalDate(fd, "nextServiceDate", "Próxima revisão (data)"),
  };
}

/**
 * Separa campos preenchidos ($set) dos vazios ($unset), para que apagar um
 * campo opcional na edição realmente o remova do banco.
 */
export function toUpdate<T extends object>(data: T) {
  const $set: Partial<T> = {};
  const $unset: Partial<Record<keyof T, "">> = {};
  for (const [key, value] of Object.entries(data) as [keyof T, T[keyof T]][]) {
    if (value === undefined) $unset[key] = "";
    else $set[key] = value;
  }
  return { $set, $unset };
}

export function isDuplicateKey(err: unknown, field: string): boolean {
  return (
    err instanceof MongoServerError &&
    err.code === 11000 &&
    Object.keys(err.keyPattern ?? {}).includes(field)
  );
}

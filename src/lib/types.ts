import type { ObjectId } from "mongodb";

export type Role = "master" | "mechanic";

export const ROLE_LABEL: Record<Role, string> = {
  master: "Mecânico mestre",
  mechanic: "Mecânico",
};

export interface UserDoc {
  _id: ObjectId;
  name: string;
  username: string;
  passwordHash: string;
  role: Role;
  active: boolean;
  createdAt: Date;
}

/** Usuário logado, já sem dados sensíveis. */
export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: Role;
}

export interface Author {
  id: ObjectId;
  name: string;
}

export const VEHICLE_TYPES = ["carro", "moto", "caminhonete", "caminhao", "van", "onibus", "outro"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_TYPE_LABEL: Record<VehicleType, string> = {
  carro: "Carro",
  moto: "Moto",
  caminhonete: "Caminhonete",
  caminhao: "Caminhão",
  van: "Van",
  onibus: "Ônibus",
  outro: "Outro",
};

export interface CarDoc {
  _id: ObjectId;
  /** Tipo de veículo. Cadastros antigos não têm o campo e contam como carro. */
  type?: VehicleType;
  /** Código aleatório usado no link do QR. Gerado uma vez e nunca muda. */
  publicCode: string;
  /** Placa normalizada: maiúscula, sem hífen (ABC1234 ou ABC1D23). */
  plate: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  /** Dados do dono: só aparecem no painel, nunca na página pública. */
  ownerName?: string;
  ownerPhone?: string;
  notes?: string;
  /** Data (YYYY-MM-DD) da anotação mais recente, para ordenar a lista. */
  lastRecordDate?: string;
  createdAt: Date;
  createdBy: Author;
  updatedAt: Date;
}

export interface RecordDoc {
  _id: ObjectId;
  carId: ObjectId;
  /** Data em que o serviço foi realizado, no formato YYYY-MM-DD. */
  date: string;
  km?: number;
  title?: string;
  /** Lista do que foi feito: "Troca de óleo", "Filtro de ar"... */
  items: string[];
  notes?: string;
  nextServiceKm?: number;
  nextServiceDate?: string;
  createdAt: Date;
  createdBy: Author;
  updatedAt?: Date;
  updatedBy?: Author;
}

/** Versão serializável de uma anotação, segura para mandar ao navegador. */
export interface RecordView {
  id: string;
  date: string;
  km?: number;
  title?: string;
  items: string[];
  notes?: string;
  nextServiceKm?: number;
  nextServiceDate?: string;
  /** Só preenchido no painel; a página pública não expõe quem fez o serviço. */
  createdByName?: string;
  updatedByName?: string;
}

export type FormState =
  | { error?: string; success?: string; values?: Record<string, string | string[]> }
  | undefined;

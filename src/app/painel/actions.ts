"use server";

import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireUser } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import {
  ValidationError,
  formValues,
  isDuplicateKey,
  parseCarForm,
  parseRecordForm,
  text,
  toUpdate,
} from "@/lib/form";
import { can } from "@/lib/permissions";
import type { Author, FormState, Role, SessionUser } from "@/lib/types";

const NO_PERMISSION = "Você não tem permissão para fazer isso.";

// Sem caracteres ambíguos (0/o, 1/l/i), caso alguém precise digitar o link.
const newPublicCode = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

function authorOf(user: SessionUser): Author {
  return { id: new ObjectId(user.id), name: user.name };
}

function parseId(id: string): ObjectId {
  if (!ObjectId.isValid(id) || id.length !== 24) throw new Error("ID inválido");
  return new ObjectId(id);
}

function refreshPanel() {
  revalidatePath("/painel", "layout");
}

/** Mantém no carro a data da anotação mais recente (usada para ordenar a lista). */
async function syncLastRecordDate(carId: ObjectId) {
  const { cars, records } = await getCollections();
  const latest = await records.findOne({ carId }, { sort: { date: -1 }, projection: { date: 1 } });
  await cars.updateOne(
    { _id: carId },
    latest
      ? { $set: { lastRecordDate: latest.date, updatedAt: new Date() } }
      : { $unset: { lastRecordDate: "" }, $set: { updatedAt: new Date() } },
  );
}

// ---------------------------------------------------------------- Carros

export async function createCar(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!can.createCar(user)) return { error: NO_PERMISSION };

  let data;
  try {
    data = parseCarForm(fd);
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message, values: formValues(fd) };
    throw err;
  }

  const { cars } = await getCollections();
  const now = new Date();
  const carId = new ObjectId();
  let inserted = false;
  // O código público é aleatório; repetir é quase impossível, mas tenta de novo se acontecer.
  for (let attempt = 0; !inserted && attempt < 3; attempt++) {
    try {
      await cars.insertOne({
        _id: carId,
        ...data,
        publicCode: newPublicCode(),
        createdAt: now,
        createdBy: authorOf(user),
        updatedAt: now,
      });
      inserted = true;
    } catch (err) {
      if (isDuplicateKey(err, "plate")) {
        return { error: "Já existe um carro cadastrado com essa placa.", values: formValues(fd) };
      }
      if (!isDuplicateKey(err, "publicCode")) throw err;
    }
  }
  if (!inserted) throw new Error("Não foi possível gerar um código único para o carro.");

  refreshPanel();
  redirect(`/painel/carros/${carId}`);
}

export async function updateCar(carId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!can.editCar(user)) return { error: NO_PERMISSION };

  let data;
  try {
    data = parseCarForm(fd);
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message, values: formValues(fd) };
    throw err;
  }

  const { cars } = await getCollections();
  const { $set, $unset } = toUpdate(data);
  try {
    await cars.updateOne({ _id: parseId(carId) }, { $set: { ...$set, updatedAt: new Date() }, $unset });
  } catch (err) {
    if (isDuplicateKey(err, "plate")) {
      return { error: "Já existe outro carro cadastrado com essa placa.", values: formValues(fd) };
    }
    throw err;
  }

  refreshPanel();
  redirect(`/painel/carros/${carId}`);
}

export async function deleteCar(carId: string) {
  const user = await requireUser();
  if (!can.deleteCar(user)) throw new Error(NO_PERMISSION);

  const _id = parseId(carId);
  const { cars, records } = await getCollections();
  await records.deleteMany({ carId: _id });
  await cars.deleteOne({ _id });

  refreshPanel();
  redirect("/painel");
}

// ---------------------------------------------------------------- Anotações

export async function createRecord(carId: string, _prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!can.createRecord(user)) return { error: NO_PERMISSION };

  let data;
  try {
    data = parseRecordForm(fd);
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message, values: formValues(fd) };
    throw err;
  }

  const _id = parseId(carId);
  const { cars, records } = await getCollections();
  if (!(await cars.findOne({ _id }, { projection: { _id: 1 } }))) {
    return { error: "Carro não encontrado." };
  }
  await records.insertOne({
    _id: new ObjectId(),
    ...data,
    carId: _id,
    createdAt: new Date(),
    createdBy: authorOf(user),
  });
  await syncLastRecordDate(_id);

  refreshPanel();
  redirect(`/painel/carros/${carId}`);
}

export async function updateRecord(
  carId: string,
  recordId: string,
  _prev: FormState,
  fd: FormData,
): Promise<FormState> {
  const user = await requireUser();
  if (!can.editRecord(user)) return { error: NO_PERMISSION };

  let data;
  try {
    data = parseRecordForm(fd);
  } catch (err) {
    if (err instanceof ValidationError) return { error: err.message, values: formValues(fd) };
    throw err;
  }

  const _carId = parseId(carId);
  const { records } = await getCollections();
  const { $set, $unset } = toUpdate(data);
  await records.updateOne(
    { _id: parseId(recordId), carId: _carId },
    { $set: { ...$set, updatedAt: new Date(), updatedBy: authorOf(user) }, $unset },
  );
  await syncLastRecordDate(_carId);

  refreshPanel();
  redirect(`/painel/carros/${carId}`);
}

export async function deleteRecord(carId: string, recordId: string) {
  const user = await requireUser();
  if (!can.deleteRecord(user)) throw new Error(NO_PERMISSION);

  const _carId = parseId(carId);
  const { records } = await getCollections();
  await records.deleteOne({ _id: parseId(recordId), carId: _carId });
  await syncLastRecordDate(_carId);

  refreshPanel();
  redirect(`/painel/carros/${carId}`);
}

// ---------------------------------------------------------------- Usuários

export async function createUser(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  if (!can.manageUsers(user)) return { error: NO_PERMISSION };

  const name = text(fd, "name", 80);
  const username = text(fd, "username", 30).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = text(fd, "role") as Role;
  const values = formValues(fd);

  if (!name) return { error: 'Preencha o campo "Nome".', values };
  if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
    return { error: "O usuário deve ter de 3 a 30 letras, números, ponto, hífen ou _.", values };
  }
  if (password.length < 6) return { error: "A senha precisa ter pelo menos 6 caracteres.", values };
  if (role !== "master" && role !== "mechanic") return { error: "Escolha o tipo de usuário.", values };

  const { users } = await getCollections();
  try {
    await users.insertOne({
      _id: new ObjectId(),
      name,
      username,
      role,
      passwordHash: await bcrypt.hash(password, 10),
      active: true,
      createdAt: new Date(),
    });
  } catch (err) {
    if (isDuplicateKey(err, "username")) return { error: "Esse nome de usuário já existe.", values };
    throw err;
  }

  refreshPanel();
  return { success: `Usuário "${username}" criado.` };
}

export async function setUserActive(userId: string, active: boolean) {
  const user = await requireUser();
  if (!can.manageUsers(user)) throw new Error(NO_PERMISSION);
  if (userId === user.id) throw new Error("Você não pode desativar o próprio usuário.");

  const { users } = await getCollections();
  await users.updateOne({ _id: parseId(userId) }, { $set: { active } });
  refreshPanel();
}

// ---------------------------------------------------------------- Sessão

/** Cada usuário troca só a própria senha, confirmando a atual. */
export async function changeOwnPassword(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const current = String(fd.get("currentPassword") ?? "");
  const password = String(fd.get("newPassword") ?? "");
  const confirmation = String(fd.get("confirmPassword") ?? "");

  if (password.length < 6) return { error: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (password !== confirmation) return { error: "A confirmação está diferente da nova senha." };

  const { users } = await getCollections();
  const doc = await users.findOne({ _id: parseId(user.id) }, { projection: { passwordHash: 1 } });
  if (!doc || !(await bcrypt.compare(current, doc.passwordHash))) {
    return { error: "A senha atual está incorreta." };
  }

  await users.updateOne({ _id: doc._id }, { $set: { passwordHash: await bcrypt.hash(password, 10) } });
  return { success: "Senha alterada." };
}

export async function logout() {
  await endSession();
  redirect("/login");
}

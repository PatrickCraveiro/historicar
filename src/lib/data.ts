import "server-only";
import { ObjectId, type Filter } from "mongodb";
import { getCollections } from "./db";
import { normalizePlate } from "./format";
import { VEHICLE_TYPES, VEHICLE_TYPE_LABEL, type CarDoc, type RecordDoc, type RecordView } from "./types";

function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) && id.length === 24 ? new ObjectId(id) : null;
}

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withoutAccents(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export async function listCars(query?: string): Promise<CarDoc[]> {
  const { cars } = await getCollections();
  const filter: Filter<CarDoc> = {};
  const q = query?.trim();
  if (q) {
    const regex = new RegExp(escapeRegex(q), "i");
    const or: Filter<CarDoc>[] = [{ brand: regex }, { model: regex }, { ownerName: regex }];
    const plate = normalizePlate(q);
    if (plate) or.push({ plate: new RegExp(escapeRegex(plate)) });
    // Busca pelo tipo ("moto", "caminhao"...), com ou sem acento.
    const types = VEHICLE_TYPES.filter((type) => withoutAccents(VEHICLE_TYPE_LABEL[type]).includes(withoutAccents(q)));
    if (types.length) or.push({ type: { $in: types } });
    if (types.includes("carro")) or.push({ type: { $exists: false } }); // cadastros antigos
    filter.$or = or;
  }
  return cars.find(filter).sort({ lastRecordDate: -1, updatedAt: -1 }).limit(200).toArray();
}

export async function getCarById(id: string): Promise<CarDoc | null> {
  const _id = toObjectId(id);
  if (!_id) return null;
  const { cars } = await getCollections();
  return cars.findOne({ _id });
}

export async function getCarByCode(code: string): Promise<CarDoc | null> {
  if (!/^[a-z0-9]{6,32}$/.test(code)) return null;
  const { cars } = await getCollections();
  return cars.findOne({ publicCode: code });
}

/** Anotações do automóvel, da mais recente para a mais antiga. */
export async function getRecords(carId: ObjectId): Promise<RecordDoc[]> {
  const { records } = await getCollections();
  return records.find({ carId }).sort({ date: -1, createdAt: -1 }).toArray();
}

export async function getRecord(carId: ObjectId, recordId: string): Promise<RecordDoc | null> {
  const _id = toObjectId(recordId);
  if (!_id) return null;
  const { records } = await getCollections();
  return records.findOne({ _id, carId });
}

/** Anotação pronta para a tela. Na página pública, sem os nomes dos mecânicos. */
export function toRecordView(record: RecordDoc, { withAuthor = false } = {}): RecordView {
  return {
    id: record._id.toHexString(),
    date: record.date,
    km: record.km,
    title: record.title,
    items: record.items,
    notes: record.notes,
    nextServiceKm: record.nextServiceKm,
    nextServiceDate: record.nextServiceDate,
    ...(withAuthor && {
      createdByName: record.createdBy.name,
      updatedByName: record.updatedBy?.name,
    }),
  };
}

/** Próxima revisão indicada na anotação mais recente que tiver essa informação. */
export function getNextService(records: RecordDoc[]) {
  const record = records.find((r) => r.nextServiceKm != null || r.nextServiceDate);
  if (!record) return null;
  return { km: record.nextServiceKm, date: record.nextServiceDate };
}

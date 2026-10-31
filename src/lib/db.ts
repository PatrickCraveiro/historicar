import "server-only";
import { MongoClient, type Db } from "mongodb";
import type { CarDoc, RecordDoc, UserDoc } from "./types";

const DB_NAME = process.env.MONGODB_DB || "historico_veicular";

// Reaproveita a conexão entre requisições (e entre hot reloads em dev).
const globalForMongo = globalThis as unknown as {
  _mongoClient?: Promise<MongoClient>;
  _mongoIndexes?: Promise<unknown>;
};

function getClient(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada. Veja o arquivo .env.example");
  }
  // ignoreUndefined: campos opcionais vazios não são gravados como null.
  globalForMongo._mongoClient ??= new MongoClient(uri, { ignoreUndefined: true })
    .connect()
    .catch((err) => {
      globalForMongo._mongoClient = undefined;
      throw err;
    });
  return globalForMongo._mongoClient;
}

function ensureIndexes(db: Db) {
  return Promise.all([
    db.collection("users").createIndex({ username: 1 }, { unique: true }),
    db.collection("cars").createIndex({ publicCode: 1 }, { unique: true }),
    db.collection("cars").createIndex({ plate: 1 }, { unique: true }),
    db.collection("cars").createIndex({ lastRecordDate: -1, updatedAt: -1 }),
    db.collection("records").createIndex({ carId: 1, date: -1 }),
  ]);
}

export async function getCollections() {
  const client = await getClient();
  const db = client.db(DB_NAME);
  globalForMongo._mongoIndexes ??= ensureIndexes(db).catch((err) => {
    globalForMongo._mongoIndexes = undefined;
    throw err;
  });
  await globalForMongo._mongoIndexes;

  return {
    users: db.collection<UserDoc>("users"),
    cars: db.collection<CarDoc>("cars"),
    records: db.collection<RecordDoc>("records"),
  };
}

// Cria (ou recupera) um usuário mestre.
// Uso: npm run criar-mestre -- "Seu Nome" usuario senha
//
// Se o usuário já existir, a senha é trocada e ele vira mestre e ativo de novo.
// Útil também para recuperar o acesso caso a senha seja esquecida.
import bcrypt from "bcryptjs";
import { MongoClient } from "mongodb";

const [name, rawUsername, password] = process.argv.slice(2);
const username = rawUsername?.toLowerCase();

if (!name || !username || !password) {
  console.error('Uso: npm run criar-mestre -- "Seu Nome" usuario senha');
  process.exit(1);
}
if (!/^[a-z0-9._-]{3,30}$/.test(username)) {
  console.error("O usuário deve ter de 3 a 30 letras, números, ponto, hífen ou _.");
  process.exit(1);
}
if (password.length < 6) {
  console.error("A senha precisa ter pelo menos 6 caracteres.");
  process.exit(1);
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI não configurada. Crie o arquivo .env.local (veja o .env.example).");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
try {
  await client.connect();
  const users = client.db(process.env.MONGODB_DB || "historicar").collection("users");
  await users.createIndex({ username: 1 }, { unique: true });

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await users.updateOne(
    { username },
    {
      $set: { name, passwordHash, role: "master", active: true },
      $setOnInsert: { username, createdAt: new Date() },
    },
    { upsert: true },
  );

  console.log(
    result.upsertedCount
      ? `Usuário mestre "${username}" criado.`
      : `Usuário "${username}" atualizado: agora é mestre, está ativo e com a nova senha.`,
  );
} finally {
  await client.close();
}

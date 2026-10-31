// Assinatura e leitura do cookie de sessão (JWT). Não acessa o banco, então
// pode ser usado tanto no proxy quanto nas páginas e Server Actions.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hv_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 dias

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET precisa ter pelo menos 32 caracteres. Veja o .env.example");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

/** Retorna o id do usuário se o token for válido, ou null. */
export async function verifySession(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

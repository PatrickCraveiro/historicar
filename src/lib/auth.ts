import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getCollections } from "./db";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from "./session-token";
import type { SessionUser } from "./types";

/**
 * Usuário logado ou null. Sempre confere no banco, então um usuário
 * desativado (ou que mudou de papel) perde o acesso na hora.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const userId = await verifySession(token);
  if (!userId || !ObjectId.isValid(userId)) return null;

  const { users } = await getCollections();
  const user = await users.findOne({ _id: new ObjectId(userId), active: true });
  if (!user) return null;

  return { id: user._id.toHexString(), name: user.name, username: user.username, role: user.role };
});

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function startSession(userId: string) {
  (await cookies()).set(SESSION_COOKIE, await signSession(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

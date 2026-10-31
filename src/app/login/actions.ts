"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { startSession } from "@/lib/auth";
import { getCollections } from "@/lib/db";
import { text } from "@/lib/form";
import type { FormState } from "@/lib/types";

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  const username = text(fd, "username", 30).toLowerCase();
  const password = String(fd.get("password") ?? "");

  const { users } = await getCollections();
  const user = await users.findOne({ username, active: true });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !ok) {
    return { error: "Usuário ou senha incorretos.", values: { username } };
  }

  await startSession(user._id.toHexString());
  redirect("/painel");
}

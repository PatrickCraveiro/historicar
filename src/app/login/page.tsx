import type { Metadata } from "next";
import { WrenchIcon } from "@/components/icons";
import { card } from "@/components/ui";
import { SHOP_NAME } from "@/lib/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-slate-900 text-orange-400">
            <WrenchIcon className="size-6" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{SHOP_NAME}</h1>
            <p className="text-sm text-slate-500">Área do mecânico</p>
          </div>
        </div>
        <div className={`${card} p-6`}>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

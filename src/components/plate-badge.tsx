import { formatPlate } from "@/lib/format";

/** Placa no estilo Mercosul (faixa azul com "BRASIL"). */
export function PlateBadge({ plate, size = "md" }: { plate: string; size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "min-w-24", strip: "text-[7px] py-px", text: "text-sm px-2 py-0.5" },
    md: { box: "min-w-32", strip: "text-[8px] py-0.5", text: "text-lg px-3 py-0.5" },
    lg: { box: "min-w-44", strip: "text-[10px] py-0.5", text: "text-2xl px-4 py-1" },
  }[size];

  return (
    <span
      className={`inline-flex flex-col overflow-hidden rounded-md border-2 border-slate-800 bg-white text-center align-middle ${sizes.box}`}
    >
      <span className={`bg-blue-700 font-bold uppercase tracking-[0.3em] text-white ${sizes.strip}`}>Brasil</span>
      <span className={`font-mono font-bold tracking-widest text-slate-900 ${sizes.text}`}>{formatPlate(plate)}</span>
    </span>
  );
}

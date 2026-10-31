// Classes Tailwind reaproveitadas pelas telas.

export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";

// No celular os campos e botões ficam mais altos (mínimo de 44px, bom para o dedo).
// O texto dos campos fica em 16px: abaixo disso o iPhone dá zoom ao tocar.
export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 shadow-sm sm:py-2 " +
  "placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20";

export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

// active:scale: o botão "afunda" de leve ao ser pressionado (bom no celular).
const btn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold sm:min-h-0 " +
  "transition duration-150 active:scale-[0.97] motion-reduce:active:scale-100 " +
  "disabled:cursor-wait disabled:opacity-70";

export const btnPrimary = `${btn} bg-slate-900 text-white shadow-sm hover:bg-slate-700`;
export const btnAccent = `${btn} bg-blue-700 text-white shadow-sm hover:bg-blue-800`;
export const btnSecondary = `${btn} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50`;
export const btnDanger = `${btn} bg-red-600 text-white shadow-sm hover:bg-red-500`;
export const btnGhost = `${btn} px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

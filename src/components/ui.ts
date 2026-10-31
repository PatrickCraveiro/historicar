// Classes Tailwind reaproveitadas pelas telas.

export const card = "rounded-2xl border border-slate-200 bg-white shadow-sm";

export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm " +
  "placeholder:text-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20";

export const labelClass = "mb-1 block text-sm font-medium text-slate-700";

const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${btn} bg-slate-900 text-white shadow-sm hover:bg-slate-700`;
export const btnAccent = `${btn} bg-orange-500 text-white shadow-sm hover:bg-orange-600`;
export const btnSecondary = `${btn} border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50`;
export const btnDanger = `${btn} bg-red-600 text-white shadow-sm hover:bg-red-500`;
export const btnGhost = `${btn} px-2 py-1 text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

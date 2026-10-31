"use client";

import { PrinterIcon } from "./icons";
import { btnPrimary } from "./ui";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className={btnPrimary}>
      <PrinterIcon /> Imprimir adesivo
    </button>
  );
}

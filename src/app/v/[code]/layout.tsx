import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Histórico de manutenção",
  // O link é público, mas não precisa aparecer no Google.
  robots: { index: false, follow: false },
};

export default function PublicLayout({ children }: LayoutProps<"/v/[code]">) {
  return children;
}

import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage, type RGB } from "pdf-lib";
import { carTitle, formatDate, formatKm, formatPlate, nextServiceText, vehicleTypeLabel } from "./format";
import type { CarDoc, RecordDoc } from "./types";

const PAGE: [number, number] = [595.28, 841.89]; // A4
const MARGIN = 48;
const FOOTER_SPACE = 36;
const CONTENT_WIDTH = PAGE[0] - MARGIN * 2;

const COLORS = {
  text: rgb(0.06, 0.09, 0.16),
  muted: rgb(0.39, 0.45, 0.55),
  light: rgb(0.89, 0.91, 0.94),
  accent: rgb(0.114, 0.306, 0.847), // azul da placa (#1d4ed8)
  accentBg: rgb(0.937, 0.965, 1),
  check: rgb(0.02, 0.59, 0.41),
};

// As fontes padrão do PDF só conhecem o alfabeto latino (WinAnsi). Acentos do
// português funcionam; emojis e outros símbolos são removidos para não quebrar.
const WINANSI_EXTRA = "€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ";
function sanitize(text: string): string {
  return Array.from(text.replace(/\t/g, " "))
    .filter((ch) => {
      const code = ch.codePointAt(0)!;
      return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WINANSI_EXTRA.includes(ch);
    })
    .join("");
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  // Separa os parágrafos antes de limpar o texto, senão o sanitize remove o "\n".
  for (const paragraph of text.replace(/\r/g, "").split("\n")) {
    let line = "";
    for (const word of sanitize(paragraph).split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      // Palavra maior que a linha inteira: quebra no meio.
      let rest = word;
      while (font.widthOfTextAtSize(rest, size) > maxWidth) {
        let cut = rest.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxWidth) cut--;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      line = rest;
    }
    lines.push(line);
  }
  return lines;
}

interface TextOptions {
  font: PDFFont;
  size: number;
  color?: RGB;
  indent?: number;
  /** Texto desenhado antes da primeira linha (ex.: um marcador), com recuo nas demais. */
  bullet?: { text: string; font: PDFFont; color: RGB; width: number };
}

class Writer {
  page!: PDFPage;
  y = 0;

  constructor(private doc: PDFDocument) {
    this.addPage();
  }

  addPage() {
    this.page = this.doc.addPage(PAGE);
    this.y = PAGE[1] - MARGIN;
  }

  /** Começa uma página nova se não couber `height` pontos. */
  ensure(height: number) {
    if (this.y - height < MARGIN + FOOTER_SPACE) this.addPage();
  }

  gap(height: number) {
    this.y -= height;
  }

  /** Altura que `text()` vai ocupar, sem desenhar nada. */
  measure(content: string, { font, size, indent = 0, bullet }: TextOptions): number {
    return wrap(content, font, size, CONTENT_WIDTH - indent - (bullet?.width ?? 0)).length * size * 1.4;
  }

  text(content: string, { font, size, color = COLORS.text, indent = 0, bullet }: TextOptions) {
    const lineHeight = size * 1.4;
    const x = MARGIN + indent + (bullet?.width ?? 0);
    const lines = wrap(content, font, size, CONTENT_WIDTH - indent - (bullet?.width ?? 0));
    lines.forEach((line, index) => {
      this.ensure(lineHeight);
      const baseline = this.y - size;
      if (bullet && index === 0) {
        this.page.drawText(bullet.text, { x: MARGIN + indent, y: baseline, size, font: bullet.font, color: bullet.color });
      }
      this.page.drawText(line, { x, y: baseline, size, font, color });
      this.y -= lineHeight;
    });
  }

  rule(color = COLORS.light) {
    this.page.drawLine({
      start: { x: MARGIN, y: this.y },
      end: { x: PAGE[0] - MARGIN, y: this.y },
      thickness: 1,
      color,
    });
  }
}

export async function buildCarPdf(input: {
  shopName: string;
  car: CarDoc;
  records: RecordDoc[];
  nextService: { km?: number; date?: string } | null;
  url: string;
  generatedOn: string;
}): Promise<Uint8Array> {
  const { shopName, car, records, nextService, url, generatedOn } = input;

  const doc = await PDFDocument.create();
  doc.setTitle(sanitize(`Histórico de manutenção - ${carTitle(car)} - ${formatPlate(car.plate)}`));
  doc.setAuthor(sanitize(shopName));
  doc.setLanguage("pt-BR");

  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const italic = await doc.embedFont(StandardFonts.HelveticaOblique);
  const w = new Writer(doc);

  // Cabeçalho
  w.text(shopName, { font: bold, size: 18 });
  w.text("Histórico de manutenção", { font: regular, size: 11, color: COLORS.muted });
  const generated = sanitize(`Gerado em ${formatDate(generatedOn)}`);
  w.page.drawText(generated, {
    x: PAGE[0] - MARGIN - regular.widthOfTextAtSize(generated, 9),
    y: PAGE[1] - MARGIN - 14,
    size: 9,
    font: regular,
    color: COLORS.muted,
  });
  w.gap(10);
  w.rule();
  w.gap(16);

  // Veículo
  w.text(carTitle(car), { font: bold, size: 16 });
  w.gap(2);
  w.text([`Tipo: ${vehicleTypeLabel(car)}`, `Placa: ${formatPlate(car.plate)}`, car.color && `Cor: ${car.color}`].filter(Boolean).join("   ·   "), {
    font: regular,
    size: 11,
  });
  const lastKm = records.find((r) => r.km != null)?.km;
  w.text(
    [
      `Serviços registrados: ${records.length}`,
      records[0] && `Último serviço: ${formatDate(records[0].date)}`,
      lastKm != null && `Última km: ${formatKm(lastKm)}`,
    ]
      .filter(Boolean)
      .join("   ·   "),
    { font: regular, size: 10, color: COLORS.muted },
  );
  w.gap(12);

  if (nextService) {
    const boxHeight = 30;
    w.ensure(boxHeight);
    w.page.drawRectangle({
      x: MARGIN,
      y: w.y - boxHeight,
      width: CONTENT_WIDTH,
      height: boxHeight,
      color: COLORS.accentBg,
      borderColor: COLORS.accent,
      borderWidth: 0.75,
    });
    w.page.drawText(sanitize(`Próxima revisão: ${nextServiceText(nextService)}`), {
      x: MARGIN + 12,
      y: w.y - 19,
      size: 11,
      font: bold,
      color: COLORS.accent,
    });
    w.gap(boxHeight + 16);
  }

  // Histórico
  w.ensure(40);
  w.text("Histórico", { font: bold, size: 13 });
  w.gap(6);

  if (records.length === 0) {
    w.text("Nenhum serviço registrado ainda.", { font: italic, size: 11, color: COLORS.muted });
  }

  const bullet = { text: "•", font: bold, color: COLORS.check, width: 12 };
  const pageContentHeight = PAGE[1] - MARGIN * 2 - FOOTER_SPACE;

  // Do mais antigo para o mais recente, como o histórico na tela.
  for (const record of [...records].reverse()) {
    const blocks: { text: string; opts: TextOptions; gapBefore?: number }[] = [
      {
        text: [formatDate(record.date), record.km != null && formatKm(record.km)].filter(Boolean).join("   ·   "),
        opts: { font: bold, size: 11.5 },
      },
    ];
    if (record.title) blocks.push({ text: record.title, opts: { font: bold, size: 10.5, color: COLORS.muted } });
    record.items.forEach((item, index) =>
      blocks.push({ text: item, opts: { font: regular, size: 10.5, indent: 6, bullet }, gapBefore: index === 0 ? 3 : 0 }),
    );
    if (record.notes) {
      blocks.push({
        text: `Obs.: ${record.notes}`,
        opts: { font: italic, size: 10, color: COLORS.muted, indent: 6 },
        gapBefore: 3,
      });
    }
    if (record.nextServiceKm != null || record.nextServiceDate) {
      blocks.push({
        text: `Próxima revisão: ${nextServiceText({ km: record.nextServiceKm, date: record.nextServiceDate })}`,
        opts: { font: regular, size: 10, color: COLORS.accent, indent: 6 },
        gapBefore: 2,
      });
    }

    // Se a anotação inteira não cabe no resto da página, começa ela na próxima.
    const height = blocks.reduce((sum, b) => sum + (b.gapBefore ?? 0) + w.measure(b.text, b.opts), 20);
    w.ensure(Math.min(height, pageContentHeight));
    w.rule();
    w.gap(10);
    for (const block of blocks) {
      w.gap(block.gapBefore ?? 0);
      w.text(block.text, block.opts);
    }
    w.gap(10);
  }

  // Rodapé com link e numeração em todas as páginas
  const pages = doc.getPages();
  pages.forEach((page, index) => {
    const label = `Página ${index + 1} de ${pages.length}`;
    page.drawText(sanitize(url), { x: MARGIN, y: MARGIN - 14, size: 8, font: regular, color: COLORS.muted });
    page.drawText(sanitize(label), {
      x: PAGE[0] - MARGIN - regular.widthOfTextAtSize(sanitize(label), 8),
      y: MARGIN - 14,
      size: 8,
      font: regular,
      color: COLORS.muted,
    });
  });

  return doc.save();
}

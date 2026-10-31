import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LineCapStyle, PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { sanitizePdfText } from "./pdf";

// Adesivo para colar no vidro: faixa azul com a marca, o QR e uma linha curta.
// PNG e PDF usam as mesmas medidas (em milímetros), para saírem iguais.
const W = 70; // largura
const H = 82; // altura
const RADIUS = 4;
const BAND_H = 16; // faixa azul
const ICON = 8; // chave inglesa
const GAP = 2.5; // entre a chave e o nome
const QR_TOP = BAND_H + 4;
const QR_SIZE = 52; // inclui a margem branca de 2 módulos exigida pelo QR
const CAPTION_Y = QR_TOP + QR_SIZE + 4.5; // centro da linha de texto
const CAPTION = "Aponte a câmera e veja o histórico";
const CAPTION_SIZE = 3.2;

const BLUE = "#1d4ed8"; // azul da placa
const WRENCH =
  "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z";

/** Tamanho do nome da oficina (mm), diminuindo se o nome for comprido. */
function nameSize(name: string) {
  return Math.min(5, (W - 12 - ICON - GAP) / (0.6 * name.length));
}

/** Módulos escuros do QR como um caminho SVG, em unidades de módulo (já com a margem). */
function qrPath(url: string) {
  // Correção "Q": continua legível com até ~25% do código sujo ou gasto.
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "Q" });
  const margin = 2;
  let d = "";
  for (let row = 0; row < modules.size; row++) {
    for (let col = 0; col < modules.size; col++) {
      if (!modules.get(row, col)) continue;
      let run = 1;
      while (col + run < modules.size && modules.get(row, col + run)) run++;
      d += `M${col + margin} ${row + margin}h${run}v1h-${run}z`;
      col += run - 1;
    }
  }
  return { d, units: modules.size + margin * 2 };
}

// ---------------------------------------------------------------- PNG

const PX = 12; // pixels por milímetro (~300 dpi): bom para imprimir

let fonts: Promise<{ regular: ArrayBuffer; bold: ArrayBuffer }> | undefined;
function loadFonts() {
  const load = async (file: string) =>
    new Uint8Array(await readFile(join(process.cwd(), "assets/fonts", file))).buffer;
  fonts ??= Promise.all([load("Geist-Regular.ttf"), load("Geist-Bold.ttf")]).then(([regular, bold]) => ({
    regular,
    bold,
  }));
  return fonts;
}

export async function stickerPng({
  url,
  shopName,
  headers,
}: {
  url: string;
  shopName: string;
  headers?: HeadersInit;
}): Promise<Response> {
  const { regular, bold } = await loadFonts();
  const qr = qrPath(url);
  const px = (mm: number) => mm * PX;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "#ffffff",
          borderRadius: px(RADIUS),
          border: `${px(0.3)}px solid #cbd5e1`,
          overflow: "hidden",
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            width: "100%",
            height: px(BAND_H),
            background: BLUE,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={px(ICON)} height={px(ICON)} viewBox="0 0 24 24">
            <path d={WRENCH} fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ marginLeft: px(GAP), color: "#ffffff", fontSize: px(nameSize(shopName)), fontWeight: 700 }}>
            {shopName}
          </div>
        </div>
        <svg
          width={px(QR_SIZE)}
          height={px(QR_SIZE)}
          viewBox={`0 0 ${qr.units} ${qr.units}`}
          style={{ marginTop: px(QR_TOP - BAND_H) }}
        >
          <path d={qr.d} fill="#000000" />
        </svg>
        <div style={{ marginTop: px(1.6), fontSize: px(CAPTION_SIZE), color: "#475569" }}>{CAPTION}</div>
      </div>
    ),
    {
      width: px(W),
      height: px(H),
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: bold, weight: 700, style: "normal" },
      ],
      headers,
    },
  );
}

// ---------------------------------------------------------------- PDF

const PT = 72 / 25.4; // pontos por milímetro
const A4: [number, number] = [595.28, 841.89];
const TOP = 20; // margem de cima da folha (mm)

/** Caminho de um retângulo arredondado (só os cantos de cima, se `topOnly`). */
function roundedRect(w: number, h: number, r: number, topOnly = false) {
  const bottom = topOnly ? `V${h}H0` : `V${h - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 0 ${h - r}`;
  return `M0 ${r}A${r} ${r} 0 0 1 ${r} 0H${w - r}A${r} ${r} 0 0 1 ${w} ${r}${bottom}Z`;
}

/** PDF A4 com o adesivo em tamanho real, linha de recorte e, fora dele, de qual carro é. */
export async function stickerPdf({
  url,
  shopName,
  carLabel,
}: {
  url: string;
  shopName: string;
  carLabel: string;
}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(sanitizePdfText(`Adesivo QR - ${carLabel}`));
  const page = doc.addPage(A4);
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const left = (A4[0] / PT - W) / 2; // centralizado (mm)
  const x = (mm: number) => (left + mm) * PT;
  const y = (mm: number) => A4[1] - (TOP + mm) * PT; // mm a partir do topo do adesivo
  const blue = rgb(0x1d / 255, 0x4e / 255, 0xd8 / 255);
  const white = rgb(1, 1, 1);

  // Faixa azul e linha tracejada de recorte (caminhos em mm, escalados para pontos)
  page.drawSvgPath(roundedRect(W, BAND_H, RADIUS, true), { x: x(0), y: y(0), scale: PT, color: blue });
  page.drawSvgPath(roundedRect(W, H, RADIUS), {
    x: x(0),
    y: y(0),
    scale: PT,
    borderColor: rgb(0.58, 0.64, 0.72),
    borderWidth: 0.25,
    borderDashArray: [1.5, 1],
  });

  // Chave + nome da oficina, centralizados na faixa
  const name = sanitizePdfText(shopName);
  let size = nameSize(name) * PT;
  const maxText = (W - 12 - ICON - GAP) * PT;
  while (bold.widthOfTextAtSize(name, size) > maxText) size -= 0.5;
  const textW = bold.widthOfTextAtSize(name, size) / PT;
  const groupLeft = (W - (ICON + GAP + textW)) / 2;
  page.drawSvgPath(WRENCH, {
    x: x(groupLeft),
    y: y((BAND_H - ICON) / 2),
    scale: (ICON / 24) * PT,
    borderColor: white,
    borderWidth: 2,
    borderLineCap: LineCapStyle.Round,
  });
  page.drawText(name, {
    x: x(groupLeft + ICON + GAP),
    y: y(BAND_H / 2) - size * 0.35,
    size,
    font: bold,
    color: white,
  });

  // QR em vetor: nítido em qualquer impressora
  const qr = qrPath(url);
  page.drawSvgPath(qr.d, {
    x: x((W - QR_SIZE) / 2),
    y: y(QR_TOP),
    scale: (QR_SIZE / qr.units) * PT,
    color: rgb(0, 0, 0),
  });

  // Linha de baixo
  const caption = sanitizePdfText(CAPTION);
  const captionSize = CAPTION_SIZE * PT;
  page.drawText(caption, {
    x: x(W / 2) - regular.widthOfTextAtSize(caption, captionSize) / 2,
    y: y(CAPTION_Y) - captionSize * 0.35,
    size: captionSize,
    font: regular,
    color: rgb(0.28, 0.33, 0.41),
  });

  // Fora do adesivo: de qual carro é e como imprimir
  const notes = [
    { text: carLabel, font: bold, size: 10, color: rgb(0.06, 0.09, 0.16) },
    {
      text: "Recorte na linha tracejada. Imprima em tamanho real (100%), sem \"ajustar à página\".",
      font: regular,
      size: 8.5,
      color: rgb(0.39, 0.45, 0.55),
    },
    { text: url, font: regular, size: 8, color: rgb(0.58, 0.64, 0.72) },
  ];
  let noteY = y(H + 8);
  for (const note of notes) {
    const text = sanitizePdfText(note.text);
    page.drawText(text, {
      x: A4[0] / 2 - note.font.widthOfTextAtSize(text, note.size) / 2,
      y: noteY,
      size: note.size,
      font: note.font,
      color: note.color,
    });
    noteY -= note.size * 1.6;
  }

  return doc.save();
}

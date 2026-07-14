// src/modules/certificate/signature/pdf-stamp.ts
import { PDFDocument, StandardFonts, rgb, PDFImage } from 'pdf-lib';
import { LOGO_ASSINAE_SRC } from 'src/resources/certificatesConfig/certificate.assets';

export interface StampData {
  /** Nome completo de quem assina. */
  assinanteNome: string;
  /** Data/hora da assinatura. */
  assinadoEm: Date;
  /** Código público de verificação (ex.: "A1B2-C3D4-E5F6"). */
  codigoVerificacao: string;
  /** URL codificada no QR Code para validar o certificado/hash. */
  urlVerificacao: string;
}

const NAVY = rgb(0.06, 0.11, 0.21); // #0F1D35
const GRAY = rgb(0.4, 0.45, 0.52);
const LIGHT = rgb(0.58, 0.64, 0.72);

function formatarDataHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(data);
}

/** Gera o PNG do QR Code. Import dinâmico para degradar sem quebrar se o pacote faltar. */
async function gerarQrPng(texto: string): Promise<Buffer | null> {
  try {
    const mod: any = await import('qrcode');
    const QRCode = mod?.toBuffer ? mod : mod?.default;
    if (!QRCode?.toBuffer) return null;
    return await QRCode.toBuffer(texto, {
      type: 'png',
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0F1D35ff', light: '#ffffffff' },
    });
  } catch {
    return null;
  }
}

/**
 * Carimba a assinatura digital CENTRALIZADA na última página do certificado:
 * logo do sistema + nome completo de quem assina + data + QR Code de validação.
 */
export async function carimbarAssinatura(
  pdfOriginal: Buffer | Uint8Array,
  data: StampData,
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfOriginal);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const paginas = pdfDoc.getPages();
  const pagina = paginas[paginas.length - 1];
  const { width } = pagina.getSize();
  const centerX = width / 2;

  // --- Recursos de imagem -------------------------------------------------
  const logo = await pdfDoc.embedPng(LOGO_ASSINAE_SRC.data);
  const logoDims = logo.scaleToFit(96, 38);

  const qrPngBuffer = await gerarQrPng(data.urlVerificacao);
  let qr: PDFImage | null = null;
  if (qrPngBuffer) qr = await pdfDoc.embedPng(qrPngBuffer);
  const qrSize = 68;

  // --- Layout: [QR]  [ coluna de texto com logo no topo ] -----------------
  const gap = 16;

  const linhaPor = 'Assinado digitalmente por';
  const linhaNome = data.assinanteNome;
  const linhaData = `em ${formatarDataHora(data.assinadoEm)}`;
  const linhaCodigo = `Codigo de verificacao: ${data.codigoVerificacao}`;

  const sPor = 7.5;
  const sNome = 12;
  const sData = 8.5;
  const sCod = 7.5;

  const colWidth = Math.max(
    logoDims.width,
    font.widthOfTextAtSize(linhaPor, sPor),
    fontBold.widthOfTextAtSize(linhaNome, sNome),
    font.widthOfTextAtSize(linhaData, sData),
    font.widthOfTextAtSize(linhaCodigo, sCod),
  );

  const larguraQr = qr ? qrSize + gap : 0;
  const grupoWidth = larguraQr + colWidth;
  const startX = centerX - grupoWidth / 2;
  const colX = startX + larguraQr;

  // Centro vertical do bloco, dentro da área reservada (acima de Apoio/rodapé).
  const centerY = 150;

  // Coluna de texto: empilha de cima para baixo.
  const colHeight = logoDims.height + 6 + sPor + 4 + sNome + 5 + sData + 4 + sCod;
  let cursorY = centerY + colHeight / 2;

  // Logo do sistema
  pagina.drawImage(logo, {
    x: colX,
    y: cursorY - logoDims.height,
    width: logoDims.width,
    height: logoDims.height,
  });
  cursorY -= logoDims.height + 6;

  pagina.drawText(linhaPor, { x: colX, y: cursorY - sPor, size: sPor, font, color: GRAY });
  cursorY -= sPor + 4;

  pagina.drawText(linhaNome, {
    x: colX,
    y: cursorY - sNome,
    size: sNome,
    font: fontBold,
    color: NAVY,
  });
  cursorY -= sNome + 5;

  pagina.drawText(linhaData, { x: colX, y: cursorY - sData, size: sData, font, color: GRAY });
  cursorY -= sData + 4;

  pagina.drawText(linhaCodigo, { x: colX, y: cursorY - sCod, size: sCod, font, color: LIGHT });

  // QR Code à esquerda, centralizado verticalmente com a coluna
  if (qr) {
    pagina.drawImage(qr, {
      x: startX,
      y: centerY - qrSize / 2,
      width: qrSize,
      height: qrSize,
    });
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

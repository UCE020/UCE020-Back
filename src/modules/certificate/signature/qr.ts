// src/modules/certificate/signature/qr.ts

/**
 * Gera o PNG do QR Code com a URL de verificação.
 * Import dinâmico + try/catch para degradar sem quebrar caso o pacote falte.
 */
export async function gerarQrPng(texto: string): Promise<Buffer | null> {
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

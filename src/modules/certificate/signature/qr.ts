// src/modules/certificate/signature/qr.ts

import type * as QRCodeModule from 'qrcode';

export async function gerarQrPng(texto: string): Promise<Buffer | null> {
  try {
    const QRCode: typeof QRCodeModule = await import('qrcode');

    return await QRCode.toBuffer(texto, {
      type: 'png',
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#0F1D35ff',
        light: '#ffffffff',
      },
    });
  } catch {
    return null;
  }
}

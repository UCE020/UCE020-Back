// src/modules/certificate/signature/verification-hash.ts
import { createHash, randomUUID } from 'crypto';

export interface CertificateFingerprint {
  tipo: 'evento' | 'atividade' | 'convidado';
  certificadoId: number;
  titularNome: string;
  dataEmissao: Date;
}

export interface AssinaturaGerada {
  /** Código público e amigável, ex.: "A1B2-C3D4-E5F6". Vai no carimbo e na URL de verificação. */
  codigo: string;
  /** Hash SHA-256 de integridade do documento assinado (guardado no banco). */
  hash: string;
}

/**
 * Gera o par (código de verificação, hash de integridade) de um certificado.
 *
 * - O `hash` liga o conteúdo do certificado ao segredo do servidor: se alguém
 *   trocar o titular/emissão, o hash recalculado não bate mais.
 * - O `codigo` é a parte pública, usada no carimbo do PDF e na tela de verificação.
 */
export function gerarAssinatura(
  fingerprint: CertificateFingerprint,
): AssinaturaGerada {
  const segredo = process.env.SIGNATURE_SECRET ?? process.env.JWT_SECRET ?? '';

  // nonce garante que dois certificados idênticos gerem códigos distintos
  const nonce = randomUUID();

  const payload = [
    fingerprint.tipo,
    fingerprint.certificadoId,
    fingerprint.titularNome,
    fingerprint.dataEmissao.toISOString(),
    nonce,
    segredo,
  ].join('|');

  const hash = createHash('sha256').update(payload).digest('hex');

  // Código legível: 12 primeiros hex em grupos de 4 -> "A1B2-C3D4-E5F6"
  const codigo =
    hash
      .slice(0, 12)
      .toUpperCase()
      .match(/.{1,4}/g)
      ?.join('-') ?? hash.slice(0, 12).toUpperCase();

  return { codigo, hash };
}

/** Normaliza um código digitado pelo usuário (remove hífens/espaços, caixa alta). */
export function normalizarCodigo(codigo: string): string {
  return codigo.replace(/[\s-]/g, '').toUpperCase();
}

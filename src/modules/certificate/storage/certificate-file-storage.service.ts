import { Injectable } from '@nestjs/common';
import { mkdir, writeFile, readFile } from 'fs/promises';
import { join, basename } from 'path';

const CERTIFICATES_DIR = join(process.cwd(), 'uploads', 'certificates');

const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

@Injectable()
export class CertificateFileStorageService {
  private sanitizeFilename(text: string): string {
    return text.replace(/[/\\?%*:|"<>]/g, '').trim();
  }

  async saveParticipantCertificatePdf(
    certificateId: number,
    participantName: string,
    eventName: string,
    pdf: Buffer,
  ): Promise<string> {
    const safeName = this.sanitizeFilename(participantName);
    const safeEvent = this.sanitizeFilename(eventName);

    const filename = `Certificado ${safeName} - ${safeEvent} - ${certificateId}.pdf`;

    return this.save(filename, pdf);
  }

  async saveGuestCertificatePdf(
    certificateId: number,
    guestName: string,
    eventName: string,
    pdf: Buffer,
  ): Promise<string> {
    const safeName = this.sanitizeFilename(guestName);
    const safeEvent = this.sanitizeFilename(eventName);

    const filename = `Certificado Convidado ${safeName} - ${safeEvent} - ${certificateId}.pdf`;

    return this.save(filename, pdf);
  }

  private async save(filename: string, pdf: Buffer): Promise<string> {
    await mkdir(CERTIFICATES_DIR, { recursive: true });
    await writeFile(join(CERTIFICATES_DIR, filename), pdf);

    return `${PUBLIC_BASE_URL}/uploads/certificates/${encodeURIComponent(filename)}`;
  }

  /** Resolve o caminho local a partir da URL pública salva em `arquivoPdf`. */
  private resolveLocalPath(fileUrl: string): string {
    // Pega só o nome do arquivo (o restante da URL é ignorado) e decodifica.
    const encodedName = fileUrl.split('/').pop() ?? '';
    const filename = basename(decodeURIComponent(encodedName));
    return join(CERTIFICATES_DIR, filename);
  }

  /** Lê o PDF já salvo em disco a partir da URL pública. */
  async readCertificatePdf(fileUrl: string): Promise<Buffer> {
    return readFile(this.resolveLocalPath(fileUrl));
  }

  /** Sobrescreve o PDF existente (mesma URL) com a versão assinada. */
  async overwriteCertificatePdf(fileUrl: string, pdf: Buffer): Promise<void> {
    await mkdir(CERTIFICATES_DIR, { recursive: true });
    await writeFile(this.resolveLocalPath(fileUrl), pdf);
  }
}

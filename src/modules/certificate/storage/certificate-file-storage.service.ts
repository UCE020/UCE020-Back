import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

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
}
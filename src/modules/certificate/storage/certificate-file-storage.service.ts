import { Injectable } from '@nestjs/common';
import { SupabaseStorageService } from 'src/common/storage/supabase-storage.service';

@Injectable()
export class CertificateFileStorageService {
  constructor(private readonly storage: SupabaseStorageService) {}
  
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
    return this.storage.uploadBuffer({
      folder: 'Outros',
      buffer: pdf,
      originalName: filename,
      contentType: 'application/pdf',
    });
  }

  async remove(fileUrl?: string | null): Promise<void> {
    await this.storage.tryRemoveByPublicUrl(fileUrl);
  }
}

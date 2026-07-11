import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

// Pasta física onde os PDFs ficam salvos, seguindo o mesmo padrão usado para avatares.
const CERTIFICATES_DIR = join(process.cwd(), 'uploads', 'certificates');

// Mesma env var usada pelo AvatarStorageService para montar URLs públicas.
// Cai para a porta em que o servidor realmente está escutando (ver main.ts)
const PUBLIC_BASE_URL =
  process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;

@Injectable()
export class CertificateFileStorageService {
  async saveGuestCertificatePdf(
    certificateId: number,
    pdf: Buffer,
  ): Promise<string> {
    return this.save(`convidado-${certificateId}.pdf`, pdf);
  }

  async saveParticipantCertificatePdf(
    certificateId: number,
    pdf: Buffer,
  ): Promise<string> {
    return this.save(`participante-${certificateId}.pdf`, pdf);
  }

  private async save(filename: string, pdf: Buffer): Promise<string> {
    await mkdir(CERTIFICATES_DIR, { recursive: true });
    await writeFile(join(CERTIFICATES_DIR, filename), pdf);

    return `${PUBLIC_BASE_URL}/uploads/certificates/${filename}`;
  }
}

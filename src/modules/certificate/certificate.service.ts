// src/modules/certificate/certificate.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { CertificateRepository } from './repository/certificate.respository';

@Injectable()
export class CertificateService {
  constructor(private readonly repo: CertificateRepository) {}

// certificate.service.ts
async getCertificatesByEvent(eventoId: number, page: number, limit: number) {
  const rows = await this.repo.findByEvent(eventoId, page, limit);

  if (!rows.length) {
    throw new NotFoundException('Nenhum certificado encontrado para este evento');
  }

  return rows.map(row => ({
    id:               String(row.id),
    title:            row.activityTitle,
    participantName:  row.participantName,
    participantEmail: row.participantEmail,
    role:             this.mapRole(row.role),
    hours:            row.activityHours ?? undefined,
    issueDate:        row.dataEmissao.toISOString(),
    imageUrl:         undefined,
  }));
}

  async getCertificateStatsByEvent(eventoId: number) {
    const rows = await this.repo.countByRole(eventoId);
    const counts = new Map(rows.map(row => [this.mapRole(row.role), row.count]));

    return ['Ouvinte', 'Monitor', 'Organizador', 'Palestrante'].map(role => ({
      role,
      count: counts.get(role) ?? 0,
    }));
  }

  private mapRole(role: string): string {
    const map: Record<string, string> = {
      participante: 'Ouvinte',
      monitor:      'Monitor',
      organizador:  'Organizador',
      palestrante:  'Palestrante',
    };
    return map[role.toLowerCase()] ?? role;
  }
}
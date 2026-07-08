// src/modules/certificate/repository/certificate.repository.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import {
  tabelaCertificadoEvento,
  tabelaParticipacoes,
  tabelaUsuario,
  tabelaAtividade,
} from 'src/db/schema';
import { eq, sql } from 'drizzle-orm';

@Injectable()
export class CertificateRepository {
  async findByEvent(eventoId: number, page: number, limit: number) {
    const offset = (page - 1) * limit;
    return db
      .select({
        id:               tabelaCertificadoEvento.id,
        dataEmissao:      tabelaCertificadoEvento.dataEmissao,
        participantName:  tabelaUsuario.nome,
        participantEmail: tabelaUsuario.email,
        role:             tabelaParticipacoes.tipo,
        activityTitle:    tabelaAtividade.nome,
        activityHours:    tabelaAtividade.cargaHoraria,
      })
      .from(tabelaCertificadoEvento)
      .innerJoin(tabelaUsuario,     eq(tabelaCertificadoEvento.usuarioId,   tabelaUsuario.id))
      .innerJoin(tabelaAtividade,   eq(tabelaCertificadoEvento.eventoId, tabelaAtividade.id))
      .innerJoin(tabelaParticipacoes, eq(
        tabelaParticipacoes.usuarioId, tabelaCertificadoEvento.usuarioId,
      ))
      .where(eq(tabelaAtividade.eventoId, eventoId))
      .limit(limit)
      .offset(offset);
  }

    async countByEvent(eventoId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tabelaCertificadoEvento)
      .innerJoin(tabelaAtividade, eq(tabelaCertificadoEvento.eventoId, tabelaAtividade.id))
      .where(eq(tabelaAtividade.eventoId, eventoId));
    return result[0]?.count ?? 0;
  }

  async countByRole(eventoId: number): Promise<{ role: string; count: number }[]> {
    return db
      .select({
        role:  tabelaParticipacoes.tipo,
        count: sql<number>`count(distinct ${tabelaCertificadoEvento.id})::int`,
      })
      .from(tabelaCertificadoEvento)
      .innerJoin(tabelaAtividade, eq(tabelaCertificadoEvento.eventoId, tabelaAtividade.id))
      .innerJoin(tabelaParticipacoes, eq(
        tabelaParticipacoes.usuarioId, tabelaCertificadoEvento.usuarioId,
      ))
      .where(eq(tabelaAtividade.eventoId, eventoId))
      .groupBy(tabelaParticipacoes.tipo);
  }
}
// src/modules/certificate/repository/certificate.repository.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import {
  tabelaCertificadoEvento,
  tabelaParticipacoes,
  tabelaUsuario,
  tabelaAtividade,
} from 'src/db/schema';
import { eq } from 'drizzle-orm';

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
}
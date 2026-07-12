// src/modules/certificate/repository/certificate.repository.ts
import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import {
  tabelaCertificadoEvento,
  tabelaCertificadoConvidado,
  tabelaParticipacoes,
  tabelaUsuario,
  tabelaAtividade,
  tabelaConvidado,
  tabelaConvidadoAtividade,
  tabelaEvento,
} from 'src/db/schema';
import { and, eq, sql, SQL } from 'drizzle-orm';

@Injectable()
export class CertificateRepository {
  private userCertificateQuery(condition: SQL) {
    return db
      .select({
        id: tabelaCertificadoEvento.id,
        dataEmissao: tabelaCertificadoEvento.dataEmissao,
        participantName: tabelaUsuario.nome,
        participantEmail: tabelaUsuario.email,
        role: tabelaParticipacoes.tipo,
        activityTitle: tabelaEvento.nome,
        activityHours: tabelaEvento.cargaHoraria,
        arquivoPdf: tabelaCertificadoEvento.arquivoPdf,
      })
      .from(tabelaCertificadoEvento)
      .innerJoin(
        tabelaUsuario,
        eq(tabelaCertificadoEvento.usuarioId, tabelaUsuario.id),
      )
      .innerJoin(
        tabelaEvento,
        eq(tabelaCertificadoEvento.eventoId, tabelaEvento.id),
      )
      .innerJoin(
        tabelaParticipacoes,
        and(
          eq(tabelaParticipacoes.usuarioId, tabelaCertificadoEvento.usuarioId),
          eq(tabelaParticipacoes.eventoId, tabelaCertificadoEvento.eventoId),
        ),
      )
      .where(condition);
  }

  private guestCertificateQuery(condition: SQL) {
    return db
      .select({
        id: tabelaCertificadoConvidado.id,
        dataEmissao: tabelaCertificadoConvidado.dataEmissao,
        participantName: tabelaConvidado.nome,
        participantEmail: tabelaConvidado.email,
        role: tabelaConvidadoAtividade.funcao,
        activityTitle: tabelaAtividade.nome,
        activityHours: tabelaAtividade.cargaHoraria,
        arquivoPdf: tabelaCertificadoConvidado.arquivoPdf,
      })
      .from(tabelaCertificadoConvidado)
      .innerJoin(
        tabelaConvidado,
        eq(tabelaCertificadoConvidado.convidadoId, tabelaConvidado.id),
      )
      .innerJoin(
        tabelaAtividade,
        eq(tabelaCertificadoConvidado.atividadeId, tabelaAtividade.id),
      )
      .innerJoin(
        tabelaConvidadoAtividade,
        and(
          eq(
            tabelaConvidadoAtividade.convidadoId,
            tabelaCertificadoConvidado.convidadoId,
          ),
          eq(
            tabelaConvidadoAtividade.atividadeId,
            tabelaCertificadoConvidado.atividadeId,
          ),
        ),
      )
      .where(condition);
  }

  async findByEvent(eventoId: number, page: number, limit: number) {
    const [userRows, guestRows] = await Promise.all([
      this.userCertificateQuery(eq(tabelaCertificadoEvento.eventoId, eventoId)),
      this.guestCertificateQuery(eq(tabelaAtividade.eventoId, eventoId)),
    ]);

    const offset = (page - 1) * limit;
    return [...userRows, ...guestRows]
      .sort((a, b) => b.dataEmissao.getTime() - a.dataEmissao.getTime())
      .slice(offset, offset + limit);
  }

  async findUserCertificateById(certificateId: number) {
    const [row] = await this.userCertificateQuery(
      eq(tabelaCertificadoEvento.id, certificateId),
    );
    return row;
  }

  async findGuestCertificateById(certificateId: number) {
    const [row] = await this.guestCertificateQuery(
      eq(tabelaCertificadoConvidado.id, certificateId),
    );
    return row;
  }

  async countByEvent(eventoId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tabelaCertificadoEvento)
      .where(eq(tabelaCertificadoEvento.eventoId, eventoId));
    return result[0]?.count ?? 0;
  }

  async countByRole(
    eventoId: number,
  ): Promise<{ role: string; count: number }[]> {
    return db
      .select({
        role: tabelaParticipacoes.tipo,
        count: sql<number>`count(distinct ${tabelaCertificadoEvento.id})::int`,
      })
      .from(tabelaCertificadoEvento)
      .innerJoin(
        tabelaParticipacoes,
        and(
          eq(tabelaParticipacoes.usuarioId, tabelaCertificadoEvento.usuarioId),
          eq(tabelaParticipacoes.eventoId, tabelaCertificadoEvento.eventoId),
        ),
      )
      .where(eq(tabelaCertificadoEvento.eventoId, eventoId))
      .groupBy(tabelaParticipacoes.tipo);
  }

  async countGuestCertificatesByEvent(eventoId: number): Promise<number> {
    const result = await db
      .select({
        count: sql<number>`count(distinct ${tabelaCertificadoConvidado.id})::int`,
      })
      .from(tabelaCertificadoConvidado)
      .innerJoin(
        tabelaAtividade,
        eq(tabelaCertificadoConvidado.atividadeId, tabelaAtividade.id),
      )
      .where(eq(tabelaAtividade.eventoId, eventoId));
    return result[0]?.count ?? 0;
  }

  async findActivityForCertificate(atividadeId: number) {
    const [atividade] = await db
      .select({
        id: tabelaAtividade.id,
        nome: tabelaAtividade.nome,
        cargaHoraria: tabelaAtividade.cargaHoraria,
        status: tabelaAtividade.status,
        localizacao: tabelaAtividade.localizacao,
        dataInicio: tabelaAtividade.dataInicio,
        dataFim: tabelaAtividade.dataFim,
        eventoId: tabelaAtividade.eventoId,
        eventoNome: tabelaEvento.nome,
        assinante1Nome:   tabelaEvento.assinante1Nome,   
        assinante1Titulo: tabelaEvento.assinante1Titulo, 
        assinante2Nome:   tabelaEvento.assinante2Nome,   
        assinante2Titulo: tabelaEvento.assinante2Titulo, 
      })
      .from(tabelaAtividade)
      .innerJoin(tabelaEvento, eq(tabelaAtividade.eventoId, tabelaEvento.id))
      .where(eq(tabelaAtividade.id, atividadeId));
    return atividade;
  }

  async findGuestsByActivity(atividadeId: number) {
    return db
      .select({
        convidadoId: tabelaConvidado.id,
        nome: tabelaConvidado.nome,
        email: tabelaConvidado.email,
        funcao: tabelaConvidadoAtividade.funcao,
      })
      .from(tabelaConvidadoAtividade)
      .innerJoin(
        tabelaConvidado,
        eq(tabelaConvidadoAtividade.convidadoId, tabelaConvidado.id),
      )
      .where(eq(tabelaConvidadoAtividade.atividadeId, atividadeId));
  }

  async findExistingGuestCertificatesByActivity(atividadeId: number) {
    return db
      .select()
      .from(tabelaCertificadoConvidado)
      .where(eq(tabelaCertificadoConvidado.atividadeId, atividadeId));
  }

  async insertGuestCertificates(
    rows: { convidadoId: number; atividadeId: number; dataEmissao: Date }[],
  ) {
    if (!rows.length) return [];
    return db.insert(tabelaCertificadoConvidado).values(rows).returning();
  }

  async setGuestCertificateFile(certificateId: number, arquivoPdf: string) {
    await db
      .update(tabelaCertificadoConvidado)
      .set({ arquivoPdf })
      .where(eq(tabelaCertificadoConvidado.id, certificateId));
  }

  async findEventForCertificate(eventoId: number) {
    const [evento] = await db
      .select({
        id: tabelaEvento.id,
        nome: tabelaEvento.nome,
        cargaHoraria: tabelaEvento.cargaHoraria,
        status: tabelaEvento.status,
        localizacao: tabelaEvento.localizacao,
        dataInicio: tabelaEvento.dataInicio,
        dataFim: tabelaEvento.dataFim,
        assinante1Nome:   tabelaEvento.assinante1Nome,   
        assinante1Titulo: tabelaEvento.assinante1Titulo, 
        assinante2Nome:   tabelaEvento.assinante2Nome,   
        assinante2Titulo: tabelaEvento.assinante2Titulo,
      })
      .from(tabelaEvento)
      .where(eq(tabelaEvento.id, eventoId));
    return evento;
  }

  async findParticipacoesByEvent(eventoId: number) {
    return db
      .select({
        usuarioId: tabelaUsuario.id,
        nome: tabelaUsuario.nome,
        email: tabelaUsuario.email,
        tipo: tabelaParticipacoes.tipo,
      })
      .from(tabelaParticipacoes)
      .innerJoin(
        tabelaUsuario,
        eq(tabelaParticipacoes.usuarioId, tabelaUsuario.id),
      )
      .where(eq(tabelaParticipacoes.eventoId, eventoId));
  }

  async findExistingUserCertificatesByEvent(eventoId: number) {
    return db
      .select()
      .from(tabelaCertificadoEvento)
      .where(eq(tabelaCertificadoEvento.eventoId, eventoId));
  }

  async insertUserCertificates(
    rows: { usuarioId: number; eventoId: number; dataEmissao: Date }[],
  ) {
    if (!rows.length) return [];
    return db.insert(tabelaCertificadoEvento).values(rows).returning();
  }

  async setUserCertificateFile(certificateId: number, arquivoPdf: string) {
    await db
      .update(tabelaCertificadoEvento)
      .set({ arquivoPdf })
      .where(eq(tabelaCertificadoEvento.id, certificateId));
  }
}

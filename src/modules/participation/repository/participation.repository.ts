import { Injectable } from '@nestjs/common';
import { db } from 'src/db';
import { tabelaParticipacoes, tabelaEvento } from 'src/db/schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class ParticipationRepository {
  async findSubscription(usuarioId: number, eventoId: number) {
    const [participacao] = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.usuarioId, usuarioId),
          eq(tabelaParticipacoes.eventoId, eventoId),
        ),
      )
      .limit(1);
    return participacao ?? null;
  }

  async findEventoById(eventoId: number) {
    const [evento] = await db
      .select()
      .from(tabelaEvento)
      .where(eq(tabelaEvento.id, eventoId))
      .limit(1);
    return evento ?? null;
  }

  async subscribe(usuarioId: number, eventoId: number) {
    const [participacao] = await db
      .insert(tabelaParticipacoes)
      .values({
        usuarioId,
        eventoId,
        tipo: 'participante',
      })
      .returning();
    return participacao;
  }

  async unsubscribe(usuarioId: number, eventoId: number) {
    await db
      .delete(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.usuarioId, usuarioId),
          eq(tabelaParticipacoes.eventoId, eventoId),
        ),
      );
  }
}
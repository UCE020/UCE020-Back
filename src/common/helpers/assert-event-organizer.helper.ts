import { ForbiddenException } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from 'src/db';
import { tabelaParticipacoes, tabelaUsuario } from 'src/db/schema';

export async function assertEventOrganizer(userId: number, eventId: number) {
  const [participacao] = await db
    .select()
    .from(tabelaParticipacoes)
    .where(
      and(
        eq(tabelaParticipacoes.usuarioId, userId),
        eq(tabelaParticipacoes.eventoId, eventId),
        eq(tabelaParticipacoes.tipo, 'organizador'),
      )
    );

  if (!participacao) {
    const adminCheck = await db
      .select()
      .from(tabelaUsuario)
      .where(eq(tabelaUsuario.id, userId));
      
    if (!adminCheck) {
      throw new ForbiddenException('Apenas organizadores podem realizar esta ação.');
    }
  }
}
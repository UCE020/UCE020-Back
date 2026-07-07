import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from 'src/db';
import { tabelaEvento } from 'src/db/schema';

export async function assertEventActive(eventId: number) {
  const [evento] = await db
    .select()
    .from(tabelaEvento)
    .where(eq(tabelaEvento.id, eventId));

  if (!evento) {
    throw new NotFoundException('Evento não encontrado.');
  }

  if (evento.status === 'finalizada') {
    throw new ForbiddenException('Não é possível criar atividades em um evento finalizado.');
  }

  return evento;
}
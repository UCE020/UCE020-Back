import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { tabelaEvento, tabelaParticipacoes } from '../../db/schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  create(createEventDto: CreateEventDto) {
    return { success: true, data: createEventDto };
  }

  async findAll() {
    const eventos = await db
      .select()
      .from(tabelaEvento)
      .orderBy(tabelaEvento.dataInicio);

    return {
      message: 'Eventos listados com sucesso.',
      data: eventos,
    };
  }

  async findByCodigo(codigo: string) {
    const [evento] = await db
      .select()
      .from(tabelaEvento)
      .where(eq(tabelaEvento.codigo, codigo))
      .limit(1);

    if (!evento) {
      throw new NotFoundException(
        `Evento com código "${codigo}" não encontrado.`,
      );
    }

    return {
      message: 'Evento encontrado.',
      data: evento,
    };
  }

  async findEventsByUser(
    userId: number,
  ): Promise<{ message: string; data: Array<Record<string, unknown>> }> {
    const eventos = await db
      .select({ evento: tabelaEvento })
      .from(tabelaEvento)
      .innerJoin(
        tabelaParticipacoes,
        eq(tabelaParticipacoes.eventoId, tabelaEvento.id),
      )
      .where(eq(tabelaParticipacoes.usuarioId, userId))
      .orderBy(tabelaEvento.dataInicio);

    return {
      message: 'Eventos do usuário listados com sucesso.',
      data: eventos.map((row) => row.evento),
    };
  }

  findOne(id: number) {
    return { success: true, data: { id } };
  }

  update(id: number, updateEventDto: UpdateEventDto) {
    return { success: true, data: { id, ...updateEventDto } };
  }

  remove(id: number) {
    return { success: true, data: { id } };
  }
}

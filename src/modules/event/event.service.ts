import { Injectable, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { db } from '../../db';
import { tabelaEvento, tabelaParticipacoes } from '../../db/schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  async create(createEventDto: CreateEventDto) {
    const [novoEvento] = await db
      .insert(tabelaEvento)
      .values({
        nome: createEventDto.nome,
        codigo: createEventDto.codigo,
        descricao: createEventDto.descricao,
        localizacao: createEventDto.localizacao,
        responsavel: createEventDto.responsavel,
        cargaHoraria: createEventDto.cargaHoraria,
        dataInicio: createEventDto.dataInicio,
        dataFim: createEventDto.dataFim,
        status: createEventDto.status,
        foto: createEventDto.foto,
      })
      .returning();

    return {
      message: 'Evento criado com sucesso.',
      data: novoEvento,
    };
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

  async findOne(id: number) {
    const [evento] = await db
      .select()
      .from(tabelaEvento)
      .where(eq(tabelaEvento.id, id))
      .limit(1);

    if (!evento) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
    }

    return {
      message: 'Evento encontrado.',
      data: evento,
    };
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const [eventoExistente] = await db
      .select()
      .from(tabelaEvento)
      .where(eq(tabelaEvento.id, id))
      .limit(1);

    if (!eventoExistente) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
    }

    const [eventoAtualizado] = await db
      .update(tabelaEvento)
      .set(updateEventDto)
      .where(eq(tabelaEvento.id, id))
      .returning();

    return {
      message: 'Evento atualizado com sucesso.',
      data: eventoAtualizado,
    };
  }

  async remove(id: number) {
    const [eventoExistente] = await db
      .select()
      .from(tabelaEvento)
      .where(eq(tabelaEvento.id, id))
      .limit(1);

    if (!eventoExistente) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
    }

    await db.delete(tabelaEvento).where(eq(tabelaEvento.id, id));

    return {
      message: 'Evento removido com sucesso.',
      data: eventoExistente,
    };
  }
}

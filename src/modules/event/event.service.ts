import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db';
import {
  tabelaEvento,
  tabelaParticipacoes,
  tabelaUsuario,
} from '../../db/schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

export type TipoParticipante = 'participante' | 'organizador' | 'monitor';

@Injectable()
export class EventService {
  private async gerarCodigoUnico(nome: string): Promise<string> {
    const prefixo = nome
      .replace(/[^a-zA-Z]/g, '')
      .toUpperCase()
      .substring(0, 3)
      .padEnd(3, 'X');

    for (let tentativas = 0; tentativas < 10; tentativas++) {
      const sufixo = Math.floor(1000 + Math.random() * 9000).toString();
      const codigo = `${prefixo}${sufixo}`;

      const [existente] = await db
        .select({ id: tabelaEvento.id })
        .from(tabelaEvento)
        .where(eq(tabelaEvento.codigo, codigo))
        .limit(1);

      if (!existente) {
        return codigo;
      }
    }

    return `${prefixo}${Date.now().toString().slice(-4)}`;
  }

  async create(createEventDto: CreateEventDto, userId: number) {
    const codigo =
      createEventDto.codigo?.trim() ||
      (await this.gerarCodigoUnico(createEventDto.nome));

    const [novoEvento] = await db
      .insert(tabelaEvento)
      .values({
        nome: createEventDto.nome,
        codigo,
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

    // Registra o criador como organizador do evento
    await db.insert(tabelaParticipacoes).values({
      usuarioId: userId,
      eventoId: novoEvento.id,
      tipo: 'organizador',
    });

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
    tipo?: TipoParticipante,
  ): Promise<{ message: string; data: Array<Record<string, unknown>> }> {
    const filtros = [eq(tabelaParticipacoes.usuarioId, userId)];

    if (tipo) {
      filtros.push(eq(tabelaParticipacoes.tipo, tipo));
    }

    const eventos = await db
      .select({ evento: tabelaEvento })
      .from(tabelaEvento)
      .innerJoin(
        tabelaParticipacoes,
        eq(tabelaParticipacoes.eventoId, tabelaEvento.id),
      )
      .where(and(...filtros))
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

  // Métodos auxiliares para membros

  async checkIsOrganizer(eventId: number, userId: number): Promise<void> {
    const [participacao] = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.eventoId, eventId),
          eq(tabelaParticipacoes.usuarioId, userId),
          eq(tabelaParticipacoes.tipo, 'organizador'),
        ),
      )
      .limit(1);

    if (!participacao) {
      throw new ForbiddenException(
        'Apenas organizadores podem gerenciar membros.',
      );
    }
  }

  // Membros do Evento

  async getEventMembers(eventId: number) {
    await this.findOne(eventId); // Garante que o evento existe

    const membros = await db
      .select({
        id: tabelaParticipacoes.id,
        usuarioId: tabelaParticipacoes.usuarioId,
        tipo: tabelaParticipacoes.tipo,
        nome: tabelaUsuario.nome,
        email: tabelaUsuario.email,
      })
      .from(tabelaParticipacoes)
      .innerJoin(
        tabelaUsuario,
        eq(tabelaParticipacoes.usuarioId, tabelaUsuario.id),
      )
      .where(eq(tabelaParticipacoes.eventoId, eventId));

    return {
      message: 'Membros do evento listados com sucesso.',
      data: membros,
    };
  }

  async updateEventMember(
    eventId: number,
    memberUserId: number,
    tipo: TipoParticipante,
    requesterId: number,
  ) {
    await this.checkIsOrganizer(eventId, requesterId);

    const [participacaoExistente] = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.eventoId, eventId),
          eq(tabelaParticipacoes.usuarioId, memberUserId),
        ),
      )
      .limit(1);

    if (!participacaoExistente) {
      throw new NotFoundException(`Membro não encontrado neste evento.`);
    }

    const [participacaoAtualizada] = await db
      .update(tabelaParticipacoes)
      .set({ tipo })
      .where(
        and(
          eq(tabelaParticipacoes.eventoId, eventId),
          eq(tabelaParticipacoes.usuarioId, memberUserId),
        ),
      )
      .returning();

    return {
      message: 'Papel do membro atualizado com sucesso.',
      data: participacaoAtualizada,
    };
  }

  async removeEventMember(
    eventId: number,
    memberUserId: number,
    requesterId: number,
  ) {
    await this.checkIsOrganizer(eventId, requesterId);

    // Não permitir que o organizador se remova caso seja o único organizador (opcional, mas recomendado evitar se remover sem querer)
    // Para simplificar a task, apenas processamos a remoção básica:
    const [participacaoExistente] = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.eventoId, eventId),
          eq(tabelaParticipacoes.usuarioId, memberUserId),
        ),
      )
      .limit(1);

    if (!participacaoExistente) {
      throw new NotFoundException(`Membro não encontrado neste evento.`);
    }

    await db
      .delete(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.eventoId, eventId),
          eq(tabelaParticipacoes.usuarioId, memberUserId),
        ),
      );

    return {
      message: 'Membro removido do evento com sucesso.',
      data: participacaoExistente,
    };
  }
}

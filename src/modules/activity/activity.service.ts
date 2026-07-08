import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { db } from 'src/db';
import {
  tabelaAtividade,
  tabelaConvidado,
  tabelaConvidadoAtividade,
  tabelaParticipacoes,
  tabelaParticipacoesAtividades,
} from 'src/db/schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-acitivity.dto';
import { SubscribeActivityDto } from './dto/subscribe-activity.dto';
import { assertEventOrganizer } from 'src/common/helpers/assert-event-organizer.helper';
import { assertEventActive } from 'src/common/helpers/assert-event-active.helper';
import { assertActivityDates } from 'src/common/helpers/assert-activity-dates.helper';
import { GuestResult } from './types/activity.type';
import { FindAllActivitiesDto } from './dto/find-activities.dto';

@Injectable()
export class ActivityService {
  async create({ dto, userId }: { dto: CreateActivityDto; userId: number }) {
    await assertEventOrganizer(userId, dto.eventId);
    const evento = await assertEventActive(dto.eventId);
    assertActivityDates(new Date(dto.startDate), new Date(dto.endDate), evento);

    const result = await db.transaction(async (tx) => {
      const [activity] = await tx
        .insert(tabelaAtividade)
        .values({
          nome: dto.name,
          descricao: dto.description,
          localizacao: dto.location,
          categoria: dto.category,
          cargaHoraria: dto.workload ?? 0,
          dataInicio: new Date(dto.startDate),
          dataFim: new Date(dto.endDate),
          status: 'pendente',
          eventoId: dto.eventId,
        })
        .returning();

      const guests: GuestResult[] = [];

      if (dto.guests?.length) {
        for (const guest of dto.guests) {
          let [existing] = await tx
            .select()
            .from(tabelaConvidado)
            .where(eq(tabelaConvidado.email, guest.email));

          if (!existing) {
            [existing] = await tx
              .insert(tabelaConvidado)
              .values({ nome: guest.name, email: guest.email })
              .returning();
          }

          await tx.insert(tabelaConvidadoAtividade).values({
            convidadoId: existing.id,
            atividadeId: activity.id,
            funcao: guest.role,
          });

          guests.push({
            id: existing.id,
            name: existing.nome,
            email: existing.email,
            role: guest.role,
          });
        }
      }

      return { activity, guests };
    });

    return {
      message: 'Atividade criada com sucesso.',
      data: {
        activity: {
          ...this.mapActivity(result.activity),
          guests: result.guests,
        },
      },
    };
  }

  async findAll(query: FindAllActivitiesDto) {
    const baseQuery = db.select().from(tabelaAtividade);

    if (query.eventId) {
      baseQuery.where(eq(tabelaAtividade.eventoId, query.eventId));
    }

    const activities = await baseQuery;

    return {
      message: 'Atividades listadas com sucesso.',
      data: {
        activities: activities.map((a) => this.mapActivity(a)),
      },
    };
  }

  async findOne(id: number) {
    const rows = await db
      .select({
        atividade: tabelaAtividade,
        convidado: tabelaConvidado,
        funcao: tabelaConvidadoAtividade.funcao,
      })
      .from(tabelaAtividade)
      .leftJoin(
        tabelaConvidadoAtividade,
        eq(tabelaConvidadoAtividade.atividadeId, tabelaAtividade.id),
      )
      .leftJoin(
        tabelaConvidado,
        eq(tabelaConvidado.id, tabelaConvidadoAtividade.convidadoId),
      )
      .where(eq(tabelaAtividade.id, id));

    if (!rows.length) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    const atividadeBase = rows[0].atividade;

    const guests = rows
      .filter((row) => row.convidado !== null)
      .map((row) => ({
        id: row.convidado!.id,
        name: row.convidado!.nome,
        email: row.convidado!.email,
        role: row.funcao!,
      }));

    return {
      message: 'Atividade encontrada com sucesso.',
      data: {
        activity: {
          ...this.mapActivity(atividadeBase),
          guests,
        },
      },
    };
  }

  async update({
    id,
    dto,
    userId,
  }: {
    id: number;
    dto: UpdateActivityDto;
    userId: number;
  }) {
    const existing = await db
      .select()
      .from(tabelaAtividade)
      .where(eq(tabelaAtividade.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    await assertEventOrganizer(userId, existing[0].eventoId);

    const result = await db.transaction(async (tx) => {
      const [updatedActivity] = await tx
        .update(tabelaAtividade)
        .set({
          ...(dto.name && { nome: dto.name }),
          ...(dto.description && { descricao: dto.description }),
          ...(dto.location && { localizacao: dto.location }),
          ...(dto.category && { categoria: dto.category }),
          ...(dto.workload !== undefined && { cargaHoraria: dto.workload }),
          ...(dto.startDate && { dataInicio: new Date(dto.startDate) }),
          ...(dto.endDate && { dataFim: new Date(dto.endDate) }),
        })
        .where(eq(tabelaAtividade.id, id))
        .returning();

      const guests: GuestResult[] = [];

      if (dto.guests !== undefined) {
        await tx
          .delete(tabelaConvidadoAtividade)
          .where(eq(tabelaConvidadoAtividade.atividadeId, id));

        if (dto.guests.length > 0) {
          for (const guest of dto.guests) {
            let [existingGuest] = await tx
              .select()
              .from(tabelaConvidado)
              .where(eq(tabelaConvidado.email, guest.email));

            if (!existingGuest) {
              [existingGuest] = await tx
                .insert(tabelaConvidado)
                .values({ nome: guest.name, email: guest.email })
                .returning();
            }

            await tx.insert(tabelaConvidadoAtividade).values({
              convidadoId: existingGuest.id,
              atividadeId: id,
              funcao: guest.role,
            });

            guests.push({
              id: existingGuest.id,
              name: existingGuest.nome,
              email: existingGuest.email,
              role: guest.role,
            });
          }
        }
      }

      return { updatedActivity, guests };
    });

    return {
      message: 'Atividade atualizada com sucesso.',
      data: {
        activity: {
          ...this.mapActivity(result.updatedActivity),
          guests: result.guests,
        },
      },
    };
  }

  async subscribe(id: number, subscribeActivityDto: SubscribeActivityDto) {
    const { userId } = subscribeActivityDto;

    const activity = await db
      .select()
      .from(tabelaAtividade)
      .where(eq(tabelaAtividade.id, id));

    if (!activity.length) {
      throw new NotFoundException('Atividade não encontrada');
    }

    const activityData = activity[0];

    const participation = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.usuarioId, userId),
          eq(tabelaParticipacoes.eventoId, activityData.eventoId),
        ),
      );

    let participationId: number;

    if (!participation.length) {
      const createdParticipation = await db
        .insert(tabelaParticipacoes)
        .values({
          usuarioId: userId,
          eventoId: activityData.eventoId,
          tipo: 'participante',
        })
        .returning();

      participationId = createdParticipation[0].id;
    } else {
      participationId = participation[0].id;
    }

    const existingSubscription = await db
      .select()
      .from(tabelaParticipacoesAtividades)
      .where(
        and(
          eq(tabelaParticipacoesAtividades.participacaoId, participationId),
          eq(tabelaParticipacoesAtividades.atividadeId, id),
        ),
      );

    if (existingSubscription.length) {
      throw new BadRequestException('Usuário já inscrito nesta atividade');
    }

    await db.insert(tabelaParticipacoesAtividades).values({
      participacaoId: participationId,
      atividadeId: id,
    });

    return {
      success: true,
      data: {
        activityId: id,
        userId,
        participationId,
      },
    };
  }

  async unsubscribe(id: number, userId: number) {
    const activity = await db
      .select()
      .from(tabelaAtividade)
      .where(eq(tabelaAtividade.id, id));

    if (!activity.length) {
      throw new NotFoundException('Atividade não encontrada');
    }

    const activityData = activity[0];

    const participation = await db
      .select()
      .from(tabelaParticipacoes)
      .where(
        and(
          eq(tabelaParticipacoes.usuarioId, userId),
          eq(tabelaParticipacoes.eventoId, activityData.eventoId),
        ),
      );

    if (!participation.length) {
      throw new NotFoundException('Participação não encontrada para este usuário');
    }

    const participationId = participation[0].id;

    const existingSubscription = await db
      .select()
      .from(tabelaParticipacoesAtividades)
      .where(
        and(
          eq(tabelaParticipacoesAtividades.participacaoId, participationId),
          eq(tabelaParticipacoesAtividades.atividadeId, id),
        ),
      );

    if (!existingSubscription.length) {
      throw new BadRequestException('Usuário não está inscrito nesta atividade');
    }

    await db
      .delete(tabelaParticipacoesAtividades)
      .where(
        and(
          eq(tabelaParticipacoesAtividades.participacaoId, participationId),
          eq(tabelaParticipacoesAtividades.atividadeId, id),
        ),
      );

    const remainingSubscriptions = await db
      .select()
      .from(tabelaParticipacoesAtividades)
      .where(eq(tabelaParticipacoesAtividades.participacaoId, participationId));

    if (!remainingSubscriptions.length) {
      await db
        .delete(tabelaParticipacoes)
        .where(eq(tabelaParticipacoes.id, participationId));
    }

    return {
      success: true,
      data: {
        activityId: id,
        userId,
        participationId,
      },
    };
  }

  async remove({ id, userId }: { id: number; userId: number }) {
    const existing = await db
      .select()
      .from(tabelaAtividade)
      .where(eq(tabelaAtividade.id, id))
      .limit(1);

    if (!existing.length) {
      throw new NotFoundException('Atividade não encontrada.');
    }

    await assertEventOrganizer(userId, existing[0].eventoId);

    await db.delete(tabelaAtividade).where(eq(tabelaAtividade.id, id));

    return {
      message: 'Atividade removida com sucesso.',
      data: { id },
    };
  }

  private mapActivity(activity: typeof tabelaAtividade.$inferSelect) {
    return {
      id: activity.id,
      name: activity.nome,
      description: activity.descricao,
      location: activity.localizacao,
      category: activity.categoria,
      workload: activity.cargaHoraria,
      startDate: activity.dataInicio,
      endDate: activity.dataFim,
      status: activity.status,
      eventId: activity.eventoId,
    };
  }
}

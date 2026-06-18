import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ParticipationRepository } from './repository/participation.repository';

@Injectable()
export class ParticipationService {
  constructor(private readonly repo: ParticipationRepository) {}

  async subscribe(usuarioId: number, eventoId: number) {
    const evento = await this.repo.findEventoById(eventoId);
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    if (evento.status === 'finalizada') {
      throw new BadRequestException(
        'Não é possível se inscrever em um evento já finalizado',
      );
    }

    const existente = await this.repo.findSubscription(usuarioId, eventoId);
    if (existente) {
      throw new ConflictException('Usuário já está inscrito neste evento');
    }

    const participacao = await this.repo.subscribe(usuarioId, eventoId);
    return {
      message: 'Inscrição realizada com sucesso',
      data: participacao,
    };
  }

  async unsubscribe(usuarioId: number, eventoId: number) {
    const existente = await this.repo.findSubscription(usuarioId, eventoId);
    if (!existente) {
      throw new NotFoundException('Inscrição não encontrada');
    }

    await this.repo.unsubscribe(usuarioId, eventoId);
    return {
      message: 'Inscrição cancelada com sucesso',
    };
  }
}
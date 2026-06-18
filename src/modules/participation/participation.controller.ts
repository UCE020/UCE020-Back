import { Controller, Post, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth, ApiConflictResponse, ApiNotFoundResponse,
  ApiOkResponse, ApiTags, ApiUnauthorizedResponse, ApiBadRequestResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { User } from 'src/common/decorators/usuario.decorator';
import type { JwtPayload } from 'src/common/types/jwt-payload.type';
import { ParticipationService } from './participation.service';

@ApiTags('participation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event/:eventoId/subscription')
export class ParticipationController {
  constructor(private readonly participationService: ParticipationService) {}

  @Post()
  @ApiOkResponse({ 
    description: 'Inscrição realizada com sucesso',
    schema: {
      example: {
        message: 'Inscrição realizada com sucesso!',
        eventoId: 10,
        userId: 1
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Evento já finalizado' })
  @ApiConflictResponse({ description: 'Usuário já inscrito' })
  @ApiNotFoundResponse({ description: 'Evento não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  async subscribe(
    @User() user: JwtPayload,
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    // Aguarda o serviço processar a inscrição no banco
    await this.participationService.subscribe(user.sub, eventoId);

    // Retorna o payload estruturado para o front
    return {
      message: 'Inscrição realizada com sucesso!',
      eventoId: eventoId,
      userId: user.sub,
    };
  }

  @Delete()
  @ApiOkResponse({ 
    description: 'Inscrição cancelada com sucesso',
    schema: {
      example: {
        message: 'Inscrição cancelada com sucesso.',
        eventoId: 10,
        userId: 1
      }
    }
  })
  @ApiNotFoundResponse({ description: 'Inscrição não encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  async unsubscribe(
    @User() user: JwtPayload,
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    // Aguarda o serviço remover a inscrição no banco
    await this.participationService.unsubscribe(user.sub, eventoId);

    // Retorna o payload de confirmação
    return {
      message: 'Inscrição cancelada com sucesso.',
      eventoId: eventoId,
      userId: user.sub,
    };
  }
}
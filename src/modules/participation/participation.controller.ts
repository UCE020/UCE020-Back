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
  @ApiOkResponse({ description: 'Inscrição realizada com sucesso' })
  @ApiBadRequestResponse({ description: 'Evento já finalizado' })
  @ApiConflictResponse({ description: 'Usuário já inscrito' })
  @ApiNotFoundResponse({ description: 'Evento não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  subscribe(
    @User() user: JwtPayload,
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    return this.participationService.subscribe(Number(user.sub), eventoId);
  }

  @Delete()
  @ApiOkResponse({ description: 'Inscrição cancelada com sucesso' })
  @ApiNotFoundResponse({ description: 'Inscrição não encontrada' })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  unsubscribe(
    @User() user: JwtPayload,
    @Param('eventoId', ParseIntPipe) eventoId: number,
  ) {
    return this.participationService.unsubscribe(Number(user.sub), eventoId);
  }
}
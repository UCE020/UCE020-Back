// src/modules/certificate/certificate-participant.controller.ts
import {
  Controller,
  Post,
  Param,
  ParseIntPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { RequestWithUser } from 'src/common/types/request-with-user.type';
import { CertificateService } from '../certificate.service';
import { JwtAuthGuard } from 'src/modules/auth/jwt/jwt-auth.guard';

@ApiTags('certificate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('event/:eventoId/certificate/participants')
export class CertificateParticipantController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({
    summary:
      'Emitir certificado dos participantes/monitores/organizadores de um evento',
  })
  @ApiOkResponse({ description: 'Certificados emitidos com sucesso.' })
  @ApiNotFoundResponse({ description: 'Evento não encontrado ou sem participantes.' })
  @ApiForbiddenResponse({
    description: 'Apenas organizadores podem emitir certificados, e apenas de eventos finalizados.',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  generateParticipantCertificates(
    @Param('eventoId', ParseIntPipe) eventoId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.certificateService.generateParticipantCertificates(
      eventoId,
      req.user.sub,
    );
  }
}

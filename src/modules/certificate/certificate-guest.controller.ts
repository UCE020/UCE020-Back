// src/modules/certificate/certificate-guest.controller.ts
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
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { CertificateService } from './certificate.service';

@ApiTags('certificate')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('activity/:atividadeId/certificate/guests')
export class CertificateGuestController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post()
  @ApiOperation({
    summary:
      'Emitir certificado dos convidados (palestrante/ministrante/moderador) de uma atividade',
  })
  @ApiOkResponse({
    description: 'Certificados de convidado emitidos com sucesso.',
  })
  @ApiNotFoundResponse({
    description: 'Atividade não encontrada ou sem convidados.',
  })
  @ApiForbiddenResponse({
    description:
      'Apenas organizadores podem emitir certificados, e apenas de atividades finalizadas.',
  })
  @ApiUnauthorizedResponse({ description: 'Token ausente ou inválido' })
  generateGuestCertificates(
    @Param('atividadeId', ParseIntPipe) atividadeId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.certificateService.generateGuestCertificates(
      atividadeId,
      req.user.sub,
    );
  }
}
